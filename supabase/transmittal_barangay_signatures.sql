-- ============================================================
-- Transmittal Barangay Signatures
-- Stores the barangay + signature count rows for transmittal documents.
-- ============================================================

CREATE TABLE IF NOT EXISTS transmittal_barangay_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_type TEXT NOT NULL DEFAULT 'osca-transmittal',
  barangay_name TEXT NOT NULL,
  signature_count INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup by document type
CREATE INDEX IF NOT EXISTS idx_tbs_document_type ON transmittal_barangay_signatures(document_type);

-- RLS policies (adjust as needed)
ALTER TABLE transmittal_barangay_signatures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated users"
  ON transmittal_barangay_signatures
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Also allow anon for dev convenience
CREATE POLICY "Allow all for anon"
  ON transmittal_barangay_signatures
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);
