-- Drop constraints that conflict with seed data
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_barangay_assigned_fkey;
ALTER TABLE seniors DROP CONSTRAINT IF EXISTS seniors_in_risk_area_check;
ALTER TABLE seniors DROP CONSTRAINT IF EXISTS seniors_risk_severity_check;
