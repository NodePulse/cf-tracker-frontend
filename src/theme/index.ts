export const colors = {
  primary: '#3b82f6', // Main brand color (blue)
  accent: '#10b981', // Success color (emerald)
  error: '#ef4444', // Wrong answer color (red)
  background: '#111827', // Dark slate background
  surface: '#1f2937', // Slightly lighter surface background
  card: '#374151', // Card background
  text: '#f9fafb', // Normal text
  textSecondary: '#9ca3af', // Muted text
  textTertiary: '#6b7280', // More muted text
  border: '#4b5563', // Border color
  gradientStart: '#111827',
  gradientEnd: '#3b82f6',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  h1: { fontSize: 32, fontWeight: '800' as const, color: colors.text, letterSpacing: -1 },
  h2: { fontSize: 24, fontWeight: '700' as const, color: colors.text },
  h3: { fontSize: 18, fontWeight: '600' as const, color: colors.text },
  body1: { fontSize: 16, fontWeight: '400' as const, color: colors.text },
  body2: { fontSize: 14, fontWeight: '400' as const, color: colors.textSecondary },
  caption: { fontSize: 12, fontWeight: '500' as const, color: colors.textTertiary },
  bold: { fontWeight: '700' as const },
};
