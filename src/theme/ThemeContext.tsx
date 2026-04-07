import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';
import * as MMKVLib from 'react-native-mmkv';

export type ThemeName = 'system' | 'light' | 'dark' | 'amoled';

type Colors = {
  primary: string;
  accent: string;
  error: string;
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  gradientStart: string;
  gradientEnd: string;
};

const themes: Record<'light' | 'dark' | 'amoled', Colors> = {
  dark: {
    primary: '#3b82f6',
    accent: '#10b981',
    error: '#ef4444',
    background: '#111827',
    surface: '#1f2937',
    card: '#374151',
    text: '#f9fafb',
    textSecondary: '#9ca3af',
    textTertiary: '#6b7280',
    border: '#4b5563',
    gradientStart: '#111827',
    gradientEnd: '#3b82f6',
  },
  amoled: {
    primary: '#3b82f6',
    accent: '#10b981',
    error: '#ef4444',
    background: '#000000',
    surface: '#0a0a0a',
    card: '#111111',
    text: '#f9fafb',
    textSecondary: '#9ca3af',
    textTertiary: '#6b7280',
    border: '#1f2937',
    gradientStart: '#000000',
    gradientEnd: '#3b82f6',
  },
  light: {
    primary: '#3b82f6',
    accent: '#10b981',
    error: '#ef4444',
    background: '#f3f4f6',
    surface: '#ffffff',
    card: '#f9fafb',
    text: '#111827',
    textSecondary: '#6b7280',
    textTertiary: '#9ca3af',
    border: '#e5e7eb',
    gradientStart: '#ffffff',
    gradientEnd: '#3b82f6',
  },
};

const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

const createTypography = (c: Colors) => ({
  h1: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: c.text,
    letterSpacing: -1,
  },
  h2: { fontSize: 24, fontWeight: '700' as const, color: c.text },
  h3: { fontSize: 18, fontWeight: '600' as const, color: c.text },
  body1: { fontSize: 16, fontWeight: '400' as const, color: c.text },
  body2: { fontSize: 14, fontWeight: '400' as const, color: c.textSecondary },
  caption: { fontSize: 12, fontWeight: '500' as const, color: c.textTertiary },
  bold: { fontWeight: '700' as const },
});

const storage = MMKVLib.createMMKV({
  id: 'cf-tracker-storage',
});
const KEY = 'theme.preference';

type ThemeContextValue = {
  themeName: ThemeName;
  activeTheme: 'light' | 'dark' | 'amoled';
  colors: Colors;
  spacing: typeof spacing;
  typography: ReturnType<typeof createTypography>;
  setTheme: (name: ThemeName) => void;
  navTheme: {
    dark: boolean;
    colors: {
      primary: string;
      background: string;
      card: string;
      text: string;
      border: string;
      notification: string;
    };
    fonts: {
      regular: { fontFamily: string; fontWeight: '400' };
      medium: { fontFamily: string; fontWeight: '500' };
      bold: { fontFamily: string; fontWeight: '700' };
      heavy: { fontFamily: string; fontWeight: '800' };
    };
  };
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [themeName, setThemeName] = useState<ThemeName>(() => {
    const saved = storage.getString(KEY);
    if (
      saved === 'light' ||
      saved === 'dark' ||
      saved === 'amoled' ||
      saved === 'system'
    )
      return saved;
    return 'system';
  });

  useEffect(() => {
    storage.set(KEY, themeName);
  }, [themeName]);

  const activeTheme: 'light' | 'dark' | 'amoled' = useMemo(() => {
    if (themeName === 'system') return system === 'dark' ? 'dark' : 'light';
    return themeName === 'dark' ||
      themeName === 'light' ||
      themeName === 'amoled'
      ? themeName
      : 'light';
  }, [themeName, system]);

  const colors = themes[activeTheme];
  const typography = useMemo(() => createTypography(colors), [colors]);

  const navTheme = useMemo(
    () => ({
      dark: activeTheme === 'dark' || activeTheme === 'amoled',
      colors: {
        primary: colors.primary,
        background: colors.background,
        card: colors.surface,
        text: colors.text,
        border: colors.border,
        notification: colors.accent,
      },
      fonts: {
        regular: { fontFamily: 'System', fontWeight: '400' as const },
        medium: { fontFamily: 'System', fontWeight: '500' as const },
        bold: { fontFamily: 'System', fontWeight: '700' as const },
        heavy: { fontFamily: 'System', fontWeight: '800' as const },
      },
    }),
    [activeTheme, colors],
  );

  const value: ThemeContextValue = {
    themeName,
    activeTheme,
    colors,
    spacing,
    typography,
    setTheme: setThemeName,
    navTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
