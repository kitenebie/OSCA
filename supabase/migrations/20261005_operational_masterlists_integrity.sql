-- A deceased status is only valid when the reportable death fields are complete.
UPDATE seniors
SET is_deceased = TRUE
WHERE status = 'Deceased' AND is_deceased IS DISTINCT FROM TRUE;

ALTER TABLE seniors DROP CONSTRAINT IF EXISTS seniors_deceased_data_check;
ALTER TABLE seniors ADD CONSTRAINT seniors_deceased_data_check
  CHECK (status <> 'Deceased' OR (is_deceased IS TRUE AND date_of_death IS NOT NULL)) NOT VALID;
