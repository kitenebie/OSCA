import { useEffect, useMemo, useState } from 'react';
import { CheckCheck, ClipboardList, Eye, History, Search, Trash2, X } from 'lucide-react';
import { auditLogsService, seniorRecordHistoryService } from '../services/supabaseService';
import { AuditLogNotification, SeniorRecordHistory } from '../types';
import { useUIStore } from '../store/uiStore';

const formatHistoryValue = (value: unknown) => {
  const text = value == null || value === '' ? '—' : typeof value === 'string' ? value : JSON.stringify(value);
  return text.length > 160 ? `${text.slice(0, 157)}…` : text;
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogNotification[]>([]);
  const [seniorHistory, setSeniorHistory] = useState<SeniorRecordHistory[]>([]);
  const [selectedLog, setSelectedLog] = useState<AuditLogNotification | null>(null);
  const [selectedHistory, setSelectedHistory] = useState<SeniorRecordHistory | null>(null);
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
              <tr><th className="px-4 py-3">Time</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">Details</th><th className="px-4 py-3">Actor</th><th className="px-4 py-3">Barangay</th><th className="px-4 py-3"></th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleLogs.map((log) => (
                <tr key={log.id} className={log.read ? 'bg-white' : 'bg-teal-50/40'}>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-500 font-mono text-[10px]">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-3"><span className="inline-flex px-2 py-1 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px]">{log.action} · {log.entity}</span></td>
                  <td className="px-4 py-3 text-slate-700 max-w-xl">{log.details}</td>
                  <td className="px-4 py-3 text-slate-600">{log.actorName}<span className="block text-[10px] text-slate-400">{log.actorRole}</span></td>
                  <td className="px-4 py-3 text-slate-600">{log.barangay || '—'}</td>
                  <td className="px-4 py-3 text-right"><button onClick={() => { setSelectedHistory(null); setSelectedLog(log); }} className="p-2 text-teal-700 hover:bg-teal-50 rounded-lg" title="Preview log"><Eye size={15} /></button></td>
                </tr>
              ))}
              {visibleLogs.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">No audit logs found.</td></tr>}
            </tbody>
          </table> : <table className="w-full min-w-[820px] text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wide text-[10px]">
              <tr><th className="px-4 py-3">Time</th><th className="px-4 py-3">Senior</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">Current & Changes</th><th className="px-4 py-3">Barangay</th><th className="px-4 py-3"></th></tr>
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
                  <td className="px-4 py-3 text-right"><button onClick={() => { setSelectedLog(null); setSelectedHistory(entry); }} className="p-2 text-teal-700 hover:bg-teal-50 rounded-lg" title="Preview record history"><Eye size={15} /></button></td>
                </tr>;
              })}
              {visibleSeniorHistory.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">No senior record history found.</td></tr>}
            </tbody>
          </table>}
        </div>
      </section>

      {(selectedLog || selectedHistory) && <div className="fixed inset-0 z-[100]">
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => { setSelectedLog(null); setSelectedHistory(null); }} />
        <aside className="absolute inset-y-0 right-0 w-full max-w-xl bg-white shadow-2xl flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-teal-600">Preview</p>
              <h3 className="text-base font-black text-slate-800">{selectedLog ? 'Audit Log Details' : 'Senior Record History'}</h3>
            </div>
            <button onClick={() => { setSelectedLog(null); setSelectedHistory(null); }} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg" aria-label="Close preview"><X size={18} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-5 text-sm">
            {selectedLog && <>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><span className="block text-slate-400 uppercase">Action</span><strong>{selectedLog.action} · {selectedLog.entity}</strong></div>
                <div><span className="block text-slate-400 uppercase">Time</span><strong>{new Date(selectedLog.timestamp).toLocaleString()}</strong></div>
                <div><span className="block text-slate-400 uppercase">Actor</span><strong>{selectedLog.actorName}</strong><span className="block text-slate-500">{selectedLog.actorRole}</span></div>
                <div><span className="block text-slate-400 uppercase">Barangay</span><strong>{selectedLog.barangay || '—'}</strong></div>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-4"><span className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Details</span>{selectedLog.details}</div>
              {(selectedLog.targetPage || selectedLog.targetId) && <div className="text-xs text-slate-500"><strong>Target:</strong> {[selectedLog.targetPage, selectedLog.targetId].filter(Boolean).join(' · ')}</div>}
            </>}
            {selectedHistory && <>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><span className="block text-slate-400 uppercase">Senior</span><strong>{selectedHistory.seniorName}</strong><span className="block text-slate-500 font-mono">{selectedHistory.oscaNumber || selectedHistory.seniorId}</span></div>
                <div><span className="block text-slate-400 uppercase">Action</span><strong>{selectedHistory.action}</strong><span className="block text-slate-500">{new Date(selectedHistory.changedAt).toLocaleString()}</span></div>
                <div><span className="block text-slate-400 uppercase">Barangay</span><strong>{selectedHistory.barangay || '—'}</strong></div>
                <div><span className="block text-slate-400 uppercase">Changed by</span><strong>{selectedHistory.changedBy || 'System'}</strong></div>
              </div>
              <div><h4 className="text-xs font-black uppercase tracking-wide text-slate-600 mb-2">{selectedHistory.action === 'CREATE' ? 'Initial Snapshot' : 'Changes'}</h4><div className="space-y-2">{Object.entries(selectedHistory.changes).filter(([field]) => field !== 'record').map(([field, change]) => { const values = change as { previous: unknown; current: unknown }; return <div key={field} className="rounded-xl border border-slate-100 p-3"><strong className="block text-xs capitalize text-slate-700">{field.replace(/_/g, ' ')}</strong><div className="grid grid-cols-2 gap-3 mt-2 text-xs"><span><span className="block text-slate-400 uppercase">Previous</span>{formatHistoryValue(values.previous)}</span><span><span className="block text-teal-600 uppercase">Current</span>{formatHistoryValue(values.current)}</span></div></div>; })}{selectedHistory.action === 'CREATE' && <p className="text-xs text-slate-500">Initial record saved with the snapshot below.</p>}</div></div>
              <details className="rounded-xl border border-slate-100 p-3"><summary className="cursor-pointer text-xs font-bold text-teal-700">Current record snapshot</summary><div className="mt-3 space-y-2 text-xs">{Object.entries(selectedHistory.currentData).filter(([field]) => !field.endsWith('_at')).map(([field, value]) => <div key={field} className="grid grid-cols-[9rem_1fr] gap-2"><span className="text-slate-400 capitalize">{field.replace(/_/g, ' ')}</span><span className="break-words text-slate-700">{formatHistoryValue(value)}</span></div>)}</div></details>
            </>}
          </div>
        </aside>
      </div>}
    </div>
  );
}
