ALTER TABLE public.centenarian_honoring
  DROP CONSTRAINT IF EXISTS centenarian_honoring_preferred_payment_mode_check,
  ADD CONSTRAINT centenarian_honoring_preferred_payment_mode_check
    CHECK (preferred_payment_mode IN ('Landbank', 'Other Banks', 'GCash', 'Palawan PSP', 'Bank'));

ALTER TABLE public.centenarian_honoring
  DROP CONSTRAINT IF EXISTS centenarian_honoring_claimant_payment_mode_check,
  ADD CONSTRAINT centenarian_honoring_claimant_payment_mode_check
    CHECK (claimant_payment_mode IN ('Landbank', 'Other Banks', 'GCash', 'Palawan PSP', 'Bank'));
