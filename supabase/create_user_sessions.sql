-- ============================================================
-- USER SESSIONS TABLE
-- Tracks active login sessions with token-based security
-- ============================================================

CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  refresh_token TEXT UNIQUE,          -- Long-lived token for "Remember Me" auto-relogin
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,    -- 60 minutes from creation
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  remember_me BOOLEAN DEFAULT FALSE,
  ip_address TEXT,
  user_agent TEXT
);

-- Index for fast token lookups
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_refresh ON user_sessions(refresh_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);

-- Auto-cleanup expired sessions (optional - run via cron or Supabase Edge Function)
-- DELETE FROM user_sessions WHERE expires_at < NOW() AND is_active = FALSE;
