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
  | 'Configuration';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface UIState {
  currentPage: AppPages;
  selectedSeniorId: string | null;
  sidebarOpen: boolean;
  toasts: Toast[];
  nfcEnabled: boolean;
  
  setCurrentPage: (page: AppPages, seniorId?: string | null) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  showToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
  setNfcEnabled: (enabled: boolean) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  currentPage: 'Dashboard',
  selectedSeniorId: null,
  sidebarOpen: true,
  toasts: [],
  nfcEnabled: false,

  setCurrentPage: (page, seniorId = null) => {
    set({ currentPage: page, selectedSeniorId: seniorId });
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

  setNfcEnabled: (enabled) => set({ nfcEnabled: enabled })
}));
