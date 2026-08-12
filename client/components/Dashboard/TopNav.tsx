/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Menu, X, User, Lock, Fingerprint, Wallet, Settings, HelpCircle, LogOut } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme.ts';
import { useAvatar } from '../../hooks/useAvatar.ts';
import { ThemeSwitch } from '../ui/ThemeSwitch.tsx';
import { NotificationBell } from './NotificationBell.tsx';
import { AvatarPicker } from '../ui/AvatarPicker.tsx';
import logoImg from '../../../assets/images/branding/logo.png';
import logoMarkImg from '../../../assets/images/branding/logo-mark.png';
import type { MockIdentity } from '../../types/index.ts';
import { DashboardTab } from './Sidebar.tsx';

interface TopNavProps {
  identity: MockIdentity;
  activeTab: DashboardTab;
  onNavigate: (tab: DashboardTab) => void;
  onLogout: () => void;
}

/**
 * Simplified Dashboard top navigation — only contains the MetaFirm Logo, Theme Switch, and Hamburger Menu.
 * Handles the premium glassmorphic Hamburger dropdown containing all account-related navigation links.
 */
export const TopNav: React.FC<TopNavProps> = ({ identity, activeTab, onNavigate, onLogout }) => {
  const { t } = useTheme();
  const { avatarUrl } = useAvatar();
  const [isOpen, setIsOpen] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  return (
    <header className="flex justify-between items-center gap-4 py-2 px-4 sm:px-6 md:px-8 border-b border-transparent relative z-40" id="dashboard-header">
      {/* Logo: mobile shows the full wordmark, tablet/desktop keep mark + wordmark */}
      <button
        type="button"
        onClick={() => onNavigate('dashboard')}
        className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity bg-transparent border-0 p-0 text-left focus:outline-none"
        title="Go to Home Dashboard"
      >
        <img
          src={logoImg}
          alt="MetaFirm"
          className={`h-7 object-contain sm:hidden ${t.isDark ? 'brightness-0 invert' : ''}`}
        />
        <img src={logoMarkImg} alt="MetaFirm mark" className="hidden sm:block w-9 h-9 object-contain" />
        <img
          src={logoImg}
          alt="MetaFirm"
          className={`h-7 object-contain hidden sm:block ${t.isDark ? 'brightness-0 invert' : ''}`}
        />
      </button>

      {/* Right: theme switch + hamburger menu */}
      <div className="flex items-center gap-3 relative">
        <ThemeSwitch />
        <NotificationBell />

        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center justify-center p-2 rounded-2xl border transition-all duration-300 relative cursor-pointer focus:outline-none ${t.pill} ${t.pillHover} text-cyan-500`}
            title="Account Menu"
            id="hamburger-menu-toggle"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {isOpen && (
            <>
              {/* Click-away backdrop */}
              <div
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setIsOpen(false)}
              />
              {/* Dropdown Menu */}
              <div
                className={`absolute right-0 mt-2.5 w-60 rounded-2xl border p-2 shadow-2xl z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200 ${t.card} ${t.sep}`}
                style={{ top: '100%' }}
              >
                {/* User Info header inside menu */}
                <div className={`px-3 py-2.5 mb-1.5 border-b flex items-center gap-2.5 ${t.sep}`}>
                  <button
                    onClick={() => {
                      setIsPickerOpen(true);
                      setIsOpen(false);
                    }}
                    title="Change Avatar"
                    className={`relative w-8 h-8 rounded-xl bg-gradient-to-br ${identity.rankBg} border border-white/20 flex items-center justify-center shrink-0 overflow-hidden hover:brightness-110 transition-all cursor-pointer`}
                  >
                    <img src={avatarUrl} alt={identity.name} className="w-full h-full object-cover" />
                  </button>
                  <div className="flex flex-col leading-tight min-w-0 text-left">
                    <span className={`font-semibold text-xs truncate max-w-[120px] ${t.text}`}>{identity.name}</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-mono ${t.textSub}`}>{identity.id}</span>
                      <span
                        className="text-[9px] px-1 rounded font-semibold shrink-0"
                        style={{ color: identity.rankColor, background: `${identity.rankColor}22` }}
                      >
                        {identity.rankLabel}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Account-Related Navigation items */}
                <div className="space-y-0.5">
                  {[
                    { id: 'profile' as DashboardTab, label: 'Profile', icon: User },
                    { id: 'security' as DashboardTab, label: 'Security', icon: Lock },
                    { id: 'twoFactor' as DashboardTab, label: 'Two-Factor Authentication', icon: Fingerprint },
                    { id: 'withdrawalAddresses' as DashboardTab, label: 'Withdrawal Addresses', icon: Wallet },
                    { id: 'settings' as DashboardTab, label: 'Settings', icon: Settings },
                    { id: 'support' as DashboardTab, label: 'Support', icon: HelpCircle },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onNavigate(item.id);
                          setIsOpen(false);
                        }}
                        className={`w-full flex items-center rounded-xl py-2 px-3 text-xs font-bold transition-all text-left cursor-pointer focus:outline-none ${
                          isActive
                            ? 'text-cyan-500 bg-cyan-500/10'
                            : `${t.textSub} hover:${t.text} hover:bg-white/5`
                        }`}
                      >
                        <Icon className="w-4 h-4 mr-2.5 shrink-0" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}

                  <div className={`border-t my-1.5 ${t.sep}`} />

                  <button
                    onClick={() => {
                      onLogout();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center rounded-xl py-2 px-3 text-xs font-bold transition-all text-left text-red-400 hover:text-red-500 hover:bg-red-500/10 cursor-pointer focus:outline-none"
                  >
                    <LogOut className="w-4 h-4 mr-2.5 shrink-0" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <AvatarPicker isOpen={isPickerOpen} onClose={() => setIsPickerOpen(false)} />
    </header>
  );
};

export default TopNav;
