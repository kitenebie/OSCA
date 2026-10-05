import { create } from 'zustand';

export type AppPages = 
  | 'Dashboard' 
  | 'SeniorsList' 
  | 'SeniorProfile' 
  | 'Register' 
  | 'Reports' 
  | 'SMSCenter' 
  | 'UserManagement'
  | 'FindUser'
  | 'Configuration'
  | 'Mapping'
  | 'GranteeClaimForms'
  | 'AuditLogs'

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface UIState {
  currentPage: AppPages;
  selectedSeniorId: string | null;
  selectedFormId: string | null;
  sidebarOpen: boolean;
  toasts: Toast[];
  sessionDismissedBy: string | null;
  
  setCurrentPage: (page: AppPages, seniorId?: string | null, formId?: string | null) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  showToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
  showSessionDismissed: (terminatedBy: string) => void;
  clearSessionDismissed: () => void;
}

const getStoredPage = (): AppPages => {
  const page = localStorage.getItem('senior_system_current_page');
  return (page as AppPages) || 'Dashboard';
};

const getStoredSeniorId = (): string | null => {
  return localStorage.getItem('senior_system_selected_senior_id');
};

const getStoredFormId = (): string | null => {
  return localStorage.getItem('senior_system_selected_form_id');
};

export const useUIStore = create<UIState>((set, get) => ({
  currentPage: getStoredPage(),
  selectedSeniorId: getStoredSeniorId(),
  selectedFormId: getStoredFormId(),
  sidebarOpen: true,
  toasts: [],
  sessionDismissedBy: null,

  setCurrentPage: (page, seniorId = null, formId = null) => {
    set({ currentPage: page, selectedSeniorId: seniorId, selectedFormId: formId });
    localStorage.setItem('senior_system_current_page', page);
    if (seniorId) {
      localStorage.setItem('senior_system_selected_senior_id', seniorId);
    } else {
      localStorage.removeItem('senior_system_selected_senior_id');
    }
    if (formId) {
      localStorage.setItem('senior_system_selected_form_id', formId);
    } else {
      localStorage.removeItem('senior_system_selected_form_id');
    }
    // Auto-scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  showToast: (message, type = 'success') => {
    const id = `toast-${Date.now()}`;
    const newToast = { id, message, type };
    set((state) => ({ toasts: [...state.toasts, newToast] }));

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      get().removeToast(id);
    }, 4000);
  },

  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  showSessionDismissed: (terminatedBy) => set({ sessionDismissedBy: terminatedBy }),
  clearSessionDismissed: () => set({ sessionDismissedBy: null }),
}));
