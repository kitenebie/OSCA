import { useEffect, useMemo, useState } from 'react';
import { CheckCheck, ClipboardList, Search, Trash2 } from 'lucide-react';
import { auditLogsService } from '../services/supabaseService';
import { AuditLogNotification } from '../types';
import { useUIStore } from '../store/uiStore';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogNotification[]>([]);
  const [query, setQuery] = useState('');
  const showToast = useUIStore((state) => state.showToast);

  useEffect(() => {
    void auditLogsService.getAll().then(setLogs);
    return auditLogsService.subscribe(setLogs);
  }, []);

  const visibleLogs = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return logs;
    return logs.filter((log) =>
      [log.action, log.entity, log.details, log.actorName, log.barangay]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(needle)),
    );
  }, [logs, query]);

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
        <div className="flex gap-2">
          <button onClick={handleMarkAllRead} className="px-3 py-2 text-xs font-bold rounded-xl border border-teal-200 text-teal-700 bg-teal-50 hover:bg-teal-100 flex items-center gap-1.5"><CheckCheck size={14} />Mark all read</button>
          <button onClick={handleClear} className="px-3 py-2 text-xs font-bold rounded-xl border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 flex items-center gap-1.5"><Trash2 size={14} />Clear</button>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <label className="relative block max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search action, user, barangay, or details" className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-xs">
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
          </table>
        </div>
      </section>
    </div>
  );
}
