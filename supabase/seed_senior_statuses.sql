-- Optional status workflow seeder for local/demo databases.
-- Apply add_deceased_status.sql first so the seniors.status CHECK constraint
-- accepts the full set of status values below. These synthetic rows use
-- dedicated seed IDs; rerunning updates only their status and leaves
-- non-seed senior records untouched.

INSERT INTO seniors (
  id, osca_number, first_name, last_name, birthdate, sex, barangay, status,
  remarks
) VALUES
  ('seed-status-verification', 'OSCA-SEED-STATUS-001', 'Demo Verification', 'Senior', '1950-01-15', 'Female', 'Añog', 'For Verification', 'Synthetic status workflow sample.'),
  ('seed-status-approved-id', 'OSCA-SEED-STATUS-002', 'Demo Approved ID', 'Senior', '1948-05-21', 'Male', 'Aroroy', 'Approved ID', 'Synthetic status workflow sample.'),
  ('seed-status-qualified-nscs', 'OSCA-SEED-STATUS-003', 'Demo Qualified NSCS', 'Senior', '1952-09-03', 'Female', 'Bacolod', 'Qualified for NSCS', 'Synthetic status workflow sample.'),
  ('seed-status-nscs-submitted', 'OSCA-SEED-STATUS-004', 'Demo NSCS Submitted', 'Senior', '1949-12-11', 'Male', 'Binanuahan', 'NSCS Form Submitted', 'Synthetic status workflow sample.'),
  ('seed-status-approved-data', 'OSCA-SEED-STATUS-005', 'Demo Approved Data', 'Senior', '1951-07-30', 'Female', 'Biriran', 'Approved Data Form', 'Synthetic status workflow sample.'),
  ('seed-status-disapproved-data', 'OSCA-SEED-STATUS-006', 'Demo Disapproved Data', 'Senior', '1947-04-09', 'Male', 'Buraburan', 'Disapproved Data Form', 'Synthetic status workflow sample.'),
  ('seed-status-qualified-honoring', 'OSCA-SEED-STATUS-007', 'Demo Qualified Honoring', 'Senior', '1953-02-18', 'Female', 'Calateo', 'Qualified for Honoring', 'Synthetic status workflow sample.'),
  ('seed-status-rejected', 'OSCA-SEED-STATUS-008', 'Demo Rejected', 'Senior', '1946-10-26', 'Male', 'Calmayon', 'Rejected', 'Synthetic status workflow sample.'),
  ('seed-status-deactivated', 'OSCA-SEED-STATUS-009', 'Demo Deactivated', 'Senior', '1954-06-14', 'Female', 'Caruhayon', 'Deactivated', 'Synthetic status workflow sample.'),
  ('seed-status-deceased', 'OSCA-SEED-STATUS-010', 'Demo Deceased', 'Senior', '1945-03-05', 'Male', 'Catanagan', 'Deceased', 'Synthetic status workflow sample.')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = NOW();
