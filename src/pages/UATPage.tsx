import { useState } from 'react';
import { ArrowLeft, Check, CircleHelp, ClipboardCheck, LoaderCircle, Send } from 'lucide-react';
import { supabase } from '../../utils/supabase';

const sections = [
  { title: 'Sign in and dashboard', items: [
    'Can you sign in and sign out with your assigned account?',
    'Does the dashboard show the expected senior counts, barangay chart, and pending approvals?',
    'Do your account permissions correctly control which pages and actions you can access?',
  ] },
  { title: 'Senior records', items: [
    'Can you search, filter, open, and review a senior record from the list?',
    'Can you register a senior, capture a photo and thumbprint, leave the signature optional, and submit the form?',
    'Can you update a record and review its status, benefits, and registration details?',
    'Can you find a senior and view or print their ID card?',
  ] },
  { title: 'Reports and forms', items: [
    'Can you filter reports by barangay, status, and senior classification?',
    'Can you create a custom report by choosing fields, then save or export it?',
    'Can you prepare and export the required senior forms and reports?',
  ] },
  { title: 'SMS center', items: [
    'Can you send a message to one individual senior, selected barangays, or all seniors?',
    'Can you use message templates and review sent or pending messages?',
    'Can you delete a pending message and verify it is removed?',
  ] },
  { title: 'Users, roles, and configuration', items: [
    'Can an administrator add, edit, deactivate, and find user accounts?',
    'Can you create, edit, delete, and save roles and permissions, including when the role list is long?',
    'Can you update configuration such as barangays, ID card design, and system settings?',
  ] },
  { title: 'Map and public claim forms', items: [
    'Can you view senior locations on the map and open a record from a map marker?',
    'Can you review and process claim forms, and can a claimant submit or check a form?',
  ] },
  { title: 'Audit and accessibility', items: [
    'Can an authorized user review and filter audit logs?',
    'Do the pages work on your device, and are labels, buttons, and error messages clear?',
  ] },
];

type Outcome = 'Works' | 'Partly works' | 'Does not work' | 'Not tested';

export default function UATPage() {
  const [tester, setTester] = useState('');
  const [role, setRole] = useState('');
  const [device, setDevice] = useState('');
  const [answers, setAnswers] = useState<Record<string, { outcome: Outcome; comment: string }>>({});
  const [overall, setOverall] = useState('');
  const [feedback, setFeedback] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const total = sections.reduce((sum, section) => sum + section.items.length, 0);
  const completed = sections.reduce((sum, section) => sum + section.items.filter((question) => answers[question]?.outcome).length, 0);
  const setOutcome = (question: string, outcome: Outcome) => setAnswers((current) => ({
    ...current, [question]: { outcome, comment: current[question]?.comment || '' },
  }));
  const setComment = (question: string, comment: string) => setAnswers((current) => ({
    ...current, [question]: { outcome: current[question]?.outcome, comment },
  }));

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (completed !== total || !overall) return;
    setState('sending');
    const { error } = await supabase.from('uat_submissions').insert({
      tester_name: tester.trim() || null,
      tester_role: role.trim() || null,
      device: device.trim() || null,
      answers: sections.flatMap((section) => section.items.map((question) => ({
        section: section.title, question, ...answers[question],
      }))),
      overall, feedback: feedback.trim() || null,
    });
    setState(error ? 'error' : 'sent');
  };

  return <main className="min-h-screen bg-slate-50 text-slate-900">
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
        <a href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-teal-700"><ArrowLeft size={17} /> OSCA</a>
        <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold tracking-wide text-teal-800">USER ACCEPTANCE TESTING</span>
      </div>
    </header>
    <div className="mx-auto max-w-4xl px-5 py-10">
      <div className="mb-8">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-800"><ClipboardCheck size={25} /></div>
        <h1 className="text-3xl font-bold tracking-tight">Help us test OSCA</h1>
        <p className="mt-2 max-w-2xl text-slate-600">Try each workflow you use and record what happened. Choose “Not tested” for anything you could not try. Please do not include senior personal or biometric information in comments.</p>
      </div>
      <div className="sticky top-0 z-10 mb-6 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-sm backdrop-blur">
        <div className="mb-2 flex justify-between text-xs font-semibold text-slate-600"><span>Testing progress</span><span>{completed} / {total}</span></div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-teal-600 transition-all" style={{ width: `${completed / total * 100}%` }} /></div>
      </div>

      {state === 'sent' ? <section className="rounded-2xl border border-teal-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal-100 text-teal-700"><Check size={28} /></div>
        <h2 className="text-xl font-bold">Response submitted</h2><p className="mt-2 text-slate-600">Thank you. Your feedback has been saved for the OSCA team.</p>
        <a href="/" className="mt-6 inline-flex rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800">Return to OSCA</a>
      </section> : <form onSubmit={submit} className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-bold">About your test <span className="font-normal text-slate-500">(optional)</span></h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[['Your name', tester, setTester], ['Your role', role, setRole], ['Device or browser', device, setDevice]].map(([label, value, setter]) => <label key={label as string} className="text-sm font-medium text-slate-700">{label as string}<input value={value as string} onChange={(e) => (setter as (v: string) => void)(e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100" /></label>)}
          </div>
        </section>
        {sections.map((section, sectionIndex) => <section key={section.title} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4"><p className="text-xs font-bold uppercase tracking-wider text-teal-700">Section {sectionIndex + 1}</p><h2 className="mt-1 text-lg font-bold">{section.title}</h2></div>
          <div className="divide-y divide-slate-100">
            {section.items.map((question, index) => <fieldset key={question} className="p-5">
              <legend className="mb-3 font-medium leading-relaxed">{question}</legend>
              <div className="flex flex-wrap gap-2">
                {(['Works', 'Partly works', 'Does not work', 'Not tested'] as Outcome[]).map((outcome) => <label key={outcome} className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold transition ${answers[question]?.outcome === outcome ? 'border-teal-700 bg-teal-700 text-white' : 'border-slate-300 text-slate-600 hover:border-teal-500'}`}><input className="sr-only" type="radio" name={`q-${sectionIndex}-${index}`} value={outcome} checked={answers[question]?.outcome === outcome} onChange={() => setOutcome(question, outcome)} />{outcome}</label>)}
              </div>
              <label className="mt-3 block text-xs font-semibold text-slate-600">Comment (optional)<textarea value={answers[question]?.comment || ''} onChange={(e) => setComment(question, e.target.value)} rows={2} maxLength={1000} className="mt-1.5 w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100" placeholder="Add a comment; leave out senior personal information." /></label>
            </fieldset>)}
          </div>
        </section>)}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold">Overall, is OSCA ready for your day-to-day work?</h2>
          <div className="mt-3 flex flex-wrap gap-2">{['Yes', 'Needs changes', 'No'].map((item) => <label key={item} className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold ${overall === item ? 'border-teal-700 bg-teal-700 text-white' : 'border-slate-300 text-slate-600'}`}><input className="sr-only" type="radio" name="overall" value={item} checked={overall === item} onChange={() => setOverall(item)} />{item}</label>)}</div>
          <label className="mt-4 block text-sm font-medium text-slate-700">Anything else you want us to know?<textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={3} maxLength={2000} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100" placeholder="Optional feedback; do not include senior personal information." /></label>
        </section>
        {state === 'error' && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">Your response could not be saved. Please check your connection and try again.</p>}
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center"><p className="flex items-center gap-2 text-xs text-slate-500"><CircleHelp size={15} /> Responses are saved securely for the OSCA team.</p><button disabled={completed !== total || !overall || state === 'sending'} className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-5 py-3 text-sm font-bold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300">{state === 'sending' ? <LoaderCircle size={17} className="animate-spin" /> : <Send size={16} />}Submit feedback</button></div>
      </form>}
    </div>
  </main>;
}
