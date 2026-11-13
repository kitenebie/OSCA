ALTER TABLE public.centenarian_honoring
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ;

ALTER TABLE public.centenarian_honoring
  DROP CONSTRAINT IF EXISTS centenarian_honoring_status_check;

ALTER TABLE public.centenarian_honoring
  ADD CONSTRAINT centenarian_honoring_status_check
  CHECK (status IN (
    'Pending',
    'Under Review',
    'Verified',
    'Approved',
    'Rejected',
    'Ready for claim',
    'Unclaimed',
    'Claimed',
    'Submitted'
  ));
