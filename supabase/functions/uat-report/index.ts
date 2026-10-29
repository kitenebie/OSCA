/// <reference lib="deno.ns" />
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-api-version',
  'Access-Control-Max-Age': '86400',
};

const response = (body: unknown, status = 200) => Response.json(body, { status, headers: { ...cors, 'Cache-Control': 'no-store' } });

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (request.method !== 'POST') return response({ error: 'Method not allowed.' }, 405);

  let sessionToken: unknown;
  try {
    ({ sessionToken } = await request.json());
  } catch {
    return response({ error: 'Invalid request.' }, 400);
  }
  if (typeof sessionToken !== 'string' || sessionToken.length < 32 || sessionToken.length > 256) {
    return response({ error: 'Unauthorized.' }, 401);
  }

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: session } = await admin.from('user_sessions')
    .select('user_id')
    .eq('session_token', sessionToken)
    .eq('is_active', true)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();
  if (!session) return response({ error: 'Unauthorized.' }, 401);

  const { data: user } = await admin.from('users')
    .select('role, status')
    .eq('id', session.user_id)
    .maybeSingle();
  if (!user || user.status !== 'Active' || user.role.replace(/[^a-z0-9]/gi, '').toLowerCase() !== 'superadmin') {
    return response({ error: 'Forbidden.' }, 403);
  }

  const { data, error } = await admin.from('uat_submissions')
    .select('id, tester_role, answers, overall, created_at')
    .order('created_at', { ascending: false });
  if (error) return response({ error: 'Could not load UAT reports.' }, 500);
  return response({ submissions: data || [] });
});
