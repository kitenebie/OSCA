import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { CheckCircle, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { sidebarOpen, toasts, removeToast } = useUIStore();
  const { currentUser } = useAuthStore();

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
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div 
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300
          ${sidebarOpen ? 'lg:pl-64' : 'lg:pl-20'}`}
      >
        {/* Topbar navigation header */}
        <Topbar />

        {/* Dynamic page container */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Custom Global Toast System */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
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
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded-md hover:bg-slate-50 transition-colors"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
