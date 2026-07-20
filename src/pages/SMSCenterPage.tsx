import React from 'react';
import SMSComposer from '../components/sms/SMSComposer';
import { useSeniorsStore } from '../store/seniorsStore';
import { Mail, Send, CheckCircle2, ShieldCheck, HelpCircle, Terminal } from 'lucide-react';

export default function SMSCenterPage() {
  const { smsLogs } = useSeniorsStore();

  const totalLogs = smsLogs.length;

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
            <h5 className="font-bold text-xs uppercase tracking-wide">Mga Naipadalang Mensahe (Outbound SMS History)</h5>
          </div>
        </div>

        {/* Logs table content */}
        {smsLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 text-slate-400 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-2">
              <Mail size={24} />
            </div>
            <p className="text-xs font-semibold">Walang Naitalang SMS Logs</p>
            <p className="text-[10px] text-slate-400 mt-1">Lahat ng ipapadalang bulk alert o personal notifications ay rito nakatala.</p>
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
                  <th className="py-3 px-5 text-center hidden sm:table-cell">Gateway Code</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {smsLogs.slice().reverse().map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-5 text-slate-500 font-mono hidden sm:table-cell">{log.timestamp}</td>
                    <td className="py-3 px-5 text-slate-900 font-bold uppercase">{log.recipientName}</td>
                    <td className="py-3 px-5 text-slate-600 hidden md:table-cell">{log.barangay}</td>
                    <td className="py-3 px-5 text-slate-700 font-mono font-semibold hidden sm:table-cell">{log.recipientPhone}</td>
                    <td className="py-3 px-5 text-slate-500 font-sans italic max-w-xs truncate" title={log.message}>
                      "{log.message}"
                    </td>
                    <td className="py-3 px-5 text-teal-700 font-bold uppercase hidden lg:table-cell">{log.sentBy}</td>
                    <td className="py-3 px-5 text-center hidden sm:table-cell">
                      <span className="inline-block text-[9px] font-bold px-1.5 py-0.2 rounded font-mono bg-emerald-50 text-emerald-600 border border-emerald-100">
                        SUCCESS (200)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}
