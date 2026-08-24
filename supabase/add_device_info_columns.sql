-- Migration: Add device info + session termination columns to user_sessions table
-- Run this in Supabase SQL Editor

ALTER TABLE user_sessions
ADD COLUMN IF NOT EXISTS device_name TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS ip_address TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS location TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS terminated_by TEXT DEFAULT NULL;

-- Documentation
COMMENT ON COLUMN user_sessions.device_name IS 'Browser and OS info parsed from User-Agent';
COMMENT ON COLUMN user_sessions.ip_address IS 'Client IP address captured at login';
COMMENT ON COLUMN user_sessions.location IS 'Approximate location derived from IP (city, region)';
COMMENT ON COLUMN user_sessions.terminated_by IS 'Name of admin who force-terminated this session';

-- Set REPLICA IDENTITY FULL so realtime UPDATE events include full row data
ALTER TABLE user_sessions REPLICA IDENTITY FULL;

-- Enable Supabase Realtime on user_sessions (required for instant force-logout)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'user_sessions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE user_sessions;
  END IF;
END $$;
