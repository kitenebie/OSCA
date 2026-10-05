import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-api-version',
  'Access-Control-Max-Age': '86400',
};
const sha256 = async (value: string) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)))).map((b) => b.toString(16).padStart(2, '0')).join('');

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (request.method !== 'POST') return Response.json({ error: 'Method not allowed.' }, { status: 405, headers: cors });
  const { token, password } = await request.json();
  if (!token || typeof password !== 'string' || password.length < 8) return Response.json({ error: 'Invalid reset request.' }, { status: 400, headers: cors });
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const tokenHash = await sha256(token);
  const { data: reset } = await admin.from('password_reset_tokens').select('id, user_id, expires_at').eq('token_hash', tokenHash).is('used_at', null).maybeSingle();
  if (!reset || new Date(reset.expires_at) < new Date()) return Response.json({ error: 'This reset link is invalid or expired.' }, { status: 400, headers: cors });
  const { error } = await admin.from('users').update({ password: await sha256(password) }).eq('id', reset.user_id);
  if (error) return Response.json({ error: 'Unable to reset password.' }, { status: 500, headers: cors });
  await admin.from('password_reset_tokens').update({ used_at: new Date().toISOString() }).eq('id', reset.id);
  await admin.from('user_sessions').update({ is_active: false }).eq('user_id', reset.user_id);
  return Response.json({ ok: true }, { headers: cors });
});
