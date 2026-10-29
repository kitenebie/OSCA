import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ClipboardList, LoaderCircle, ShieldAlert } from 'lucide-react';
import { supabase } from '../../utils/supabase';
import { useAuthStore } from '../store/authStore';

type Outcome = 'Works' | 'Partly works' | 'Does not work' | 'Not tested';
type UATAnswer = { section?: string; question?: string; outcome?: Outcome; comment?: string };
type Submission = { id: string; tester_role: string | null; answers: UATAnswer[]; overall: 'Yes' | 'Needs changes' | 'No'; created_at: string };
type BacklogItem = { key: string; section: string; question: string; failed: number; partial: number; comments: string[]; latest: string };
type Resolution = { issue_key: string; section: string; question: string; resolved_at: string; resolved_by: string };

const isSuperAdmin = (role?: string) => role?.replace(/[^a-z0-9]/gi, '').toLowerCase() === 'superadmin';

export default function UATReportPage() {
  const initialize = useAuthStore((state) => state.initialize);
  const [status, setStatus] = useState<'loading' | 'ready' | 'denied' | 'error'>('loading');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [resolutions, setResolutions] = useState<Resolution[]>([]);
  const [savingIssueKey, setSavingIssueKey] = useState('');
  const [backlogError, setBacklogError] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      await initialize();
      const { currentUser, sessionToken } = useAuthStore.getState();
      if (!currentUser || !isSuperAdmin(currentUser.role) || !sessionToken) {
        if (active) setStatus('denied');
        return;
      }
      const { data, error } = await supabase.functions.invoke('uat-report', { body: { action: 'load', sessionToken } });
      if (!active) return;
      if (error || !data?.submissions) {
        setStatus(error?.context?.status === 401 || error?.context?.status === 403 ? 'denied' : 'error');
        return;
      }
      setSubmissions(data.submissions);
      setResolutions(data.resolutions || []);
      setStatus('ready');
    };
    void load();
    return () => { active = false; };
  }, [initialize]);

  const overallCounts = useMemo(() => submissions.reduce((counts, item) => {
    counts[item.overall]++;
    return counts;
  }, { Yes: 0, 'Needs changes': 0, No: 0 }), [submissions]);

  const outcomeCounts = useMemo(() => submissions.flatMap((item) => item.answers || []).reduce((counts, answer) => {
    if (answer.outcome && answer.outcome in counts) counts[answer.outcome]++;
    return counts;
  }, { Works: 0, 'Partly works': 0, 'Does not work': 0, 'Not tested': 0 }), [submissions]);

  const backlog = useMemo(() => {
    const grouped = new Map<string, BacklogItem>();
    for (const submission of submissions) for (const answer of submission.answers || []) {
      if (!answer.question || (answer.outcome !== 'Partly works' && answer.outcome !== 'Does not work')) continue;
      const section = answer.section || 'Additional questions';
      const key = JSON.stringify([section, answer.question]);
      const item = grouped.get(key) || { key, section, question: answer.question, failed: 0, partial: 0, comments: [], latest: submission.created_at };
      if (answer.outcome === 'Does not work') item.failed++;
      else item.partial++;
      if (answer.comment?.trim() && item.comments.length < 3) item.comments.push(answer.comment.trim());
      if (submission.created_at > item.latest) item.latest = submission.created_at;
      grouped.set(key, item);
    }
    return [...grouped.values()].sort((a, b) => b.failed - a.failed || b.partial - a.partial || b.latest.localeCompare(a.latest));
  }, [submissions]);

  const openBacklog = backlog.filter((item) => {
    const resolution = resolutions.find((entry) => entry.issue_key === item.key);
    return !resolution || item.latest > resolution.resolved_at;
  });
  const resolvedBacklog = backlog.filter((item) => {
    const resolution = resolutions.find((entry) => entry.issue_key === item.key);
    return resolution && item.latest <= resolution.resolved_at;
  });

  const updateBacklogIssue = async (item: BacklogItem, action: 'resolve' | 'reopen') => {
    setSavingIssueKey(item.key);
    setBacklogError('');
    try {
      const sessionToken = useAuthStore.getState().sessionToken;
      if (!sessionToken) throw new Error('Session expired. Please sign in again.');
      const { data, error } = await supabase.functions.invoke('uat-report', {
        body: { action, sessionToken, issueKey: item.key, section: item.section, question: item.question },
      });
      if (error) throw error;
      if (action === 'resolve') setResolutions((current) => [data.resolution, ...current.filter((entry) => entry.issue_key !== item.key)]);
      else setResolutions((current) => current.filter((entry) => entry.issue_key !== item.key));
    } catch {
      setBacklogError(`Could not ${action === 'resolve' ? 'resolve' : 'reopen'} this issue. Please try again.`);
    } finally {
      setSavingIssueKey('');
    }
  };

  const card = (label: string, value: number, detail: string) => <div key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-semibold text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p><p className="mt-1 text-xs text-slate-500">{detail}</p></div>;

  return <main className="min-h-screen bg-slate-50 text-slate-900">
    <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4"><a href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-teal-700"><ArrowLeft size={17} /> OSCA</a><span className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold tracking-wide text-teal-800"><ClipboardList size={14} /> UAT REPORT</span></div></header>
    <div className="mx-auto max-w-6xl px-5 py-9">
      <h1 className="text-3xl font-bold tracking-tight">UAT analytics and backlog</h1>
      <p className="mt-2 text-slate-600">Submission trends, reported workflow issues, and tester comments.</p>
      {status === 'loading' ? <div className="mt-12 flex items-center justify-center gap-3 text-slate-500"><LoaderCircle className="animate-spin" /> Loading UAT report…</div>
        : status === 'denied' ? <div className="mt-8 rounded-2xl border border-amber-200 bg-white p-6"><ShieldAlert className="mb-3 text-amber-600" /><h2 className="font-bold">Super Admin access required</h2><p className="mt-1 text-sm text-slate-600">Sign in with an active Super Admin account to view UAT responses.</p><a className="mt-4 inline-flex rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white" href="/">Go to sign in</a></div>
        : status === 'error' ? <p role="alert" className="mt-8 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">Could not load the UAT report. Please try again later.</p>
        : <>
          <section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {card('Responses', submissions.length, 'Total submitted UAT forms')}
            {card('Ready', overallCounts.Yes, 'Marked ready for daily work')}
            {card('Needs changes', overallCounts['Needs changes'], 'Requested changes before rollout')}
            {card('Not ready', overallCounts.No, 'Marked not ready for daily work')}
          </section>
          <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold">Workflow outcomes</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Object.entries(outcomeCounts).map(([label, count]) => <div key={label}><div className="flex justify-between text-sm"><span className="font-medium text-slate-700">{label}</span><span className="font-bold">{count}</span></div><div className="mt-2 h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-teal-600" style={{ width: `${count ? Math.max(4, count / Math.max(1, Object.values(outcomeCounts).reduce((a, b) => a + b, 0)) * 100) : 0}%` }} /></div></div>)}</div>
          </section>
          <section className="mt-7 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5"><h2 className="text-lg font-bold">Backlog from reported issues</h2><p className="mt-1 text-sm text-slate-500">Questions marked “Partly works” or “Does not work,” ranked by failed reports first.</p></div>
            {backlogError && <p role="alert" className="m-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{backlogError}</p>}
            {openBacklog.length === 0 ? <p className="p-8 text-center text-sm text-slate-500">No open workflow issues.</p> : <div className="divide-y divide-slate-100">{openBacklog.map((item) => <article key={item.key} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-teal-700">{item.section}</p><h3 className="mt-1 font-semibold">{item.question}</h3></div><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">{item.failed} failed</span><span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">{item.partial} partial</span><button type="button" onClick={() => void updateBacklogIssue(item, 'resolve')} disabled={savingIssueKey === item.key} className="rounded-lg border border-teal-200 px-3 py-1.5 text-xs font-semibold text-teal-800 hover:bg-teal-50 disabled:opacity-50">{savingIssueKey === item.key ? 'Saving…' : 'Mark resolved'}</button></div></div>
              {item.comments.length > 0 && <ul className="mt-3 space-y-2">{item.comments.map((comment, index) => <li key={index} className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">“{comment}”</li>)}</ul>}
              <p className="mt-3 text-xs text-slate-400">Latest report: {new Date(item.latest).toLocaleString('en-PH')}</p>
            </article>)}</div>}
          </section>
          {resolvedBacklog.length > 0 && <section className="mt-7 rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 p-5"><h2 className="text-lg font-bold">Resolved issues</h2><p className="mt-1 text-sm text-slate-500">Historical reports stay available here. A new failed report moves an issue back to the open backlog.</p></div><div className="divide-y divide-slate-100">{resolvedBacklog.map((item) => {
            const resolution = resolutions.find((entry) => entry.issue_key === item.key)!;
            return <article key={item.key} className="p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-teal-700">{item.section}</p><h3 className="mt-1 font-semibold">{item.question}</h3><p className="mt-2 text-xs text-slate-500">Resolved by {resolution.resolved_by} · {new Date(resolution.resolved_at).toLocaleString('en-PH')}</p></div><button type="button" onClick={() => void updateBacklogIssue(item, 'reopen')} disabled={savingIssueKey === item.key} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">{savingIssueKey === item.key ? 'Saving…' : 'Reopen'}</button></div><div className="mt-3 flex gap-2 text-xs font-bold"><span className="rounded-full bg-red-50 px-3 py-1 text-red-700">{item.failed} historical failed</span><span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">{item.partial} historical partial</span></div></article>;
          })}</div></section>}
        </>}
    </div>
  </main>;
}
