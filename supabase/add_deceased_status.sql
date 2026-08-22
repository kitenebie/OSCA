-- ============================================================
-- Migration: Add "Deceased" status option to seniors table
-- Run this in Supabase Dashboard → SQL Editor → Click "Run"
-- ============================================================

-- If your 'status' column uses a CHECK constraint or ENUM type,
-- update it accordingly. Below covers both common patterns:

-- ─── OPTION A: If 'status' is TEXT with a CHECK constraint ───
-- First, drop the existing constraint (adjust name if different):
ALTER TABLE seniors DROP CONSTRAINT IF EXISTS seniors_status_check;

-- Then re-add it with "Deceased" included:
ALTER TABLE seniors ADD CONSTRAINT seniors_status_check
  CHECK (status IN (
    'Pending',
    'Approved',
    'Rejected',
    'For Verification',
    'Deactivated',
    'Deceased',
    'Approved ID',
    'Qualified for NSCS',
    'NSCS Form Submitted',
    'Approved Data Form',
    'Disapproved Data Form',
    'Qualified for Honoring',
    'Approved Honoring',
    'Disapproved Honoring'
  ));

-- ─── OPTION B: If 'status' is just TEXT with no constraint ───
-- (No schema change needed — the app can already write 'Deceased')
-- You only need the code changes above.

-- ─── Optional: Add a deceased_date column for record-keeping ───
ALTER TABLE seniors ADD COLUMN IF NOT EXISTS deceased_date DATE;

-- ─── Optional: Create an index for filtering deceased seniors ───
CREATE INDEX IF NOT EXISTS idx_seniors_deceased
  ON seniors (status) WHERE status = 'Deceased';

-- ─── Example: Mark a senior as deceased ───
-- UPDATE seniors
-- SET status = 'Deceased', deceased_date = '2026-08-21'
-- WHERE id = 'senior-uuid-here';
