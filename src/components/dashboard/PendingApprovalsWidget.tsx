import React from 'react';
import { useSeniorsStore } from '../../store/seniorsStore';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { Check, X, ArrowUpRight, ShieldAlert, UserCheck } from 'lucide-react';

export default function PendingApprovalsWidget() {
  const { seniors, approveSenior, rejectSenior } = useSeniorsStore();
  const { setCurrentPage } = useUIStore();
  const { currentUser, hasPermission } = useAuthStore();

  const pendingSeniors = seniors.filter(
    (s) => s.status === 'Pending' || s.status === 'For Verification'
  ).slice(0, 5); // Take top 5

  const canApprove = hasPermission('canApproveReject');

  const handleApprove = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (!currentUser) return;
    await approveSenior(id, currentUser.fullName);
    useUIStore.getState().showToast(`Naprubahan na si ${name}!`, 'success');
  };

  const handleReject = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (!currentUser) return;
    const reason = prompt(`Mataas na Paunawa: Isulat ang dahilan ng pag-reject kay ${name}:`, 'Kulang sa dokumento');
    if (reason === null) return; // cancelled
    await rejectSenior(id, reason || 'Kulang sa patunay o dokumento', currentUser.fullName);
    useUIStore.getState().showToast(`Tinanggihan si ${name}.`, 'warning');
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
        <div>
          <h4 className="font-bold text-slate-800 text-sm md:text-base">Mga Hinihintay na Pagsusuri</h4>
          <p className="text-[11px] text-slate-400">List of pending and verification-required files</p>
        </div>
        <button
          onClick={() => {
            useSeniorsStore.getState().setSelectedStatus('Pending');
            setCurrentPage('SeniorsList');
          }}
          className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 hover:underline transition-all"
        >
          <span>Tignan Lahat</span>
          <ArrowUpRight size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {pendingSeniors.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[180px] text-slate-400 text-center p-4">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-2">
              <UserCheck size={24} />
            </div>
            <p className="text-xs font-semibold">Walang Nakabinbing Aplikasyon</p>
            <p className="text-[10px] text-slate-400 mt-1">Lahat ng records ay nasuri at naproseso na.</p>
          </div>
        ) : (
          pendingSeniors.map((senior) => (
            <div
              key={senior.id}
              onClick={() => setCurrentPage('SeniorProfile', senior.id)}
              className="group p-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between gap-4 cursor-pointer transition-all duration-150 active:scale-99"
            >
              <div className="flex items-center gap-3 min-w-0">
                {senior.profilePhoto ? (
                  <img
                    referrerPolicy="no-referrer"
                    src={senior.profilePhoto}
                    alt={senior.firstName}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center font-bold text-xs text-teal-600 shrink-0">
                    {senior.firstName.charAt(0)}{senior.lastName.charAt(0)}
                  </div>
                )}
                
                <div className="min-w-0">
                  <h5 className="font-semibold text-xs text-slate-800 truncate group-hover:text-teal-600 transition-colors">
                    {senior.firstName} {senior.lastName}
                  </h5>
                  <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                    {senior.barangay} • Age: {senior.age}
                  </p>
                  <span className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded mt-1 font-mono uppercase
                    ${senior.status === 'Pending' 
                      ? 'bg-amber-50 text-amber-600 border border-amber-100' 
                      : 'bg-blue-50 text-blue-600 border border-blue-100'}
                  `}>
                    {senior.status === 'Pending' ? 'Pending' : 'For Verification'}
                  </span>
                </div>
              </div>

              {/* Quick Actions wrapper */}
              <div className="flex items-center gap-1.5 shrink-0">
                {canApprove ? (
                  <>
                    <button
                      onClick={(e) => handleApprove(e, senior.id, `${senior.firstName} ${senior.lastName}`)}
                      title="Approve Profile"
                      className="p-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500 hover:text-white text-teal-600 border border-teal-500/20 transition-all"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={(e) => handleReject(e, senior.id, `${senior.firstName} ${senior.lastName}`)}
                      title="Reject Profile"
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500 hover:text-white text-red-600 border border-red-500/20 transition-all"
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <div className="p-1.5 text-slate-300" title="Viewing access only">
                    <ShieldAlert size={14} />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
