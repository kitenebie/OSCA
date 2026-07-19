import React, { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { useUIStore } from './store/uiStore';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import SeniorsListPage from './pages/SeniorsListPage';
import SeniorProfilePage from './pages/SeniorProfilePage';
import SeniorRegistrationPage from './pages/SeniorRegistrationPage';
import ReportsPage from './pages/ReportsPage';
import SMSCenterPage from './pages/SMSCenterPage';
import UserManagementPage from './pages/UserManagementPage';
import FindUserPage from './pages/FindUserPage';
import ConfigurationPage from './pages/ConfigurationPage';
import MappingPage from './pages/MappingPage';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export default function App() {
  const { currentUser } = useAuthStore();
  const { currentPage, toasts, removeToast } = useUIStore();

  // Handle auto-timeout or logging checks in development
  useEffect(() => {
    console.log(`LGU System Node Initialized. Active Page: ${currentPage}`);
  }, [currentPage]);

  // Render Page Router
  const renderPage = () => {
    switch (currentPage) {
      case 'Dashboard':
        return <DashboardPage />;
      case 'SeniorsList':
        return <SeniorsListPage />;
      case 'SeniorProfile':
        return <SeniorProfilePage />;
      case 'Register':
        return <SeniorRegistrationPage />;
      case 'Reports':
        return <ReportsPage />;
      case 'SMSCenter':
        return <SMSCenterPage />;
      case 'UserManagement':
        return <UserManagementPage />;
      case 'FindUser':
        return <FindUserPage />;
      case 'Configuration':
        return <ConfigurationPage />;
      case 'Mapping':
        return <MappingPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 antialiased selection:bg-teal-500/10 selection:text-teal-800">
      
      {/* Auth state manager router */}
      {!currentUser ? (
        <LoginPage />
      ) : (
        <DashboardLayout>
          {renderPage()}
        </DashboardLayout>
      )}

      {/* Floating Global Toast Notification */}
      {toasts.length > 0 && (
        <div className="fixed bottom-5 right-5 z-[2000] space-y-2 max-w-sm w-full">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className="flex items-center gap-3 px-4.5 py-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-2xl shadow-slate-950/20 animate-fadeIn"
            >
              {/* Toast type specific icon */}
              <div className="shrink-0">
                {toast.type === 'success' && <CheckCircle size={16} className="text-emerald-400" />}
                {toast.type === 'warning' && <AlertTriangle size={16} className="text-amber-400" />}
                {toast.type === 'error' && <AlertCircle size={16} className="text-red-400" />}
                {toast.type === 'info' && <Info size={16} className="text-teal-400" />}
              </div>

              <p className="text-[11.5px] font-semibold flex-1 leading-normal font-sans text-slate-100 pr-1">
                {toast.message}
              </p>

              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
