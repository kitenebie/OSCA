-- ============================================================
-- PhilHealth Transmittal Selected Seniors
-- Stores which seniors are selected for each PhilHealth transmittal.
-- ============================================================

CREATE TABLE IF NOT EXISTS philhealth_transmittal_seniors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  senior_id TEXT NOT NULL REFERENCES seniors(id) ON DELETE CASCADE,
  barangay_filter TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ph_transmittal_barangay ON philhealth_transmittal_seniors(barangay_filter);

-- PhilHealth transmittal settings (address, etc.)
CREATE TABLE IF NOT EXISTS philhealth_transmittal_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default address
INSERT INTO philhealth_transmittal_settings (setting_key, setting_value)
VALUES ('ph_office_address', 'Legazpi City, Albay')
ON CONFLICT (setting_key) DO NOTHING;

-- RLS
ALTER TABLE philhealth_transmittal_seniors ENABLE ROW LEVEL SECURITY;
ALTER TABLE philhealth_transmittal_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated" ON philhealth_transmittal_seniors FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON philhealth_transmittal_seniors FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON philhealth_transmittal_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON philhealth_transmittal_settings FOR ALL TO anon USING (true) WITH CHECK (true);
