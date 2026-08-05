-- ============================================================
-- OSCA Juban - Supabase Migration (Notifications & User Settings)
-- Migration Date: 2026-08-05
-- Run this script in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. AUDIT LOGS & REALTIME NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'LOGIN', 'SMS')),
  entity TEXT NOT NULL CHECK (entity IN ('Senior', 'User', 'Role', 'Report', 'SMS', 'System')),
  details TEXT NOT NULL,
  actor_name TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  barangay TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE,
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'success', 'warning', 'danger'))
);

-- Indexes for fast notification queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_read ON audit_logs(read);
CREATE INDEX IF NOT EXISTS idx_audit_logs_barangay ON audit_logs(barangay);

-- RLS Security Policies for audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to audit_logs" ON audit_logs;
CREATE POLICY "Allow all access to audit_logs" ON audit_logs FOR ALL USING (true) WITH CHECK (true);

-- Enable Supabase Realtime for audit_logs (Idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'audit_logs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE audit_logs;
  END IF;
END $$;


-- 2. USER SETTINGS & THEME CONFIGURATION TABLE
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  font_family TEXT DEFAULT 'Inter',
  font_size TEXT DEFAULT '14px',
  primary_color TEXT DEFAULT '#02A952',
  secondary_color TEXT DEFAULT '#0F766E',
  info_color TEXT DEFAULT '#0284C7',
  danger_color TEXT DEFAULT '#DC2626',
  warning_color TEXT DEFAULT '#D97706',
  bg_tint TEXT DEFAULT '#f8fafc',
  mode TEXT DEFAULT 'light' CHECK (mode IN ('light', 'dark')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast user_id lookup
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- Auto-update updated_at trigger for user_settings
CREATE OR REPLACE FUNCTION update_user_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_user_settings_updated ON user_settings;
CREATE TRIGGER trg_user_settings_updated
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_user_settings_timestamp();

-- RLS Security Policies for user_settings
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to user_settings" ON user_settings;
CREATE POLICY "Allow all access to user_settings" ON user_settings FOR ALL USING (true) WITH CHECK (true);

-- Enable Supabase Realtime for user_settings (Idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'user_settings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE user_settings;
  END IF;
END $$;
