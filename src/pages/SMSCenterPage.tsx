import React, { useState, useEffect } from 'react';
import SMSComposer from '../components/sms/SMSComposer';
import { useSeniorsStore } from '../store/seniorsStore';
import { smsLogsService } from '../services/supabaseService';
import { Mail, Send, CheckCircle2, ShieldCheck, HelpCircle, Terminal, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';

// Status sort priority: Failed → Pending → Sent
const STATUS_PRIORITY: Record<string, number> = {
  Failed: 0,
  Pending: 1,
  Sent: 2,
};

const STATUS_STYLES: Record<string, string> = {
  Failed: 'bg-red-50 text-red-600 border-red-100',
  Pending: 'bg-amber-50 text-amber-600 border-amber-100',
  Sent: 'bg-emerald-50 text-emerald-600 border-emerald-100',
};

const ROWS_PER_PAGE = 10;

// Format timestamp to readable format: "Aug 7, 2026 · 3:45 PM"
function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return timestamp; // fallback if invalid
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }) + ' · ' + date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export default function SMSCenterPage() {
  const { smsLogs, resendSMS } = useSeniorsStore();
  const [currentPage, setCurrentPage] = useState(1);

  // Realtime: fetch fresh data on mount and subscribe to changes
  useEffect(() => {
    // Fetch latest on mount
    smsLogsService.getAll().then((logs) => {
      useSeniorsStore.setState({ smsLogs: logs });
    });

    // Subscribe to realtime updates
    const unsubscribe = smsLogsService.subscribe((updatedLogs) => {
      useSeniorsStore.setState({ smsLogs: updatedLogs });
    });

    return () => { unsubscribe(); };
  }, []);

  const totalLogs = smsLogs.length;

  // Sort logs: Failed first, then Pending, then Sent
  const sortedLogs = [...smsLogs].sort((a, b) => {
    return (STATUS_PRIORITY[a.status] ?? 99) - (STATUS_PRIORITY[b.status] ?? 99);
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedLogs.length / ROWS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedLogs = sortedLogs.slice((safePage - 1) * ROWS_PER_PAGE, safePage * ROWS_PER_PAGE);

  const handleResend = async (logId: string) => {
    await resendSMS(logId);
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      
      {/* Page Title */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap justify-between items-center gap-4">
        <div>
          <h4 className="font-bold text-slate-800 text-sm md:text-base">LGU SMS Broadcast Center</h4>
          <p className="text-[11px] text-slate-400">Broadcast pension payouts, medical missions, and urgent weather advisories to seniors</p>
        </div>

        {/* Mini stats count */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs font-semibold font-mono shadow-sm">
          <Send size={12} className="text-teal-600" />
          <span>Outbound Dispatched: <strong className="text-teal-600 font-black">{totalLogs}</strong></span>
        </div>
      </div>

      {/* SMS Dispatcher composer */}
      <SMSComposer />

      {/* Outbound SMS logs table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        
        {/* Logs header */}
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-700">
            <Terminal size={14} className="text-slate-500" />
            <h5 className="font-bold text-xs uppercase tracking-wide">Sent Messages (Outbound SMS History)</h5>
          </div>
        </div>

        {/* Logs table content */}
        {smsLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 text-slate-400 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-2">
              <Mail size={24} />
            </div>
            <p className="text-xs font-semibold">No SMS Logs Recorded</p>
            <p className="text-[10px] text-slate-400 mt-1">All bulk alerts and personal notifications sent will be recorded here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/20 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  <th className="py-3 px-5 hidden sm:table-cell">Timestamp</th>
                  <th className="py-3 px-5">Senior Citizen Recipient</th>
                  <th className="py-3 px-5 hidden md:table-cell">Barangay</th>
                  <th className="py-3 px-5 hidden sm:table-cell">Mobile Phone</th>
                  <th className="py-3 px-5">Message Body (Nai-send)</th>
                  <th className="py-3 px-5 hidden lg:table-cell">Personnel Sender</th>
                  <th className="py-3 px-5 text-center hidden sm:table-cell">Status</th>
                  <th className="py-3 px-5 text-center">Action</th>
                </tr>
              </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
                {paginatedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-5 text-slate-500 text-[11px] hidden sm:table-cell">{formatTimestamp(log.timestamp)}</td>
                    <td className="py-3 px-5 text-slate-900 font-bold uppercase">{log.recipientName}</td>
                    <td className="py-3 px-5 text-slate-600 hidden md:table-cell">{log.barangay}</td>
                    <td className="py-3 px-5 text-slate-700 font-mono font-semibold hidden sm:table-cell">{log.recipientPhone}</td>
                    <td className="py-3 px-5 text-slate-500 font-sans italic max-w-xs truncate" title={log.message}>
                      "{log.message}"
                    </td>
                    <td className="py-3 px-5 text-teal-700 font-bold uppercase hidden lg:table-cell">{log.sentBy}</td>
                    <td className="py-3 px-5 text-center hidden sm:table-cell">
                      <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded font-mono border ${STATUS_STYLES[log.status] || 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                        {log.status === 'Sent' ? 'SUCCESS (200)' : log.status === 'Pending' ? 'PENDING...' : 'FAILED (ERR)'}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-center">
                      {log.status === 'Failed' ? (
                        <button
                          onClick={() => handleResend(log.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-colors"
                        >
                          <RotateCcw size={11} />
                          Re-send
                        </button>
                      ) : (
                        <span className="text-slate-300 text-[10px]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {sortedLogs.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <p className="text-[11px] text-slate-400 font-medium">
              Showing <span className="font-bold text-slate-600">{(safePage - 1) * ROWS_PER_PAGE + 1}</span>–<span className="font-bold text-slate-600">{Math.min(safePage * ROWS_PER_PAGE, sortedLogs.length)}</span> of <span className="font-bold text-slate-600">{sortedLogs.length}</span> records
            </p>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={14} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`min-w-[28px] h-7 rounded-lg text-[11px] font-bold transition-colors ${
                    page === safePage
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-slate-500 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
