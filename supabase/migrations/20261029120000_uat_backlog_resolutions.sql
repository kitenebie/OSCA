CREATE TABLE IF NOT EXISTS public.uat_backlog_resolutions (
  issue_key TEXT PRIMARY KEY,
  section TEXT NOT NULL,
  question TEXT NOT NULL,
  resolved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_by TEXT NOT NULL
);

ALTER TABLE public.uat_backlog_resolutions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.uat_backlog_resolutions FROM anon, authenticated;
GRANT ALL ON TABLE public.uat_backlog_resolutions TO service_role;
