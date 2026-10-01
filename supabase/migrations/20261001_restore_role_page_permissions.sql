-- Restore page-access permissions that were unintentionally reset to false by
-- earlier Role Configuration saves, which only persisted a subset of fields.
-- The current app persists every permission column going forward.

ALTER TABLE roles
  ADD COLUMN IF NOT EXISTS can_delete_senior BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS can_view_users BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS can_create_user BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS can_edit_user BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS can_delete_user BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS can_delete_reports BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS can_manage_notifications BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS can_access_dashboard BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS can_access_seniors_list BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS can_access_senior_profile BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS can_access_register BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS can_access_reports BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS can_access_sms_center BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS can_access_user_management BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS can_access_find_user BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS can_access_configuration BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS can_access_mapping BOOLEAN DEFAULT false;

UPDATE roles
SET
  can_access_dashboard = true,
  can_access_seniors_list = true,
  can_access_senior_profile = true,
  can_access_mapping = true,
  can_access_find_user = true,
  can_access_register = can_create_senior,
  can_access_reports = can_generate_reports,
  can_access_sms_center = can_send_sms,
  can_access_user_management = can_manage_users,
  can_access_configuration = can_manage_users
WHERE
  can_access_dashboard = false
  AND can_access_seniors_list = false
  AND can_access_senior_profile = false
  AND can_access_register = false
  AND can_access_reports = false
  AND can_access_sms_center = false
  AND can_access_user_management = false
  AND can_access_find_user = false
  AND can_access_configuration = false
  AND can_access_mapping = false;

-- A Super Admin cannot be locked out by an incomplete or legacy role record.
UPDATE roles
SET
  can_view_seniors = true,
  can_create_senior = true,
  can_edit_senior = true,
  can_delete_senior = true,
  can_approve_reject = true,
  can_view_users = true,
  can_create_user = true,
  can_edit_user = true,
  can_delete_user = true,
  can_manage_users = true,
  can_generate_reports = true,
  can_delete_reports = true,
  can_send_sms = true,
  can_manage_notifications = true,
  can_access_dashboard = true,
  can_access_seniors_list = true,
  can_access_senior_profile = true,
  can_access_register = true,
  can_access_reports = true,
  can_access_sms_center = true,
  can_access_user_management = true,
  can_access_find_user = true,
  can_access_configuration = true,
  can_access_mapping = true
WHERE lower(regexp_replace(role, '[^a-zA-Z0-9]', '', 'g')) = 'superadmin';
