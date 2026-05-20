/**
 * AetherFlow Design Tokens
 * Pixel-perfect match of the web app's cyberpunk dark palette.
 * Every hex code, spacing value, and typography token is preserved 1:1.
 */

// ─── Colors ──────────────────────────────────────────────────────────
export const Colors = {
  background: '#0A0A0F',
  surface: '#11141F',
  foreground: '#FFFFFF',
  card: '#11141F',
  cardForeground: '#FFFFFF',

  primary: '#00F0FF',        // oklch(0.86 0.18 210)
  primaryForeground: '#0A0A0F',

  secondary: '#B847FF',      // oklch(0.62 0.27 305)
  secondaryForeground: '#FFFFFF',

  success: '#00FF88',        // oklch(0.86 0.24 155)
  warning: '#FFB800',        // oklch(0.82 0.17 80)

  muted: '#1A1D28',         // oklch(0.22 0.02 270)
  mutedForeground: '#94A3B8',

  accent: '#B847FF',
  accentForeground: '#FFFFFF',

  destructive: '#FF5050',
  destructiveForeground: '#FFFFFF',

  border: 'rgba(255,255,255,0.08)',
  input: 'rgba(255,255,255,0.10)',
  ring: '#00F0FF',

  // Transparent helpers
  primaryAlpha15: 'rgba(0,240,255,0.15)',
  primaryAlpha20: 'rgba(0,240,255,0.20)',
  primaryAlpha30: 'rgba(0,240,255,0.30)',
  primaryAlpha40: 'rgba(0,240,255,0.40)',
  primaryAlpha5: 'rgba(0,240,255,0.05)',
  primaryAlpha6: 'rgba(0,240,255,0.06)',

  secondaryAlpha15: 'rgba(184,71,255,0.15)',

  successAlpha15: 'rgba(0,255,136,0.15)',
  successAlpha50: 'rgba(0,255,136,0.50)',

  warningAlpha15: 'rgba(255,184,0,0.15)',
  warningAlpha20: 'rgba(255,184,0,0.20)',

  destructiveAlpha15: 'rgba(255,80,80,0.15)',
  destructiveAlpha25: 'rgba(255,80,80,0.25)',

  whiteAlpha4: 'rgba(255,255,255,0.04)',
  whiteAlpha8: 'rgba(255,255,255,0.08)',
  whiteAlpha10: 'rgba(255,255,255,0.10)',
  whiteAlpha30: 'rgba(255,255,255,0.30)',

  blackAlpha50: 'rgba(0,0,0,0.50)',
  blackAlpha60: 'rgba(0,0,0,0.60)',
  blackAlpha70: 'rgba(0,0,0,0.70)',

  foregroundAlpha80: 'rgba(255,255,255,0.80)',
  foregroundAlpha85: 'rgba(255,255,255,0.85)',
  foregroundAlpha70: 'rgba(255,255,255,0.70)',
  foregroundAlpha90: 'rgba(255,255,255,0.90)',
} as const;

// ─── Gradients (start/end for LinearGradient) ────────────────────────
export const Gradients = {
  primary: {
    colors: ['#00F0FF', '#B847FF'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  hero: {
    colors: ['#00F0FF', '#B847FF', '#00FF88'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  surface: {
    colors: ['rgba(24,18,42,0.8)', 'rgba(20,14,36,0.6)'] as const,
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 1 },
  },
} as const;

// ─── Spacing (px → dp 1:1) ──────────────────────────────────────────
export const Spacing = {
  px: 1,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  28: 112,
} as const;

// ─── Border Radius ──────────────────────────────────────────────────
export const Radius = {
  base: 14,   // 0.875rem
  sm: 10,     // base - 4
  md: 12,     // base - 2
  lg: 14,     // base
  xl: 18,     // base + 4
  '2xl': 22,  // base + 8
  full: 9999,
} as const;

// ─── Typography ─────────────────────────────────────────────────────
export const FontFamily = {
  sans: 'Inter',
  display: 'SpaceGrotesk',
  mono: 'JetBrainsMono',
} as const;

export const FontSize = {
  '10': 10,
  '11': 11,
  '11.5': 11.5,
  '12': 12,
  '12.5': 12.5,
  '13': 13,
  '14': 14,
  '15': 15,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '34': 34,
  '7xl': 72,
} as const;

// ─── Shadows (RN compatible) ────────────────────────────────────────
export const Shadows = {
  glowPrimary: {
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 40,
    elevation: 12,
  },
  glowSecondary: {
    shadowColor: '#B847FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 40,
    elevation: 10,
  },
  glowSuccess: {
    shadowColor: '#00FF88',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 10,
  },
  elevated: {
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.35,
    shadowRadius: 60,
    elevation: 16,
  },
  navBar: {
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.25,
    shadowRadius: 40,
    elevation: 20,
  },
} as const;
