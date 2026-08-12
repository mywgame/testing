/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  ArrowDownLeft,
  ArrowUpRight,
  Star,
  TrendingUp,
  Gift,
  DollarSign,
  Headphones,
  Megaphone,
  ScrollText,
  ShieldAlert,
  Settings,
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme.ts';
import { useAuth } from '../../hooks/useAuth.ts';
import { AdminSidebar, AdminTab } from './AdminSidebar.tsx';
import { AdminTopbar } from './AdminTopbar.tsx';

// View Modules
import { DashboardHome } from './DashboardHome.tsx';
import { UsersView } from './UsersView.tsx';
import { AdminProfileView } from './AdminProfileView.tsx';
import { DepositsView } from './DepositsView.tsx';
import { WithdrawalsView } from './WithdrawalsView.tsx';
import { VipView } from './VipView.tsx';
import { IncomeView } from './IncomeView.tsx';
import { RewardsView } from './RewardsView.tsx';
import { SalaryView } from './SalaryView.tsx';
import { SupportView } from './SupportView.tsx';
import { AnnouncementsView } from './AnnouncementsView.tsx';
import { AuditLogsView } from './AuditLogsView.tsx';
import { SecurityView } from './SecurityView.tsx';
import { SettingsView } from './SettingsView.tsx';
import { TrialFundView } from './TrialFundView.tsx';
import { TreasuryView } from './TreasuryView.tsx';
import { ReferralSystemView } from './ReferralSystemView.tsx';
import { ResetView } from './ResetView.tsx';

interface EnterpriseAdminDashboardProps {
  onBackToLanding: () => void;
}

export const EnterpriseAdminDashboard: React.FC<EnterpriseAdminDashboardProps> = ({ onBackToLanding }) => {
  const { isDark, t } = useTheme();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Logout wrapper
  const handleLogout = () => {
    logout();
    onBackToLanding();
  };

  // Active View Dispatcher
  const renderViewContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardHome t={t} isDark={isDark} onNavigate={(path) => setActiveTab(path as AdminTab)} />;
      case 'users':
        return <UsersView t={t} isDark={isDark} />;
      case 'profile':
        return <AdminProfileView t={t} isDark={isDark} />;
      case 'referral':
        return <ReferralSystemView t={t} isDark={isDark} />;
      case 'deposits':
        return <DepositsView t={t} isDark={isDark} />;
      case 'withdrawals':
        return <WithdrawalsView t={t} isDark={isDark} />;
      case 'vip':
        return <VipView t={t} isDark={isDark} />;
      case 'income':
        return <IncomeView t={t} isDark={isDark} />;
      case 'rewards':
        return <RewardsView t={t} isDark={isDark} />;
      case 'salary':
        return <SalaryView t={t} isDark={isDark} />;
      case 'support':
        return <SupportView t={t} isDark={isDark} />;
      case 'announcements':
        return <AnnouncementsView t={t} isDark={isDark} />;
      case 'audit':
        return <AuditLogsView t={t} isDark={isDark} />;
      case 'security':
        return <SecurityView t={t} isDark={isDark} />;
      case 'settings':
        return <SettingsView t={t} isDark={isDark} />;
      case 'trial_fund':
        return <TrialFundView t={t} isDark={isDark} />;
      case 'treasury':
        return <TreasuryView t={t} isDark={isDark} />;
      case 'reset':
        return <ResetView t={t} isDark={isDark} />;
      default:
        return <DashboardHome t={t} isDark={isDark} onNavigate={(path) => setActiveTab(path as AdminTab)} />;
    }
  };

  return (
    <div className={`relative flex h-screen overflow-hidden font-sans transition-colors duration-300 ${t.pageBg} ${t.text}`} id="superadmin-root">
      {/* 1. Sidebar navigation (Desktop and Mobile Slideout) */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        onLogout={handleLogout}
        userRole={user?.role || 'superadmin'}
      />

      {/* 2. Main Chassis Workspace Area */}
      <div className="flex-grow flex flex-col h-screen overflow-y-auto min-w-0">
        {/* 2.1 Header bar navigation */}
        <AdminTopbar
          onMobileMenuToggle={() => setIsMobileOpen(true)}
          activeTab={activeTab}
        />

        {/* 2.2 Scrollable Canvas Space */}
        <main className="flex-grow p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto pb-12">
          {renderViewContent()}
        </main>
      </div>
    </div>
  );
};

export default EnterpriseAdminDashboard;
