import React, { useState, useEffect } from 'react';
import { useUIStore, AppPages } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { Menu, Calendar, Clock, Bell, User, ChevronDown } from 'lucide-react';

const PAGE_TITLES: Record<AppPages, string> = {
  Dashboard: 'Census Statistics & Dashboard',
  SeniorsList: 'Senior Citizen Profiles Registry',
  SeniorProfile: 'Senior Citizen Detailed Dossier',
  Register: 'Senior Citizen Registration Portal',
  Reports: 'Forms, Templates & Census Reports',
  SMSCenter: 'SMS Communications & Notifications',
  UserManagement: 'System User Administration'
};

export default function Topbar() {
  const { toggleSidebar, currentPage } = useUIStore();
  const { currentUser } = useAuthStore();
  const [time, setTime] = useState(new Date());

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
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Left controls */}
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="font-bold text-slate-800 text-base md:text-lg tracking-tight">
            {PAGE_TITLES[currentPage]}
          </h1>
          <p className="text-[10px] text-slate-400 font-medium md:flex items-center gap-1.5 hidden">
            <span>Republika ng Pilipinas</span>
            <span>•</span>
            <span>Lalawigan ng Sorsogon</span>
            <span>•</span>
            <span>Bayan ng Juban</span>
          </p>
        </div>
      </div>

      {/* Right details */}
      <div className="flex items-center gap-4 md:gap-6">
        {/* DateTime Widget */}
        <div className="hidden lg:flex flex-col items-end border-r border-slate-200 pr-5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <Clock size={12} className="text-teal-600" />
            <span className="font-mono">{formattedTime}</span>
            <span className="text-[9px] text-teal-600 uppercase bg-teal-50 px-1 py-0.5 rounded font-bold">PST</span>
          </div>
          <div className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-400">
            <Calendar size={10} />
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Action Widgets */}
        <div className="flex items-center gap-2">
          {/* Notifications Placeholder */}
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all relative">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-teal-500 rounded-full ring-2 ring-white"></span>
          </button>
          
          {/* User Profile dropdown mockup */}
          {currentUser && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-100">
              <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center font-bold text-xs text-white">
                {currentUser.username.substring(0, 2).toUpperCase()}
              </div>
              <div className="hidden md:block text-left">
                <h4 className="text-xs font-semibold text-slate-700 leading-tight">{currentUser.fullName}</h4>
                <p className="text-[9px] text-slate-400 leading-none">{currentUser.role}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
