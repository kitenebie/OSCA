-- ============================================================
-- AUDIT LOGS & REALTIME NOTIFICATIONS TABLE
-- Stores all system audit events (login, CRUD, approvals, SMS)
-- Used by the Notification Hub in the Configuration page.
-- ============================================================

DROP TABLE IF EXISTS audit_logs;

CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'LOGIN', 'SMS')),
  entity TEXT NOT NULL CHECK (entity IN ('Senior', 'User', 'Role', 'Report', 'SMS', 'System')),
  details TEXT NOT NULL,
  actor_name TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  barangay TEXT,
  timestamp TIMESTAMPTZ DEFAULT now(),
  read BOOLEAN DEFAULT false,
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'success', 'warning', 'danger'))
);

-- Indexes for fast notification queries
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_read ON audit_logs(read);
CREATE INDEX idx_audit_logs_barangay ON audit_logs(barangay);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity);

-- Row Level Security
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to audit_logs" ON audit_logs;
CREATE POLICY "Allow all access to audit_logs" ON audit_logs
  FOR ALL USING (true) WITH CHECK (true);

-- Enable Supabase Realtime
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'audit_logs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE audit_logs;
  END IF;
END $$;
