import React, { useEffect, useState } from 'react';
import { userSettingsService } from './services/supabaseService';
import { useAuthStore } from './store/authStore';
import { useSeniorsStore } from './store/seniorsStore';
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
import GranteeClaimFormsPage from './pages/GranteeClaimFormsPage';
import MappingPage from './pages/MappingPage';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import SessionDismissedModal from './components/rbac/SessionDismissedModal';
import { applySystemTheme } from './utils/theme';

export default function App() {
  const { currentUser } = useAuthStore();
  const { currentPage, toasts, removeToast, sessionDismissedBy, clearSessionDismissed } = useUIStore();
  const logout = useAuthStore((s) => s.logout);
  const initAuth = useAuthStore((s) => s.initialize);
  const initSeniors = useSeniorsStore((s) => s.initialize);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Initialize Supabase data on mount
  useEffect(() => {
    const init = async () => {
      await initAuth();
      setIsCheckingSession(false);
    };
    init();
    initSeniors();
  }, []);

  // Load and apply user theme from Supabase after login
  useEffect(() => {
    if (!currentUser) return;
    loadUserTheme(currentUser.id);
  }, [currentUser]);

  const loadUserTheme = async (userId: string) => {
    try {
      const t = await userSettingsService.get(userId);
      if (!t) return;
      applySystemTheme(t);
    } catch { /* ignore */ }
  };
  useEffect(() => {
    console.log(`Active Page: ${currentPage}`);
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
      case 'GranteeClaimForms':
        return <GranteeClaimFormsPage />;
      default:
        return <DashboardPage />;
    }
  };

  const getToastIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="text-teal-500 shrink-0" size={18} />;
      case 'error': return <AlertCircle className="text-red-500 shrink-0" size={18} />;
      case 'warning': return <AlertTriangle className="text-amber-500 shrink-0" size={18} />;
      default: return <Info className="text-blue-500 shrink-0" size={18} />;
    }
  };

  const getToastColors = (type: string) => {
    switch (type) {
      case 'success': return 'bg-white border-teal-100 shadow-teal-100/50';
      case 'error': return 'bg-white border-red-100 shadow-red-100/50';
      case 'warning': return 'bg-white border-amber-100 shadow-amber-100/50';
      default: return 'bg-white border-blue-100 shadow-blue-100/50';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 antialiased selection:bg-teal-500/10 selection:text-teal-800">
      
      {/* Auth state manager router */}
      {isCheckingSession ? (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="flex flex-col items-center gap-3">
            <svg className="animate-spin h-8 w-8 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-sm text-slate-500 font-medium">Verifying session...</p>
          </div>
        </div>
      ) : !currentUser ? (
        <LoginPage />
      ) : (
        <DashboardLayout>
          {renderPage()}
        </DashboardLayout>
      )}

      {/* Unified Global Toast Notification System */}
      <div className="fixed top-20 right-5 z-[2000] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all duration-300 ${getToastColors(toast.type)}`}
            >
              {getToastIcon(toast.type)}
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-800 leading-normal">{toast.message}</p>
              </div>
              <button 
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded-md hover:bg-slate-50 transition-colors shrink-0"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Session Dismissed Modal — shown when admin force-terminates this user's session */}
      <SessionDismissedModal
        isOpen={!!sessionDismissedBy}
        terminatedBy={sessionDismissedBy || ''}
        onAcknowledge={() => {
          clearSessionDismissed();
          logout();
        }}
      />

    </div>
  );
}
