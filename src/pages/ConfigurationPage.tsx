import React, { useState, useEffect } from 'react';
import { useUIStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import { RolePermission } from '../types';
import { rolesService, userSettingsService } from '../services/supabaseService';
import { supabase } from '../../utils/supabase';
import { applySystemTheme, DEFAULT_THEME, getStoredTheme } from '../utils/theme';
import { 
  Sliders, HelpCircle, Shield, Plus, Trash2, Save, 
  Users, Eye, UserPlus, FileEdit, CheckSquare, FileBarChart, 
  MessageSquare, X, Pencil, Palette, Type, RotateCcw, CheckCircle2, Sun, Moon,
  BellRing, LayoutDashboard, Scan, MapPin, UserRoundCog, MonitorCog, ShieldCheck, FileCheck, UserX, Trash,
  Camera, FileText, Fingerprint
} from 'lucide-react';
import InlineFaceCapture from '../components/profiling/InlineFaceCapture';
import SignaturePad from '../components/profiling/SignaturePad';
import ThumbprintCapture from '../components/profiling/ThumbprintCapture';

// Default roles configuration with notifications, CRUD, and page access control
const DEFAULT_ROLES: RolePermission[] = [
  {
    role: 'super-admin',
    permissions: {
      canViewSeniors: true,
      canCreateSenior: true,
      canEditSenior: true,
      canDeleteSenior: true,
      canApproveReject: true,

      canViewUsers: true,
      canCreateUser: true,
      canEditUser: true,
      canDeleteUser: true,
      canManageUsers: true,

      canGenerateReports: true,
      canDeleteReports: true,

      canSendSMS: true,
      canManageNotifications: true,

      canAccessDashboard: true,
      canAccessSeniorsList: true,
      canAccessSeniorProfile: true,
      canAccessRegister: true,
      canAccessReports: true,
      canAccessSMSCenter: true,
      canAccessUserManagement: true,
      canAccessFindUser: true,
      canAccessConfiguration: true,
      canAccessMapping: true,
    },
  },
  {
    role: 'brgy-admin',
    permissions: {
      canViewSeniors: true,
      canCreateSenior: true,
      canEditSenior: true,
      canDeleteSenior: false,
      canApproveReject: true,

      canViewUsers: true,
      canCreateUser: true,
      canEditUser: true,
      canDeleteUser: false,
      canManageUsers: false,

      canGenerateReports: true,
      canDeleteReports: false,

      canSendSMS: true,
      canManageNotifications: true,

      canAccessDashboard: true,
      canAccessSeniorsList: true,
      canAccessSeniorProfile: true,
      canAccessRegister: true,
      canAccessReports: true,
      canAccessSMSCenter: true,
      canAccessUserManagement: true,
      canAccessFindUser: true,
      canAccessConfiguration: false,
      canAccessMapping: true,
    },
  },
  {
    role: 'notification-manager',
    permissions: {
      canViewSeniors: true,
      canCreateSenior: false,
      canEditSenior: false,
      canDeleteSenior: false,
      canApproveReject: false,

      canViewUsers: true,
      canCreateUser: false,
      canEditUser: false,
      canDeleteUser: false,
      canManageUsers: false,

      canGenerateReports: true,
      canDeleteReports: false,

      canSendSMS: true,
      canManageNotifications: true,

      canAccessDashboard: true,
      canAccessSeniorsList: true,
      canAccessSeniorProfile: true,
      canAccessRegister: false,
      canAccessReports: true,
      canAccessSMSCenter: true,
      canAccessUserManagement: false,
      canAccessFindUser: true,
      canAccessConfiguration: false,
      canAccessMapping: true,
    },
  },
  {
    role: 'general-encoder',
    permissions: {
      canViewSeniors: true,
      canCreateSenior: true,
      canEditSenior: true,
      canDeleteSenior: false,
      canApproveReject: false,

      canViewUsers: false,
      canCreateUser: false,
      canEditUser: false,
      canDeleteUser: false,
      canManageUsers: false,

      canGenerateReports: true,
      canDeleteReports: false,

      canSendSMS: true,
      canManageNotifications: true,

      canAccessDashboard: true,
      canAccessSeniorsList: true,
      canAccessSeniorProfile: true,
      canAccessRegister: true,
      canAccessReports: true,
      canAccessSMSCenter: true,
      canAccessUserManagement: false,
      canAccessFindUser: true,
      canAccessConfiguration: false,
      canAccessMapping: true,
    },
  },
  {
    role: 'brgy-encoder',
    permissions: {
      canViewSeniors: true,
      canCreateSenior: true,
      canEditSenior: true,
      canDeleteSenior: false,
      canApproveReject: false,

      canViewUsers: false,
      canCreateUser: false,
      canEditUser: false,
      canDeleteUser: false,
      canManageUsers: false,

      canGenerateReports: false,
      canDeleteReports: false,

      canSendSMS: false,
      canManageNotifications: false,

      canAccessDashboard: true,
      canAccessSeniorsList: true,
      canAccessSeniorProfile: true,
      canAccessRegister: true,
      canAccessReports: false,
      canAccessSMSCenter: false,
      canAccessUserManagement: false,
      canAccessFindUser: true,
      canAccessConfiguration: false,
      canAccessMapping: true,
    },
  },
  {
    role: 'brgy-viewer',
    permissions: {
      canViewSeniors: true,
      canCreateSenior: false,
      canEditSenior: false,
      canDeleteSenior: false,
      canApproveReject: false,

      canViewUsers: false,
      canCreateUser: false,
      canEditUser: false,
      canDeleteUser: false,
      canManageUsers: false,

      canGenerateReports: true,
      canDeleteReports: false,

      canSendSMS: false,
      canManageNotifications: false,

      canAccessDashboard: true,
      canAccessSeniorsList: true,
      canAccessSeniorProfile: true,
      canAccessRegister: false,
      canAccessReports: true,
      canAccessSMSCenter: false,
      canAccessUserManagement: false,
      canAccessFindUser: false,
      canAccessConfiguration: false,
      canAccessMapping: true,
    },
  },
  {
    role: 'general-viewer',
    permissions: {
      canViewSeniors: true,
      canCreateSenior: false,
      canEditSenior: false,
      canDeleteSenior: false,
      canApproveReject: false,

      canViewUsers: false,
      canCreateUser: false,
      canEditUser: false,
      canDeleteUser: false,
      canManageUsers: false,

      canGenerateReports: true,
      canDeleteReports: false,

      canSendSMS: false,
      canManageNotifications: false,

      canAccessDashboard: true,
      canAccessSeniorsList: true,
      canAccessSeniorProfile: true,
      canAccessRegister: false,
      canAccessReports: true,
      canAccessSMSCenter: false,
      canAccessUserManagement: false,
      canAccessFindUser: false,
      canAccessConfiguration: false,
      canAccessMapping: true,
    },
  },
];

const PERMISSION_LABELS: { key: keyof RolePermission['permissions']; label: string; group: string; icon: any }[] = [
  // Senior Records CRUD
  { key: 'canViewSeniors', label: 'View Seniors', group: 'Seniors CRUD', icon: Eye },
  { key: 'canCreateSenior', label: 'Create Senior', group: 'Seniors CRUD', icon: UserPlus },
  { key: 'canEditSenior', label: 'Edit Senior', group: 'Seniors CRUD', icon: FileEdit },
  { key: 'canDeleteSenior', label: 'Delete Senior', group: 'Seniors CRUD', icon: Trash },
  { key: 'canApproveReject', label: 'Approve/Reject', group: 'Seniors CRUD', icon: CheckSquare },

  // User Accounts CRUD
  { key: 'canViewUsers', label: 'View Users', group: 'Users CRUD', icon: Users },
  { key: 'canCreateUser', label: 'Create User', group: 'Users CRUD', icon: UserPlus },
  { key: 'canEditUser', label: 'Edit User', group: 'Users CRUD', icon: Pencil },
  { key: 'canDeleteUser', label: 'Delete User', group: 'Users CRUD', icon: UserX },
  { key: 'canManageUsers', label: 'Manage Roles/RBAC', group: 'Users CRUD', icon: ShieldCheck },

  // Notifications & SMS
  { key: 'canSendSMS', label: 'Send SMS', group: 'Notifications', icon: MessageSquare },
  { key: 'canManageNotifications', label: 'Notifications Hub', group: 'Notifications', icon: BellRing },

  // Reports & Documents
  { key: 'canGenerateReports', label: 'Generate Reports', group: 'Reports', icon: FileBarChart },
  { key: 'canDeleteReports', label: 'Delete Reports', group: 'Reports', icon: Trash2 },

  // Page Access Control
  { key: 'canAccessDashboard', label: 'Page: Dashboard', group: 'Pages Access', icon: LayoutDashboard },
  { key: 'canAccessSeniorsList', label: 'Page: Senior Profiles', group: 'Pages Access', icon: Users },
  { key: 'canAccessSeniorProfile', label: 'Page: Dossier Detail', group: 'Pages Access', icon: Eye },
  { key: 'canAccessRegister', label: 'Page: New Registration', group: 'Pages Access', icon: UserPlus },
  { key: 'canAccessReports', label: 'Page: Reports', group: 'Pages Access', icon: FileCheck },
  { key: 'canAccessSMSCenter', label: 'Page: SMS Center', group: 'Pages Access', icon: MessageSquare },
  { key: 'canAccessUserManagement', label: 'Page: User Admin', group: 'Pages Access', icon: UserRoundCog },
  { key: 'canAccessFindUser', label: 'Page: NFC / Find User', group: 'Pages Access', icon: Scan },
  { key: 'canAccessMapping', label: 'Page: GIS Mapping', group: 'Pages Access', icon: MapPin },
  { key: 'canAccessConfiguration', label: 'Page: System Config', group: 'Pages Access', icon: MonitorCog },
];

export default function ConfigurationPage() {
  const { nfcEnabled, setNfcEnabled, showToast } = useUIStore();
  const { hasPermission, currentUser } = useAuthStore();

  // ====== THEME STATE ======
  const FONT_OPTIONS = ['Inter', 'Poppins', 'Roboto', 'Open Sans', 'Nunito', 'System Default'];
  const FONT_SIZE_OPTIONS = [
    { label: 'Small', value: '12px' },
    { label: 'Medium', value: '14px' },
    { label: 'Large', value: '16px' },
    { label: 'Ext. Large', value: '18px' },
  ];
  const BG_TINT_OPTIONS = [
    { label: 'Light', value: '#f8fafc' },
    { label: 'Neutral', value: '#f1f5f9' },
    { label: 'Warm', value: '#fefce8' },
  ];

  const BG_TINT_OPTIONS_DARK = [
    { label: 'Charcoal', value: '#0f172a' },
    { label: 'Slate', value: '#1e293b' },
    { label: 'Midnight', value: '#020617' },
  ];
  const COLOR_PALETTES = [
  { name: 'OSCA Default', primary: '#02A952', secondary: '#0F766E', info: '#0284C7', danger: '#DC2626', warning: '#D97706', sidebar: '#128F82', highlight: '#FDFE00', desc: 'Green & Teal' },
  { name: 'Ocean', primary: '#0284C7', secondary: '#6366F1', info: '#06B6D4', danger: '#EF4444', warning: '#F59E0B', sidebar: '#1E3A5F', highlight: '#38BDF8', desc: 'Blue & Indigo' },
  { name: 'Sunset', primary: '#EA580C', secondary: '#B91C1C', info: '#0891B2', danger: '#DC2626', warning: '#CA8A04', sidebar: '#7C2D12', highlight: '#FBBF24', desc: 'Orange & Red' },
  { name: 'Royal', primary: '#5B21B6', secondary: '#3730A3', info: '#2563EB', danger: '#DC2626', warning: '#FBBF24', sidebar: '#2E1065', highlight: '#FDE68A', desc: 'Royal Violet' },
  { name: 'Forest', primary: '#15803D', secondary: '#166534', info: '#0D9488', danger: '#B91C1C', warning: '#A16207', sidebar: '#14532D', highlight: '#86EFAC', desc: 'Deep Green' },
  { name: 'Cherry', primary: '#BE123C', secondary: '#9F1239', info: '#7C3AED', danger: '#EF4444', warning: '#F59E0B', sidebar: '#4C0519', highlight: '#FDA4AF', desc: 'Rose & Violet' },
  { name: 'Midnight', primary: '#0F172A', secondary: '#1E293B', info: '#38BDF8', danger: '#EF4444', warning: '#F59E0B', sidebar: '#020617', highlight: '#7DD3FC', desc: 'Midnight Navy' },
  { name: 'Earth', primary: '#B45309', secondary: '#92400E', info: '#15803D', danger: '#B91C1C', warning: '#FACC15', sidebar: '#78350F', highlight: '#FCD34D', desc: 'Bronze Earth' },

  { name: 'Universe', primary: '#4338CA', secondary: '#1E1B4B', info: '#06B6D4', danger: '#EF4444', warning: '#F59E0B', sidebar: '#0F172A', highlight: '#A78BFA', desc: 'Galaxy & Stars' },
  { name: 'Nebula', primary: '#7C3AED', secondary: '#312E81', info: '#06B6D4', danger: '#EF4444', warning: '#F59E0B', sidebar: '#0B1120', highlight: '#C4B5FD', desc: 'Purple Galaxy' },
  { name: 'Aurora', primary: '#14B8A6', secondary: '#4338CA', info: '#0EA5E9', danger: '#F43F5E', warning: '#EAB308', sidebar: '#111827', highlight: '#67E8F9', desc: 'Northern Lights' },
  { name: 'Cosmos', primary: '#2563EB', secondary: '#1E3A8A', info: '#22D3EE', danger: '#DC2626', warning: '#FBBF24', sidebar: '#020617', highlight: '#93C5FD', desc: 'Deep Space' },

  { name: 'Emerald', primary: '#009B77', secondary: '#007A5E', info: '#22C55E', danger: '#DC2626', warning: '#F59E0B', sidebar: '#004D40', highlight: '#A7F3D0', desc: 'Jade Green' },
  { name: 'Mint', primary: '#22C55E', secondary: '#16A34A', info: '#14B8A6', danger: '#E11D48', warning: '#FACC15', sidebar: '#14532D', highlight: '#BBF7D0', desc: 'Fresh Mint' },
  { name: 'Sky', primary: '#3B82F6', secondary: '#1D4ED8', info: '#60A5FA', danger: '#DC2626', warning: '#FBBF24', sidebar: '#1E3A8A', highlight: '#BFDBFE', desc: 'Azure Blue' },
  { name: 'Arctic', primary: '#7DD3FC', secondary: '#38BDF8', info: '#0284C7', danger: '#EF4444', warning: '#EAB308', sidebar: '#0C4A6E', highlight: '#E0F2FE', desc: 'Ice Blue' },

  { name: 'Lavender', primary: '#8B5CF6', secondary: '#7C3AED', info: '#6366F1', danger: '#F43F5E', warning: '#FBBF24', sidebar: '#4C1D95', highlight: '#DDD6FE', desc: 'Soft Purple' },
  { name: 'Amethyst', primary: '#9333EA', secondary: '#7E22CE', info: '#6366F1', danger: '#DC2626', warning: '#EAB308', sidebar: '#3B0764', highlight: '#E9D5FF', desc: 'Rich Purple' },

  { name: 'Golden', primary: '#D97706', secondary: '#B45309', info: '#0284C7', danger: '#DC2626', warning: '#FACC15', sidebar: '#78350F', highlight: '#FDE68A', desc: 'Golden Amber' },
  { name: 'Lemon', primary: '#EAB308', secondary: '#CA8A04', info: '#06B6D4', danger: '#E11D48', warning: '#F59E0B', sidebar: '#713F12', highlight: '#FEF08A', desc: 'Bright Yellow' },

  { name: 'Slate', primary: '#6B7280', secondary: '#4B5563', info: '#0EA5E9', danger: '#DC2626', warning: '#F59E0B', sidebar: '#374151', highlight: '#E5E7EB', desc: 'Cool Gray' },
  { name: 'Steel', primary: '#64748B', secondary: '#475569', info: '#2563EB', danger: '#EF4444', warning: '#EAB308', sidebar: '#0F172A', highlight: '#E2E8F0', desc: 'Steel Blue Gray' },

  { name: 'Coral', primary: '#F97316', secondary: '#EA580C', info: '#0891B2', danger: '#DC2626', warning: '#FACC15', sidebar: '#7C2D12', highlight: '#FDBA74', desc: 'Coral Orange' },
  { name: 'Ruby', primary: '#C1121F', secondary: '#9B2226', info: '#3B82F6', danger: '#780000', warning: '#F59E0B', sidebar: '#540B0E', highlight: '#F8B4B4', desc: 'Crimson Red' },

  { name: 'Sapphire', primary: '#0F52BA', secondary: '#1565C0', info: '#29B6F6', danger: '#E53935', warning: '#FFB300', sidebar: '#0A2540', highlight: '#81D4FA', desc: 'Sapphire Gem' },
  { name: 'Teal', primary: '#0F766E', secondary: '#115E59', info: '#06B6D4', danger: '#DC2626', warning: '#D97706', sidebar: '#134E4A', highlight: '#99F6E4', desc: 'Classic Teal' },
  { name: 'Olive', primary: '#4D7C0F', secondary: '#3F6212', info: '#0D9488', danger: '#B91C1C', warning: '#CA8A04', sidebar: '#365314', highlight: '#BEF264', desc: 'Olive Green' },
  { name: 'Coffee', primary: '#6F4E37', secondary: '#5C4033', info: '#0EA5E9', danger: '#B91C1C', warning: '#D97706', sidebar: '#3E2723', highlight: '#D7CCC8', desc: 'Coffee Brown' },
  { name: 'Graphite', primary: '#374151', secondary: '#1F2937', info: '#3B82F6', danger: '#DC2626', warning: '#F59E0B', sidebar: '#111827', highlight: '#D1D5DB', desc: 'Modern Dark' },
];

const COLOR_PALETTES_DARK = [
  { name: 'OSCA Default', primary: '#34D399', secondary: '#2DD4BF', info: '#38BDF8', danger: '#F87171', warning: '#FBBF24', sidebar: '#0F1D1A', highlight: '#FDFE00', desc: 'Green & Teal' },

  { name: 'Ocean', primary: '#0EA5E9', secondary: '#2563EB', info: '#38BDF8', danger: '#F87171', warning: '#FCD34D', sidebar: '#071A2D', highlight: '#7DD3FC', desc: 'Deep Ocean Blue' },

  { name: 'Sunset', primary: '#F97316', secondary: '#EA580C', info: '#FB923C', danger: '#F87171', warning: '#FACC15', sidebar: '#241108', highlight: '#FDBA74', desc: 'Burning Sunset' },

  { name: 'Royal', primary: '#7C3AED', secondary: '#A855F7', info: '#818CF8', danger: '#FB7185', warning: '#FDE68A', sidebar: '#160B2D', highlight: '#DDD6FE', desc: 'Royal Purple' },

  { name: 'Forest', primary: '#22C55E', secondary: '#15803D', info: '#4ADE80', danger: '#F87171', warning: '#FCD34D', sidebar: '#08170D', highlight: '#BBF7D0', desc: 'Forest Green' },

  { name: 'Cherry', primary: '#E11D48', secondary: '#BE185D', info: '#F472B6', danger: '#FB7185', warning: '#FBBF24', sidebar: '#230814', highlight: '#FDA4AF', desc: 'Cherry Blossom' },

  { name: 'Midnight', primary: '#64748B', secondary: '#334155', info: '#38BDF8', danger: '#F87171', warning: '#FCD34D', sidebar: '#020617', highlight: '#CBD5E1', desc: 'Midnight Slate' },

  { name: 'Earth', primary: '#B45309', secondary: '#92400E', info: '#84CC16', danger: '#F87171', warning: '#FCD34D', sidebar: '#1A1207', highlight: '#FDE68A', desc: 'Earth Brown' },

  { name: 'Universe', primary: '#4338CA', secondary: '#312E81', info: '#06B6D4', danger: '#F87171', warning: '#FCD34D', sidebar: '#050514', highlight: '#A5B4FC', desc: 'Universe Indigo' },

  { name: 'Nebula', primary: '#9333EA', secondary: '#6D28D9', info: '#EC4899', danger: '#FB7185', warning: '#FBBF24', sidebar: '#140A25', highlight: '#E9D5FF', desc: 'Nebula Magenta' },

  { name: 'Aurora', primary: '#14B8A6', secondary: '#06B6D4', info: '#0EA5E9', danger: '#FB7185', warning: '#FCD34D', sidebar: '#07171A', highlight: '#99F6E4', desc: 'Aurora Borealis' },

  { name: 'Cosmos', primary: '#0284C7', secondary: '#0891B2', info: '#22D3EE', danger: '#F87171', warning: '#FDE68A', sidebar: '#06111E', highlight: '#BAE6FD', desc: 'Cosmic Cyan' },

  { name: 'Emerald', primary: '#10B981', secondary: '#059669', info: '#34D399', danger: '#F87171', warning: '#FBBF24', sidebar: '#031712', highlight: '#A7F3D0', desc: 'Emerald Jewel' },

  { name: 'Mint', primary: '#6EE7B7', secondary: '#34D399', info: '#A7F3D0', danger: '#FB7185', warning: '#FDE68A', sidebar: '#0A1812', highlight: '#D1FAE5', desc: 'Fresh Mint' },

  { name: 'Sky', primary: '#38BDF8', secondary: '#0EA5E9', info: '#7DD3FC', danger: '#F87171', warning: '#FDE68A', sidebar: '#081A29', highlight: '#E0F2FE', desc: 'Clear Sky' },

  { name: 'Arctic', primary: '#E0F2FE', secondary: '#BAE6FD', info: '#7DD3FC', danger: '#F87171', warning: '#FCD34D', sidebar: '#08202B', highlight: '#F0F9FF', desc: 'Frozen Ice' },

  { name: 'Lavender', primary: '#DDD6FE', secondary: '#C4B5FD', info: '#A78BFA', danger: '#FB7185', warning: '#FDE68A', sidebar: '#170C2B', highlight: '#F5F3FF', desc: 'Soft Lavender' },

  { name: 'Amethyst', primary: '#C026D3', secondary: '#A21CAF', info: '#E879F9', danger: '#F87171', warning: '#FCD34D', sidebar: '#220A22', highlight: '#F5D0FE', desc: 'Amethyst Gem' },

  { name: 'Golden', primary: '#EAB308', secondary: '#CA8A04', info: '#38BDF8', danger: '#F87171', warning: '#FDE047', sidebar: '#211605', highlight: '#FEF08A', desc: 'Golden Yellow' },

  { name: 'Lemon', primary: '#FACC15', secondary: '#EAB308', info: '#84CC16', danger: '#FB7185', warning: '#FDE68A', sidebar: '#201B04', highlight: '#FEF9C3', desc: 'Lemon Lime' },

  { name: 'Slate', primary: '#475569', secondary: '#334155', info: '#0EA5E9', danger: '#F87171', warning: '#FCD34D', sidebar: '#111827', highlight: '#CBD5E1', desc: 'Slate Gray' },

  { name: 'Steel', primary: '#94A3B8', secondary: '#64748B', info: '#60A5FA', danger: '#F87171', warning: '#FCD34D', sidebar: '#1E293B', highlight: '#F1F5F9', desc: 'Steel Metal' },

  { name: 'Coral', primary: '#FB7185', secondary: '#FB923C', info: '#F97316', danger: '#EF4444', warning: '#FCD34D', sidebar: '#210D0B', highlight: '#FED7AA', desc: 'Coral Reef' },

  { name: 'Ruby', primary: '#DC2626', secondary: '#B91C1C', info: '#F87171', danger: '#991B1B', warning: '#FBBF24', sidebar: '#210606', highlight: '#FECACA', desc: 'Ruby Red' },

  { name: 'Sapphire', primary: '#2563EB', secondary: '#1D4ED8', info: '#60A5FA', danger: '#F87171', warning: '#FCD34D', sidebar: '#07162A', highlight: '#DBEAFE', desc: 'Sapphire Blue' },

  { name: 'Teal', primary: '#0D9488', secondary: '#0F766E', info: '#2DD4BF', danger: '#F87171', warning: '#FBBF24', sidebar: '#071715', highlight: '#99F6E4', desc: 'Classic Teal' },

  { name: 'Olive', primary: '#65A30D', secondary: '#4D7C0F', info: '#A3E635', danger: '#F87171', warning: '#FCD34D', sidebar: '#161D08', highlight: '#D9F99D', desc: 'Olive Green' },

  { name: 'Coffee', primary: '#8D6E63', secondary: '#6D4C41', info: '#D7CCC8', danger: '#F87171', warning: '#FBBF24', sidebar: '#120D0A', highlight: '#EFEBE9', desc: 'Coffee Brown' },

  { name: 'Graphite', primary: '#4B5563', secondary: '#1F2937', info: '#9CA3AF', danger: '#F87171', warning: '#FCD34D', sidebar: '#030712', highlight: '#E5E7EB', desc: 'Dark Graphite' },
];

  const [theme, setTheme] = useState(DEFAULT_THEME);

  // Load theme from Supabase (per-user) on mount
  useEffect(() => {
    if (!currentUser) return;
    loadUserTheme();
  }, [currentUser]);

  const loadUserTheme = async () => {
    if (!currentUser) return;
    try {
      const stored = await userSettingsService.get(currentUser.id);
      if (stored) {
        setTheme(stored);
        applySystemTheme(stored);
      }
    } catch { /* ignore */ }
  };

  const updateTheme = (partial: Partial<typeof DEFAULT_THEME>) => {
    const updated = { ...theme, ...partial };
    setTheme(updated);
    applySystemTheme(updated);
    // Save to Supabase per-user
    if (currentUser) {
      userSettingsService.upsert(currentUser.id, updated).catch((err) => { console.error('[THEME SAVE ERROR]', err); showToast('Could not save theme settings.', 'error'); });
    }
  };

  const handleResetTheme = () => {
    setTheme(DEFAULT_THEME);
    applySystemTheme(DEFAULT_THEME);
    if (currentUser) {
      userSettingsService.remove(currentUser.id).catch(() => {});
    }
    showToast('Reset to default theme settings.', 'info');
  };

  const [roles, setRoles] = useState<RolePermission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [editRoleName, setEditRoleName] = useState('');
  const [activePermGroup, setActivePermGroup] = useState('All');
  const [viewMode, setViewMode] = useState<'roles' | 'matrix'>('roles');
  const [selectedRoleTab, setSelectedRoleTab] = useState<string>('super-admin');

  const togglePermissionByRole = (roleName: string, permKey: keyof RolePermission['permissions']) => {
    if (roleName === 'super-admin') return;
    setRoles((prev) => prev.map(r => {
      if (r.role === roleName) {
        return {
          ...r,
          permissions: {
            ...r.permissions,
            [permKey]: !r.permissions[permKey]
          }
        };
      }
      return r;
    }));
  };

  const setAllPermissionsForRole = (roleName: string, value: boolean) => {
    if (roleName === 'super-admin') return;
    setRoles((prev) => prev.map(r => {
      if (r.role === roleName) {
        const updatedPerms = { ...r.permissions };
        (Object.keys(updatedPerms) as Array<keyof typeof updatedPerms>).forEach(k => {
          updatedPerms[k] = value;
        });
        return { ...r, permissions: updatedPerms };
      }
      return r;
    }));
  };

  // Load roles from Supabase
  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    setIsLoading(true);
    try {
      const data = await rolesService.getAll();
      setRoles(data.length > 0 ? data : DEFAULT_ROLES);
    } catch {
      setRoles(DEFAULT_ROLES);
    }
    setIsLoading(false);
  };

  // Toggle a permission for a specific role
  const togglePermission = (roleIndex: number, permKey: keyof RolePermission['permissions']) => {
    setRoles((prev) => {
      const updated = [...prev];
      updated[roleIndex] = {
        ...updated[roleIndex],
        permissions: {
          ...updated[roleIndex].permissions,
          [permKey]: !updated[roleIndex].permissions[permKey],
        },
      };
      return updated;
    });
  };

  // Add new role
  const handleAddRole = () => {
    const name = newRoleName.trim().toLowerCase().replace(/\s+/g, '-');
    if (!name) {
      showToast('Please enter a role name.', 'warning');
      return;
    }
    if (roles.find((r) => r.role === name)) {
      showToast('A role with that name already exists.', 'error');
      return;
    }

    setRoles((prev) => [
      ...prev,
      {
        role: name,
        permissions: {
          canViewSeniors: true,
          canCreateSenior: false,
          canEditSenior: false,
          canDeleteSenior: false,
          canApproveReject: false,

          canViewUsers: false,
          canCreateUser: false,
          canEditUser: false,
          canDeleteUser: false,
          canManageUsers: false,

          canGenerateReports: false,
          canDeleteReports: false,

          canSendSMS: false,
          canManageNotifications: false,

          canAccessDashboard: true,
          canAccessSeniorsList: true,
          canAccessSeniorProfile: true,
          canAccessRegister: false,
          canAccessReports: false,
          canAccessSMSCenter: false,
          canAccessUserManagement: false,
          canAccessFindUser: false,
          canAccessConfiguration: false,
          canAccessMapping: true,
        },
      },
    ]);
    setNewRoleName('');
    showToast(`Role "${name}" added. Save to apply.`, 'success');
  };

  // Delete role
  const handleDeleteRole = (roleName: string) => {
    if (roleName === 'super-admin') {
      showToast('Cannot delete the super-admin role.', 'error');
      return;
    }

    setRoles((prev) => prev.filter((r) => r.role !== roleName));
    showToast(`Role "${roleName}" removed. Save to apply.`, 'info');
  };

  // Rename role
  const handleRenameRole = (oldName: string) => {
    const name = editRoleName.trim().toLowerCase().replace(/\\s+/g, '-');
    if (!name || name === oldName) {
      setEditingRole(null);
      return;
    }
    if (roles.find((r) => r.role === name)) {
      showToast('A role with that name already exists.', 'error');
      return;
    }
    setRoles((prev) =>
      prev.map((r) => (r.role === oldName ? { ...r, role: name } : r))
    );
    setEditingRole(null);
    showToast(`Role renamed to "${name}". Save to apply.`, 'success');
  };

  // Save roles configuration to Supabase & localStorage
  const handleSaveRoles = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem('osca_roles_config', JSON.stringify(roles));

      // Delete all existing roles and re-insert
      await supabase.from('roles').delete().neq('role', '');
      
      const rows = roles.map((r) => ({
        role: r.role,
        can_view_seniors: r.permissions.canViewSeniors,
        can_create_senior: r.permissions.canCreateSenior,
        can_edit_senior: r.permissions.canEditSenior,
        can_approve_reject: r.permissions.canApproveReject,
        can_manage_users: r.permissions.canManageUsers,
        can_generate_reports: r.permissions.canGenerateReports,
        can_send_sms: r.permissions.canSendSMS,
      }));

      const { error } = await supabase.from('roles').insert(rows);
      if (error) console.warn('[SUPABASE ROLE INSERT NOTICE]', error);

      // Re-initialize auth store roles
      await useAuthStore.getState().initialize();

      showToast('Roles configuration saved successfully!', 'success');
    } catch (err: any) {
      console.error('Save roles error:', err);
      showToast('Roles configuration saved locally!', 'success');
    }
    setIsSaving(false);
  };

  // Reset to defaults
  const handleResetDefaults = () => {
    setRoles([...DEFAULT_ROLES]);
    showToast('Reset to default roles. Save to apply.', 'info');
  };

  const handleNfcToggle = () => {
    const nextState = !nfcEnabled;
    setNfcEnabled(nextState);
    showToast(
      nextState 
        ? 'NFC-enabled features activated.' 
        : 'NFC features deactivated.',
      'info'
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      
      {/* Page Title */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <h4 className="font-bold text-slate-800 text-sm md:text-base">System Configuration & Settings</h4>
        <p className="text-[11px] text-slate-400">Configure user roles, permissions, and hardware parameters</p>
      </div>

      {/* ====== ROLE CONFIGURATION SECTION ====== */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 p-4 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-teal-600" />
            <h5 className="font-bold text-slate-800 text-xs md:text-sm">User Role & Permission Configuration</h5>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-200/60 dark:bg-slate-800 p-0.5 rounded-xl text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setViewMode('roles')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'roles'
                    ? 'bg-white dark:bg-slate-900 text-teal-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                By Role Tabs
              </button>
              <button
                type="button"
                onClick={() => setViewMode('matrix')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'matrix'
                    ? 'bg-white dark:bg-slate-900 text-teal-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                Matrix Grid
              </button>
            </div>

            <button
              onClick={handleResetDefaults}
              className="px-3 py-1.5 text-[10px] font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all cursor-pointer"
            >
              Reset Defaults
            </button>
            <button
              onClick={handleSaveRoles}
              disabled={isSaving}
              className="px-3 py-1.5 text-[10px] font-bold text-white bg-[#02A952] hover:bg-[#018c43] rounded-lg transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <Save size={11} />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          
          {/* Add New Role Bar */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              placeholder="New role name (e.g. municipal-encoder)"
              className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400"
              onKeyDown={(e) => e.key === 'Enter' && handleAddRole()}
            />
            <button
              onClick={handleAddRole}
              className="px-3 py-2 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Plus size={13} />
              Dagdag Role
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-slate-400 text-xs">Loading roles...</div>
          ) : viewMode === 'roles' ? (
            /* ====== VIEW MODE 1: ROLE TABS ====== */
            <div className="space-y-4">
              {/* Horizontal Role Scrollable Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-100 scrollbar-none">
                {roles.map((r) => {
                  const isSelected = (selectedRoleTab || roles[0]?.role) === r.role;
                  const activeCount = Object.values(r.permissions).filter(Boolean).length;
                  const totalCount = Object.keys(r.permissions).length;

                  return (
                    <button
                      key={r.role}
                      type="button"
                      onClick={() => setSelectedRoleTab(r.role)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                        isSelected
                          ? 'bg-teal-500 text-white border-teal-500 shadow-md shadow-teal-500/20'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <Shield size={13} className={isSelected ? 'text-white' : 'text-teal-500'} />
                      <span className="font-mono text-[11px]">{r.role}</span>
                      <span className={`text-[9.5px] px-1.5 py-0.5 rounded-full font-semibold ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                      }`}>
                        {activeCount}/{totalCount}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Active Role Control Panel */}
              {(() => {
                const activeRole = roles.find((r) => r.role === (selectedRoleTab || roles[0]?.role)) || roles[0];
                if (!activeRole) return null;

                const isSuperAdmin = activeRole.role === 'super-admin';
                const groups = ['Seniors CRUD', 'Users CRUD', 'Notifications', 'Reports', 'Pages Access'];

                return (
                  <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-200/80 space-y-6">
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/60 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold uppercase font-mono px-3 py-1 bg-teal-600 text-white rounded-lg tracking-wider">
                          {activeRole.role}
                        </span>
                        {isSuperAdmin && (
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            System Master (Locked)
                          </span>
                        )}
                      </div>

                      {!isSuperAdmin && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setAllPermissionsForRole(activeRole.role, true)}
                            className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer"
                          >
                            Enable All
                          </button>
                          <button
                            type="button"
                            onClick={() => setAllPermissionsForRole(activeRole.role, false)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer"
                          >
                            Disable All
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteRole(activeRole.role)}
                            className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer"
                          >
                            Delete Role
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Category Sub-cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {groups.map((groupName) => {
                        const items = PERMISSION_LABELS.filter((p) => p.group === groupName);

                        return (
                          <div key={groupName} className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                              <h6 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                <ShieldCheck size={14} className="text-teal-500" />
                                {groupName}
                              </h6>
                              <span className="text-[10px] text-slate-400 font-mono font-bold">
                                {items.filter((i) => activeRole.permissions[i.key]).length}/{items.length} ON
                              </span>
                            </div>

                            <div className="space-y-2">
                              {items.map((item) => {
                                const isEnabled = activeRole.permissions[item.key];
                                const ItemIcon = item.icon;

                                return (
                                  <div
                                    key={item.key}
                                    onClick={() => !isSuperAdmin && togglePermissionByRole(activeRole.role, item.key)}
                                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                                      isSuperAdmin
                                        ? 'bg-slate-50 border-slate-200 cursor-not-allowed opacity-90'
                                        : isEnabled
                                        ? 'bg-teal-50/40 border-teal-200/80 cursor-pointer hover:border-teal-300'
                                        : 'bg-white border-slate-200/80 cursor-pointer hover:border-slate-300'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2.5">
                                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                        isEnabled ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-400'
                                      }`}>
                                        <ItemIcon size={14} />
                                      </div>
                                      <div>
                                        <p className="font-bold text-[11.5px] text-slate-800 leading-tight">{item.label}</p>
                                        <p className="text-[9.5px] text-slate-400 font-mono mt-0.5">{item.key}</p>
                                      </div>
                                    </div>

                                    {/* Toggle Switch */}
                                    <div className={`w-9 h-5 rounded-full transition-colors relative flex items-center p-0.5 ${
                                      isEnabled ? 'bg-teal-500' : 'bg-slate-300'
                                    }`}>
                                      <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${
                                        isEnabled ? 'translate-x-4' : 'translate-x-0'
                                      }`} />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            /* ====== VIEW MODE 2: MATRIX GRID ====== */
            <div className="space-y-4">
              {/* Category Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 pb-3">
                <span className="text-[11px] font-bold text-slate-400 mr-2 uppercase tracking-wide">Category:</span>
                {['All', 'Seniors CRUD', 'Users CRUD', 'Notifications', 'Reports', 'Pages Access'].map((grp) => (
                  <button
                    key={grp}
                    type="button"
                    onClick={() => setActivePermGroup(grp)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                      activePermGroup === grp
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {grp}
                  </button>
                ))}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="py-3 px-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider w-44">Role</th>
                      {(activePermGroup === 'All' ? PERMISSION_LABELS : PERMISSION_LABELS.filter(p => p.group === activePermGroup)).map((p) => (
                        <th key={p.key} className="py-3 px-2 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider min-w-[90px]">
                          <div className="flex flex-col items-center gap-0.5">
                            <p.icon size={12} className="text-slate-400" />
                            <span className="leading-tight">{p.label}</span>
                          </div>
                        </th>
                      ))}
                      <th className="py-3 px-2 text-center text-[10px] font-bold text-slate-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {roles.map((role) => (
                      <tr key={role.role} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-3">
                          <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg font-mono text-[10px]">
                            {role.role}
                          </span>
                        </td>

                        {(activePermGroup === 'All' ? PERMISSION_LABELS : PERMISSION_LABELS.filter(p => p.group === activePermGroup)).map((p) => (
                          <td key={p.key} className="py-3 px-2 text-center">
                            <button
                              onClick={() => togglePermissionByRole(role.role, p.key)}
                              disabled={role.role === 'super-admin'}
                              className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer disabled:cursor-not-allowed ${
                                role.permissions[p.key]
                                  ? 'bg-teal-500 border-teal-500 text-white shadow-sm'
                                  : 'bg-white border-slate-200 text-slate-300 hover:border-slate-300'
                              }`}
                            >
                              {role.permissions[p.key] && (
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                  <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                            </button>
                          </td>
                        ))}

                        <td className="py-3 px-2 text-center">
                          {role.role !== 'super-admin' ? (
                            <button
                              onClick={() => handleDeleteRole(role.role)}
                              className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                              title="Delete this role"
                            >
                              <Trash2 size={13} />
                            </button>
                          ) : (
                            <span className="text-[9px] text-slate-300 font-mono">locked</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Info Note */}
          <div className="p-3 bg-blue-50/50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 rounded-xl flex gap-2">
            <HelpCircle size={14} className="text-blue-500 dark:text-blue-300 shrink-0 mt-0.5" />
            <p className="text-[10px] text-blue-700 dark:text-blue-200 leading-relaxed">
              Use <strong>By Role Tabs</strong> for a clearer and easier way to configure permissions per role, or the <strong>Matrix Grid</strong> for an overall table view. Click "Save" after making changes.
            </p>
          </div>

        </div>
      </div>

      {/* ====== NFC CONFIGURATION SECTION ====== */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 p-4 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders size={16} className="text-teal-600" />
            <h5 className="font-bold text-slate-800 text-xs md:text-sm">Hardware & Smart Card Parameters</h5>
          </div>
          <span className="text-[10px] font-mono font-bold bg-teal-50 text-teal-700 px-2.5 py-0.5 rounded-full border border-teal-100 uppercase">
            {nfcEnabled ? 'Active: NFC' : 'Active: Standard'}
          </span>
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-slate-200/60 hover:border-teal-500/30 transition-all gap-4">
            <div className="space-y-1 max-w-md">
              <span className="font-extrabold text-slate-800 text-xs md:text-sm block">NFC-Enabled OSCA ID Card</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Toggle NFC (NTAG213) support for biometric scans, automated logging, and quick profile retrieval.
              </p>
            </div>
            <button 
              onClick={handleNfcToggle}
              className="flex items-center gap-3 self-start md:self-auto shrink-0 cursor-pointer"
            >
              <div className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${nfcEnabled ? 'bg-teal-600' : 'bg-slate-200'}`}>
                <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${nfcEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
              </div>
              <span className={`text-xs font-bold font-mono ${nfcEnabled ? 'text-teal-600' : 'text-slate-400'}`}>
                {nfcEnabled ? 'ENABLED' : 'DISABLED'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ====== SYSTEM APPEARANCE & THEME ====== */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 p-4 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette size={16} className="text-teal-600" />
            <h5 className="font-bold text-slate-800 text-xs md:text-sm">System Appearance & Theme</h5>
          </div>
          <button
            onClick={handleResetTheme}
            className="px-3 py-1.5 text-[10px] font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw size={10} />
            Reset Default
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* Font Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-600">
              <Type size={14} />
              <span className="text-xs font-bold uppercase tracking-wider">Font Settings</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Font Family */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Font Family</label>
                <select
                  value={theme.fontFamily}
                  onChange={(e) => updateTheme({ fontFamily: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 bg-white cursor-pointer"
                >
                  {FONT_OPTIONS.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              {/* Font Size */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Font Size</label>
                <div className="flex gap-2">
                  {FONT_SIZE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => updateTheme({ fontSize: opt.value })}
                      className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer ${
                        theme.fontSize === opt.value
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Color Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-600">
              <Palette size={14} />
              <span className="text-xs font-bold uppercase tracking-wider">Color Theme</span>
            </div>

            
            {/* Light / Dark Mode Toggle */}
            <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1 w-fit">
              <button
                onClick={() => updateTheme({ mode: 'light' as 'light' | 'dark', bgTint: '#f8fafc' })}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  theme.mode === 'dark' ? 'text-slate-500' : 'bg-white text-slate-800 shadow-sm'
                }`}
              >
                <Sun size={13} className="inline-block mr-1.5" /> Light Mode
              </button>
              <button
                onClick={() => updateTheme({ mode: 'dark' as 'light' | 'dark', bgTint: '#0f172a' })}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  theme.mode === 'dark' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500'
                }`}
              >
                <Moon size={13} className="inline-block mr-1.5" /> Dark Mode
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(theme.mode === 'dark' ? COLOR_PALETTES_DARK : COLOR_PALETTES).map((palette) => {
                const isActive = theme.primaryColor === palette.primary;
                return (
                  <button
                    key={palette.name}
                    onClick={() => updateTheme({ primaryColor: palette.primary, secondaryColor: palette.secondary, infoColor: palette.info, dangerColor: palette.danger, warningColor: palette.warning })}
                    className={`relative p-3 rounded-xl border-2 transition-all cursor-pointer text-left ${
                      isActive
                        ? 'border-slate-800 shadow-md ring-2 ring-slate-800/10 scale-[1.02]'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-1 mb-2">
                      <div className="w-4 h-4 rounded-full border border-white shadow-sm" style={{ backgroundColor: palette.primary }} title="Primary"></div>
                      <div className="w-4 h-4 rounded-full border border-white shadow-sm" style={{ backgroundColor: palette.secondary }} title="Secondary"></div>
                      <div className="w-4 h-4 rounded-full border border-white shadow-sm" style={{ backgroundColor: palette.info }} title="Info"></div>
                      <div className="w-4 h-4 rounded-full border border-white shadow-sm" style={{ backgroundColor: palette.danger }} title="Danger"></div>
                      <div className="w-4 h-4 rounded-full border border-white shadow-sm" style={{ backgroundColor: palette.warning }} title="Warning"></div>
                    </div>
                    <p className="text-[11px] font-bold text-slate-700">{palette.name}</p>
                    <p className="text-[9px] text-slate-400">{palette.desc}</p>
                    {isActive && (
                      <div className="absolute top-2 right-2 w-4 h-4 bg-slate-800 rounded-full flex items-center justify-center">
                        <CheckCircle2 size={10} className="text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Background Tint */}
            <div className="space-y-1.5 mt-4">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Background Tint</label>
              <div className="flex gap-2">
                {(theme.mode === 'dark' ? BG_TINT_OPTIONS_DARK : BG_TINT_OPTIONS).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updateTheme({ bgTint: opt.value })}
                    className={`flex-1 py-2 rounded-xl text-[10px] font-bold border-2 transition-all cursor-pointer ${
                      theme.bgTint === opt.value
                        ? 'border-teal-500 text-teal-700'
                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                    style={{ backgroundColor: opt.value }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Live Preview */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Live Preview</span>
            <div className="p-5 rounded-xl border border-slate-200" style={{ backgroundColor: theme.bgTint, fontFamily: theme.fontFamily === 'System Default' ? 'system-ui' : theme.fontFamily, fontSize: theme.fontSize }}>
              <div className="space-y-2">
                <h4 className="font-bold" style={{ color: theme.primaryColor }}>LGU Juban OSCA System</h4>
                <p className="text-slate-600">This is a preview of your selected theme settings. All text and colors change in real-time.</p>
                <div className="flex gap-2 pt-1">
                  <span className="px-2.5 py-1 rounded-lg text-white text-[10px] font-bold" style={{ backgroundColor: theme.primaryColor }}>Primary</span>
                  <span className="px-2.5 py-1 rounded-lg text-white text-[10px] font-bold" style={{ backgroundColor: theme.secondaryColor }}>Secondary</span>
                  <span className="px-2.5 py-1 rounded-lg text-white text-[10px] font-bold" style={{ backgroundColor: theme.infoColor }}>Info</span>
                  <span className="px-2.5 py-1 rounded-lg text-white text-[10px] font-bold" style={{ backgroundColor: theme.dangerColor }}>Danger</span>
                  <span className="px-2.5 py-1 rounded-lg text-white text-[10px] font-bold" style={{ backgroundColor: theme.warningColor }}>Warning</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ====== BIOMETRIC HARDWARE TESTING SECTION ====== */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 dark:border-slate-700 p-4 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-2">
          <Fingerprint size={16} className="text-teal-600" />
          <h5 className="font-bold text-slate-800 dark:text-slate-100 text-xs md:text-sm">Biometric Hardware Testing & Calibration</h5>
        </div>

        <div className="p-6 space-y-8">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 -mt-2">
            Test and calibrate the biometric devices connected to the system before using them for senior citizen profiling.
          </p>

          {/* --- Biometric Profile Photo (Camera Sync) --- */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-2">
              <Camera size={14} className="text-blue-600" />
              <h6 className="font-bold text-xs text-slate-800 dark:text-slate-100 uppercase tracking-wide">Biometric Profile Photo (Camera Sync)</h6>
              <span className="text-[9px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-800 uppercase tracking-wider">Test Mode</span>
            </div>
            <p className="text-[10px] text-slate-400">Test the camera connection and AI face detection to ensure they are working before use in registration.</p>
            <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
              <InlineFaceCapture
                value={null}
                onChange={(img) => { if (img) console.log('[CONFIG TEST] Photo captured:', img.substring(0, 50) + '...'); }}
              />
            </div>
          </div>

          {/* --- E-Lagda Digital Signature Pad --- */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-2">
              <FileText size={14} className="text-purple-600" />
              <h6 className="font-bold text-xs text-slate-800 dark:text-slate-100 uppercase tracking-wide">E-Lagda Digital Signature Pad</h6>
              <span className="text-[9px] font-bold text-purple-600 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-full border border-purple-100 dark:border-purple-800 uppercase tracking-wider">Test Mode</span>
            </div>
            <p className="text-[10px] text-slate-400">Test the digital signature pad — draw with a mouse or stylus pen to verify that stroke capture is working.</p>
            <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
              <SignaturePad
                value={null}
                onChange={(sig) => { if (sig) console.log('[CONFIG TEST] Signature captured:', sig.substring(0, 50) + '...'); }}
              />
            </div>
          </div>

          {/* --- Fingerprint Biometric Scanner Sync --- */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-2">
              <Fingerprint size={14} className="text-amber-600" />
              <h6 className="font-bold text-xs text-slate-800 dark:text-slate-100 uppercase tracking-wide">Fingerprint Biometric Scanner Sync</h6>
              <span className="text-[9px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-100 dark:border-amber-800 uppercase tracking-wider">Test Mode</span>
            </div>
            <p className="text-[10px] text-slate-400">Sync and test the USB fingerprint scanner device. Ensure the driver is installed and the device is connected.</p>
            <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
              <ThumbprintCapture
                value={null}
                onChange={(fp) => { if (fp) console.log('[CONFIG TEST] Fingerprint captured:', fp.substring(0, 50) + '...'); }}
              />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
