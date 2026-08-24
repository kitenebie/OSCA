import { create } from 'zustand';
import { User, RolePermission } from '../types';
import { usersService, rolesService, auditLogsService } from '../services/supabaseService';
import { sessionService } from '../services/sessionService';
import { getDeviceInfo } from '../services/deviceInfoService';
import { supabase } from '../../utils/supabase';
import { useUIStore } from './uiStore';

interface AuthState {
  currentUser: User | null;
  users: User[];
  roles: RolePermission[];
  isLoading: boolean;
  isInitialized: boolean;
  sessionToken: string | null;
  sessionExpiresAt: string | null;
  isSessionValid: boolean;

  initialize: () => Promise<void>;
  login: (username: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
  validateSession: () => Promise<boolean>;
  hasPermission: (permissionName: keyof RolePermission['permissions']) => boolean;
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
  updateUser: (id: string, user: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

// ============================================================
// LOCAL STORAGE KEYS
// ============================================================
const STORAGE_KEYS = {
  SESSION_TOKEN: 'osca_session_token',
  REFRESH_TOKEN: 'osca_refresh_token',
  USER: 'senior_system_auth_user',
  REMEMBER_ME: 'osca_remember_me',
};

const getStoredUser = (): User | null => {
  const stored = localStorage.getItem(STORAGE_KEYS.USER);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
};

const getStoredSessionToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
};

const getStoredRefreshToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
};

// ============================================================
// SESSION MONITOR (Realtime + Polling Fallback)
// Realtime: instant force-logout when admin terminates session
// Polling: handles natural expiry, expiry warnings, activity touch
// ============================================================
let sessionCheckInterval: ReturnType<typeof setInterval> | null = null;
let activityTouchInterval: ReturnType<typeof setInterval> | null = null;
let realtimeChannel: any = null;
let sessionDismissedAlready = false;
let expiryWarningShown = false;

const EXPIRY_WARNING_MINUTES = 5;

function startSessionMonitor(store: any) {
  // Clear existing
  if (sessionCheckInterval) clearInterval(sessionCheckInterval);
  if (activityTouchInterval) clearInterval(activityTouchInterval);
  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel);
    realtimeChannel = null;
  }
  expiryWarningShown = false;
  sessionDismissedAlready = false;

  // ────────────────────────────────────────────────────────────
  // REALTIME: Subscribe to session row changes for INSTANT force-logout
  // ────────────────────────────────────────────────────────────
  const currentToken = getStoredSessionToken();
  if (currentToken) {
    realtimeChannel = supabase
      .channel('session-force-logout')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_sessions',
          filter: `session_token=eq.${currentToken}`,
        },
        (payload: any) => {
          const newRow = payload.new;
          // Session deactivated with terminated_by = force-terminated by admin
          if (newRow && newRow.is_active === false && newRow.terminated_by && !sessionDismissedAlready) {
            sessionDismissedAlready = true;
            const terminatedBy = newRow.terminated_by;

            console.log(`[SESSION REALTIME] Force-terminated by: ${terminatedBy}`);
            useUIStore.getState().showSessionDismissed(terminatedBy);
            stopSessionMonitor();

            // Audit log
            const user = store.getState().currentUser;
            auditLogsService.log({
              action: 'SESSION_TERMINATE',
              entity: 'Session',
              details: `Session force-terminated for: ${user?.fullName || 'Unknown'} by ${terminatedBy}`,
              actorName: terminatedBy,
              actorRole: 'admin',
              barangay: user?.barangayAssigned || '',
              severity: 'danger',
            });
          }
        }
      )
      .subscribe();

    console.log('[SESSION] Realtime subscription active for force-logout detection');
  }

  // ────────────────────────────────────────────────────────────
  // POLLING FALLBACK: Every 30s for expiry checks
  // (also catches force-terminate if realtime channel drops)
  // ────────────────────────────────────────────────────────────
  sessionCheckInterval = setInterval(async () => {
    const token = getStoredSessionToken();
    if (!token) return;
    if (sessionDismissedAlready) return; // Already handled by realtime

    const state = store.getState();
    const valid = await state.validateSession();

    if (valid) {
      // Check if we're within 5 minutes of expiry — show warning toast
      const expiresAt = store.getState().sessionExpiresAt;
      if (expiresAt && !expiryWarningShown) {
        const now = new Date();
        const expiry = new Date(expiresAt);
        const minutesRemaining = (expiry.getTime() - now.getTime()) / (1000 * 60);

        if (minutesRemaining <= EXPIRY_WARNING_MINUTES && minutesRemaining > 0) {
          expiryWarningShown = true;
          const mins = Math.ceil(minutesRemaining);
          useUIStore.getState().showToast(
            `⚠️ Your session will expire in ${mins} minute${mins !== 1 ? 's' : ''}. Save your work or stay active to continue.`,
            'warning'
          );
          console.log(`[SESSION] Warning: expires in ${mins} minute(s)`);
        }
      }
    } else {
      // Session invalid — check if force-terminated (fallback)
      if (sessionDismissedAlready) return;
      const terminatedBy = await sessionService.getTerminationInfo(token);

      if (terminatedBy) {
        sessionDismissedAlready = true;
        useUIStore.getState().showSessionDismissed(terminatedBy);
        stopSessionMonitor();
        console.log(`[SESSION POLL FALLBACK] Force-terminated by: ${terminatedBy}`);

        const user = store.getState().currentUser;
        auditLogsService.log({
          action: 'SESSION_TERMINATE',
          entity: 'Session',
          details: `Session force-terminated for: ${user?.fullName || 'Unknown'} by ${terminatedBy}`,
          actorName: terminatedBy,
          actorRole: 'admin',
          barangay: user?.barangayAssigned || '',
          severity: 'danger',
        });
        return;
      }

      // Not force-terminated — try auto-relogin with refresh token (natural expiry)
      const refreshToken = getStoredRefreshToken();
      if (refreshToken) {
        const newSession = await sessionService.refreshSession(refreshToken);
        if (newSession) {
          localStorage.setItem(STORAGE_KEYS.SESSION_TOKEN, newSession.sessionToken);
          if (newSession.refreshToken) {
            localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newSession.refreshToken);
          }
          expiryWarningShown = false;
          store.setState({
            sessionToken: newSession.sessionToken,
            sessionExpiresAt: newSession.expiresAt,
            isSessionValid: true,
            currentUser: store.getState().currentUser,
          });
          console.log('[SESSION] Auto-renewed via Remember Me');

          // Restart realtime with new token
          if (realtimeChannel) {
            supabase.removeChannel(realtimeChannel);
          }
          startSessionMonitor(store); // Re-subscribe with new session token
          return;
        }
      }
      // No refresh token or refresh failed — natural expiry
      useUIStore.getState().showToast(
        'Your session has expired. Please log in again.',
        'error'
      );
      const user = store.getState().currentUser;
      auditLogsService.log({
        action: 'SESSION_EXPIRED',
        entity: 'Session',
        details: `Session expired for: ${user?.fullName || 'Unknown'} — auto logout`,
        actorName: 'System',
        actorRole: 'system',
        barangay: user?.barangayAssigned || '',
        severity: 'warning',
      });
      console.log('[SESSION] Expired. Logging out.');
      state.logout();
    }
  }, 30000); // Every 30 seconds

  // Touch session (update last_activity) every 5 minutes
  activityTouchInterval = setInterval(async () => {
    const token = getStoredSessionToken();
    if (token) {
      await sessionService.touchSession(token);
    }
  }, 5 * 60 * 1000);
}

function stopSessionMonitor() {
  if (sessionCheckInterval) {
    clearInterval(sessionCheckInterval);
    sessionCheckInterval = null;
  }
  if (activityTouchInterval) {
    clearInterval(activityTouchInterval);
    activityTouchInterval = null;
  }
  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel);
    realtimeChannel = null;
  }
}

// ============================================================
// SHA-256 HASHING (with fallback for non-secure contexts)
// ============================================================
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);

  if (globalThis.crypto?.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  // Fallback: manual SHA-256 for HTTP dev environments
  return sha256Fallback(password);
}

async function sha256Fallback(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);

  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }

  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;

  const msgLen = msgBuffer.length;
  const bitLen = msgLen * 8;
  const padLen = ((msgLen + 8) % 64 === 0) ? msgLen + 8 : msgLen + 64 - ((msgLen + 8) % 64);
  const padded = new Uint8Array(padLen + 8);
  padded.set(msgBuffer);
  padded[msgLen] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(padded.length - 4, bitLen, false);

  for (let i = 0; i < padded.length; i += 64) {
    const w = new Array(64);
    for (let t = 0; t < 16; t++) {
      w[t] = view.getUint32(i + t * 4, false);
    }
    for (let t = 16; t < 64; t++) {
      const s0 = rightRotate(w[t - 15], 7) ^ rightRotate(w[t - 15], 18) ^ (w[t - 15] >>> 3);
      const s1 = rightRotate(w[t - 2], 17) ^ rightRotate(w[t - 2], 19) ^ (w[t - 2] >>> 10);
      w[t] = (w[t - 16] + s0 + w[t - 7] + s1) | 0;
    }

    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
    for (let t = 0; t < 64; t++) {
      const S1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + k[t] + w[t]) | 0;
      const S0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) | 0;
      h = g; g = f; f = e; e = (d + temp1) | 0;
      d = c; c = b; b = a; a = (temp1 + temp2) | 0;
    }
    h0 = (h0 + a) | 0; h1 = (h1 + b) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0; h5 = (h5 + f) | 0; h6 = (h6 + g) | 0; h7 = (h7 + h) | 0;
  }

  return [h0, h1, h2, h3, h4, h5, h6, h7]
    .map((v) => (v >>> 0).toString(16).padStart(8, '0'))
    .join('');
}

// ============================================================
// AUTH STORE
// ============================================================
export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: getStoredUser(),
  users: [],
  roles: [],
  isLoading: false,
  isInitialized: false,
  sessionToken: getStoredSessionToken(),
  sessionExpiresAt: null,
  isSessionValid: false,

  initialize: async () => {
    if (get().isInitialized) return;
    set({ isLoading: true });

    try {
      const [users, roles] = await Promise.all([
        usersService.getAll(),
        rolesService.getAll(),
      ]);

      set({ users, roles, isInitialized: true, isLoading: false });

      // Validate existing session on app startup
      const sessionToken = getStoredSessionToken();
      if (sessionToken) {
        const isValid = await get().validateSession();
        if (!isValid) {
          // Try refresh token for auto-relogin
          const refreshToken = getStoredRefreshToken();
          if (refreshToken) {
            const newSession = await sessionService.refreshSession(refreshToken);
            if (newSession) {
              localStorage.setItem(STORAGE_KEYS.SESSION_TOKEN, newSession.sessionToken);
              if (newSession.refreshToken) {
                localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newSession.refreshToken);
              }
              set({
                sessionToken: newSession.sessionToken,
                sessionExpiresAt: newSession.expiresAt,
                isSessionValid: true,
              });
              console.log('[SESSION] Auto-renewed on startup via Remember Me');
              // Start monitoring
              startSessionMonitor(useAuthStore);
            } else {
              // Refresh failed - clear everything
              get().logout();
            }
          } else {
            // No refresh token - clear session
            get().logout();
          }
        } else {
          // Session still valid - start monitoring
          startSessionMonitor(useAuthStore);
        }
      }

      // Subscribe to realtime user changes
      usersService.subscribe((updatedUsers) => {
        set({ users: updatedUsers });
        const current = get().currentUser;
        if (current) {
          const refreshed = updatedUsers.find((u) => u.id === current.id);
          if (refreshed) {
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(refreshed));
            set({ currentUser: refreshed });
          }
        }
      });

      // Subscribe to realtime role changes
      rolesService.subscribe((updatedRoles) => {
        set({ roles: updatedRoles });
      });
    } catch (error) {
      console.error('Failed to initialize auth store:', error);
      set({ isLoading: false });
    }
  },

  login: async (username: string, password: string, rememberMe: boolean = false) => {
    set({ isLoading: true });

    try {
      const passwordHash = await hashPassword(password);

      console.log('[LOGIN] Username:', username);
      console.log('[LOGIN] Remember Me:', rememberMe);

      // Verify credentials against Supabase
      const user = await usersService.verifyLogin(username, passwordHash);
      if (user) {
        // Capture device info (browser, IP, location) for session tracking
        const deviceInfo = await getDeviceInfo();

        // Create a session token in the database with device info
        const session = await sessionService.createSession(user.id, rememberMe, deviceInfo);

        // Store in localStorage
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        localStorage.setItem(STORAGE_KEYS.SESSION_TOKEN, session.sessionToken);
        localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, rememberMe ? 'true' : 'false');

        if (session.refreshToken) {
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, session.refreshToken);
        } else {
          localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        }

        set({
          currentUser: user,
          isLoading: false,
          sessionToken: session.sessionToken,
          sessionExpiresAt: session.expiresAt,
          isSessionValid: true,
        });

        // Start session monitoring
        startSessionMonitor(useAuthStore);

        console.log('[SESSION] Created. Expires at:', session.expiresAt);

        // Audit log: successful login
        auditLogsService.log({
          action: 'LOGIN',
          entity: 'Session',
          details: `User "${user.fullName}" logged in successfully${rememberMe ? ' (Remember Me enabled)' : ''}`,
          actorName: user.fullName,
          actorRole: user.role,
          barangay: user.barangayAssigned || '',
          severity: 'success',
        });
        return true;
      } else {
        set({ isLoading: false });
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      set({ isLoading: false });
      return false;
    }
  },

  logout: async () => {
    // Audit log: manual logout (capture user info before clearing)
    const logoutUser = get().currentUser;
    if (logoutUser) {
      auditLogsService.log({
        action: 'LOGOUT',
        entity: 'Session',
        details: `User "${logoutUser.fullName}" logged out`,
        actorName: logoutUser.fullName,
        actorRole: logoutUser.role,
        barangay: logoutUser.barangayAssigned || '',
        severity: 'info',
      });
    }

    // Destroy session in database
    const sessionToken = getStoredSessionToken();
    if (sessionToken) {
      try {
        await sessionService.destroySession(sessionToken);
      } catch (e) {
        console.error('[SESSION] Error destroying session:', e);
      }
    }

    // Stop monitoring
    stopSessionMonitor();

    // Clear all local storage
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.SESSION_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);

    set({
      currentUser: null,
      sessionToken: null,
      sessionExpiresAt: null,
      isSessionValid: false,
    });
  },

  validateSession: async () => {
    const token = getStoredSessionToken();
    if (!token) {
      set({ isSessionValid: false });
      return false;
    }

    try {
      const session = await sessionService.validateSession(token);
      if (session) {
        set({
          isSessionValid: true,
          sessionExpiresAt: session.expiresAt,
        });
        return true;
      } else {
        set({ isSessionValid: false });
        return false;
      }
    } catch {
      set({ isSessionValid: false });
      return false;
    }
  },

  hasPermission: (permissionName: keyof RolePermission['permissions']) => {
    const user = get().currentUser;
    if (!user) return false;

    const roleDef = get().roles.find((r) => r.role === user.role);
    if (!roleDef) return false;

    return roleDef.permissions[permissionName] ?? false;
  },

  addUser: async (newUserData) => {
    set({ isLoading: true });
    try {
      await usersService.create(newUserData);

      const actor = get().currentUser;
      auditLogsService.log({
        action: 'CREATE',
        entity: 'User',
        details: `Added new system user: ${newUserData.fullName} (${newUserData.role})`,
        actorName: actor?.fullName || 'Super Admin',
        actorRole: actor?.role || 'admin',
        barangay: newUserData.barangayAssigned,
        severity: 'success',
      });

      set({ isLoading: false });
    } catch (error) {
      console.error('Failed to add user:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  updateUser: async (id, updatedFields) => {
    try {
      await usersService.update(id, updatedFields);

      const target = get().users.find((u) => u.id === id);
      const actor = get().currentUser;

      auditLogsService.log({
        action: 'UPDATE',
        entity: 'User',
        details: `Updated user account of: ${updatedFields.fullName || target?.fullName || id}`,
        actorName: actor?.fullName || 'Super Admin',
        actorRole: actor?.role || 'admin',
        barangay: target?.barangayAssigned,
        severity: 'info',
      });

      // Optimistic update
      const updatedUsers = get().users.map((u) =>
        u.id === id ? { ...u, ...updatedFields } : u
      );
      set({ users: updatedUsers });

      // Sync current user session if self-updating
      const current = get().currentUser;
      if (current && current.id === id) {
        const updated = { ...current, ...updatedFields };
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
        set({ currentUser: updated });
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  },

  deleteUser: async (id) => {
    try {
      const target = get().users.find((u) => u.id === id);
      const actor = get().currentUser;

      await usersService.delete(id);

      auditLogsService.log({
        action: 'DELETE',
        entity: 'User',
        details: `Removed user account of: ${target ? target.fullName : id}`,
        actorName: actor?.fullName || 'Super Admin',
        actorRole: actor?.role || 'admin',
        barangay: target?.barangayAssigned,
        severity: 'danger',
      });

      const updatedUsers = get().users.filter((u) => u.id !== id);
      set({ users: updatedUsers });
    } catch (error) {
      console.error('Failed to delete user:', error);
      throw error;
    }
  },
}));
