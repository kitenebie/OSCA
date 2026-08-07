import React, { useState } from 'react';
import { useUIStore, AppPages } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  FileSpreadsheet, 
  MessageSquare,  
  LogOut, 
  X,
  MapPin,
  Scan,
  UserRoundCog,
  MonitorCog,
  AlertTriangle,
  ClipboardList,
  Trophy
} from 'lucide-react';

export default function Sidebar() {
  const { currentPage, setCurrentPage, sidebarOpen, toggleSidebar, nfcEnabled } = useUIStore();
  const { currentUser, logout, hasPermission } = useAuthStore();

  const menuItems = [
    { 
      id: 'Dashboard' as AppPages, 
      label: 'Census Dashboard', 
      icon: LayoutDashboard, 
      permission: 'canAccessDashboard' as const 
    },
    { 
      id: 'SeniorsList' as AppPages, 
      label: 'Senior Profiles', 
      icon: Users, 
      permission: 'canAccessSeniorsList' as const 
    },
    { 
      id: 'Mapping' as AppPages, 
      label: 'Demographics Map', 
      icon: MapPin, 
      permission: 'canAccessMapping' as const 
    },
    { 
      id: 'FindUser' as AppPages, 
      label: nfcEnabled ? 'Find User / NFC' : 'Find User', 
      icon: Scan, 
      permission: 'canAccessFindUser' as const 
    },
    { 
      id: 'Register' as AppPages, 
      label: 'New Registration', 
      icon: UserPlus, 
      permission: 'canAccessRegister' as const 
    },
    { 
      id: 'Reports' as AppPages, 
      label: 'Reports & Forms', 
      icon: FileSpreadsheet, 
      permission: 'canAccessReports' as const 
    },
    { 
      id: 'SMSCenter' as AppPages, 
      label: 'SMS Center', 
      icon: MessageSquare, 
      permission: 'canAccessSMSCenter' as const 
    },
    { 
      id: 'NCSCInterview' as AppPages, 
      label: 'NCSC Data Form', 
      icon: ClipboardList, 
      permission: 'canAccessSeniorsList' as const 
    },
    { 
      id: 'CentenarianHonoring' as AppPages, 
      label: 'Centenarian Honoring', 
      icon: Trophy, 
      permission: 'canAccessSeniorsList' as const 
    },
    { 
      id: 'UserManagement' as AppPages, 
      label: 'User Management', 
      icon: UserRoundCog, 
      permission: 'canAccessUserManagement' as const 
    },
    { 
      id: 'Configuration' as AppPages, 
      label: 'Configuration', 
      icon: MonitorCog, 
      permission: 'canAccessConfiguration' as const 
    },
  ];

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-[#0f172a]/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside 
        className={`fixed inset-y-0 left-0 text-[#f1f5f9] flex flex-col transition-all duration-300 z-50 shadow-2xl
          ${sidebarOpen ? 'w-64' : 'w-20'} 
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{ backgroundColor: 'var(--osca-sidebar-bg)' }}
      >
        {/* Header Branding */}
        <div className="h-16 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center p-0.5 shadow-md shrink-0">
              <img 
                referrerPolicy="no-referrer"
                src="/juban-logo.png" 
                alt="Juban Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            {sidebarOpen && (
              <div className="flex flex-col">
                <span className="font-extrabold text-sm tracking-wide leading-none text-white font-sans">JUBAN, SORSOGON</span>
                <span className="text-[9px] font-bold uppercase tracking-widest mt-0.5" style={{ color: 'var(--osca-sidebar-active)' }}>OSCA LGU Portal</span>
              </div>
            )}
          </div>
          <button 
            onClick={toggleSidebar} 
            className="lg:hidden p-1 rounded-md text-[#f1f5f9] hover:text-white hover:bg-[#02061733]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Philippine National Colors Tri-Color Security Accent Ribbon */}
        <div style={{ height: 2, background: 'linear-gradient(to right, #FD0000 40%, #FDFE00 40% 60%, #0000FD 60%)' }} className="w-full shrink-0" />

        {/* Logged User Info Badge */}
        {currentUser && sidebarOpen && (
          <div className="mx-4 my-6 p-3 bg-[#02061733] rounded-xl border border-[#0206171a] flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#02061726] border border-[#02061740] flex items-center justify-center text-white shrink-0 font-extrabold">
              {currentUser.fullName.split(' ').pop()?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <h4 className="font-bold text-xs truncate text-white">{currentUser.fullName}</h4>
              <p className="text-[8px] font-mono font-semibold mt-0.5 truncate uppercase tracking-widest" style={{ color: 'var(--osca-sidebar-active)' }}>{currentUser.role}</p>
              {currentUser.barangayAssigned && (
                <div className="flex items-center gap-1 mt-1 text-[9px] text-[#e2e8f0]">
                  <MapPin size={8} className="text-[#e2e8f0]" />
                  <span>Brgy: {currentUser.barangayAssigned}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 px-3 space-y-1 py-4 overflow-hidden">
          {menuItems.map((item) => {
            const hasAccess = hasPermission(item.permission);
            if (!hasAccess) return null;

            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  // Auto close sidebar on mobile
                  if (window.innerWidth < 1024) toggleSidebar();
                }}
                style={{ borderLeftColor: isActive ? 'var(--osca-sidebar-active)' : undefined }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 relative group
                  ${isActive 
                    ? 'bg-[#02061733] text-white border-l-4 rounded-l-none' 
                    : 'text-[#cbd5e1cc] hover:bg-[#0206171a] hover:text-white'}`}
              >
                <Icon size={18} className={isActive ? '' : 'text-[#cbd5e1b3] group-hover:text-white'} style={isActive ? { color: 'var(--osca-sidebar-active)' } : undefined} />
                {sidebarOpen ? (
                  <span className="truncate">{item.label}</span>
                ) : (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-[#020617] text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-md border border-[#0206174d] font-bold">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-3 border-t border-[#02061733] space-y-1">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-red-200 hover:bg-red-950/20 transition-all duration-150 group"
          >
            <LogOut size={18} className="text-red-300 group-hover:translate-x-1 transition-transform" />
            {sidebarOpen && <span>Logout</span>}
          </button>
          
          {sidebarOpen && (
            <div className="pt-2 text-center">
              <span className="text-[8px] text-[#f1f5f966] font-mono uppercase tracking-widest">LGU-JUBAN v1.0.0</span>
            </div>
          )}
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-[fadeIn_200ms_ease-out]"
            onClick={() => setShowLogoutModal(false)}
          ></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4 animate-[scaleIn_250ms_ease-out]">
            <button 
              onClick={() => setShowLogoutModal(false)}
              className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="w-14 h-14 mx-auto bg-red-50 border border-red-200 rounded-2xl flex items-center justify-center">
              <AlertTriangle size={24} className="text-red-500" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-bold text-lg text-slate-800">Do you want to logout?</h3>
              <p className="text-sm text-slate-500">
                Your session will end and you will need to log in again.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 px-4 bg-red-500 hover:bg-red-600 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer active:scale-95"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
