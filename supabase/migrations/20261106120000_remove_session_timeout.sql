UPDATE public.user_sessions
SET expires_at = '9999-12-31 23:59:59+00'
WHERE is_active = true AND expires_at > now();
