import { supabase } from '../../utils/supabase';

// ============================================================
// SESSION SERVICE
// Manages user session tokens with 60-minute expiration
// ============================================================

export interface UserSession {
  id: string;
  userId: string;
  sessionToken: string;
  refreshToken: string | null;
  createdAt: string;
  expiresAt: string;
  lastActivity: string;
  isActive: boolean;
  rememberMe: boolean;
  deviceName: string | null;
  ipAddress: string | null;
  location: string | null;
  terminatedBy: string | null;
}

const SESSION_DURATION_MINUTES = 60;
const REFRESH_TOKEN_DAYS = 30; // Remember Me lasts 30 days

// Generate a cryptographically secure random token
function generateToken(length: number = 64): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

function mapSessionFromDB(row: any): UserSession {
  return {
    id: row.id,
    userId: row.user_id,
    sessionToken: row.session_token,
    refreshToken: row.refresh_token || null,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    lastActivity: row.last_activity,
    isActive: row.is_active,
    rememberMe: row.remember_me,
    deviceName: row.device_name || null,
    ipAddress: row.ip_address || null,
    location: row.location || null,
    terminatedBy: row.terminated_by || null,
  };
}

export const sessionService = {
  /**
   * Create a new session after successful login.
   * Returns session token (stored in localStorage) and refresh token (if remember me).
   * Now captures device info (device name, IP, location).
   */
  async createSession(
    userId: string,
    rememberMe: boolean = false,
    deviceInfo?: { deviceName: string; ipAddress: string; location: string }
  ): Promise<UserSession> {
    // Deactivate any existing active sessions for this user (single-session policy)
    await supabase
      .from('user_sessions')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('is_active', true);

    const sessionToken = generateToken(64);
    const refreshToken = rememberMe ? generateToken(80) : null;

    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_DURATION_MINUTES * 60 * 1000);

    const { data, error } = await supabase
      .from('user_sessions')
      .insert({
        user_id: userId,
        session_token: sessionToken,
        refresh_token: refreshToken,
        expires_at: expiresAt.toISOString(),
        is_active: true,
        remember_me: rememberMe,
        device_name: deviceInfo?.deviceName || null,
        ip_address: deviceInfo?.ipAddress || null,
        location: deviceInfo?.location || null,
      })
      .select()
      .single();

    if (error) throw error;
    return mapSessionFromDB(data);
  },

  /**
   * Validate a session token. Returns the session if valid and not expired.
   */
  async validateSession(sessionToken: string): Promise<UserSession | null> {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .eq('is_active', true)
      .single();

    if (error || !data) return null;

    const session = mapSessionFromDB(data);
    const now = new Date();
    const expiresAt = new Date(session.expiresAt);

    // Check if session has expired
    if (now > expiresAt) {
      // Mark session as inactive
      await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('id', session.id);
      return null;
    }

    return session;
  },

  /**
   * Refresh a session using a refresh token (Remember Me auto-relogin).
   * Creates a brand new session token with fresh 60-min expiry.
   * Carries over device info from the original session.
   */
  async refreshSession(refreshToken: string): Promise<UserSession | null> {
    // Find the session with this refresh token
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('refresh_token', refreshToken)
      .eq('remember_me', true)
      .single();

    if (error || !data) return null;

    const session = mapSessionFromDB(data);

    // IMPORTANT: Do NOT refresh if session was force-terminated by admin
    if (session.terminatedBy) {
      // Admin explicitly killed this session — do not allow re-authentication
      console.log('[SESSION] Refresh blocked: session was force-terminated by', session.terminatedBy);
      return null;
    }

    // Check if refresh token is still within 30-day window
    const createdAt = new Date(session.createdAt);
    const refreshExpiry = new Date(createdAt.getTime() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);
    const now = new Date();

    if (now > refreshExpiry) {
      // Refresh token expired, user must login manually
      await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('id', session.id);
      return null;
    }

    // Deactivate old session
    await supabase
      .from('user_sessions')
      .update({ is_active: false })
      .eq('id', session.id);

    // Create a new session with fresh tokens (carry over device info)
    const newSessionToken = generateToken(64);
    const newRefreshToken = generateToken(80);
    const expiresAt = new Date(now.getTime() + SESSION_DURATION_MINUTES * 60 * 1000);

    const { data: newData, error: newError } = await supabase
      .from('user_sessions')
      .insert({
        user_id: session.userId,
        session_token: newSessionToken,
        refresh_token: newRefreshToken,
        expires_at: expiresAt.toISOString(),
        is_active: true,
        remember_me: true,
        device_name: session.deviceName,
        ip_address: session.ipAddress,
        location: session.location,
      })
      .select()
      .single();

    if (newError) return null;
    return mapSessionFromDB(newData);
  },

  /**
   * Update last activity timestamp (call periodically to track user activity).
   */
  async touchSession(sessionToken: string): Promise<void> {
    await supabase
      .from('user_sessions')
      .update({ last_activity: new Date().toISOString() })
      .eq('session_token', sessionToken)
      .eq('is_active', true);
  },

  /**
   * Extend session expiration by another 60 minutes from now (sliding expiration).
   */
  async extendSession(sessionToken: string): Promise<void> {
    const now = new Date();
    const newExpiry = new Date(now.getTime() + SESSION_DURATION_MINUTES * 60 * 1000);
    await supabase
      .from('user_sessions')
      .update({
        expires_at: newExpiry.toISOString(),
        last_activity: now.toISOString(),
      })
      .eq('session_token', sessionToken)
      .eq('is_active', true);
  },

  /**
   * Invalidate/logout a session.
   */
  async destroySession(sessionToken: string): Promise<void> {
    await supabase
      .from('user_sessions')
      .update({ is_active: false })
      .eq('session_token', sessionToken);
  },

  /**
   * Destroy all sessions for a user (force logout everywhere).
   */
  async destroyAllUserSessions(userId: string): Promise<void> {
    await supabase
      .from('user_sessions')
      .update({ is_active: false })
      .eq('user_id', userId);
  },

  /**
   * Get all active sessions for a user (for admin/security dashboard).
   */
  async getUserActiveSessions(userId: string): Promise<UserSession[]> {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) return [];
    return (data || []).map(mapSessionFromDB);
  },

  /**
   * Get ALL active sessions across all users (admin only).
   */
  async getAllActiveSessions(): Promise<UserSession[]> {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) return [];
    return (data || []).map(mapSessionFromDB);
  },

  /**
   * Force-terminate a specific session by ID (admin action).
   * Stores the name of who terminated it so the user can be notified.
   */
  async forceTerminateSession(sessionId: string, terminatedBy?: string): Promise<boolean> {
    const { error } = await supabase
      .from('user_sessions')
      .update({
        is_active: false,
        terminated_by: terminatedBy || null,
        refresh_token: null, // Clear refresh token to prevent auto-relogin
      })
      .eq('id', sessionId);

    return !error;
  },

  /**
   * Check if a session was force-terminated by an admin.
   * Returns the terminator's name if yes, null if not found or naturally expired.
   */
  async getTerminationInfo(sessionToken: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('terminated_by')
      .eq('session_token', sessionToken)
      .eq('is_active', false)
      .single();

    if (error || !data) return null;
    return data.terminated_by || null;
  },
};
