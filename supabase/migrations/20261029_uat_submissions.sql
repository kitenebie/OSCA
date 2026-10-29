CREATE TABLE IF NOT EXISTS public.uat_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tester_name TEXT CHECK (char_length(tester_name) <= 120),
  tester_role TEXT CHECK (char_length(tester_role) <= 120),
  device TEXT CHECK (char_length(device) <= 160),
  answers JSONB NOT NULL CHECK (jsonb_typeof(answers) = 'array'),
  overall TEXT NOT NULL CHECK (overall IN ('Yes', 'Needs changes', 'No')),
  feedback TEXT CHECK (char_length(feedback) <= 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.uat_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow UAT feedback submissions"
  ON public.uat_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (jsonb_array_length(answers) > 0);
