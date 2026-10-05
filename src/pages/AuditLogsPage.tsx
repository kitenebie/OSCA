import { useEffect, useMemo, useState } from 'react';
import { CheckCheck, ClipboardList, History, Search, Trash2 } from 'lucide-react';
import { auditLogsService, seniorRecordHistoryService } from '../services/supabaseService';
import { AuditLogNotification, SeniorRecordHistory } from '../types';
import { useUIStore } from '../store/uiStore';

const formatHistoryValue = (value: unknown) => value == null || value === '' ? '—' : typeof value === 'string' ? value : JSON.stringify(value);

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogNotification[]>([]);
  const [seniorHistory, setSeniorHistory] = useState<SeniorRecordHistory[]>([]);
  const [activeTab, setActiveTab] = useState<'audit' | 'senior'>('audit');
  const [query, setQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('All');
  const [barangayFilter, setBarangayFilter] = useState('All');
  const showToast = useUIStore((state) => state.showToast);

  useEffect(() => {
    void auditLogsService.getAll().then(setLogs);
    void seniorRecordHistoryService.getAll().then(setSeniorHistory).catch((error) => console.error('Failed to load senior record history:', error));
    return auditLogsService.subscribe(setLogs);
  }, []);

  const visibleLogs = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return logs.filter((log) =>
      (actionFilter === 'All' || log.action === actionFilter) &&
      (barangayFilter === 'All' || log.barangay === barangayFilter) &&
      (!needle ||
      [log.action, log.entity, log.details, log.actorName, log.barangay]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(needle))),
    );
  }, [logs, query, actionFilter, barangayFilter]);

  const visibleSeniorHistory = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return seniorHistory.filter((entry) =>
      (actionFilter === 'All' || entry.action === actionFilter) &&
      (barangayFilter === 'All' || entry.barangay === barangayFilter) &&
      (!needle || [entry.seniorName, entry.oscaNumber, entry.action, entry.changedBy, entry.barangay, ...Object.keys(entry.changes)]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(needle))),
    );
  }, [seniorHistory, query, actionFilter, barangayFilter]);

  const barangays = useMemo(() => Array.from(new Set([...logs.map((log) => log.barangay), ...seniorHistory.map((entry) => entry.barangay)].filter(Boolean))).sort(), [logs, seniorHistory]);
  const actions = activeTab === 'audit'
    ? ['All', ...Array.from(new Set(logs.map((log) => log.action))).sort()]
    : ['All', 'CREATE', 'UPDATE'];

  const handleMarkAllRead = async () => {
    await auditLogsService.markAllAsRead();
    showToast('All audit logs marked as read.', 'success');
  };

  const handleClear = async () => {
    if (!window.confirm('Clear all audit log entries? This cannot be undone.')) return;
    await auditLogsService.clearAll();
    showToast('Audit logs cleared.', 'info');
  };

  return (
    <div className="space-y-6">
      <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-50 border border-teal-100 rounded-xl text-teal-700"><ClipboardList size={20} /></div>
          <div>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Audit Logs</h2>
            <p className="text-xs text-slate-500">Record of system activity and administrative actions.</p>
          </div>
        </div>
        {activeTab === 'audit' && <div className="flex gap-2">
          <button onClick={handleMarkAllRead} className="px-3 py-2 text-xs font-bold rounded-xl border border-teal-200 text-teal-700 bg-teal-50 hover:bg-teal-100 flex items-center gap-1.5"><CheckCheck size={14} />Mark all read</button>
          <button onClick={handleClear} className="px-3 py-2 text-xs font-bold rounded-xl border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 flex items-center gap-1.5"><Trash2 size={14} />Clear</button>
        </div>}
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 space-y-3">
          <div className="flex gap-2 border-b border-slate-100">
            <button onClick={() => { setActiveTab('audit'); setActionFilter('All'); }} className={`px-3 py-2 text-xs font-bold border-b-2 ${activeTab === 'audit' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-400'}`}>Audit Logs</button>
            <button onClick={() => { setActiveTab('senior'); setActionFilter('All'); }} className={`px-3 py-2 text-xs font-bold border-b-2 flex items-center gap-1.5 ${activeTab === 'senior' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-400'}`}><History size={13} />Senior Record Logs</button>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
          <label className="relative block max-w-md flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={activeTab === 'audit' ? 'Search action, user, barangay, or details' : 'Search senior, OSCA ID, field, or barangay'} className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
          </label>
          <select value={actionFilter} onChange={(event) => setActionFilter(event.target.value)} className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"><option value="All">All actions</option>{actions.slice(1).map((action) => <option key={action} value={action}>{action}</option>)}</select>
          <select value={barangayFilter} onChange={(event) => setBarangayFilter(event.target.value)} className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"><option value="All">All barangays</option>{barangays.map((barangay) => <option key={barangay} value={barangay}>{barangay}</option>)}</select>
          </div>
        </div>
        <div className="overflow-x-auto">
          {activeTab === 'audit' ? <table className="w-full min-w-[720px] text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wide text-[10px]">
              <tr><th className="px-4 py-3">Time</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">Details</th><th className="px-4 py-3">Actor</th><th className="px-4 py-3">Barangay</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleLogs.map((log) => (
                <tr key={log.id} className={log.read ? 'bg-white' : 'bg-teal-50/40'}>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-500 font-mono text-[10px]">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-3"><span className="inline-flex px-2 py-1 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px]">{log.action} · {log.entity}</span></td>
                  <td className="px-4 py-3 text-slate-700 max-w-xl">{log.details}</td>
                  <td className="px-4 py-3 text-slate-600">{log.actorName}<span className="block text-[10px] text-slate-400">{log.actorRole}</span></td>
                  <td className="px-4 py-3 text-slate-600">{log.barangay || '—'}</td>
                </tr>
              ))}
              {visibleLogs.length === 0 && <tr><td colSpan={5} className="px-4 py-12 text-center text-slate-400">No audit logs found.</td></tr>}
            </tbody>
          </table> : <table className="w-full min-w-[820px] text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wide text-[10px]">
              <tr><th className="px-4 py-3">Time</th><th className="px-4 py-3">Senior</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">Current & Changes</th><th className="px-4 py-3">Barangay</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleSeniorHistory.map((entry) => {
                const changes = Object.entries(entry.changes).filter(([field]) => field !== 'record') as [string, { previous: unknown; current: unknown }][];
                return <tr key={entry.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-500 font-mono text-[10px]">{new Date(entry.changedAt).toLocaleString()}</td>
                  <td className="px-4 py-3 text-slate-700 font-semibold">{entry.seniorName}<span className="block text-[10px] font-mono text-slate-400">{entry.oscaNumber || entry.seniorId}</span></td>
                  <td className="px-4 py-3"><span className="inline-flex px-2 py-1 rounded-md bg-teal-50 text-teal-700 font-bold text-[10px]">{entry.action}</span></td>
                  <td className="px-4 py-3 text-slate-600 max-w-md">{entry.action === 'CREATE' ? 'Initial Step 11 snapshot saved.' : <details><summary className="cursor-pointer font-semibold text-teal-700">{changes.length} changed field{changes.length === 1 ? '' : 's'}</summary><div className="mt-2 space-y-1">{changes.map(([field, change]) => <div key={field}><strong>{field.replace(/_/g, ' ')}:</strong> {formatHistoryValue(change.previous)} → {formatHistoryValue(change.current)}</div>)}</div></details>}</td>
                  <td className="px-4 py-3 text-slate-600">{entry.barangay || '—'}</td>
                </tr>;
              })}
              {visibleSeniorHistory.length === 0 && <tr><td colSpan={5} className="px-4 py-12 text-center text-slate-400">No senior record history found.</td></tr>}
            </tbody>
          </table>}
        </div>
      </section>
    </div>
  );
}
