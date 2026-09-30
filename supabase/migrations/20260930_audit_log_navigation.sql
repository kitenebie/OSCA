-- Store an optional in-app destination with each audit log/notification.
ALTER TABLE audit_logs
  ADD COLUMN IF NOT EXISTS target_page TEXT,
  ADD COLUMN IF NOT EXISTS target_id TEXT;

-- Keep database constraints aligned with the events already emitted by the app.
ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_action_check;
ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_action_check
  CHECK (action IN (
    'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'LOGIN', 'LOGOUT', 'SMS',
    'SESSION_TERMINATE', 'SESSION_TERMINATE_ALL', 'SESSION_EXPIRED',
    'SESSION_RENEW', 'TOGGLE'
  ));

ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_entity_check;
ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_entity_check
  CHECK (entity IN (
    'Senior', 'User', 'Role', 'Report', 'SMS', 'System', 'Session',
    'Grantee Claim Form', 'Grantee Registration'
  ));
