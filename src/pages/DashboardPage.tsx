import React from 'react';
import { useSeniorsStore } from '../store/seniorsStore';
import { useAuthStore } from '../store/authStore';
import StatCard from '../components/dashboard/StatCard';
import BarangayChart from '../components/dashboard/BarangayChart';
import PendingApprovalsWidget from '../components/dashboard/PendingApprovalsWidget';
import { Users, CreditCard, Clock, Landmark, Calendar, ShieldCheck } from 'lucide-react';

export default function DashboardPage() {
  const { seniors } = useSeniorsStore();
  const { currentUser } = useAuthStore();

  const totalSeniors = seniors.length;
  const pensionSeniors = seniors.filter((s) => s.pensionBeneficiary).length;
  const pendingSeniors = seniors.filter(
    (s) => s.status === 'Pending' || s.status === 'For Verification'
  ).length;
  const approvedSeniors = seniors.filter((s) => s.status === 'Approved').length;

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Magandang Umaga';
    if (hr < 18) return 'Magandang Hapon';
    return 'Magandang Gabi';
  };

  const formattedDate = new Date().toLocaleDateString('fil-PH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      
      {/* Greetings Header block */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 bg-slate-900 text-white rounded-3xl shadow-lg border border-slate-950">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-teal-400 font-mono">Bayan ng Juban Portal</span>
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></div>
          </div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight uppercase truncate">
            {getGreeting()}, {currentUser?.fullName || 'LGU User'}!
          </h2>
          <p className="text-[11px] text-slate-400 font-medium">
            Maaari mong subaybayan, irehistro, at i-audit ang records ng mga nakatira nating Senior Citizens dito.
          </p>
        </div>

        <div className="flex items-center gap-2.5 bg-slate-950/50 p-3 rounded-2xl border border-slate-800 shrink-0 font-medium text-slate-300 text-xs font-mono">
          <Calendar size={13} className="text-teal-400" />
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* Statistics Counter row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Kabuuang Rehistrado (Total Seniors)"
          value={totalSeniors}
          description="Registered senior citizen population"
          change="+4.2% buwanang taas"
          changeType="increase"
          icon={Users}
          bgColor="bg-teal-50"
          iconColor="text-teal-600"
        />
        <StatCard
          title="Social Pensioners (SocPen)"
          value={pensionSeniors}
          description="Seniors enrolled in indigent pension"
          change={`${Math.round((pensionSeniors / (totalSeniors || 1)) * 100)}% ng kabuuan`}
          changeType="neutral"
          icon={CreditCard}
          bgColor="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          title="Mga Hinihintay (Pending Approvals)"
          value={pendingSeniors}
          description="Applications awaiting review"
          change={pendingSeniors > 0 ? "Kailangan Suriin" : "Malinis ang Queue"}
          changeType={pendingSeniors > 0 ? "decrease" : "increase"}
          icon={Clock}
          bgColor="bg-amber-50"
          iconColor="text-amber-600"
        />
        <StatCard
          title="Aktibong Aprobado (Approved)"
          value={approvedSeniors}
          description="Active records issued with NFC cards"
          change={`${Math.round((approvedSeniors / (totalSeniors || 1)) * 100)}% Active`}
          changeType="increase"
          icon={Landmark}
          bgColor="bg-blue-50"
          iconColor="text-blue-600"
        />
      </div>

      {/* Dashboard Visualizer widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <BarangayChart />
        </div>
        <div className="lg:col-span-2">
          <PendingApprovalsWidget />
        </div>
      </div>

      {/* Localized Scope Notification Banner */}
      {currentUser?.role === 'Barangay Encoder' && (
        <div className="flex items-start gap-3 p-4 bg-teal-500/10 border border-teal-500/20 text-teal-800 rounded-2xl">
          <ShieldCheck className="text-teal-600 shrink-0 mt-0.5" size={18} />
          <div>
            <h5 className="font-bold text-xs uppercase tracking-wide">Localized Scope Protection Active</h5>
            <p className="text-[10px] text-teal-700 leading-normal mt-0.5">
              Naka-filter ang inyong view sa <strong>Brgy. {currentUser.barangayAssigned}</strong>. Lahat ng bagong rehistro ay kusa naming iuugnay sa inyong barangay assigned. Ang inyong account ay limitado lamang sa pagrehistro at pag-edit ng inyong sariling barangay records alinsunod sa RBAC rules.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
