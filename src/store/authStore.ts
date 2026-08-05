import { create } from 'zustand';
import { User, RolePermission } from '../types';
import { usersService, rolesService, auditLogsService } from '../services/supabaseService';

interface AuthState {
  currentUser: User | null;
  users: User[];
  roles: RolePermission[];
  isLoading: boolean;
  isInitialized: boolean;

  initialize: () => Promise<void>;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permissionName: keyof RolePermission['permissions']) => boolean;
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
  updateUser: (id: string, user: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

const getStoredUser = (): User | null => {
  const stored = localStorage.getItem('senior_system_auth_user');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
};

// SHA-256 fallback for non-secure contexts (HTTP)
async function sha256Fallback(message: string): Promise<string> {
  // Pure JS SHA-256 implementation
  const msgBuffer = new TextEncoder().encode(message);
  
  // Try crypto.subtle first (works on HTTPS and localhost)
  if (globalThis.crypto?.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  // Fallback: manual SHA-256
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
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
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
      const s0 = rightRotate(w[t-15], 7) ^ rightRotate(w[t-15], 18) ^ (w[t-15] >>> 3);
      const s1 = rightRotate(w[t-2], 17) ^ rightRotate(w[t-2], 19) ^ (w[t-2] >>> 10);
      w[t] = (w[t-16] + s0 + w[t-7] + s1) | 0;
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
    .map(v => (v >>> 0).toString(16).padStart(8, '0'))
    .join('');
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: getStoredUser(),
  users: [],
  roles: [],
  isLoading: false,
  isInitialized: false,

  initialize: async () => {
    if (get().isInitialized) return;
    set({ isLoading: true });

    try {
      const [users, roles] = await Promise.all([
        usersService.getAll(),
        rolesService.getAll(),
      ]);

      set({ users, roles, isInitialized: true, isLoading: false });

      // Subscribe to realtime user changes
      usersService.subscribe((updatedUsers) => {
        set({ users: updatedUsers });
        // If current user was updated, sync local session
        const current = get().currentUser;
        if (current) {
          const refreshed = updatedUsers.find((u) => u.id === current.id);
          if (refreshed) {
            localStorage.setItem('senior_system_auth_user', JSON.stringify(refreshed));
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

  login: async (username: string, password: string) => {
    set({ isLoading: true });

    try {
      // Hash password with SHA-256 (with fallback for non-HTTPS contexts)
      let passwordHash: string;
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      
      if (globalThis.crypto?.subtle) {
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      } else {
        // Fallback: manual SHA-256 using simple hash (for HTTP dev environments)
        // Import a pure-JS implementation
        passwordHash = await sha256Fallback(password);
      }

      console.log('[LOGIN DEBUG] Username:', username);
      console.log('[LOGIN DEBUG] Password Hash (SHA-256):', passwordHash);

      // Verify credentials against Supabase
      const user = await usersService.verifyLogin(username, passwordHash);
      if (user) {
        localStorage.setItem('senior_system_auth_user', JSON.stringify(user));
        set({ currentUser: user, isLoading: false });
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

  logout: () => {
    localStorage.removeItem('senior_system_auth_user');
    set({ currentUser: null });
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
        details: `Idinagdag ang bagong system user: ${newUserData.fullName} (${newUserData.role})`,
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

      const target = get().users.find(u => u.id === id);
      const actor = get().currentUser;

      auditLogsService.log({
        action: 'UPDATE',
        entity: 'User',
        details: `In-update ang user account ni: ${updatedFields.fullName || target?.fullName || id}`,
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
        localStorage.setItem('senior_system_auth_user', JSON.stringify(updated));
        set({ currentUser: updated });
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  },

  deleteUser: async (id) => {
    try {
      const target = get().users.find(u => u.id === id);
      const actor = get().currentUser;

      await usersService.delete(id);

      auditLogsService.log({
        action: 'DELETE',
        entity: 'User',
        details: `Tinanggal ang user account ni: ${target ? target.fullName : id}`,
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
