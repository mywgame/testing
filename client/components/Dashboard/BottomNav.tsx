/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Crown, LayoutDashboard, Users, History, HelpCircle } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme.ts';
import { DashboardTab } from './Sidebar.tsx';

interface BottomNavProps {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  onMoreClick?: () => void;
}

/**
 * Mobile-only fixed bottom tab bar — order: VIP | History | Home | Team | Support.
 * Minimal, elegant active design: gradient icon, gradient text, higher opacity/weight. No floating circle/sphere.
 */
export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const { t } = useTheme();
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  const tabs: { id: DashboardTab; label: string; icon: React.ElementType }[] = [
    { id: 'vip', label: 'VIP', icon: Crown },
    { id: 'transactions', label: 'History', icon: History },
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'support', label: 'Support', icon: HelpCircle },
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
        className="relative flex flex-col items-center justify-center gap-1 cursor-pointer focus:outline-none group py-2 px-1 rounded-2xl transition-all duration-300"
        aria-current={isActive ? 'page' : undefined}
      >
        {/* Subtle background highlight on hover (5% opacity in light mode, 8% in dark mode) */}
        <div
          className={`absolute inset-0.5 rounded-xl transition-all duration-300 pointer-events-none ${
            isHovered ? 'opacity-100' : 'opacity-0'
          } ${t.isDark ? 'bg-cyan-500/8' : 'bg-cyan-500/5'}`}
        />

        {/* Icon wrapper */}
        <span
          className={`flex items-center justify-center transition-all duration-300 ease-out relative z-10`}
        >
          <Icon
            className="w-[20px] h-[20px] transition-all duration-300"
            stroke={showGradient ? 'url(#metafirm-gradient)' : 'currentColor'}
            strokeWidth={isActive ? 2.5 : 2}
          />
        </span>

        {/* Label wrapper */}
        <span
          className={`text-[9px] font-bold tracking-wide transition-all duration-300 relative z-10 select-none ${
            showGradient
              ? 'bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent font-extrabold opacity-100'
              : `${t.navInactive} opacity-75`
          }`}
        >
          {label}
        </span>

        {/* Thin gradient underline (2.5px) centered beneath the active label */}
        {isActive && (
          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-[2.5px] rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-300" />
        )}
      </button>
    );
  };

  return (
    <nav
      id="mobile-bottom-nav"
      className={`md:hidden fixed bottom-0 inset-x-0 z-40 backdrop-blur-xl border-t pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(0,0,0,0.12)] transition-colors duration-300 ${t.navBg} ${t.navBorder}`}
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
