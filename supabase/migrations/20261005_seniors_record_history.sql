-- Keep an immutable, per-save snapshot of the Senior Registration Step 11 data.
ALTER TABLE seniors ADD COLUMN IF NOT EXISTS interview_place TEXT;

CREATE TABLE IF NOT EXISTS seniors_record_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  senior_id TEXT NOT NULL,
  senior_name TEXT NOT NULL,
  osca_number TEXT,
  barangay TEXT,
  action TEXT NOT NULL CHECK (action IN ('CREATE', 'UPDATE')),
  previous_data JSONB,
  current_data JSONB NOT NULL,
  changes JSONB NOT NULL DEFAULT '{}'::jsonb,
  changed_by TEXT DEFAULT COALESCE(auth.jwt() ->> 'email', auth.uid()::text),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seniors_record_history_senior_id ON seniors_record_history (senior_id, changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_seniors_record_history_barangay ON seniors_record_history (barangay, changed_at DESC);

CREATE OR REPLACE FUNCTION log_senior_record_history()
RETURNS TRIGGER AS $$
DECLARE
  previous_snapshot JSONB;
  current_snapshot JSONB;
  field_changes JSONB;
BEGIN
  current_snapshot := to_jsonb(NEW);

  IF TG_OP = 'INSERT' THEN
    INSERT INTO seniors_record_history (senior_id, senior_name, osca_number, barangay, action, current_data, changes)
    VALUES (
      NEW.id,
      concat_ws(' ', NEW.first_name, NULLIF(NEW.middle_name, ''), NEW.last_name, NULLIF(NEW.suffix, '')),
      NEW.osca_number,
      NEW.barangay,
      'CREATE',
      current_snapshot,
      jsonb_build_object('record', jsonb_build_object('previous', NULL, 'current', current_snapshot))
    );
    RETURN NEW;
  END IF;

  previous_snapshot := to_jsonb(OLD);
  SELECT COALESCE(jsonb_object_agg(current_field.key, jsonb_build_object('previous', previous_field.value, 'current', current_field.value)), '{}'::jsonb)
  INTO field_changes
  FROM jsonb_each(current_snapshot) AS current_field
  JOIN jsonb_each(previous_snapshot) AS previous_field USING (key)
  WHERE current_field.value IS DISTINCT FROM previous_field.value
    AND current_field.key NOT IN ('updated_at');

  IF field_changes = '{}'::jsonb THEN
    RETURN NEW;
  END IF;

  INSERT INTO seniors_record_history (senior_id, senior_name, osca_number, barangay, action, previous_data, current_data, changes)
  VALUES (
    NEW.id,
    concat_ws(' ', NEW.first_name, NULLIF(NEW.middle_name, ''), NEW.last_name, NULLIF(NEW.suffix, '')),
    NEW.osca_number,
    NEW.barangay,
    'UPDATE',
    previous_snapshot,
    current_snapshot,
    field_changes
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_seniors_record_history ON seniors;
CREATE TRIGGER trg_seniors_record_history
  AFTER INSERT OR UPDATE ON seniors
  FOR EACH ROW EXECUTE FUNCTION log_senior_record_history();

ALTER TABLE seniors_record_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to seniors record history"
  ON seniors_record_history FOR ALL USING (true) WITH CHECK (true);
