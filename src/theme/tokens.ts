import { Platform } from 'react-native';

const headingFamily = Platform.select({
  ios: 'SF Pro Display',
  android: 'sans-serif-medium',
  default: '"Avenir Next", "IBM Plex Sans KR", sans-serif',
});

const bodyFamily = Platform.select({
  ios: 'SF Pro Text',
  android: 'sans-serif',
  default: '"Avenir Next", "IBM Plex Sans KR", sans-serif',
});

export const tokens = {
  colors: {
    canvas: '#F4F7FB',
    surface: '#FFFFFF',
    surfaceMuted: '#ECF2F8',
    line: '#D6E0EA',
    ink: '#111827',
    inkSoft: '#556377',
    inkMute: '#7A8798',
    brand: '#2563EB',
    brandStrong: '#1749B5',
    brandSoft: '#DCE8FF',
    navy: '#0F172A',
    sand: '#F3ECE1',
    teal: '#0F766E',
    tealSoft: '#D6F5F1',
    positive: '#16A34A',
    positiveSoft: '#DCFCE7',
    caution: '#F59E0B',
    cautionSoft: '#FEF3C7',
    danger: '#E11D48',
    dangerSoft: '#FFE4E6',
  },
  spacing: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
  },
  radius: {
    sm: 14,
    md: 22,
    lg: 30,
    pill: 999,
  },
  typography: {
    heading: headingFamily,
    body: bodyFamily,
  },
  layout: {
    maxWidth: 1120,
  },
  shadow: {
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
} as const;
