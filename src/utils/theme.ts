import { userSettingsService, UserThemeSettings } from '../services/supabaseService';

export const DEFAULT_THEME: UserThemeSettings = {
  fontFamily: 'Inter',
  fontSize: '14px',
  primaryColor: '#02A952',
  secondaryColor: '#0F766E',
  infoColor: '#0284C7',
  dangerColor: '#DC2626',
  warningColor: '#D97706',
  bgTint: '#f8fafc',
  mode: 'light',
};

const COLOR_PALETTES = [
  { primary: '#02A952', sidebar: '#128F82', highlight: '#FDFE00' },
  { primary: '#0284C7', sidebar: '#1E3A5F', highlight: '#38BDF8' },
  { primary: '#EA580C', sidebar: '#7C2D12', highlight: '#FBBF24' },
  { primary: '#5B21B6', sidebar: '#2E1065', highlight: '#FDE68A' },
  { primary: '#15803D', sidebar: '#14532D', highlight: '#86EFAC' },
  { primary: '#BE123C', sidebar: '#4C0519', highlight: '#FDA4AF' },
  { primary: '#0F172A', sidebar: '#020617', highlight: '#7DD3FC' },
  { primary: '#B45309', sidebar: '#78350F', highlight: '#FCD34D' },
  { primary: '#4338CA', sidebar: '#0F172A', highlight: '#A78BFA' },
  { primary: '#7C3AED', sidebar: '#0B1120', highlight: '#C4B5FD' },
  { primary: '#14B8A6', sidebar: '#111827', highlight: '#67E8F9' },
  { primary: '#2563EB', sidebar: '#020617', highlight: '#93C5FD' },
  { primary: '#009B77', sidebar: '#004D40', highlight: '#A7F3D0' },
  { primary: '#22C55E', sidebar: '#14532D', highlight: '#BBF7D0' },
  { primary: '#3B82F6', sidebar: '#1E3A8A', highlight: '#BFDBFE' },
  { primary: '#7DD3FC', sidebar: '#0C4A6E', highlight: '#E0F2FE' },
  { primary: '#8B5CF6', sidebar: '#4C1D95', highlight: '#DDD6FE' },
  { primary: '#9333EA', sidebar: '#3B0764', highlight: '#E9D5FF' },
  { primary: '#D97706', sidebar: '#78350F', highlight: '#FDE68A' },
  { primary: '#EAB308', sidebar: '#713F12', highlight: '#FEF08A' },
  { primary: '#6B7280', sidebar: '#374151', highlight: '#E5E7EB' },
  { primary: '#64748B', sidebar: '#0F172A', highlight: '#E2E8F0' },
];

export const getStoredTheme = (): UserThemeSettings => {
  try {
    const raw = localStorage.getItem('osca_current_theme');
    if (raw) return { ...DEFAULT_THEME, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return DEFAULT_THEME;
};

export const applySystemTheme = (t: Partial<UserThemeSettings>) => {
  const current = getStoredTheme();
  const fullTheme: UserThemeSettings = { ...current, ...t };
  const root = document.documentElement;

  const fontValue = fullTheme.fontFamily === 'System Default' 
    ? '-apple-system, BlinkMacSystemFont, sans-serif' 
    : `'${fullTheme.fontFamily}', sans-serif`;

  root.style.setProperty('--osca-font-family', fontValue);
  root.style.setProperty('--osca-font-size', fullTheme.fontSize || '14px');
  root.style.setProperty('--osca-primary-color', fullTheme.primaryColor || '#02A952');
  root.style.setProperty('--osca-secondary-color', fullTheme.secondaryColor || '#0F766E');
  root.style.setProperty('--osca-info-color', fullTheme.infoColor || '#0284C7');
  root.style.setProperty('--osca-danger-color', fullTheme.dangerColor || '#DC2626');
  root.style.setProperty('--osca-warning-color', fullTheme.warningColor || '#D97706');

  const isDark = fullTheme.mode === 'dark';
  const effectiveBgTint = isDark && (!fullTheme.bgTint || fullTheme.bgTint === '#f8fafc') 
    ? '#0b1329' 
    : (fullTheme.bgTint || '#f8fafc');

  root.style.setProperty('--osca-bg-tint', effectiveBgTint);
  document.body.style.backgroundColor = effectiveBgTint;

  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  ['50','100','200','300','400','500','600','700','800','900','950'].forEach(s => {
    root.style.removeProperty(`--color-slate-${s}`);
    root.style.removeProperty(`--color-gray-${s}`);
  });

  const primaryHex = fullTheme.primaryColor || '#02A952';
  const pr = parseInt(primaryHex.slice(1, 3), 16) || 2;
  const pg = parseInt(primaryHex.slice(3, 5), 16) || 169;
  const pb = parseInt(primaryHex.slice(5, 7), 16) || 82;
  root.style.setProperty('--osca-primary-rgb', `${pr}, ${pg}, ${pb}`);

  const generateShades = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const mix = (base: number, target: number, w: number) => Math.round(base + (target - base) * w);
    const lighten = (amt: number) => `#${[r, g, b].map(c => mix(c, 255, amt).toString(16).padStart(2, '0')).join('')}`;
    const darken = (amt: number) => `#${[r, g, b].map(c => mix(c, 0, amt).toString(16).padStart(2, '0')).join('')}`;

    if (isDark) {
      return {
        '50': darken(0.85),
        '100': darken(0.7),
        '200': darken(0.5),
        '300': darken(0.3),
        '400': hex,
        '500': lighten(0.2),
        '600': lighten(0.5),
        '700': lighten(0.7),
        '800': lighten(0.85),
        '900': lighten(0.92),
        '950': lighten(0.97)
      };
    }

    return {
      '50': lighten(0.95),
      '100': lighten(0.88),
      '200': lighten(0.75),
      '300': lighten(0.6),
      '400': lighten(0.4),
      '500': lighten(0.15),
      '600': hex,
      '700': darken(0.2),
      '800': darken(0.4),
      '900': darken(0.55),
      '950': darken(0.7)
    };
  };

  const primaryShades = generateShades(primaryHex);
  Object.entries(primaryShades).forEach(([s, c]) => root.style.setProperty(`--osca-primary-${s}`, c));

  const palette = COLOR_PALETTES.find(p => p.primary === primaryHex) || COLOR_PALETTES[0];
  root.style.setProperty('--osca-sidebar-bg', palette.sidebar);
  root.style.setProperty('--osca-sidebar-active', palette.highlight);

  // Dynamically load Google Font if not System Default or Inter
  if (fullTheme.fontFamily && fullTheme.fontFamily !== 'System Default' && fullTheme.fontFamily !== 'Inter') {
    const fontId = 'osca-dynamic-font';
    let link = document.getElementById(fontId) as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.id = fontId;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    link.href = `https://fonts.googleapis.com/css2?family=${fullTheme.fontFamily.replace(/\s/g, '+')}:wght@400;500;600;700;800&display=swap`;
  }

  try {
    localStorage.setItem('osca_current_theme', JSON.stringify(fullTheme));
  } catch { /* ignore */ }
};
