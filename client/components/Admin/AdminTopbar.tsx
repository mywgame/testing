/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.ts';
import { 
  Menu, 
  Search, 
  Bell, 
  Clock, 
  ShieldCheck, 
  Globe, 
  Zap,
  Activity,
  UserCheck
} from 'lucide-react';
import { Dropdown } from '../ui/Inputs/index.tsx';
import { useTheme } from '../../hooks/useTheme.ts';
import { ThemeSwitch } from '../ui/index.ts';

interface AdminTopbarProps {
  onMobileMenuToggle: () => void;
  activeTab: string;
  onSearchChange?: (val: string) => void;
}

export const AdminTopbar: React.FC<AdminTopbarProps> = ({
  onMobileMenuToggle,
  activeTab,
  onSearchChange
}) => {
  const { user } = useAuth();
  const { t, isDark } = useTheme();
  const [utcTime, setUtcTime] = useState<string>('');
  const [localTime, setLocalTime] = useState<string>('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(
        now.toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric' }) + 
        ' ' + 
        now.toLocaleTimeString('en-US', { timeZone: 'UTC', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
        ' UTC'
      );
      setLocalTime(
        now.toLocaleTimeString(undefined, { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard';
      case 'users': return 'Users';
      case 'deposits': return 'Deposits';
      case 'withdrawals': return 'Withdrawals';
      case 'vip': return 'VIP Management';
      case 'income': return 'Team Commission Engine';
      case 'rewards': return 'Rewards Pool';
      case 'salary': return 'Salaries';
      case 'trial_fund': return 'Trial Fund Settings';
      case 'support': return 'Support';
      case 'announcements': return 'Announcements';
      case 'audit': return 'Audit Logs';
      case 'security': return 'Security';
      case 'settings': return 'Settings';
      case 'reset': return 'Reset';
      default: return 'Admin Panel';
    }
  };

  return (
    <header className={`sticky top-0 z-30 backdrop-blur-md border-b px-6 py-3.5 flex items-center justify-between ${t.headerBg} ${t.sep}`}>
      {/* Tab Title / Mobile menu toggle */}
      <div className="flex items-center space-x-3.5">
        <button
          onClick={onMobileMenuToggle}
          className={`md:hidden p-1.5 rounded-lg border transition-colors cursor-pointer ${
            isDark
              ? 'border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
              : 'border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className={`text-sm font-display font-black tracking-tight flex items-center gap-1.5 uppercase leading-none ${t.text}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            {getTabTitle()}
          </h1>
          <span className={`text-[9px] font-mono font-bold block mt-1 uppercase ${t.textMuted}`}>
            MetaFirm Admin Panel
          </span>
        </div>
      </div>

      {/* Center Search bar */}
      <div className="hidden lg:block w-72 max-w-sm relative">
        <div className={`absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors ${isSearchFocused ? 'text-blue-500' : ''}`}>
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          placeholder="Search hashes, addresses, email accounts..."
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className={`w-full pl-9 pr-4 py-2 text-xs border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 font-sans ${
            isDark
              ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20'
              : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/10'
          }`}
        />
      </div>

      {/* Right Topbar actions display */}
      <div className="flex items-center space-x-4">
        
        {/* Live synchronized Business Time */}
        <div 
          className={`hidden sm:flex items-center space-x-2 border px-3 py-1.5 rounded-xl font-mono text-[10px] font-semibold cursor-default ${
            isDark ? 'bg-white/5 border-white/10 text-gray-300' : 'bg-gray-50 border-gray-100 text-gray-600'
          }`}
          title={`UTC System Time (for audit closing) & Your Local Device Time`}
        >
          <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <div className="flex items-center gap-2">
            <span>{utcTime}</span>
            <span className="text-gray-400">|</span>
            <span className="text-blue-500 font-bold">Local: {localTime}</span>
          </div>
        </div>

        {/* System Health State indicator */}
        <div className={`hidden md:flex items-center space-x-1.5 border px-2.5 py-1.5 rounded-xl text-[10px] font-mono font-bold ${
          isDark
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            : 'bg-emerald-50 border-emerald-100/55 text-emerald-700'
        }`}>
          <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
          <span>OPS: STABLE</span>
        </div>

        {/* Notifications Button */}
        <button 
          className={`relative p-2 rounded-xl border transition-all cursor-pointer ${
            isDark
              ? 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20'
              : 'bg-white border-gray-100 text-gray-500 hover:text-blue-600 hover:border-blue-100'
          }`}
          title="Notification bulletins"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full" />
        </button>

        {/* Theme Switcher Toggle pill */}
        <ThemeSwitch className="hidden sm:block" />


        {/* Operator profile card */}
        <div className={`flex items-center space-x-2.5 pl-2 border-l ${t.sep}`}>
          <div className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center font-display uppercase shadow-sm ${
            isDark
              ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
              : 'bg-blue-50 border border-blue-100 text-blue-600'
          }`}>
            {user?.email ? user.email.charAt(0) : 'A'}
          </div>
          <div className="hidden xl:block text-left">
            <span className={`text-[10px] font-mono font-extrabold block leading-none ${t.textMuted}`}>ROOT OPERATOR</span>
            <span className={`text-xs font-bold block truncate max-w-[120px] ${t.text}`}>{user?.email || 'admin@cefi.platform'}</span>
          </div>
        </div>

      </div>
    </header>
  );
};
