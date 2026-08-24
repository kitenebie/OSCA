import { create } from 'zustand';
import { systemSettingsService, idCardConfigService } from '../services/supabaseService';

interface SettingsState {
  // System settings as a key-value map
  systemSettings: Record<string, string>;
  systemSettingsLoaded: boolean;

  // ID card config as variant.fieldKey -> value map
  idCardConfig: Record<string, string>;
  idCardConfigLoaded: boolean;

  // Actions
  loadSystemSettings: () => Promise<void>;
  loadIdCardConfig: () => Promise<void>;
  updateSystemSettings: (settings: Record<string, string>) => void;
  updateIdCardConfig: (config: Record<string, string>) => void;
  getSetting: (key: string, fallback: string) => string;
  getIdConfig: (variant: 'variant1' | 'variant2', key: string, fallback: string) => string;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  systemSettings: {},
  systemSettingsLoaded: false,
  idCardConfig: {},
  idCardConfigLoaded: false,

  loadSystemSettings: async () => {
    try {
      const data = await systemSettingsService.getAll();
      const map: Record<string, string> = {};
      data.forEach((s) => { map[s.settingKey] = s.settingValue; });
      set({ systemSettings: map, systemSettingsLoaded: true });
    } catch (err) {
      console.error('Failed to load system settings:', err);
    }
  },

  loadIdCardConfig: async () => {
    try {
      const data = await idCardConfigService.getAll();
      const map: Record<string, string> = {};
      data.forEach((f) => { map[`${f.variant}.${f.fieldKey}`] = f.fieldValue; });
      set({ idCardConfig: map, idCardConfigLoaded: true });
    } catch (err) {
      console.error('Failed to load ID card config:', err);
    }
  },

  updateSystemSettings: (settings: Record<string, string>) => {
    set({ systemSettings: settings });
  },

  updateIdCardConfig: (config: Record<string, string>) => {
    set({ idCardConfig: config });
  },

  getSetting: (key: string, fallback: string) => {
    return get().systemSettings[key] || fallback;
  },

  getIdConfig: (variant: 'variant1' | 'variant2', key: string, fallback: string) => {
    return get().idCardConfig[`${variant}.${key}`] || fallback;
  },
}));
