export const APPROVED_STATUSES: string[] = [
  'Approved',
  'Approved ID',
  'Qualified for NSCS',
  'NSCS Form Submitted',
  'Approved Data Form',
  'Qualified for Honoring',
  'Annex A Form Submitted',
  'Approved Honoring',
];

export const COMPLIANCE_STATUSES: string[] = [
  'For Compliance',
  'For Verification',
  'Rejected',
  'Disapproved Data Form',
  'Disapproved Honoring',
];

export const seniorStatusLabel = (status: string) =>
  status === 'For Verification' || status === 'Rejected' ? 'For Compliance' : status;
