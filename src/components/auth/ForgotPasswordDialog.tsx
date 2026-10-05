import { FormEvent, useEffect, useState } from 'react';
import { KeyRound, Mail, X } from 'lucide-react';
import { supabase } from '../../../utils/supabase';

type Props = { isOpen: boolean; onClose: () => void };

export default function ForgotPasswordDialog({ isOpen, onClose }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const token = new URLSearchParams(window.location.search).get('reset_token');
  const isResetFlow = Boolean(token);

  useEffect(() => {
    if (!isOpen) setMessage('');
  }, [isOpen]);

  if (!isOpen) return null;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (isResetFlow && password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }
    setBusy(true);
    setMessage('');
    const functionName = isResetFlow ? 'complete-password-reset' : 'request-password-reset';
    console.info('[password-reset] Sending request', { functionName });
    const { error } = await supabase.functions.invoke(
      functionName,
      { body: isResetFlow ? { token, newPassword: password } : { email } },
    );
    setBusy(false);
    if (error) {
      console.error('[password-reset] Request failed', {
        functionName,
        error: error.message || error,
      });
      setMessage('Unable to process the request. Please try again or contact the system administrator.');
      return;
    }
    console.info('[password-reset] Request completed successfully', { functionName });
    if (isResetFlow) {
      setMessage('Password reset successful. You may now sign in.');
      window.history.replaceState({}, '', window.location.pathname);
    } else {
      // Intentionally generic so account emails are not exposed.
      setMessage('If the email is registered, a password reset link has been sent.');
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <button aria-label="Close password reset" className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={onClose} />
      <form onSubmit={submit} className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-5">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-slate-700"><X size={18} /></button>
        <div className="flex items-center gap-3">
          <div className="rounded-xl p-2.5 bg-teal-50 text-teal-700"><KeyRound size={20} /></div>
          <div><h2 className="font-black text-slate-800">{isResetFlow ? 'Set a new password' : 'Forgot password?'}</h2><p className="text-xs text-slate-500">{isResetFlow ? 'Choose a new secure password for your account.' : 'Enter the email associated with your OSCA account.'}</p></div>
        </div>
        {isResetFlow ? <>
          <label className="block text-xs font-bold text-slate-600">New password<input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-teal-500" /></label>
          <label className="block text-xs font-bold text-slate-600">Confirm password<input required minLength={8} type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-teal-500" /></label>
        </> : <label className="block text-xs font-bold text-slate-600">Email address<div className="relative mt-1.5"><Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 outline-none focus:border-teal-500" /></div></label>}
        {message && <p className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600">{message}</p>}
        <button disabled={busy} className="w-full rounded-xl bg-teal-600 py-2.5 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-60">{busy ? 'Please wait…' : isResetFlow ? 'Reset password' : 'Email reset link'}</button>
      </form>
    </div>
  );
}
