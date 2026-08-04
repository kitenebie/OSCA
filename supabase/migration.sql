-- ============================================================



-- OSCA Juban - Supabase Database Migration



-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)



-- ============================================================







-- 1. BARANGAYS TABLE



CREATE TABLE IF NOT EXISTS barangays (



  id TEXT PRIMARY KEY,



  name TEXT NOT NULL,



  population INTEGER DEFAULT 0,



  senior_count INTEGER DEFAULT 0,



  center_lat DOUBLE PRECISION,



  center_lng DOUBLE PRECISION,



  barangay_hall_address TEXT,



  created_at TIMESTAMPTZ DEFAULT NOW(),



  updated_at TIMESTAMPTZ DEFAULT NOW()



);







-- 2. USERS TABLE (system operators)



CREATE TABLE IF NOT EXISTS users (



  id TEXT PRIMARY KEY,



  username TEXT UNIQUE NOT NULL,



  full_name TEXT NOT NULL,



  role TEXT NOT NULL CHECK (role IN ('Super Admin', 'MSWDO Officer', 'Barangay Encoder', 'Viewer')),



  barangay_assigned TEXT,



  contact_number TEXT,



  email TEXT,



  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Deactivated')),



  profile_photo TEXT,



  created_at TIMESTAMPTZ DEFAULT NOW(),



  updated_at TIMESTAMPTZ DEFAULT NOW()



);







-- 3. SENIORS TABLE (main data)



CREATE TABLE IF NOT EXISTS seniors (



  id TEXT PRIMARY KEY,



  osca_number TEXT UNIQUE NOT NULL,



  first_name TEXT NOT NULL,



  middle_name TEXT,



  last_name TEXT NOT NULL,



  suffix TEXT,



  birthdate DATE NOT NULL,



  age INTEGER,



  sex TEXT NOT NULL CHECK (sex IN ('Male', 'Female')),



  civil_status TEXT CHECK (civil_status IN ('Single', 'Married', 'Widowed', 'Separated', 'Divorced')),



  contact_number TEXT,



  barangay TEXT NOT NULL,



  address TEXT,



  lat DOUBLE PRECISION,



  lng DOUBLE PRECISION,



  profile_photo TEXT,



  thumbprint_data TEXT,



  signature_data TEXT,



  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected', 'For Verification', 'Deactivated')),



  registered_date DATE DEFAULT CURRENT_DATE,



  registered_by TEXT,



  pension_beneficiary BOOLEAN DEFAULT FALSE,



  remarks TEXT,



  -- Extended fields



  region TEXT,



  province TEXT,



  city_town TEXT,



  telephone TEXT,



  email_address TEXT,



  blood_type TEXT,



  religion TEXT,



  highest_educational_attainment TEXT,



  gsis TEXT,



  sss TEXT,



  tin TEXT,



  phil_health TEXT,



  employment_status TEXT,



  classification TEXT,



  monthly_pension TEXT,



  emergency_contact_name TEXT,



  emergency_contact_phone TEXT,



  valid_id_photo TEXT,



  in_risk_area TEXT CHECK (in_risk_area IN ('yes', 'no')),



  risk_type TEXT,



  risk_details TEXT,



  risk_severity TEXT CHECK (risk_severity IN ('low', 'medium', 'high', 'critical')),



  created_at TIMESTAMPTZ DEFAULT NOW(),



  updated_at TIMESTAMPTZ DEFAULT NOW()



);







-- 4. BENEFITS TABLE



CREATE TABLE IF NOT EXISTS benefits (



  id TEXT PRIMARY KEY,



  title TEXT NOT NULL,



  description TEXT,



  amount NUMERIC(12,2) DEFAULT 0,



  frequency TEXT CHECK (frequency IN ('Monthly', 'Quarterly', 'Bi-Annual', 'Annual')),



  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Completed', 'Suspended')),



  distribution_date DATE,



  created_at TIMESTAMPTZ DEFAULT NOW(),



  updated_at TIMESTAMPTZ DEFAULT NOW()



);







-- 5. SMS LOGS TABLE



CREATE TABLE IF NOT EXISTS sms_logs (



  id TEXT PRIMARY KEY,



  recipient_name TEXT NOT NULL,



  recipient_phone TEXT,



  barangay TEXT,



  message TEXT NOT NULL,



  status TEXT DEFAULT 'Pending' CHECK (status IN ('Sent', 'Failed', 'Pending')),



  sent_by TEXT,



  timestamp TIMESTAMPTZ DEFAULT NOW(),



  created_at TIMESTAMPTZ DEFAULT NOW()



);







-- 6. ROLES TABLE



CREATE TABLE IF NOT EXISTS roles (



  role TEXT PRIMARY KEY,



  can_view_seniors BOOLEAN DEFAULT FALSE,



  can_create_senior BOOLEAN DEFAULT FALSE,



  can_edit_senior BOOLEAN DEFAULT FALSE,



  can_approve_reject BOOLEAN DEFAULT FALSE,



  can_manage_users BOOLEAN DEFAULT FALSE,



  can_generate_reports BOOLEAN DEFAULT FALSE,



  can_send_sms BOOLEAN DEFAULT FALSE



);







-- 7. REPORT TEMPLATES TABLE



CREATE TABLE IF NOT EXISTS report_templates (



  id TEXT PRIMARY KEY,



  name TEXT NOT NULL,



  description TEXT,



  type TEXT CHECK (type IN ('MasterList', 'Pension', 'Census', 'Individual')),



  category TEXT CHECK (category IN ('Demographic', 'Financial', 'Administrative')),



  parameters JSONB DEFAULT '[]'::jsonb,



  created_at TIMESTAMPTZ DEFAULT NOW()



);







-- ============================================================



-- INDEXES for performance



-- ============================================================



CREATE INDEX IF NOT EXISTS idx_seniors_barangay ON seniors(barangay);



CREATE INDEX IF NOT EXISTS idx_seniors_status ON seniors(status);



CREATE INDEX IF NOT EXISTS idx_seniors_osca_number ON seniors(osca_number);



CREATE INDEX IF NOT EXISTS idx_sms_logs_barangay ON sms_logs(barangay);



CREATE INDEX IF NOT EXISTS idx_sms_logs_timestamp ON sms_logs(timestamp DESC);



CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);



CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);







-- ============================================================



-- AUTO-UPDATE updated_at TRIGGER



-- ============================================================



CREATE OR REPLACE FUNCTION update_updated_at_column()



RETURNS TRIGGER AS $$



BEGIN



  NEW.updated_at = NOW();



  RETURN NEW;



END;



$$ language 'plpgsql';







CREATE TRIGGER update_seniors_updated_at BEFORE UPDATE ON seniors



  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();







CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users



  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();







CREATE TRIGGER update_barangays_updated_at BEFORE UPDATE ON barangays



  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();







CREATE TRIGGER update_benefits_updated_at BEFORE UPDATE ON benefits



  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();







-- ============================================================



-- ROW LEVEL SECURITY (RLS) - Enable but allow all for now



-- ============================================================



ALTER TABLE seniors ENABLE ROW LEVEL SECURITY;



ALTER TABLE users ENABLE ROW LEVEL SECURITY;



ALTER TABLE barangays ENABLE ROW LEVEL SECURITY;



ALTER TABLE benefits ENABLE ROW LEVEL SECURITY;



ALTER TABLE sms_logs ENABLE ROW LEVEL SECURITY;



ALTER TABLE roles ENABLE ROW LEVEL SECURITY;



ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;







-- Allow full access with anon key (adjust later for production auth)



CREATE POLICY "Allow all access" ON seniors FOR ALL USING (true) WITH CHECK (true);



CREATE POLICY "Allow all access" ON users FOR ALL USING (true) WITH CHECK (true);



CREATE POLICY "Allow all access" ON barangays FOR ALL USING (true) WITH CHECK (true);



CREATE POLICY "Allow all access" ON benefits FOR ALL USING (true) WITH CHECK (true);



CREATE POLICY "Allow all access" ON sms_logs FOR ALL USING (true) WITH CHECK (true);



CREATE POLICY "Allow all access" ON roles FOR ALL USING (true) WITH CHECK (true);



CREATE POLICY "Allow all access" ON report_templates FOR ALL USING (true) WITH CHECK (true);







-- ============================================================



-- ENABLE REALTIME for key tables



-- ============================================================



ALTER PUBLICATION supabase_realtime ADD TABLE seniors;



ALTER PUBLICATION supabase_realtime ADD TABLE users;



ALTER PUBLICATION supabase_realtime ADD TABLE sms_logs;



ALTER PUBLICATION supabase_realtime ADD TABLE benefits;



