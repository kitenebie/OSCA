-- ============================================================
-- FIX: Update audit_logs CHECK constraints to allow session actions
-- Run this in Supabase SQL Editor to fix 400 Bad Request errors
-- ============================================================

-- Drop the existing CHECK constraints
ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_action_check;
ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_entity_check;

-- Re-create with expanded allowed values
ALTER TABLE audit_logs 
ADD CONSTRAINT audit_logs_action_check 
CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'LOGIN', 'SMS', 'SESSION_TERMINATE', 'SESSION_TERMINATE_ALL', 'SESSION_EXPIRED', 'SESSION_RENEW', 'LOGOUT'));

ALTER TABLE audit_logs 
ADD CONSTRAINT audit_logs_entity_check 
CHECK (entity IN ('Senior', 'User', 'Role', 'Report', 'SMS', 'System', 'Session'));
