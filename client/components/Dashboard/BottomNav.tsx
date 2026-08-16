/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Crown, LayoutDashboard, Users, History, HelpCircle } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme.ts';
import { useLocalization } from '../../contexts/LocalizationContext.tsx';
import { DashboardTab } from './Sidebar.tsx';

interface BottomNavProps {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  onMoreClick?: () => void;
  variant?: 'auto' | 'dark';
}

/**
 * Mobile-only fixed bottom tab bar — order: VIP | History | Home | Team | Support.
 * High-contrast, minimal, elegant active design with vibrant gradients.
 */
export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, variant = 'auto' }) => {
  const { t, isDark: themeIsDark } = useTheme();
  const { t: translate } = useLocalization();
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  const isDark = variant === 'dark' ? true : themeIsDark;

  const tabs: { id: DashboardTab; label: string; icon: React.ElementType }[] = [
    { id: 'vip', label: translate('vip', 'VIP'), icon: Crown },
    { id: 'transactions', label: translate('transactions', 'History'), icon: History },
    { id: 'dashboard', label: translate('dashboard', 'Home'), icon: LayoutDashboard },
    { id: 'team', label: translate('team', 'Team'), icon: Users },
    { id: 'support', label: translate('support', 'Support'), icon: HelpCircle },
  ];

  const renderItem = (
    key: string,
    label: string,
    Icon: React.ElementType,
    isActive: boolean,
    onClick: () => void,
  ) => {
    const isHovered = hoveredTab === key;
    const showGradient = isActive || isHovered;

    return (
      <button
        key={key}
        onClick={onClick}
        onMouseEnter={() => setHoveredTab(key)}
        onMouseLeave={() => setHoveredTab(null)}
        className="relative flex flex-col items-center justify-center gap-1 cursor-pointer focus:outline-none group py-2 px-1 rounded-2xl transition-all duration-200"
        aria-current={isActive ? 'page' : undefined}
      >
        {/* Subtle background highlight on hover */}
        <div
          className={`absolute inset-0.5 rounded-xl transition-all duration-200 pointer-events-none ${
            isHovered ? 'opacity-100' : 'opacity-0'
          } ${isDark ? 'bg-cyan-500/10' : 'bg-cyan-500/10'}`}
        />

        {/* Icon wrapper */}
        <span
          className={`flex items-center justify-center transition-all duration-200 ease-out relative z-10 ${
            showGradient
              ? 'text-cyan-400 scale-105'
              : isDark
              ? 'text-slate-400 group-hover:text-white'
              : 'text-slate-600 group-hover:text-slate-900'
          }`}
        >
          <Icon
            className="w-[20px] h-[20px] transition-all duration-200"
            stroke={showGradient ? 'url(#metafirm-gradient)' : 'currentColor'}
            strokeWidth={isActive ? 2.5 : 2}
          />
        </span>

        {/* Label wrapper */}
        <span
          className={`text-[10px] tracking-wide transition-all duration-200 relative z-10 select-none ${
            showGradient
              ? 'bg-gradient-to-r from-cyan-400 via-sky-400 to-purple-400 bg-clip-text text-transparent font-black'
              : isDark
              ? 'text-slate-400 group-hover:text-slate-100 font-bold'
              : 'text-slate-700 group-hover:text-slate-950 font-bold'
          }`}
        >
          {label}
        </span>

        {/* Thin gradient underline (2.5px) centered beneath the active label */}
        {isActive && (
          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-[2.5px] rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-purple-500 shadow-[0_0_8px_rgba(34,211,238,0.6)] transition-all duration-200" />
        )}
      </button>
    );
  };

  const navBgClass = isDark ? 'bg-[#070b1e]/95 border-indigo-500/20' : 'bg-white/95 border-slate-200/90';

  return (
    <nav
      id="mobile-bottom-nav"
      className={`md:hidden fixed bottom-0 inset-x-0 z-40 backdrop-blur-xl border-t pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(0,0,0,0.15)] transition-colors duration-200 ${navBgClass}`}
    >
      {/* SVG Gradient definition used globally by the icons */}
      <svg className="absolute w-0 h-0" width="0" height="0" aria-hidden="true">
        <defs>
          <linearGradient id="metafirm-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
      </svg>

      <div className="grid grid-cols-5 h-[62px] max-w-lg mx-auto px-2">
        {tabs.map((item) => renderItem(item.id, item.label, item.icon, activeTab === item.id, () => setActiveTab(item.id)))}
      </div>
    </nav>
  );
};

export default BottomNav;
