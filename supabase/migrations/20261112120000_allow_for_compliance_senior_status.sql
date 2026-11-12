ALTER TABLE public.seniors DROP CONSTRAINT IF EXISTS seniors_status_check;

ALTER TABLE public.seniors ADD CONSTRAINT seniors_status_check
  CHECK (status IN (
    'Pending',
    'Approved',
    'Rejected',
    'For Verification',
    'For Compliance',
    'Deactivated',
    'Deceased',
    'Approved ID',
    'Qualified for NSCS',
    'NSCS Form Submitted',
    'Approved Data Form',
    'Disapproved Data Form',
    'Qualified for Honoring',
    'Annex A Form Submitted',
    'Approved Honoring',
    'Disapproved Honoring'
  ));
