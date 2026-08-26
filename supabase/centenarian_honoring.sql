-- ============================================================
-- OSCA Juban - Centenarian Honoring Claim Form Migration
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. CENTENARIAN HONORING TABLE (main claim form)
CREATE TABLE IF NOT EXISTS centenarian_honoring (
  id TEXT PRIMARY KEY,
  senior_id TEXT REFERENCES seniors(id) ON DELETE CASCADE,

  -- A. Data Privacy Consent
  data_privacy_consent TEXT CHECK (data_privacy_consent IN ('Consent', 'Dissent')),

  -- B. Place of Submission
  place_of_submission TEXT CHECK (place_of_submission IN ('Local', 'Abroad')),

  -- C. PERSONAL INFORMATION
  ncsc_reference_code TEXT,
  osca_number TEXT,
  first_name TEXT NOT NULL,
  middle_name TEXT,
  last_name TEXT NOT NULL,
  suffix TEXT,
  birthdate DATE,
  age INTEGER,
  contact_number TEXT,

  -- C.9.1 Address in the Philippines
  address TEXT,
  barangay TEXT,
  city_town TEXT,
  province TEXT,
  region TEXT,
  zip_code TEXT,

  -- C.9.2 Address Abroad
  abroad_house_no TEXT,
  abroad_street TEXT,
  abroad_city TEXT,
  abroad_state TEXT,
  abroad_country TEXT,
  abroad_zip_code TEXT,

  -- C.10-C.14 Other Personal Info
  sex TEXT CHECK (sex IN ('Male', 'Female')),
  civil_status TEXT CHECK (civil_status IN ('Single', 'Married', 'Widowed', 'Common-Law', 'Others')),
  citizenship TEXT CHECK (citizenship IN ('Filipino', 'Dual')),
  dual_citizen_details TEXT,
  physical_disability BOOLEAN DEFAULT FALSE,
  physical_disability_text TEXT,
  ethnic_origin TEXT,

  -- D. FAMILY INFORMATION
  spouse_last_name TEXT,
  spouse_first_name TEXT,
  spouse_middle_name TEXT,
  spouse_extension TEXT,
  spouse_contact_number TEXT,

  -- D.3-D.6 Children (stored as JSONB array)
  children JSONB DEFAULT '[]'::jsonb,

  -- E. GRANTEE'S TRANSACTION ACCOUNT
  preferred_payment_mode TEXT CHECK (preferred_payment_mode IN ('Landbank', 'Other Banks', 'GCash', 'Palawan PSP')),
  account_number TEXT,
  bank_name TEXT,
  branch_name TEXT,
  bank_address TEXT,
  is_joint_account TEXT CHECK (is_joint_account IN ('Yes', 'No')),
  bic_swift_code TEXT,
  iban TEXT,

  -- F. FOR DECEASED GRANTEES
  is_deceased BOOLEAN DEFAULT FALSE,
  date_of_death TEXT,
  claimant_contact_number TEXT,
  claimant_email TEXT,
  claimant_last_name TEXT,
  claimant_first_name TEXT,
  claimant_middle_name TEXT,
  claimant_extension TEXT,
  claimant_house_no TEXT,
  claimant_street TEXT,
  claimant_barangay TEXT,
  claimant_city TEXT,
  claimant_province TEXT,
  claimant_zip_code TEXT,
  claimant_relationship TEXT,
  claimant_payment_mode TEXT CHECK (claimant_payment_mode IN ('Landbank', 'Other Banks', 'GCash', 'Palawan PSP')),
  claimant_account_number TEXT,
  claimant_bank_name TEXT,
  claimant_branch_name TEXT,
  claimant_bank_address TEXT,
  claimant_is_joint_account TEXT CHECK (claimant_is_joint_account IN ('Yes', 'No')),
  claimant_bic_swift_code TEXT,
  claimant_iban TEXT,

  -- G. ATTESTATION
  grantee_signed TEXT,
  grantee_signature TEXT,
  date_signed DATE,

  -- H. VERIFICATION CHECKLIST
  doc1 BOOLEAN DEFAULT FALSE, -- Accomplished Annex A Grantee/Claimant Form
  doc2 BOOLEAN DEFAULT FALSE, -- Primary ID for Local Applicants
  doc3 BOOLEAN DEFAULT FALSE, -- Primary ID for Applicants Abroad
  doc4 BOOLEAN DEFAULT FALSE, -- Secondary IDs
  doc5 BOOLEAN DEFAULT FALSE, -- Whole-body/half-upper body photo
  doc6 BOOLEAN DEFAULT FALSE, -- Photocopy of bank deposit slip / GCash profile
  doc7 BOOLEAN DEFAULT FALSE, -- PSA/LCR death certificate (for deceased)
  doc8 BOOLEAN DEFAULT FALSE, -- Proof of relationship (for deceased)
  doc9 BOOLEAN DEFAULT FALSE, -- Claimant bank deposit slip / GCash (for deceased)
  doc10 BOOLEAN DEFAULT FALSE, -- Warranty and Release From Liability Form
  doc11 BOOLEAN DEFAULT FALSE, -- LGU/RCF Certification of no relative
  remarks_note_lacking_docs TEXT,

  -- I. VERIFICATION RESULT
  is_eligible BOOLEAN DEFAULT FALSE,
  is_not_eligible BOOLEAN DEFAULT FALSE,
  verifier_signature TEXT,
  verifier_signature_name TEXT,
  verification_date TEXT,
  ncsc_reg_no TEXT,
  verifier_contact_info TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. INDEXES
CREATE INDEX IF NOT EXISTS idx_centenarian_honoring_senior_id ON centenarian_honoring(senior_id);
CREATE INDEX IF NOT EXISTS idx_centenarian_honoring_osca_number ON centenarian_honoring(osca_number);
CREATE INDEX IF NOT EXISTS idx_centenarian_honoring_ncsc_reference ON centenarian_honoring(ncsc_reference_code);
CREATE INDEX IF NOT EXISTS idx_centenarian_honoring_barangay ON centenarian_honoring(barangay);
CREATE INDEX IF NOT EXISTS idx_centenarian_honoring_is_deceased ON centenarian_honoring(is_deceased);

-- 3. ROW LEVEL SECURITY
ALTER TABLE centenarian_honoring ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (adjust as needed)
CREATE POLICY "Allow all access for authenticated users" ON centenarian_honoring
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 4. AUTO-UPDATE updated_at TRIGGER
CREATE OR REPLACE FUNCTION update_centenarian_honoring_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_centenarian_honoring_updated_at
  BEFORE UPDATE ON centenarian_honoring
  FOR EACH ROW
  EXECUTE FUNCTION update_centenarian_honoring_updated_at();
