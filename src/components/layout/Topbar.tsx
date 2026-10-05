import React, { useState, useEffect, useRef } from 'react';
import { useUIStore, AppPages } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { Menu, Calendar, Clock, Bell, Sun, Moon, Monitor, Check, UserPlus, FileEdit, Trash2, CheckCircle2, ShieldAlert, MessageSquare, CheckCheck, Trash } from 'lucide-react';
import { applySystemTheme, getStoredTheme } from '../../utils/theme';
import { userSettingsService, auditLogsService } from '../../services/supabaseService';
import { AuditLogNotification } from '../../types';
import { useSeniorsStore } from '../../store/seniorsStore';

export default function Topbar() {
  const { toggleSidebar, currentPage, showToast, setCurrentPage } = useUIStore();
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

  const openNotificationTarget = (notification: AuditLogNotification) => {
    const detailText = notification.details.toLocaleLowerCase();
    const seniors = useSeniorsStore.getState().seniors;
    const matchedSenior = notification.targetId
      ? seniors.find((senior) => senior.id === notification.targetId)
      : notification.entity === 'Senior'
        ? seniors.find((senior) =>
            detailText.includes(senior.oscaNumber.toLocaleLowerCase()) ||
            detailText.includes(`${senior.firstName} ${senior.lastName}`.toLocaleLowerCase())
          )
        : undefined;

    let page = notification.targetPage;
    let targetId = notification.targetId || (notification.targetPage === 'SeniorProfile' ? matchedSenior?.id : undefined);

    if (!page) {
      if (notification.entity === 'Senior') {
        page = matchedSenior ? 'SeniorProfile' : 'SeniorsList';
        targetId = matchedSenior?.id;
      } else if (notification.entity === 'Grantee Claim Form' || notification.entity === 'Grantee Registration') {
        page = 'GranteeClaimForms';
      } else if (notification.entity === 'User') {
        page = 'UserManagement';
      } else if (notification.entity === 'SMS') {
        page = 'SMSCenter';
      } else if (notification.entity === 'Report') {
        page = 'Reports';
      } else if (notification.entity === 'Role' || notification.entity === 'System' || notification.entity === 'Session') {
        page = 'Configuration';
      } else {
        page = 'Dashboard';
      }
    }

    if (page === 'SeniorProfile' && (!targetId || !seniors.some((senior) => senior.id === targetId))) {
      page = 'SeniorsList';
      targetId = undefined;
      showToast('Hindi na makita ang senior record. Binuksan ang listahan ng seniors.', 'warning');
    }

    setCurrentPage(
      page,
      page === 'SeniorProfile' ? targetId || null : null,
      page === 'GranteeClaimForms' ? targetId || null : null,
    );
    setNotifDropdownOpen(false);
    void auditLogsService.markAsRead(notification.id);
  };

  const PAGE_TITLES: Record<AppPages, string> = {
    Dashboard: 'Census Statistics & Dashboard',
    SeniorsList: 'Senior Citizen Profiles Registry',
    SeniorProfile: 'Senior Citizen Detailed Dossier',
    Register: 'Senior Citizen Registration Portal',
    Reports: 'Forms, Templates & Census Reports',
    GranteeClaimForms: 'Grantee Claim Forms',
    SMSCenter: 'SMS Communications & Notifications',
    UserManagement: 'System User Administration',
    FindUser: 'Find User & ID Verification',
    Configuration: 'System Configuration & Parameters',
    Mapping: 'Demographics & Barangay GIS Mapping',
    AuditLogs: 'Audit Logs'
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
      bgTint: targetMode === 'dark' ? '#08111f' : '#f8fafc'
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
                {currentUser.profilePhoto ? (
                  <img
                    src={currentUser.profilePhoto}
                    alt={currentUser.fullName}
                    className="w-8 h-8 rounded-full object-cover shadow-sm"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center font-extrabold text-xs text-white shadow-sm">
                    {currentUser.username.substring(0, 2).toUpperCase()}
                  </div>
                )}
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
