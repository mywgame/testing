/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  User,
  Users,
  History,
  Lock,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  Crown,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from '../../hooks/useTheme.ts';
import { useLocalization } from '../../contexts/LocalizationContext.tsx';
import logoImg from '../../../assets/images/branding/logo.png';
import logoMarkImg from '../../../assets/images/branding/logo-mark.png';

export type DashboardTab = 'dashboard' | 'vip' | 'profile' | 'team' | 'transactions' | 'security' | 'twoFactor' | 'withdrawalAddresses' | 'settings' | 'support' | 'deposit' | 'withdrawal' | 'rewards' | 'staking' | 'task';

interface SidebarProps {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  onLogout,
}) => {
  const { t: themeTokens } = useTheme();
  const { t } = useLocalization();

  const menuItems = [
    { id: 'dashboard' as DashboardTab, label: t('dashboard', 'Dashboard'), icon: LayoutDashboard },
    { id: 'vip' as DashboardTab, label: t('vip', 'VIP Club'), icon: Crown },
    { id: 'profile' as DashboardTab, label: t('profile', 'Profile'), icon: User },
    { id: 'team' as DashboardTab, label: t('team', 'My Team'), icon: Users },
    { id: 'transactions' as DashboardTab, label: t('transactions', 'Transactions'), icon: History },
    { id: 'security' as DashboardTab, label: t('security', 'Security'), icon: Lock },
    { id: 'settings' as DashboardTab, label: t('settings', 'Settings'), icon: Settings },
    { id: 'support' as DashboardTab, label: t('support', 'Support'), icon: HelpCircle },
  ];

  // BottomNav already surfaces these on mobile; the mobile drawer ("More") only
  // needs to show what BottomNav doesn't have room for.
  const bottomNavTabs: DashboardTab[] = ['dashboard', 'vip', 'team', 'transactions', 'support'];

  const handleTabClick = (tabId: DashboardTab) => {
    setActiveTab(tabId);
    setIsMobileOpen(false);
  };

  const renderSidebarContent = (forceExpand = false) => {
    const collapsed = forceExpand ? false : isCollapsed;
    // forceExpand is only ever true for the mobile drawer render path.
    const visibleItems = forceExpand
      ? menuItems.filter((item) => !bottomNavTabs.includes(item.id))
      : menuItems;
    return (
      <div className={`flex flex-col h-full border-r py-6 text-left backdrop-blur-xl transition-colors duration-300 ${themeTokens.navBg} ${themeTokens.navBorder}`}>
        {/* Brand Header */}
        <div className={`flex items-center justify-between px-6 mb-8 ${collapsed ? 'justify-center' : ''}`}>
          <button
            type="button"
            onClick={() => handleTabClick('dashboard')}
            className="flex items-center cursor-pointer hover:opacity-80 transition-opacity bg-transparent border-0 p-0 text-left focus:outline-none"
            title="Go to Home Dashboard"
          >
            {collapsed ? (
              <img
                src={logoMarkImg}
                alt="MetaFirm Logo"
                referrerPolicy="no-referrer"
                className="h-8 w-8 object-contain"
              />
            ) : (
              <img
                src={logoImg}
                alt="MetaFirm Logo"
                referrerPolicy="no-referrer"
                className={`h-8 object-contain ${themeTokens.isDark ? 'brightness-0 invert' : ''}`}
              />
            )}
          </button>

          {/* Collapse toggle button for Desktop/Tablet (hamburger behavior preserved) */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`hidden md:flex p-1.5 rounded-lg border border-transparent transition-all cursor-pointer focus:outline-none ${themeTokens.textMuted} hover:text-cyan-500 ${themeTokens.cardInner}`}
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation List */}
        {forceExpand && (
          <div className="px-6 mb-2">
            <span className={`text-[9px] font-mono font-bold uppercase tracking-widest ${themeTokens.textMuted}`}>More</span>
          </div>
        )}
        <div className="flex-grow px-3 space-y-1" role="menu">
          {visibleItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                role="menuitem"
                aria-current={isActive ? 'page' : undefined}
                className={`w-full flex items-center rounded-2xl py-3 px-4 text-xs font-bold transition-all relative cursor-pointer focus:outline-none ${
                  isActive ? `text-cyan-500 ${themeTokens.navActiveBg}` : `${themeTokens.textSub} hover:${themeTokens.text} ${themeTokens.cardInner}`
                } ${collapsed ? 'justify-center px-0' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                {/* Highlight bar for active item */}
                {isActive && !collapsed && (
                  <div className="absolute left-0 top-3 bottom-3 w-1 bg-cyan-500 rounded-r-md" />
                )}

                <IconComponent className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-cyan-500' : themeTokens.textMuted} ${collapsed ? '' : 'mr-3'}`} />

                {!collapsed && <span className="tracking-wide">{item.label}</span>}
              </button>
            );
          })}
        </div>

        {/* Logout Row at bottom */}
        <div className={`px-3 pt-6 border-t ${themeTokens.sep}`}>
          <button
            onClick={onLogout}
            className={`w-full flex items-center rounded-2xl py-3 px-4 text-xs font-bold transition-all cursor-pointer focus:outline-none ${themeTokens.textSub} hover:text-red-500 hover:bg-red-500/10 ${
              collapsed ? 'justify-center px-0' : ''
            }`}
            title={collapsed ? 'Terminate Session' : undefined}
          >
            <LogOut className={`w-4 h-4 flex-shrink-0 ${themeTokens.textMuted} ${collapsed ? '' : 'mr-3'}`} />
            {!collapsed && <span className="tracking-wide">{t('logout', 'Logout')}</span>}
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop & Tablet Persistent Sidebar */}
      <aside
        id="desktop-sidebar"
        className={`hidden md:block h-screen sticky top-0 transition-all duration-300 ease-in-out z-30 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile Drawer Overlay Slider ("More" overflow menu — primary mobile nav is BottomNav) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop mask */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsMobileOpen(false)}
          />
          {/* Slide out drawer sheet */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`relative w-64 max-w-xs h-full z-50 shadow-2xl flex flex-col ${themeTokens.isDark ? 'bg-[#0b0e24]' : 'bg-white'}`}
          >
            {/* Close button for mobile inside sidebar drawer sheet */}
            <button
              onClick={() => setIsMobileOpen(false)}
              className={`absolute top-5 right-4 p-1.5 rounded-lg border border-transparent transition-colors cursor-pointer z-10 ${themeTokens.textMuted} hover:text-cyan-500`}
            >
              <X className="w-5 h-5" />
            </button>
            {renderSidebarContent(true)}
          </motion.div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
