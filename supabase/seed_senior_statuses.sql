-- Optional status workflow seeder for local/demo databases.
-- Run after the seniors table exists. These synthetic rows use dedicated seed
-- IDs; rerunning updates only the status on these rows and never changes
-- existing non-seed senior records.

INSERT INTO seniors (
  id, osca_number, first_name, last_name, birthdate, sex, barangay, status,
  remarks
) VALUES
  ('seed-status-pending', 'OSCA-SEED-STATUS-001', 'Demo Pending', 'Senior', '1950-01-15', 'Female', 'Añog', 'Pending', 'Synthetic status workflow sample.'),
  ('seed-status-approved', 'OSCA-SEED-STATUS-002', 'Demo Approved', 'Senior', '1948-05-21', 'Male', 'Aroroy', 'Approved', 'Synthetic status workflow sample.'),
  ('seed-status-rejected', 'OSCA-SEED-STATUS-003', 'Demo Rejected', 'Senior', '1952-09-03', 'Female', 'Bacolod', 'Rejected', 'Synthetic status workflow sample.'),
  ('seed-status-verification', 'OSCA-SEED-STATUS-004', 'Demo Verification', 'Senior', '1949-12-11', 'Male', 'Binanuahan', 'For Verification', 'Synthetic status workflow sample.'),
  ('seed-status-deactivated', 'OSCA-SEED-STATUS-005', 'Demo Deactivated', 'Senior', '1951-07-30', 'Female', 'Biriran', 'Deactivated', 'Synthetic status workflow sample.')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = NOW();
