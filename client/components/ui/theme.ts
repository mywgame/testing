/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Enterprise Design Tokens & Theme Constants
 * Used for maintaining visual consistency across the Landing Page, Login, Register,
 * and future Dashboards/Admin views of the MetaFirm Platform.
 */

export const TOKENS = {
  // Brand Colors
  colors: {
    primary: {
      light: 'text-blue-500 bg-blue-50/50 hover:bg-blue-50',
      brand: 'bg-blue-600 hover:bg-blue-700 active:scale-95 text-white',
      dark: 'bg-blue-900 text-blue-100 hover:bg-blue-950',
      gradient: 'from-blue-600 to-indigo-700',
    },
    amber: {
      light: 'text-amber-600 bg-amber-50/50 hover:bg-amber-50',
      brand: 'bg-amber-500 hover:bg-amber-600 active:scale-95 text-white',
      dark: 'bg-amber-900 text-amber-100 hover:bg-amber-950',
      gradient: 'from-amber-500 to-yellow-600',
    },
    emerald: {
      light: 'text-emerald-600 bg-emerald-50/50 hover:bg-emerald-50',
      brand: 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white',
      dark: 'bg-emerald-900 text-emerald-100 hover:bg-emerald-950',
    },
    neutral: {
      card: 'bg-white/90 backdrop-blur-xl border border-gray-100/80',
      border: 'border-gray-100/80',
      textPrimary: 'text-gray-950',
      textSecondary: 'text-gray-500',
      bgApp: 'bg-[#fafafa]',
    }
  },

  // Typography Pairings
  typography: {
    display: 'font-display font-bold tracking-tight',
    body: 'font-sans leading-relaxed text-xs sm:text-sm text-gray-500',
    mono: 'font-mono text-[10px] sm:text-xs tracking-wider',
  },

  // Border Radius System (Highly consistent & soft)
  radius: {
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    xl: 'rounded-3xl',
    card: 'rounded-[32px]', // Our signature soft container curve
    full: 'rounded-full',
  },

  // Premium Shadows
  shadows: {
    xs: 'shadow-xs',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg shadow-gray-200/40',
    xl: 'shadow-xl',
    premiumCard: 'shadow-[0_24px_60px_rgba(0,0,0,0.03)] hover:shadow-[0_24px_60px_rgba(0,0,0,0.06)]',
    premiumFloating: 'shadow-[0_12px_36px_rgba(0,0,0,0.08)]',
    blueGlow: 'shadow-lg shadow-blue-500/10 hover:shadow-xl hover:shadow-blue-500/20',
    amberGlow: 'shadow-lg shadow-amber-500/10 hover:shadow-xl hover:shadow-amber-500/20',
  },

  // Animations & Transitions
  transitions: {
    default: 'transition-all duration-200 ease-in-out',
    smooth: 'transition-all duration-300 ease-out',
    fast: 'transition-all duration-150 ease-in-out',
    bounce: 'transition-all duration-300 cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },

  // Mobile App-Shell Tokens (Bottom Nav, Icon Quick-Actions)
  mobileShell: {
    bottomNavHeight: 'h-[68px]',
    bottomNavSafeArea: 'pb-[env(safe-area-inset-bottom)]',
    contentBottomOffset: 'pb-[calc(68px+env(safe-area-inset-bottom)+1.5rem)] md:pb-0',
    iconActionSize: 'w-12 h-12 sm:w-14 sm:h-14',
  },
};
