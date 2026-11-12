import React from 'react';
import { ArrowUpRight, CalendarDays, UserRound } from 'lucide-react';
import { SeniorCitizen } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { useSeniorsStore } from '../../store/seniorsStore';
import { useUIStore } from '../../store/uiStore';
import { seniorStatusLabel } from '../../constants/seniorStatusGroups';

interface RecentRegistrationsWidgetProps {
  seniors: SeniorCitizen[];
}

export default function RecentRegistrationsWidget({ seniors }: RecentRegistrationsWidgetProps) {
  const { setCurrentPage } = useUIStore();
  const canViewProfile = useAuthStore((state) => state.hasPermission('canViewProfile'));
  const recentSeniors = [...seniors]
    .sort((a, b) => Date.parse(b.registeredDate) - Date.parse(a.registeredDate))
    .slice(0, 5);

  const openSeniorsList = () => {
    const store = useSeniorsStore.getState();
    store.setSelectedStatus('All');
    store.setSelectedPension('All');
    setCurrentPage('SeniorsList');
  };

  return (
    <section className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col h-full">
      <header className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
        <div>
          <h3 className="font-bold text-slate-800 text-sm md:text-base">Recent Registrations</h3>
          <p className="text-[11px] text-slate-400">Latest senior profiles within your access</p>
        </div>
        <button
          type="button"
          onClick={openSeniorsList}
          className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 hover:underline"
        >
          <span>View All</span>
          <ArrowUpRight size={14} />
        </button>
      </header>

      <div className="flex-1 space-y-3">
        {recentSeniors.length ? recentSeniors.map((senior) => {
          const name = `${senior.firstName} ${senior.lastName}`;
          const registeredDate = new Date(senior.registeredDate);
          const dateLabel = Number.isNaN(registeredDate.getTime())
            ? 'Registration date unavailable'
            : registeredDate.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });

          return (
            <div key={senior.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
              <div className="flex min-w-0 items-center gap-3">
                {senior.profilePhoto ? (
                  <img src={senior.profilePhoto} alt="" referrerPolicy="no-referrer" className="h-10 w-10 shrink-0 rounded-full border border-slate-200 object-cover" />
                ) : (
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-teal-100 bg-teal-50 text-teal-600">
                    <UserRound size={18} aria-hidden="true" />
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-slate-800">{name}</p>
                  <p className="truncate text-[10px] text-slate-500">{senior.barangay} · OSCA {senior.oscaNumber}</p>
                  <p className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
                    <CalendarDays size={11} aria-hidden="true" /> {dateLabel}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <span className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[9px] font-bold uppercase text-slate-600">
                  {seniorStatusLabel(senior.status)}
                </span>
                {canViewProfile && (
                  <button
                    type="button"
                    onClick={() => setCurrentPage('SeniorProfile', senior.id)}
                    aria-label={`View profile for ${name}`}
                    className="text-[10px] font-semibold text-teal-700 hover:text-teal-900 hover:underline"
                  >
                    View Profile
                  </button>
                )}
              </div>
            </div>
          );
        }) : (
          <div className="flex min-h-[180px] flex-col items-center justify-center p-4 text-center text-slate-400">
            <UserRound size={24} className="mb-2 text-slate-300" aria-hidden="true" />
            <p className="text-xs font-semibold">No registrations yet</p>
            <p className="mt-1 text-[10px]">New senior registrations will appear here.</p>
          </div>
        )}
      </div>
    </section>
  );
}
