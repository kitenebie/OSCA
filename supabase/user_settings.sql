-- ============================================================
-- USER SETTINGS TABLE (per-user theme/configuration)
-- Run this to create or update the table with all required columns.
-- ============================================================

-- Drop and recreate to ensure all columns exist
DROP TABLE IF EXISTS user_settings;

CREATE TABLE user_settings (
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
  mode TEXT DEFAULT 'light',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookup by user
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);

-- Auto-update updated_at on change
CREATE OR REPLACE FUNCTION update_user_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_user_settings_updated ON user_settings;
CREATE TRIGGER trg_user_settings_updated
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_user_settings_timestamp();

-- RLS Policies
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to user_settings" ON user_settings;
CREATE POLICY "Allow all access to user_settings" ON user_settings
  FOR ALL USING (true) WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE user_settings;
