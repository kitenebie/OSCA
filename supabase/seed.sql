-- OSCA Juban baseline seed data
-- Safe to run repeatedly after applying supabase/migrations/*.sql.
-- This seeds reference/configuration rows only: no login accounts, citizen
-- records, or SMS logs are created by default.

BEGIN;

-- Barangay IDs are stable keys used by the application. On conflict, only the
-- canonical name is updated so existing population and map data are preserved.
INSERT INTO barangays (id, name, population, senior_count) VALUES
  ('brgy-anog', 'Añog', 0, 0),
  ('brgy-aroroy', 'Aroroy', 0, 0),
  ('brgy-bacolod', 'Bacolod', 0, 0),
  ('brgy-binanuahan', 'Binanuahan', 0, 0),
  ('brgy-biriran', 'Biriran', 0, 0),
  ('brgy-buraburan', 'Buraburan', 0, 0),
  ('brgy-calateo', 'Calateo', 0, 0),
  ('brgy-calmayon', 'Calmayon', 0, 0),
  ('brgy-caruhayon', 'Caruhayon', 0, 0),
  ('brgy-catanagan', 'Catanagan', 0, 0),
  ('brgy-catanusan', 'Catanusan', 0, 0),
  ('brgy-cogon', 'Cogon', 0, 0),
  ('brgy-embarcadero', 'Embarcadero', 0, 0),
  ('brgy-guruyan', 'Guruyan', 0, 0),
  ('brgy-lajong', 'Lajong', 0, 0),
  ('brgy-maalo', 'Maalo', 0, 0),
  ('brgy-north-pob', 'North Poblacion', 0, 0),
  ('brgy-puting-sapa', 'Puting Sapa', 0, 0),
  ('brgy-rangas', 'Rangas', 0, 0),
  ('brgy-sablayan', 'Sablayan', 0, 0),
  ('brgy-sipaya', 'Sipaya', 0, 0),
  ('brgy-south-pob', 'South Poblacion', 0, 0),
  ('brgy-taboc', 'Taboc', 0, 0),
  ('brgy-tinago', 'Tinago', 0, 0),
  ('brgy-tughan', 'Tughan', 0, 0)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- Base role columns are shared by the original schema and the expanded RBAC
-- schema in update_roles.sql. Keep role names compatible with the migration's
-- original CHECK constraint; the application supports both naming schemes.
INSERT INTO roles (
  role, can_view_seniors, can_create_senior, can_edit_senior,
  can_approve_reject, can_manage_users, can_generate_reports, can_send_sms
) VALUES
  ('Super Admin', true, true, true, true, true, true, true),
  ('MSWDO Officer', true, true, true, true, false, true, true),
  ('Barangay Encoder', true, true, true, false, false, true, false),
  ('Viewer', true, false, false, false, false, true, false)
ON CONFLICT (role) DO UPDATE SET
  can_view_seniors = EXCLUDED.can_view_seniors,
  can_create_senior = EXCLUDED.can_create_senior,
  can_edit_senior = EXCLUDED.can_edit_senior,
  can_approve_reject = EXCLUDED.can_approve_reject,
  can_manage_users = EXCLUDED.can_manage_users,
  can_generate_reports = EXCLUDED.can_generate_reports,
  can_send_sms = EXCLUDED.can_send_sms;

INSERT INTO benefits (id, title, description, amount, frequency, status) VALUES
  ('seed-benefit-social-pension', 'Social Pension for Indigent Senior Citizens',
   'Monthly social pension benefit. Confirm eligibility and current amount with the responsible agency.',
   0, 'Monthly', 'Active'),
  ('seed-benefit-centenarian', 'Centenarian Cash Gift',
   'Centenarian assistance benefit. Confirm current eligibility and amount with the municipality.',
   0, 'Annual', 'Active'),
  ('seed-benefit-medical', 'Medical Assistance',
   'Medical assistance benefit. Confirm current program terms with the municipality.',
   0, 'Quarterly', 'Active')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  amount = EXCLUDED.amount,
  frequency = EXCLUDED.frequency,
  status = EXCLUDED.status;

INSERT INTO report_templates (id, name, description, type, category, parameters) VALUES
  ('seed-report-master-list', 'Senior Citizens Master List',
   'Alphabetical senior citizen list with optional barangay and status filters.',
   'MasterList', 'Demographic', '["Barangay", "Status", "Age Range"]'::jsonb),
  ('seed-report-pension', 'Pension Beneficiary List',
   'List of senior citizens marked as pension beneficiaries.',
   'Pension', 'Financial', '["Barangay", "Pension Beneficiary"]'::jsonb),
  ('seed-report-census', 'Senior Citizen Census',
   'Demographic summary of registered senior citizens.',
   'Census', 'Demographic', '["Barangay", "Sex", "Civil Status"]'::jsonb),
  ('seed-report-individual', 'Individual Senior Profile',
   'Individual senior citizen profile report.',
   'Individual', 'Administrative', '["OSCA ID Number"]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  type = EXCLUDED.type,
  category = EXCLUDED.category,
  parameters = EXCLUDED.parameters;

COMMIT;
