import { create } from 'zustand';
import { User, RolePermission } from '../types';
import { usersService, rolesService } from '../services/supabaseService';

interface AuthState {
  currentUser: User | null;
  users: User[];
  roles: RolePermission[];
  isLoading: boolean;
  isInitialized: boolean;

  initialize: () => Promise<void>;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permissionName: keyof RolePermission['permissions']) => boolean;
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
  updateUser: (id: string, user: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
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

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: getStoredUser(),
  users: [],
  roles: [],
  isLoading: false,
  isInitialized: false,

  initialize: async () => {
    if (get().isInitialized) return;
    set({ isLoading: true });

    try {
      const [users, roles] = await Promise.all([
        usersService.getAll(),
        rolesService.getAll(),
      ]);

      set({ users, roles, isInitialized: true, isLoading: false });

      // Subscribe to realtime user changes
      usersService.subscribe((updatedUsers) => {
        set({ users: updatedUsers });
        // If current user was updated, sync local session
        const current = get().currentUser;
        if (current) {
          const refreshed = updatedUsers.find((u) => u.id === current.id);
          if (refreshed) {
            localStorage.setItem('senior_system_auth_user', JSON.stringify(refreshed));
            set({ currentUser: refreshed });
          }
        }
      });
    } catch (error) {
      console.error('Failed to initialize auth store:', error);
      set({ isLoading: false });
    }
  },

  login: async (username: string, password: string) => {
    set({ isLoading: true });

    try {
      // Hash password with SHA-256
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      console.log('[LOGIN DEBUG] Username:', username);
      console.log('[LOGIN DEBUG] Password Hash (SHA-256):', passwordHash);

      // Verify credentials against Supabase
      const user = await usersService.verifyLogin(username, passwordHash);
      if (user) {
        localStorage.setItem('senior_system_auth_user', JSON.stringify(user));
        set({ currentUser: user, isLoading: false });
        return true;
      } else {
        set({ isLoading: false });
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
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

  addUser: async (newUserData) => {
    set({ isLoading: true });
    try {
      await usersService.create(newUserData);
      // Realtime will update the list
      set({ isLoading: false });
    } catch (error) {
      console.error('Failed to add user:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  updateUser: async (id, updatedFields) => {
    try {
      await usersService.update(id, updatedFields);
      // Optimistic update
      const updatedUsers = get().users.map((u) =>
        u.id === id ? { ...u, ...updatedFields } : u
      );
      set({ users: updatedUsers });

      // Sync current user session if self-updating
      const current = get().currentUser;
      if (current && current.id === id) {
        const updated = { ...current, ...updatedFields };
        localStorage.setItem('senior_system_auth_user', JSON.stringify(updated));
        set({ currentUser: updated });
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  },

  deleteUser: async (id) => {
    try {
      await usersService.delete(id);
      const updatedUsers = get().users.filter((u) => u.id !== id);
      set({ users: updatedUsers });
    } catch (error) {
      console.error('Failed to delete user:', error);
      throw error;
    }
  },
}));
