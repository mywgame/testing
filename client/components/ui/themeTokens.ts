/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Dark/Light presentation tokens for the MetaFirm Dashboard, modeled on the
 * premium glassmorphic crypto-app reference design. Purely visual — carries
 * no business data. Components read `t.xxx` to stay theme-aware without
 * sprinkling ternaries everywhere.
 */
export interface ThemeTokens {
  isDark: boolean;
  pageBg: string;
  gradOrbs: { a: string; b: string; c: string };
  text: string;
  textSub: string;
  textMuted: string;
  card: string;
  cardInner: string;
  pill: string;
  pillHover: string;
  inset: string;
  bar: string;
  sep: string;
  chartGrid: string;
  chartAxis: string;
  chartTick: string;
  tooltipBg: string;
  tooltipBorder: string;
  claimCard: string;
  timerBg: string;
  ringBg: string;
  ringTrack: string;
  streakBg: string;
  switchBorder: string;
  headerBg: string;
  navBg: string;
  navBorder: string;
  navInactive: string;
  navActiveBg: string;
  skeletonBase: string;
}

export const getThemeTokens = (isDark: boolean): ThemeTokens =>
  isDark
    ? {
        isDark: true,
        pageBg: 'bg-[#07091a]',
        gradOrbs: { a: 'bg-purple-600/20', b: 'bg-cyan-500/15', c: 'bg-blue-700/10' },
        text: 'text-white',
        textSub: 'text-gray-400',
        textMuted: 'text-gray-500',
        card: 'bg-white/5 border-white/10 hover:border-white/18',
        cardInner: 'bg-white/4 hover:bg-white/8',
        pill: 'bg-white/8 border-white/15',
        pillHover: 'hover:border-white/25',
        inset: 'bg-black/30',
        bar: 'bg-white/8',
        sep: 'border-white/10',
        chartGrid: '#ffffff12',
        chartAxis: '#4b5563',
        chartTick: '#9ca3af',
        tooltipBg: '#0f172a',
        tooltipBorder: '#1e293b',
        claimCard: 'from-white/8 to-white/3 border-white/10',
        timerBg: 'bg-white/8',
        ringBg: 'rgba(255,255,255,0.08)',
        ringTrack: 'rgba(255,255,255,0.08)',
        streakBg: 'bg-orange-500/10 border-orange-500/20',
        switchBorder: 'border-white/20',
        headerBg: 'bg-[#07091a]/80',
        navBg: 'bg-[#0b0e24]/95',
        navBorder: 'border-white/10',
        navInactive: 'text-gray-500',
        navActiveBg: 'bg-white/10',
        skeletonBase: 'bg-white/8',
      }
    : {
        isDark: false,
        pageBg: 'bg-[#eef0fb]',
        gradOrbs: { a: 'bg-violet-400/25', b: 'bg-sky-400/25', c: 'bg-pink-300/15' },
        text: 'text-gray-900',
        textSub: 'text-gray-500',
        textMuted: 'text-gray-400',
        card: 'bg-white/60 border-black/8 hover:border-black/15 shadow-sm shadow-black/5',
        cardInner: 'bg-black/4 hover:bg-black/7',
        pill: 'bg-white/70 border-black/10',
        pillHover: 'hover:border-black/20',
        inset: 'bg-black/6',
        bar: 'bg-black/8',
        sep: 'border-black/8',
        chartGrid: '#00000010',
        chartAxis: '#9ca3af',
        chartTick: '#6b7280',
        tooltipBg: '#ffffff',
        tooltipBorder: '#e5e7eb',
        claimCard: 'from-white/80 to-white/50 border-black/8 shadow-sm shadow-black/5',
        timerBg: 'bg-black/7',
        ringBg: 'rgba(0,0,0,0.07)',
        ringTrack: 'rgba(0,0,0,0.07)',
        streakBg: 'bg-orange-500/10 border-orange-400/30',
        switchBorder: 'border-black/12',
        headerBg: 'bg-white/80',
        navBg: 'bg-white/95',
        navBorder: 'border-black/8',
        navInactive: 'text-gray-400',
        navActiveBg: 'bg-blue-50',
        skeletonBase: 'bg-black/6',
      };

export default getThemeTokens;
