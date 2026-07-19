import React, { useState, useEffect } from 'react';
import { useUIStore, AppPages } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { Menu, Calendar, Clock, Bell, User, ChevronDown } from 'lucide-react';

export default function Topbar() {
  const { toggleSidebar, currentPage, nfcEnabled } = useUIStore();
  const { currentUser } = useAuthStore();
  const [time, setTime] = useState(new Date());

  const PAGE_TITLES: Record<AppPages, string> = {
    Dashboard: 'Census Statistics & Dashboard',
    SeniorsList: 'Senior Citizen Profiles Registry',
    SeniorProfile: 'Senior Citizen Detailed Dossier',
    Register: 'Senior Citizen Registration Portal',
    Reports: 'Forms, Templates & Census Reports',
    SMSCenter: 'SMS Communications & Notifications',
    UserManagement: 'System User Administration',
    FindUser: nfcEnabled ? 'Find User & Biometric NFC Scanner' : 'Find User & Biometric Scanner',
    Configuration: 'System Configuration & Parameters'
  };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const formattedDate = time.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="bg-white sticky top-0 z-30 shadow-sm flex flex-col shrink-0">
      {/* Philippine National Colors Tri-Color Security Accent Ribbon */}
      <div style={{ height: 2, background: 'linear-gradient(to right, #FD0000 40%, #FDFE00 40% 60%, #0000FD 60%)' }} className="w-full shrink-0" />
      
      <div className="h-[62px] border-b border-slate-200 px-6 flex items-center justify-between">
        {/* Left controls */}
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 transition-colors"
          >
            <Menu size={20} />
          </button>
          <div>
            <h1 className="font-black text-slate-800 text-sm md:text-base tracking-tight uppercase">
              {PAGE_TITLES[currentPage]}
            </h1>
            <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider md:flex items-center gap-1.5 hidden">
              <span>Republika ng Pilipinas</span>
              <span>•</span>
              <span className="text-[#02A952]">Lalawigan ng Sorsogon</span>
              <span>•</span>
              <span className="text-blue-700">Bayan ng Juban</span>
            </p>
          </div>
        </div>

        {/* Right details */}
        <div className="flex items-center gap-4 md:gap-6">
          {/* DateTime Widget */}
          <div className="hidden lg:flex flex-col items-end border-r border-slate-200 pr-5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <Clock size={12} className="text-[#02A952]" />
              <span className="font-mono">{formattedTime}</span>
              <span className="text-[9px] text-white uppercase bg-[#02A952] px-1 py-0.5 rounded font-bold">PST</span>
            </div>
            <div className="flex items-center gap-1 mt-0.5 text-[9px] text-slate-400 font-mono">
              <Calendar size={10} className="text-[#0000FD]" />
              <span>{formattedDate}</span>
            </div>
          </div>

          {/* Action Widgets */}
          <div className="flex items-center gap-2">
            {/* Notifications Placeholder */}
            <button className="p-2 text-slate-400 hover:text-slate-650 hover:bg-slate-50 rounded-full transition-all relative">
              <Bell size={18} className="text-emerald-700" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FD0000] rounded-full ring-2 ring-white"></span>
            </button>
            
            {/* User Profile dropdown mockup */}
            {currentUser && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-100">
                <div className="w-8 h-8 rounded-full bg-[#02A952] flex items-center justify-center font-extrabold text-xs text-white shadow-sm">
                  {currentUser.username.substring(0, 2).toUpperCase()}
                </div>
                <div className="hidden md:block text-left">
                  <h4 className="text-xs font-bold text-slate-700 leading-tight">{currentUser.fullName}</h4>
                  <p className="text-[8px] font-mono text-emerald-600 font-bold uppercase tracking-wider">{currentUser.role}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
