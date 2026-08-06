-- ====================================================
-- TABLE: document_signatories
-- Stores reusable signatory data for reports/certificates
-- ====================================================

DROP TABLE IF EXISTS document_signatories;

CREATE TABLE document_signatories (
  id TEXT PRIMARY KEY DEFAULT ('sig-' || extract(epoch from now())::bigint::text),
  document_type TEXT NOT NULL,  -- 'osca-transmittal', 'mswdo-transmittal', 'certificate-transfer', 'certification', 'masterlist'
  role_key TEXT NOT NULL,       -- 'osca_head', 'mswdo_head', 'mayor', 'recipient', 'admin_assistant'
  full_name TEXT NOT NULL DEFAULT '',
  title TEXT DEFAULT '',         -- e.g. 'OSCA Head', 'Acting MSWDO', 'Municipal Mayor'
  designation TEXT DEFAULT '',   -- e.g. 'RSW', 'NCSC Regional Director'
  license_no TEXT DEFAULT '',    -- e.g. 'Lic. No. 0032243'
  address TEXT DEFAULT '',       -- e.g. 'Legazpi City, Albay'
  is_default BOOLEAN DEFAULT true,  -- if true, auto-loads when creating new document
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(document_type, role_key)
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE document_signatories;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_signatories_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_signatories_updated_at
  BEFORE UPDATE ON document_signatories
  FOR EACH ROW EXECUTE FUNCTION update_signatories_timestamp();

-- ====================================================
-- SEED: Default signatory data
-- ====================================================

INSERT INTO document_signatories (id, document_type, role_key, full_name, title, designation, address) VALUES
-- OSCA Transmittal
('sig-osca-head', 'osca-transmittal', 'osca_head', 'MARCIANA G. OLONDRIZ', 'OSCA Head', '', ''),
('sig-osca-recipient', 'osca-transmittal', 'recipient', 'ATTY. CLARISSA LAVENA A. BOMBASE PACAMARRA', 'NCSC Regional Director', '', 'Legazpi City, Albay'),
('sig-osca-admin', 'osca-transmittal', 'admin_assistant', 'VHINZ KENNETH LORAYES', 'Administrative Assistant I', '', ''),
('sig-osca-noted', 'osca-transmittal', 'noted_by', 'JANELA J. HAINTO', 'Acting MSWDO', 'RSW', ''),

-- MSWDO Transmittal
('sig-mswdo-head', 'mswdo-transmittal', 'mswdo_head', 'JANELA J. HAINTO', 'Acting MSWDO', '', ''),
('sig-mswdo-recipient', 'mswdo-transmittal', 'recipient', 'ATTY. MA. CLARISSA LAVENA A. BOMBASE-PACAMARRA', 'NCSC Regional Director', '', 'Legazpi City, Albay'),
('sig-mswdo-mayor', 'mswdo-transmittal', 'mayor', 'HON. ROGEL "BOTOX" B. FULLEROS', 'Municipal Mayor', '', ''),

-- Certificate of Transfer
('sig-transfer-osca', 'certificate-transfer', 'osca_head', 'MARCIANA G. OLONDRIZ', 'OSCA Head', '', ''),
('sig-transfer-mswdo', 'certificate-transfer', 'mswdo_head', 'JANELA J. HAINTO', 'Acting MSWDO', 'RSW', 'Lic. No. 0032243'),

-- Certification (DSWD Pension)
('sig-cert-osca', 'certification', 'osca_head', 'MARCIANA G. OLONDRIZ', 'OSCA Head', '', ''),
('sig-cert-mswdo', 'certification', 'mswdo_head', 'JANELA J. HAINTO', 'Acting MSWDO', 'RSW', 'Lic. No. 0032243'),

-- Masterlist
('sig-master-osca', 'masterlist', 'osca_head', 'MARCIANA G. OLONDRIZ', 'OSCA Head / S. Focal', '', ''),
('sig-master-mswdo', 'masterlist', 'mswdo_head', 'JANELA J. HAINTO', 'OIC MSWDO', '', ''),
('sig-master-mayor', 'masterlist', 'mayor', 'HON. ROGEL "BOTOX" B. FULLEROS', 'Municipal Mayor', '', ''),
('sig-master-admin', 'masterlist', 'admin_assistant', 'VHINZ KENNETH LORAYES', 'Administrative Assistant I', '', '');

-- RLS: Allow all (public data)
ALTER TABLE document_signatories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access" ON document_signatories FOR ALL USING (true) WITH CHECK (true);
