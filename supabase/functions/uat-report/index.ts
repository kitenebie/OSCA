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

  let payload: Record<string, unknown>;
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) return response({ error: 'Invalid request.' }, 400);
    payload = body as Record<string, unknown>;
  } catch {
    return response({ error: 'Invalid request.' }, 400);
  }
  const { sessionToken } = payload;
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
    .select('role, status, full_name')
    .eq('id', session.user_id)
    .maybeSingle();
  if (!user || user.status !== 'Active' || user.role.replace(/[^a-z0-9]/gi, '').toLowerCase() !== 'superadmin') {
    return response({ error: 'Forbidden.' }, 403);
  }

  if (payload.action === 'resolve') {
    const { issueKey, section, question } = payload;
    if (typeof issueKey !== 'string' || !issueKey || issueKey.length > 1024 || typeof section !== 'string' || section.length > 120 || typeof question !== 'string' || !question.trim() || question.length > 400) {
      return response({ error: 'Invalid backlog issue.' }, 400);
    }
    const { data, error } = await admin.from('uat_backlog_resolutions').upsert({
      issue_key: issueKey, section, question: question.trim(), resolved_by: user.full_name,
      resolved_at: new Date().toISOString(),
    }, { onConflict: 'issue_key' }).select().single();
    if (error) return response({ error: 'Could not resolve the issue.' }, 500);
    return response({ resolution: data });
  }

  if (payload.action === 'reopen') {
    const { issueKey } = payload;
    if (typeof issueKey !== 'string' || !issueKey || issueKey.length > 1024) return response({ error: 'Invalid backlog issue.' }, 400);
    const { error } = await admin.from('uat_backlog_resolutions').delete().eq('issue_key', issueKey);
    if (error) return response({ error: 'Could not reopen the issue.' }, 500);
    return response({ ok: true });
  }

  if (payload.action && payload.action !== 'load') return response({ error: 'Invalid action.' }, 400);
  const [{ data: submissions, error: submissionsError }, { data: resolutions, error: resolutionsError }] = await Promise.all([
    admin.from('uat_submissions').select('id, tester_role, answers, overall, created_at').order('created_at', { ascending: false }),
    admin.from('uat_backlog_resolutions').select('issue_key, section, question, resolved_at, resolved_by').order('resolved_at', { ascending: false }),
  ]);
  if (submissionsError || resolutionsError) return response({ error: 'Could not load UAT reports.' }, 500);
  return response({ submissions: submissions || [], resolutions: resolutions || [] });
});
