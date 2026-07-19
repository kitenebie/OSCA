import React from 'react';
import { useUIStore, AppPages } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  FileSpreadsheet, 
  MessageSquare, 
  Settings, 
  ShieldAlert, 
  LogOut, 
  Menu,
  X,
  MapPin
} from 'lucide-react';

export default function Sidebar() {
  const { currentPage, setCurrentPage, sidebarOpen, toggleSidebar } = useUIStore();
  const { currentUser, logout, hasPermission } = useAuthStore();

  const menuItems = [
    { 
      id: 'Dashboard' as AppPages, 
      label: 'Census Dashboard', 
      icon: LayoutDashboard, 
      permission: 'canViewSeniors' as const 
    },
    { 
      id: 'SeniorsList' as AppPages, 
      label: 'Senior Profiles', 
      icon: Users, 
      permission: 'canViewSeniors' as const 
    },
    { 
      id: 'Register' as AppPages, 
      label: 'New Registration', 
      icon: UserPlus, 
      permission: 'canCreateSenior' as const 
    },
    { 
      id: 'Reports' as AppPages, 
      label: 'Reports & Forms', 
      icon: FileSpreadsheet, 
      permission: 'canGenerateReports' as const 
    },
    { 
      id: 'SMSCenter' as AppPages, 
      label: 'SMS Center', 
      icon: MessageSquare, 
      permission: 'canSendSMS' as const 
    },
    { 
      id: 'UserManagement' as AppPages, 
      label: 'User Management', 
      icon: Settings, 
      permission: 'canManageUsers' as const 
    },
  ];

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside 
        className={`fixed inset-y-0 left-0 bg-slate-900 text-slate-100 flex flex-col transition-all duration-300 z-50 shadow-2xl
          ${sidebarOpen ? 'w-64' : 'w-20'} 
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Header Branding */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center p-0.5 shadow-md shrink-0">
              <img 
                referrerPolicy="no-referrer"
                src="https://juban-boms.lguapps.com/wp-content/uploads/2025/08/cropped-jubanlogo-1.png" 
                alt="Juban Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            {sidebarOpen && (
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-wide leading-none text-teal-400 font-sans">JUBAN, SORSOGON</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Senior Citizen Portal</span>
              </div>
            )}
          </div>
          <button 
            onClick={toggleSidebar} 
            className="lg:hidden p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Logged User Info Badge */}
        {currentUser && sidebarOpen && (
          <div className="mx-4 my-6 p-3 bg-slate-800/50 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0 font-bold">
              {currentUser.fullName.split(' ').pop()?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <h4 className="font-medium text-xs truncate text-slate-200">{currentUser.fullName}</h4>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate uppercase">{currentUser.role}</p>
              {currentUser.barangayAssigned && (
                <div className="flex items-center gap-1 mt-1 text-[9px] text-teal-400">
                  <MapPin size={8} />
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
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative group
                  ${isActive 
                    ? 'bg-teal-600 text-white font-semibold' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}`}
              >
                <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'} />
                {sidebarOpen ? (
                  <span className="truncate">{item.label}</span>
                ) : (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-slate-950 text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-md">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-3 border-t border-slate-800 space-y-1">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all duration-150 group"
          >
            <LogOut size={18} className="text-red-400 group-hover:translate-x-1 transition-transform" />
            {sidebarOpen && <span>Magsara (Logout)</span>}
          </button>
          
          {sidebarOpen && (
            <div className="pt-2 text-center">
              <span className="text-[9px] text-slate-500 font-mono uppercase">LGU-JUBAN v1.0.0</span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
