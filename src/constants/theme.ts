export const theme = {
  colors: {
    // Brand - warmer purple (Indigo-based)
    primary: '#6366F1',
    primaryLight: '#EEF2FF',
    primaryDark: '#4338CA',
    primaryMuted: '#C7D2FE',

    // Accent
    accent: '#0EA5E9',
    accentLight: '#E0F2FE',

    // Warm neutrals (professional feel)
    background: '#FAFAF9',
    surface: '#FFFFFF',
    surfaceSecondary: '#F5F5F4',
    surfaceTertiary: '#E7E5E4',

    // Text - warm grays
    text: {
      primary: '#1C1917',
      secondary: '#57534E',
      tertiary: '#A8A29E',
      inverse: '#FFFFFF',
    },

    // Borders
    border: '#E7E5E4',
    borderLight: '#F5F5F4',

    // Semantic
    success: '#22C55E',
    successLight: '#DCFCE7',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    error: '#EF4444',
    errorLight: '#FEE2E2',
    info: '#3B82F6',
    infoLight: '#DBEAFE',
  },
  typography: {
    // Display - for hero numbers/stats
    display: { fontSize: 36, fontWeight: '700' as const, letterSpacing: -1, lineHeight: 40 },

    // Headings
    h1: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.5, lineHeight: 34 },
    h2: { fontSize: 22, fontWeight: '600' as const, letterSpacing: -0.3, lineHeight: 28 },
    h3: { fontSize: 18, fontWeight: '600' as const, letterSpacing: -0.2, lineHeight: 24 },

    // Body
    body: { fontSize: 15, fontWeight: '400' as const, letterSpacing: 0, lineHeight: 22 },
    bodyMedium: { fontSize: 15, fontWeight: '500' as const, letterSpacing: 0, lineHeight: 22 },
    bodySmall: { fontSize: 13, fontWeight: '400' as const, letterSpacing: 0, lineHeight: 18 },

    // UI elements
    caption: { fontSize: 12, fontWeight: '400' as const, letterSpacing: 0.2, lineHeight: 16 },
    label: { fontSize: 13, fontWeight: '500' as const, letterSpacing: 0.1, lineHeight: 18 },
    overline: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 0.8, lineHeight: 14 },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  radius: {
    sm: 6,
    md: 10,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  shadow: {
    sm: {
      shadowColor: '#1C1917',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 3,
      elevation: 1,
    },
    md: {
      shadowColor: '#1C1917',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    lg: {
      shadowColor: '#1C1917',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 5,
    },
  },
} as const

export type Theme = typeof theme
export type ThemeColors = typeof theme.colors
