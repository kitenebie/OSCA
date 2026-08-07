import React, { useState, useEffect, useRef } from 'react';
import { useUIStore, AppPages } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { Menu, Calendar, Clock, Bell, Sun, Moon, Monitor, Check, UserPlus, FileEdit, Trash2, CheckCircle2, ShieldAlert, MessageSquare, CheckCheck, Trash } from 'lucide-react';
import { applySystemTheme, getStoredTheme } from '../../utils/theme';
import { userSettingsService, auditLogsService } from '../../services/supabaseService';
import { AuditLogNotification } from '../../types';

export default function Topbar() {
  const { toggleSidebar, currentPage, nfcEnabled, showToast } = useUIStore();
  const { currentUser } = useAuthStore();
  const [time, setTime] = useState(new Date());
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<AuditLogNotification[]>([]);
  const [activeMode, setActiveMode] = useState<'light' | 'dark' | 'system'>('light');

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Real-time Notifications Subscription
  useEffect(() => {
    const unsub = auditLogsService.subscribe((logs) => {
      setNotifications(logs);
    });
    auditLogsService.getAll().then(setNotifications);
    return () => unsub();
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const PAGE_TITLES: Record<AppPages, string> = {
    Dashboard: 'Census Statistics & Dashboard',
    SeniorsList: 'Senior Citizen Profiles Registry',
    SeniorProfile: 'Senior Citizen Detailed Dossier',
    Register: 'Senior Citizen Registration Portal',
    Reports: 'Forms, Templates & Census Reports',
    SMSCenter: 'SMS Communications & Notifications',
    UserManagement: 'System User Administration',
    FindUser: nfcEnabled ? 'Find User & Biometric NFC Scanner' : 'Find User & Biometric Scanner',
    Configuration: 'System Configuration & Parameters',
    Mapping: 'Demographics & Barangay GIS Mapping'
  };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize theme mode indicator on mount
  useEffect(() => {
    const stored = getStoredTheme();
    if (stored && stored.mode) {
      setActiveMode(stored.mode);
    }
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setThemeDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleModeChange = async (mode: 'light' | 'dark' | 'system') => {
    setActiveMode(mode);
    setThemeDropdownOpen(false);

    let targetMode: 'light' | 'dark' = mode === 'system' 
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : mode;

    let current = getStoredTheme();
    if (currentUser) {
      try {
        const stored = await userSettingsService.get(currentUser.id);
        if (stored) current = stored;
      } catch { /* ignore */ }
    }

    const updatedTheme = {
      ...current,
      mode: targetMode,
      bgTint: targetMode === 'dark' ? '#0b1329' : '#f8fafc'
    };

    applySystemTheme(updatedTheme);

    if (currentUser) {
      try {
        await userSettingsService.upsert(currentUser.id, updatedTheme);
      } catch (err) {
        console.error('[THEME TOGGLE SAVE ERROR]', err);
      }
    }

    const modeLabels = { light: 'Light', dark: 'Dark', system: 'System' };
    showToast(`Theme applied: ${modeLabels[mode]}`, 'info');
  };

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

  const isDarkModeActive = document.documentElement.classList.contains('dark');

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
            <h1 className="font-black text-slate-800 text-xs sm:text-sm md:text-base tracking-tight uppercase truncate max-w-[170px] xs:max-w-[250px] sm:max-w-[400px] md:max-w-none">
              {PAGE_TITLES[currentPage]}
            </h1>
            <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider md:flex items-center gap-1.5 hidden">
              <span>Republic of the Philippines</span>
              <span>•</span>
              <span className="text-teal-600">Province of Sorsogon</span>
              <span>•</span>
              <span className="text-blue-700">Municipality of Juban</span>
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
              <span className="text-[9px] text-white uppercase bg-teal-600 px-1 py-0.5 rounded font-bold">PST</span>
            </div>
            <div className="flex items-center gap-1 mt-0.5 text-[9px] text-slate-400 font-mono">
              <Calendar size={10} className="text-teal-700" />
              <span>{formattedDate}</span>
            </div>
          </div>

          {/* Action Widgets */}
          <div className="flex items-center gap-2">
            {/* Realtime Notifications Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all relative flex items-center justify-center cursor-pointer"
                title="Notifications & Audit Logs"
              >
                <Bell size={18} className="text-emerald-700 dark:text-teal-400" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900 animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 animate-fadeIn">
                  {/* Header */}
                  <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell size={15} className="text-teal-600 dark:text-teal-400" />
                      <h6 className="font-bold text-xs text-slate-800 dark:text-slate-200">Realtime Audit Logs & Abiso</h6>
                      {unreadCount > 0 && (
                        <span className="bg-teal-500/10 text-teal-600 dark:text-teal-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-teal-500/20">
                          {unreadCount} bago
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => auditLogsService.markAllAsRead()}
                        className="p-1 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-all cursor-pointer"
                        title="Mark all as read"
                      >
                        <CheckCheck size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => auditLogsService.clearAll()}
                        className="p-1 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-all cursor-pointer"
                        title="Clear all notifications"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  </div>

                  {/* List of Realtime Audit Notifications */}
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                    {notifications.length === 0 ? (
                      <div className="text-center py-10 px-4">
                        <Bell size={24} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">No new notifications or audit logs.</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Notifications will appear here when there are new records or system changes.</p>
                      </div>
                    ) : (
                      notifications.map((n) => {
                        const isUnread = !n.read;
                        const date = new Date(n.timestamp);
                        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                        return (
                          <div
                            key={n.id}
                            className={`group p-3 text-xs transition-all duration-200 flex items-start gap-3 border-l-2 cursor-pointer ${
                              isUnread
                                ? 'bg-teal-50/60 hover:bg-teal-100/80 border-teal-500 dark:bg-teal-950/40 dark:hover:bg-teal-900/50 dark:border-teal-400 font-semibold'
                                : 'bg-transparent hover:bg-slate-100/80 border-transparent hover:border-teal-500/40 dark:hover:bg-slate-800/90 dark:hover:border-teal-400/50 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {/* Action Icon Badge */}
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-xs group-hover:scale-105 transition-transform ${
                              n.action === 'CREATE' ? 'bg-teal-500 text-white' :
                              n.action === 'UPDATE' ? 'bg-blue-500 text-white' :
                              n.action === 'DELETE' ? 'bg-amber-500 text-white' :
                              n.action === 'APPROVE' ? 'bg-emerald-500 text-white' :
                              n.action === 'REJECT' ? 'bg-red-500 text-white' : 'bg-slate-500 text-white'
                            }`}>
                              {n.action === 'CREATE' && <UserPlus size={14} />}
                              {n.action === 'UPDATE' && <FileEdit size={14} />}
                              {n.action === 'DELETE' && <Trash2 size={14} />}
                              {n.action === 'APPROVE' && <CheckCircle2 size={14} />}
                              {n.action === 'REJECT' && <ShieldAlert size={14} />}
                              {n.action === 'SMS' && <MessageSquare size={14} />}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <span className={`text-[9.5px] font-bold font-mono px-1.5 py-0.5 rounded uppercase ${
                                  n.action === 'CREATE' ? 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300 dark:border dark:border-teal-800/60' :
                                  n.action === 'UPDATE' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 dark:border dark:border-blue-800/60' :
                                  n.action === 'DELETE' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 dark:border dark:border-amber-800/60' :
                                  n.action === 'APPROVE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 dark:border dark:border-emerald-800/60' :
                                  'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:border dark:border-slate-700/60'
                                }`}>
                                  {n.action} • {n.entity}
                                </span>
                                <span className="text-[9.5px] text-slate-400 dark:text-slate-400 font-mono">{timeStr}</span>
                              </div>

                              <p className="text-[11px] text-slate-800 dark:text-slate-200 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors mt-1 leading-snug font-sans">
                                {n.details}
                              </p>

                              <div className="flex items-center gap-2 mt-1 text-[9.5px] text-slate-400 dark:text-slate-400">
                                <span>Actor: <strong className="text-slate-600 dark:text-slate-300">{n.actorName}</strong></span>
                                {n.barangay && <span>• Brgy. {n.barangay}</span>}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Theme Mode Selector Dropdown (Light / Dark / System) */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all flex items-center justify-center"
                title={`Tema: ${activeMode === 'light' ? 'Light' : activeMode === 'dark' ? 'Dark' : 'System'}`}
              >
                {activeMode === 'light' && <Sun size={18} className="text-amber-500" />}
                {activeMode === 'dark' && <Moon size={18} className="text-teal-400" />}
                {activeMode === 'system' && (
                  isDarkModeActive ? <Monitor size={18} className="text-teal-400" /> : <Monitor size={18} className="text-emerald-700" />
                )}
              </button>

              {themeDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-fadeIn">
                  <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Theme Mode</p>
                  </div>

                  <button
                    onClick={() => handleModeChange('light')}
                    className={`w-full px-3 py-2 text-xs font-semibold flex items-center justify-between transition-colors ${
                      activeMode === 'light' 
                        ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400' 
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Sun size={15} className="text-amber-500" />
                      <span>Light</span>
                    </div>
                    {activeMode === 'light' && <Check size={14} className="text-amber-600" />}
                  </button>

                  <button
                    onClick={() => handleModeChange('dark')}
                    className={`w-full px-3 py-2 text-xs font-semibold flex items-center justify-between transition-colors ${
                      activeMode === 'dark' 
                        ? 'bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400' 
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Moon size={15} className="text-teal-400" />
                      <span>Dark</span>
                    </div>
                    {activeMode === 'dark' && <Check size={14} className="text-teal-500" />}
                  </button>

                  <button
                    onClick={() => handleModeChange('system')}
                    className={`w-full px-3 py-2 text-xs font-semibold flex items-center justify-between transition-colors ${
                      activeMode === 'system' 
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400' 
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Monitor size={15} className="text-emerald-600 dark:text-emerald-400" />
                      <span>System</span>
                    </div>
                    {activeMode === 'system' && <Check size={14} className="text-emerald-600" />}
                  </button>
                </div>
              )}
            </div>
            
            {/* User Profile dropdown mockup */}
            {currentUser && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-100">
                <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center font-extrabold text-xs text-white shadow-sm">
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
