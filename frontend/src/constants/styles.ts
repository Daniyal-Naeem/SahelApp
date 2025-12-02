// Styles constants - converted from Tailwind config
// All values match Tailwind defaults and custom theme

import r from '../utils/responsive';

export const Colors = {
  primary: '#F83758', // Primary app color
  action: '#F83758',
  black: {
    100: '#000',
    200: '#C4C4C4',
    300: '#F3F3F3',
  },
  background: {
    100: '#FFFFFF',
    200: '#F9F9F9',
  },
  white: '#FFFFFF',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
  },
  green: {
    700: '#15803D',
  },
  red: {
    500: '#EF4444',
    600: '#DC2626',
  },
  neutral: {
    400: '#A3A3A3',
    500: '#737373',
  },
  blue: {
    500: '#3B82F6',
  },
};

// Base spacing values (will be scaled responsively)
const BaseSpacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
};

// Responsive spacing - scales based on device width
export const Spacing = {
  0: 0,
  1: r(BaseSpacing[1]),
  2: r(BaseSpacing[2]),
  3: r(BaseSpacing[3]),
  4: r(BaseSpacing[4]),
  5: r(BaseSpacing[5]),
  6: r(BaseSpacing[6]),
  8: r(BaseSpacing[8]),
  10: r(BaseSpacing[10]),
  12: r(BaseSpacing[12]),
  16: r(BaseSpacing[16]),
  20: r(BaseSpacing[20]),
  24: r(BaseSpacing[24]),
  28: r(BaseSpacing[28]),
  32: r(BaseSpacing[32]),
};

// Base font sizes (will be scaled responsively)
const BaseFontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
};

// Responsive font sizes - scales based on device width
export const FontSizes = {
  xs: r(BaseFontSizes.xs),
  sm: r(BaseFontSizes.sm),
  base: r(BaseFontSizes.base),
  lg: r(BaseFontSizes.lg),
  xl: r(BaseFontSizes.xl),
  '2xl': r(BaseFontSizes['2xl']),
  '3xl': r(BaseFontSizes['3xl']),
};

// Export responsive function for direct use in components
export { default as r } from '../utils/responsive';

export const FontFamilies = {
  sans: 'Montserrat-Regular',
  mthin: 'Montserrat-Thin',
  mextralight: 'Montserrat-ExtraLight',
  mlight: 'Montserrat-Light',
  mregular: 'Montserrat-Regular',
  mmedium: 'Montserrat-Medium',
  msemibold: 'Montserrat-SemiBold',
  mbold: 'Montserrat-Bold',
  mextrabold: 'Montserrat-ExtraBold',
  mblack: 'Montserrat-Black',
  pthin: 'Poppins-Thin',
  pextralight: 'Poppins-ExtraLight',
  plight: 'Poppins-Light',
  pregular: 'Poppins-Regular',
  pmedium: 'Poppins-Medium',
  psemibold: 'Poppins-SemiBold',
  pbold: 'Poppins-Bold',
  pextrabold: 'Poppins-ExtraBold',
  pblack: 'Poppins-Black',
};

export const FontWeights = {
  thin: '100',
  extralight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
};

// Base border radius values (will be scaled responsively)
const BaseBorderRadius = {
  none: 0,
  sm: 2,
  DEFAULT: 4,
  md: 6,
  lg: 8,
  xl: 12,
  '2xl': 16,
  full: 9999,
};

// Responsive border radius - scales based on device width
export const BorderRadius = {
  none: 0,
  sm: r(BaseBorderRadius.sm),
  DEFAULT: r(BaseBorderRadius.DEFAULT),
  md: r(BaseBorderRadius.md),
  lg: r(BaseBorderRadius.lg),
  xl: r(BaseBorderRadius.xl),
  '2xl': r(BaseBorderRadius['2xl']),
  full: BaseBorderRadius.full, // Keep full as is (circular)
};

