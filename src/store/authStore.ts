import { create } from 'zustand';
import { User, RolePermission } from '../types';
import initialUsers from '../Dummy/data/users.json';
import initialRoles from '../Dummy/data/roles.json';

interface AuthState {
  currentUser: User | null;
  users: User[];
  roles: RolePermission[];
  isLoading: boolean;
  login: (username: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permissionName: keyof RolePermission['permissions']) => boolean;
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
}

const getStoredUser = (): User | null => {
  const stored = localStorage.getItem('senior_system_auth_user');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
};

const getStoredUsers = (): User[] => {
  const stored = localStorage.getItem('senior_system_users');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return initialUsers as User[];
    }
  }
  localStorage.setItem('senior_system_users', JSON.stringify(initialUsers));
  return initialUsers as User[];
};

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: getStoredUser(),
  users: getStoredUsers(),
  roles: initialRoles as RolePermission[],
  isLoading: false,

  login: async (username: string) => {
    set({ isLoading: true });
    // Simulate real network request delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const user = get().users.find((u) => u.username.toLowerCase() === username.toLowerCase() && u.status === 'Active');
    
    if (user) {
      localStorage.setItem('senior_system_auth_user', JSON.stringify(user));
      set({ currentUser: user, isLoading: false });
      return true;
    } else {
      set({ isLoading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('senior_system_auth_user');
    set({ currentUser: null });
  },

  hasPermission: (permissionName: keyof RolePermission['permissions']) => {
    const user = get().currentUser;
    if (!user) return false;
    
    const roleDef = get().roles.find((r) => r.role === user.role);
    if (!roleDef) return false;
    
    return roleDef.permissions[permissionName] ?? false;
  },

  addUser: (newUserData) => {
    const id = `usr-${Date.now()}`;
    const newUser: User = { ...newUserData, id };
    const updatedUsers = [...get().users, newUser];
    localStorage.setItem('senior_system_users', JSON.stringify(updatedUsers));
    set({ users: updatedUsers });
  },

  updateUser: (id, updatedFields) => {
    const updatedUsers = get().users.map((u) => {
      if (u.id === id) {
        const updated = { ...u, ...updatedFields };
        // If updating currently logged in user, sync session
        const current = get().currentUser;
        if (current && current.id === id) {
          localStorage.setItem('senior_system_auth_user', JSON.stringify(updated));
          setTimeout(() => set({ currentUser: updated }), 0);
        }
        return updated;
      }
      return u;
    });
    localStorage.setItem('senior_system_users', JSON.stringify(updatedUsers));
    set({ users: updatedUsers });
  },

  deleteUser: (id) => {
    const updatedUsers = get().users.filter((u) => u.id !== id);
    localStorage.setItem('senior_system_users', JSON.stringify(updatedUsers));
    set({ users: updatedUsers });
  }
}));
