ALTER TABLE public.roles
ADD COLUMN IF NOT EXISTS action_permissions JSONB NOT NULL DEFAULT '{}'::jsonb;
