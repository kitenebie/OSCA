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
  let stage = 'parse request';
  try {
    const { token, newPassword } = await request.json();
    if (!token || typeof newPassword !== 'string' || newPassword.length < 8) return Response.json({ error: 'New password is required.' }, { status: 400, headers: cors });

    stage = 'initialize service client';
    const url = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !serviceKey) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    const admin = createClient(url, serviceKey);

    stage = 'look up reset token';
    const { data: reset, error: lookupError } = await admin.from('password_reset_tokens').select('id, user_id, expires_at').eq('token_hash', await sha256(token)).is('used_at', null).maybeSingle();
    if (lookupError) throw lookupError;
    if (!reset || new Date(reset.expires_at) < new Date()) return Response.json({ error: 'This reset link is invalid or expired.' }, { status: 400, headers: cors });

    stage = 'load login identifier';
    const { data: user, error: userError } = await admin.from('users').select('username').eq('id', reset.user_id).maybeSingle();
    if (userError) throw userError;
    if (!user) throw new Error('Reset account not found');

    stage = 'update password';
    const { error: passwordError } = await admin.from('users').update({ password: await sha256(newPassword) }).eq('id', reset.user_id);
    if (passwordError) throw passwordError;

    stage = 'mark reset token used';
    const { error: tokenError } = await admin.from('password_reset_tokens').update({ used_at: new Date().toISOString() }).eq('id', reset.id);
    if (tokenError) console.error('[password-reset] Token-use update failed', { error: tokenError.message });

    stage = 'invalidate sessions';
    const { error: sessionError } = await admin.from('user_sessions').update({ is_active: false }).eq('user_id', reset.user_id);
    if (sessionError) console.error('[password-reset] Session invalidation failed', { error: sessionError.message });
    return Response.json({ ok: true, loginId: user.username }, { headers: cors });
  } catch (error) {
    console.error('[password-reset] Completion failed', {
      stage,
      error: error instanceof Error ? error.message : String(error),
    });
    return Response.json({ error: 'An unexpected error occurred.' }, { status: 500, headers: cors });
  }
});
