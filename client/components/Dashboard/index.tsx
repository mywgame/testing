/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth.ts';
import { useTheme } from '../../hooks/useTheme.ts';
import { Button } from '../ui/Buttons/index.tsx';
import { Input } from '../ui/Inputs/index.tsx';
import { DashboardTab, Sidebar } from './Sidebar.tsx';
import { TopNav } from './TopNav.tsx';
import { BottomNav } from './BottomNav.tsx';
import { GradientOrbs } from './GradientOrbs.tsx';
import { api } from '../../services/api.ts';
import { DashboardData } from '../../types/index.ts';

const VIP_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  VIP1: { label: 'VIP1', color: '#94a3b8', bg: 'from-slate-400/30 to-slate-500/30', icon: '🥈' },
  VIP2: { label: 'VIP2', color: '#f59e0b', bg: 'from-yellow-500/30 to-orange-500/30', icon: '🥇' },
  VIP3: { label: 'VIP3', color: '#38bdf8', bg: 'from-cyan-500/30 to-blue-500/30', icon: '💎' },
  VIP4: { label: 'VIP4', color: '#a855f7', bg: 'from-purple-500/30 to-indigo-500/30', icon: '👑' },
  VIP5: { label: 'VIP5', color: '#ec4899', bg: 'from-pink-500/30 to-rose-500/30', icon: '🌟' },
  VIP6: { label: 'VIP6', color: '#f43f5e', bg: 'from-rose-500/30 to-red-500/30', icon: '⚡' },
  VIP7: { label: 'VIP7', color: '#10b981', bg: 'from-emerald-500/30 to-teal-500/30', icon: '🔥' },
  VIP8: { label: 'VIP8', color: '#3b82f6', bg: 'from-blue-500/30 to-cyan-500/30', icon: '🚀' },
};

// Tab Views
import { DashboardHome } from './DashboardHome.tsx';
import { TeamView } from './Team/TeamView.tsx';
import { ProfileView } from './ProfileView.tsx';
import { SecurityView } from './SecurityView.tsx';
import { TwoFactorView } from './TwoFactorView.tsx';
import { WithdrawalAddressesView } from './WithdrawalAddressesView.tsx';
import { SettingsView } from './SettingsView.tsx';
import { SupportView } from './SupportView.tsx';
import { TransactionsView } from './Transactions/TransactionsView.tsx';
import { VIPView } from './VIP/VIPView.tsx';

// Loading Skeletons
import {
  DashboardSkeleton,
  VIPSkeleton,
  TeamSkeleton,
  TransactionSkeleton,
  DepositSkeleton,
  WithdrawalSkeleton,
  ProfileSkeleton,
  SupportSkeleton,
} from './Skeletons/index.ts';

// Dedicated Sub-pages
import { DashboardLayout } from './Layout/DashboardLayout.tsx';
import { DepositView } from './Deposit/DepositView.tsx';
import { WithdrawalView } from './Withdrawal/WithdrawalView.tsx';
import { RewardsView } from './Rewards/RewardsView.tsx';
import { StakingView } from './Staking/StakingView.tsx';
import { TaskView } from './Task/TaskView.tsx';
import { DepositSuccessModal } from './Deposit/DepositSuccessModal.tsx';
import { DailyClaimModal } from './DailyClaimModal.tsx';
import { WelcomeTrialFundModal } from './WelcomeTrialFundModal.tsx';
import { clientTaskService, TaskItemDTO } from '../../services/taskService.ts';

// Overlay
import { ArrowLeft } from 'lucide-react';
import { Toast } from '../ui/Feedback/index.tsx';

interface UserDashboardProps {
  onBackToLanding: () => void;
  onNavigateToVentures?: () => void;
  initialTab?: DashboardTab;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  onBackToLanding,
  onNavigateToVentures,
  initialTab,
}) => {
  const { user, logout } = useAuth();
  const { t } = useTheme();

  const [activeTab, setActiveTab] = useState<DashboardTab>(initialTab || 'dashboard');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Dashboard state
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPageLoading, setIsPageLoading] = useState(false);

  // Deposit Success Modal State
  const [depositSuccessData, setDepositSuccessData] = useState<{ amount: string; network: string } | null>(null);
  const [dailyClaimSuccessData, setDailyClaimSuccessData] = useState<{ amount: number; streakDays: number } | null>(null);
  const [welcomeTrialTask, setWelcomeTrialTask] = useState<TaskItemDTO | null>(null);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const [isClaimingTrial, setIsClaimingTrial] = useState(false);
  const seenCompletedDepositIds = React.useRef<Set<string>>(new Set());
  const isInitialDepositCheck = React.useRef<boolean>(true);
  const hasCheckedWelcomeTrial = React.useRef<boolean>(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Derive current VIP tier and identity properties after variables have been initialized
  const vipTier = dashboardData?.vip?.tier || user?.vipTier || 'VIP1';
  const currentVip = VIP_CONFIG[vipTier] || VIP_CONFIG['VIP1'];

  const realIdentity = {
    name: user?.name || user?.email?.split('@')[0] || 'User',
    id: user?.userId || 'MF-N/A',
    rankLabel: currentVip.label,
    rankColor: currentVip.color,
    rankBg: currentVip.bg,
    rankIcon: currentVip.icon,
    streakDays: dashboardData?.dailyClaim?.streakDays ?? 0,
    online: true,
  };

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  const fetchDashboard = useCallback(async () => {
    try {
      const response = await api.get<DashboardData>('/users/dashboard');
      if (response.success && response.data) {
        setDashboardData(response.data);
      } else {
        showToast(response.error?.message || 'Failed to sync with the financial ledger.');
      }
    } catch (error: any) {
      showToast(error.message || 'Network error occurred while updating the dashboard.');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    setIsPageLoading(true);
    fetchDashboard();
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 650);
    return () => clearTimeout(timer);
  }, [activeTab, fetchDashboard]);

  // Background polling for auto-verified deposits
  const checkAutoVerifiedDeposits = useCallback(async () => {
    const token = localStorage.getItem('metafirm_token');
    if (!token) return;
    try {
      const res = await api.getUserDeposits();
      if (res.success && Array.isArray(res.data)) {
        const completedDeposits = res.data.filter((d: any) => d.status === 'COMPLETED');
        
        if (isInitialDepositCheck.current) {
          // On boot, record existing completed deposit IDs
          completedDeposits.forEach((d: any) => seenCompletedDepositIds.current.add(d.id));
          isInitialDepositCheck.current = false;
        } else {
          // Check if any new completed deposit has arrived
          for (const dep of completedDeposits) {
            if (!seenCompletedDepositIds.current.has(dep.id)) {
              seenCompletedDepositIds.current.add(dep.id);
              setDepositSuccessData({
                amount: dep.amount,
                network: dep.network || 'USDT',
              });
              // Refresh wallet & dashboard balances
              fetchDashboard();
              break;
            }
          }
        }
      }
    } catch (err) {
      console.error('Error polling user deposits for auto-verification:', err);
    }
  }, [fetchDashboard]);

  // Check Welcome / Trial Fund gift popup on login/mount
  const checkWelcomeTrialFund = useCallback(async () => {
    if (hasCheckedWelcomeTrial.current) return;
    hasCheckedWelcomeTrial.current = true;
    try {
      const taskData = await clientTaskService.getTasks();
      if (taskData && Array.isArray(taskData.tasks)) {
        const trialFundTask = taskData.tasks.find(
          (t) => t.taskCode === 'REGISTRATION_TRIAL_FUND'
        );
        // Only show popup if task exists, is active, is COMPLETED (eligible for activation), and not yet CLAIMED
        if (trialFundTask && trialFundTask.status === 'COMPLETED') {
          setWelcomeTrialTask(trialFundTask);
          setIsWelcomeModalOpen(true);
        }
      }
    } catch (err) {
      console.error('Error checking welcome trial fund task status:', err);
    }
  }, []);

  const handleClaimWelcomeTrial = async (): Promise<boolean> => {
    if (!welcomeTrialTask) return false;
    setIsClaimingTrial(true);
    try {
      const res = await clientTaskService.claimReward('REGISTRATION_TRIAL_FUND');
      if (res.success) {
        showToast(res.message || '🎉 Trial Fund welcome gift acknowledged and countdown activated!');
        fetchDashboard();
        return true;
      } else {
        showToast(res.message || 'Trial Fund could not be claimed.');
        return false;
      }
    } catch (err: any) {
      showToast(err.message || 'Error claiming trial fund reward.');
      return false;
    } finally {
      setIsClaimingTrial(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    checkAutoVerifiedDeposits();
    checkWelcomeTrialFund();

    // Check for auto-verified deposits only when the tab is visible (reduced frequency to 45s to avoid Neon compute burn)
    const pollInterval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        checkAutoVerifiedDeposits();
      }
    }, 45000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAutoVerifiedDeposits();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(pollInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchDashboard, checkAutoVerifiedDeposits, checkWelcomeTrialFund]);

  const handleLogout = () => {
    logout();
    onBackToLanding();
  };

  const handleQuickAction = (actionType: 'deposit' | 'withdraw' | 'claim' | 'staking' | 'team' | 'invite' | 'task' | 'transactions') => {
    if (actionType === 'deposit') {
      setActiveTab('deposit');
    } else if (actionType === 'withdraw') {
      setActiveTab('withdrawal');
    } else if (actionType === 'staking' || actionType === 'claim') {
      setActiveTab('staking');
    } else if (actionType === 'team') {
      setActiveTab('team');
    } else if (actionType === 'invite' || actionType === 'task') {
      setActiveTab('task');
    } else if (actionType === 'transactions') {
      setActiveTab('transactions');
    }
  };

  // Note: Team/Profile/Security/Settings/Support/Transactions still use their
  // original light-only design and (pre-existing) mock data — that is
  // unchanged, out of this redesign's scope. Wrapping them in a neutral
  // light card frame keeps them looking intentional against the dark
  // gradient-orb shell instead of visually clashing when dark mode is on.
  const wrapLegacyView = (node: React.ReactNode) => (
    <div className="bg-white rounded-3xl shadow-xl shadow-black/5 p-1">{node}</div>
  );

  // Render main sub-view depending on active tab state
  const renderActiveView = () => {
    if (isLoading || isPageLoading) {
      switch (activeTab) {
        case 'dashboard':
          return (
            <DashboardLayout variant="blank">
              <DashboardSkeleton />
            </DashboardLayout>
          );
        case 'vip':
          return <VIPSkeleton />;
        case 'profile':
          return <ProfileSkeleton />;
        case 'team':
          return <TeamSkeleton />;
        case 'transactions':
          return <TransactionSkeleton />;
        case 'deposit':
          return (
            <DashboardLayout title="USDT Deposit Gateway" onBack={() => setActiveTab('dashboard')}>
              <DepositSkeleton />
            </DashboardLayout>
          );
        case 'withdrawal':
          return (
            <DashboardLayout title="USDT Withdrawal Portal" onBack={() => setActiveTab('dashboard')}>
              <WithdrawalSkeleton />
            </DashboardLayout>
          );
        case 'support':
          return <SupportSkeleton />;
        default:
          return <DashboardSkeleton />;
      }
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardLayout variant="blank">
            <DashboardHome
              dashboardData={dashboardData}
              onRefresh={fetchDashboard}
              onQuickAction={handleQuickAction}
              onDailyClaimSuccess={(info) => setDailyClaimSuccessData(info)}
            />
          </DashboardLayout>
        );
      case 'profile':
        return <ProfileView />;
      case 'vip':
        return <VIPView dashboardData={dashboardData} />;
      case 'team':
        return <TeamView dashboardData={dashboardData} />;
      case 'transactions':
        return <TransactionsView />;
      case 'security':
        return <SecurityView />;
      case 'twoFactor':
        return <TwoFactorView />;
      case 'withdrawalAddresses':
        return <WithdrawalAddressesView />;
      case 'settings':
        return (
          <SettingsView
            onNavigate={(tab) => setActiveTab(tab)}
            showToast={showToast}
          />
        );
      case 'support':
        return <SupportView />;
      case 'deposit':
        return (
          <DepositView
            dashboardData={dashboardData}
            showToast={showToast}
            onBack={() => setActiveTab('dashboard')}
            onRefresh={fetchDashboard}
            onDepositSuccess={(info) => setDepositSuccessData(info)}
          />
        );
      case 'withdrawal':
        return (
          <WithdrawalView
            showToast={showToast}
            onBack={() => setActiveTab('dashboard')}
          />
        );
      case 'staking':
      case 'rewards':
        return (
          <StakingView
            onBack={() => setActiveTab('dashboard')}
          />
        );
      case 'task':
        return (
          <TaskView
            onBack={() => setActiveTab('dashboard')}
            onNavigateToReferrals={() => setActiveTab('team')}
            onNavigate={(tab) => setActiveTab(tab as DashboardTab)}
            onRefresh={fetchDashboard}
          />
        );
      default:
        return (
          <DashboardLayout variant="blank">
            <DashboardHome dashboardData={dashboardData} onRefresh={fetchDashboard} onQuickAction={handleQuickAction} />
          </DashboardLayout>
        );
    }
  };

  return (
    <div className={`relative flex min-h-screen font-sans transition-colors duration-300 ${t.pageBg} ${t.text}`} id="premium-user-dashboard">

      {/* 0. Decorative background (single shared instance) */}
      <GradientOrbs />

      {/* 1. Left Sidebar Navigation (desktop only — preserved with collapse/hamburger behavior) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
        onLogout={handleLogout}
      />

      {/* 2. Main content chassis block */}
      <div className="relative z-10 flex-grow flex flex-col min-w-0">

        {/* 2.1 Top Bar Navigation */}
        <TopNav
          identity={realIdentity}
          activeTab={activeTab}
          onNavigate={setActiveTab}
          onLogout={handleLogout}
        />

        {/* 2.2 Scrollable Content Canvas Container */}
        <main className="flex-grow px-2 xs:px-3 sm:px-4 md:px-8 py-4 sm:py-6 md:py-8 overflow-y-auto space-y-6 max-w-7xl w-full mx-auto pb-[calc(122px+env(safe-area-inset-bottom)+1.5rem)] md:pb-8">

          {/* Back shortcut — desktop only; mobile relies on BottomNav for navigation */}
          <div className={`hidden md:flex items-center justify-between pb-4 border-b ${t.sep}`}>
            <button
              onClick={onBackToLanding}
              className={`inline-flex items-center space-x-1.5 text-xs font-semibold transition-colors cursor-pointer ${t.textSub} hover:text-cyan-500`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          </div>

          {/* Active Child View */}
          {renderActiveView()}

        </main>
      </div>

      {/* 2.3 Mobile App-Style Bottom Shell (hidden on md+, Sidebar takes over there) */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Toast Feedbacks */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          variant="success"
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Deposit Success Modal */}
      <DepositSuccessModal
        isOpen={!!depositSuccessData}
        amount={depositSuccessData?.amount || '0'}
        network={depositSuccessData?.network}
        onClose={() => setDepositSuccessData(null)}
      />

      {/* Daily Claim Reward Success Modal */}
      <DailyClaimModal
        isOpen={!!dailyClaimSuccessData}
        amount={dailyClaimSuccessData?.amount || 0}
        streakDays={dailyClaimSuccessData?.streakDays}
        onClose={() => setDailyClaimSuccessData(null)}
      />

      {/* Welcome / Trial Fund Gift Modal */}
      {welcomeTrialTask && (
        <WelcomeTrialFundModal
          isOpen={isWelcomeModalOpen}
          trialTask={welcomeTrialTask}
          isClaiming={isClaimingTrial}
          onClaim={handleClaimWelcomeTrial}
          onClose={() => setIsWelcomeModalOpen(false)}
          onGoToTasks={() => {
            setIsWelcomeModalOpen(false);
            setActiveTab('task');
          }}
        />
      )}

    </div>
  );
};

export default UserDashboard;
