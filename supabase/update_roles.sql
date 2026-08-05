-- ============================================================
-- ROLES TABLE — Updated with all 25 permission columns
-- Drop and recreate to match current ConfigurationPage schema
-- ============================================================

DROP TABLE IF EXISTS roles;

CREATE TABLE roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  role TEXT NOT NULL UNIQUE,
  can_view_seniors BOOLEAN DEFAULT false,
  can_create_senior BOOLEAN DEFAULT false,
  can_edit_senior BOOLEAN DEFAULT false,
  can_delete_senior BOOLEAN DEFAULT false,
  can_approve_reject BOOLEAN DEFAULT false,
  can_view_users BOOLEAN DEFAULT false,
  can_create_user BOOLEAN DEFAULT false,
  can_edit_user BOOLEAN DEFAULT false,
  can_delete_user BOOLEAN DEFAULT false,
  can_manage_users BOOLEAN DEFAULT false,
  can_generate_reports BOOLEAN DEFAULT false,
  can_delete_reports BOOLEAN DEFAULT false,
  can_send_sms BOOLEAN DEFAULT false,
  can_manage_notifications BOOLEAN DEFAULT false,
  can_access_dashboard BOOLEAN DEFAULT false,
  can_access_seniors_list BOOLEAN DEFAULT false,
  can_access_senior_profile BOOLEAN DEFAULT false,
  can_access_register BOOLEAN DEFAULT false,
  can_access_reports BOOLEAN DEFAULT false,
  can_access_sms_center BOOLEAN DEFAULT false,
  can_access_user_management BOOLEAN DEFAULT false,
  can_access_find_user BOOLEAN DEFAULT false,
  can_access_configuration BOOLEAN DEFAULT false,
  can_access_mapping BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to roles" ON roles;
CREATE POLICY "Allow all access to roles" ON roles
  FOR ALL USING (true) WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE roles;

-- ============================================================
-- SEED DEFAULT ROLES (7 roles × 24 permissions)
-- ============================================================

INSERT INTO roles (role, can_view_seniors, can_create_senior, can_edit_senior, can_delete_senior, can_approve_reject, can_view_users, can_create_user, can_edit_user, can_delete_user, can_manage_users, can_generate_reports, can_delete_reports, can_send_sms, can_manage_notifications, can_access_dashboard, can_access_seniors_list, can_access_senior_profile, can_access_register, can_access_reports, can_access_sms_center, can_access_user_management, can_access_find_user, can_access_configuration, can_access_mapping)
VALUES
  ('super-admin', true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true),
  ('brgy-admin', true, true, true, false, true, true, true, true, false, false, true, false, true, true, true, true, true, true, true, true, true, true, false, true),
  ('notification-manager', true, false, false, false, false, true, false, false, false, false, true, false, true, true, true, true, true, false, true, true, false, true, false, true),
  ('general-encoder', true, true, true, false, false, false, false, false, false, false, true, false, true, true, true, true, true, true, true, true, false, true, false, true),
  ('brgy-encoder', true, true, true, false, false, false, false, false, false, false, false, false, false, false, true, true, true, true, false, false, false, true, false, true),
  ('brgy-viewer', true, false, false, false, false, false, false, false, false, false, true, false, false, false, true, true, true, false, true, false, false, false, false, true),
  ('general-viewer', true, false, false, false, false, false, false, false, false, false, true, false, false, false, true, true, true, false, true, false, false, false, false, true);

-- Remove old role CHECK constraint from users table (allow dynamic roles)
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
