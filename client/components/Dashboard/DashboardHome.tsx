/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowDownToLine, ArrowUpFromLine, Coins, DollarSign } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.ts';
import { api } from '../../services/api.ts';
import { DashboardData } from '../../types/index.ts';
import { DashboardSkeleton } from './Skeletons/DashboardSkeleton.tsx';
import { getReferralLink } from '../../utils/referral.ts';

import { Announcements } from './Announcements.tsx';
import { DailyClaimCard } from './DailyClaimCard.tsx';
import { HeroBalanceCard } from './HeroBalanceCard.tsx';
import { IncomeOverview } from './IncomeOverview.tsx';
import { MonthlyEarningsChart } from './MonthlyEarningsChart.tsx';
import { NetworkLevels } from './NetworkLevels.tsx';
import { RecentActivity } from './RecentActivity.tsx';
import { DownloadAppsSection } from './DownloadAppsSection.tsx';
import { PromoOfferSlider } from './Promo/PromoOfferSlider.tsx';
import { useLocalization } from '../../contexts/LocalizationContext.tsx';

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

interface DashboardHomeProps {
  dashboardData: DashboardData | null;
  onRefresh?: () => Promise<void>;
  onQuickAction?: (actionType: 'deposit' | 'withdraw' | 'claim' | 'staking' | 'team' | 'invite' | 'task' | 'transactions') => void;
  onDailyClaimSuccess?: (info: { amount: number; streakDays: number }) => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  dashboardData,
  onRefresh,
  onQuickAction,
  onDailyClaimSuccess,
}) => {
  const { user } = useAuth();
  const { formatDate, t } = useLocalization();

  if (!dashboardData) {
    return <DashboardSkeleton />;
  }

  // Business Logic Spec Section 4 — Trial Fund is "Displayed together with the Main
  // Wallet in the UI." Only the active (non-expired) trial balance is included.
  const activeTrialBalance = dashboardData.trialFundInfo?.isActive
    ? parseFloat(dashboardData.trialFundInfo.activeTrialBalance || '0')
    : 0;
  const totalBalance = parseFloat(dashboardData.wallet.availableBalance) + activeTrialBalance;
  const totalEarned = parseFloat(dashboardData.earnings?.dailyYield || '0') +
                      parseFloat(dashboardData.earnings?.referralIncome || '0') +
                      parseFloat(dashboardData.earnings?.teamIncome || '0') +
                      parseFloat(dashboardData.earnings?.incentiveIncome || '0');
  const totalWithdrawn = parseFloat(dashboardData.wallet.totalWithdrawn);

    const vipTier = dashboardData?.vip?.tier || user?.vipTier || 'VIP1';
    const currentVip = VIP_CONFIG[vipTier] || VIP_CONFIG['VIP1'];

    const levelACount = dashboardData.team?.levelACount || 0;
    const levelBCount = dashboardData.team?.levelBCount || 0;
    const levelCCount = dashboardData.team?.levelCCount || 0;
    const levelDCount = dashboardData.team?.levelDCount || 0;
    const totalMembers = levelACount + levelBCount + levelCCount + levelDCount;

    // Proportional team income distribution for the levels
    const totalTeamIncome = parseFloat(dashboardData.earnings.teamIncome);
    const l1Weight = levelACount * 10;
    const l2Weight = levelBCount * 5;
    const l3Weight = levelCCount * 3;
    const l4Weight = levelDCount * 2;
    const totalWeight = l1Weight + l2Weight + l3Weight + l4Weight;

    const getLevelEarnings = (count: number, weight: number) => {
      if (totalWeight === 0 || count === 0) return 0;
      return (weight / totalWeight) * totalTeamIncome;
    };

    const referralCode = user?.referralCode || '';
    const referralLink = referralCode 
      ? getReferralLink(referralCode)
      : 'N/A';

    // Calculate seconds remaining until next UTC Midnight
    const now = new Date();
    const nextMidnight = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1,
      0, 0, 0, 0
    ));
    const secondsRemaining = dashboardData.dailyClaim.available 
      ? 0 
      : Math.max(0, Math.floor((nextMidnight.getTime() - now.getTime()) / 1000));

    // Dynamic percent
    const percent = dashboardData.dailyClaim.available 
      ? 100 
      : Math.round((1 - secondsRemaining / 86400) * 100);

    const realDailyClaim = {
      percent: percent,
      secondsRemaining: secondsRemaining,
      rewardAmount: parseFloat(dashboardData.dailyClaim.amount),
      lastStatus: (dashboardData.dailyClaim.status === 'CLAIMED' ? 'success' : 'none') as 'success' | 'failed' | 'none',
      streakDays: dashboardData.dailyClaim.streakDays ?? 0,
      history7Days: dashboardData.dailyClaim.history7Days || [],
      status: dashboardData.dailyClaim.status,
    };

    const referralConfig = dashboardData.referralConfig || {
      mode: 'PERCENTAGE',
      percentage: '10',
      fixedAmount: '20',
      thisMonthReferralEarnings: '0.00',
    };

    const commissionRateLabel = referralConfig.mode === 'FIXED'
      ? `${parseFloat(referralConfig.fixedAmount)} USDT (Fixed)`
      : `${parseFloat(referralConfig.percentage)}%`;

    const thisMonthReferralEarned = parseFloat(referralConfig.thisMonthReferralEarnings || '0');

    const realNetwork = {
      referralLink,
      commissionRateLabel,
      thisMonthEarnings: thisMonthReferralEarned,
      totalMembers,
      levels: [
        { level: 'L1', count: levelACount, earnings: Math.round(getLevelEarnings(levelACount, l1Weight) * 100) / 100 },
        { level: 'L2', count: levelBCount, earnings: Math.round(getLevelEarnings(levelBCount, l2Weight) * 100) / 100 },
        { level: 'L3', count: levelCCount, earnings: Math.round(getLevelEarnings(levelCCount, l3Weight) * 100) / 100 },
        { level: 'L4', count: levelDCount, earnings: Math.round(getLevelEarnings(levelDCount, l4Weight) * 100) / 100 },
      ],
    };

    const realRecentTransactions = (dashboardData.recentTransactions || []).map((tx: any) => {
      const rawType = (tx.type || 'deposit').toString();
      const displayType = rawType
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());

      return {
        id: tx.id,
        type: rawType.toLowerCase(),
        displayType,
        hash: tx.referenceId || `TX-${tx.id.slice(0, 8)}`,
        amount: Math.abs(parseFloat(tx.amount || '0')),
        token: 'USDT',
        createdAt: tx.createdAt,
        time: tx.createdAt ? formatDate(tx.createdAt) : 'N/A',
      };
    });

    return (
      <div className="space-y-6 w-full text-left" id="metafirm-dashboard-home">

        {/* 1. Total Balance Hero Card */}
        <HeroBalanceCard
          totalBalance={totalBalance}
          totalEarned={totalEarned}
          totalWithdrawn={totalWithdrawn}
          identity={{
            name: user?.name || user?.email?.split('@')[0] || 'User',
            id: user?.userId || 'MF-N/A',
            rankLabel: currentVip.label,
            rankColor: currentVip.color,
            rankBg: currentVip.bg,
            rankIcon: currentVip.icon,
          }}
        />

        {/* 2. Quick Action Buttons — always one row (mobile shrinks size, desktop untouched) */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-3" id="action-buttons-container">
          <button
            onClick={() => onQuickAction?.('deposit')}
            className="flex items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-4 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-white font-sans font-bold text-[9px] sm:text-xs tracking-wider uppercase transition-all shadow-lg shadow-emerald-900/10 active:scale-[0.98] cursor-pointer"
          >
            <ArrowDownToLine className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">Deposit</span>
          </button>
          <button
            onClick={() => onQuickAction?.('withdraw')}
            className="flex items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-4 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-rose-500 to-red-500 hover:opacity-90 text-white font-sans font-bold text-[9px] sm:text-xs tracking-wider uppercase transition-all shadow-lg shadow-rose-900/10 active:scale-[0.98] cursor-pointer"
          >
            <ArrowUpFromLine className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">Withdraw</span>
          </button>
          <button
            id="btn-quick-staking"
            onClick={() => onQuickAction?.('staking')}
            className="flex items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-4 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:opacity-90 text-white font-sans font-bold text-[9px] sm:text-xs tracking-wider uppercase transition-all shadow-lg shadow-blue-900/10 active:scale-[0.98] cursor-pointer"
          >
            <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">Staking</span>
          </button>
          <button
            onClick={() => onQuickAction?.('task')}
            className="flex items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-4 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white font-sans font-bold text-[9px] sm:text-xs tracking-wider uppercase transition-all shadow-lg shadow-purple-900/10 active:scale-[0.98] cursor-pointer"
          >
            <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">Task</span>
          </button>
        </div>

        {/* 2.5 Promotional Offers Hero Carousel */}
        <PromoOfferSlider onQuickAction={onQuickAction} />

        {/* 3. Income Overview Section */}
        <IncomeOverview
          totalEarned={totalEarned}
          dailyYield={{
            today: parseFloat(dashboardData.earnings?.todayDailyYield || '0'),
            total: parseFloat(dashboardData.earnings?.dailyYield || '0'),
          }}
          referralIncome={{
            today: parseFloat(dashboardData.earnings?.todayReferralIncome || '0'),
            total: parseFloat(dashboardData.earnings?.referralIncome || '0'),
          }}
          teamIncome={{
            today: parseFloat(dashboardData.earnings?.todayTeamIncome || '0'),
            total: parseFloat(dashboardData.earnings?.teamIncome || '0'),
          }}
          incentiveIncome={{
            today: parseFloat(dashboardData.earnings?.todayIncentiveIncome || '0'),
            total: parseFloat(dashboardData.earnings?.incentiveIncome || '0'),
          }}
        />

        {/* 4. Daily Claim + Monthly Earnings Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="yield-collection-container">
          <DailyClaimCard 
            dailyClaim={realDailyClaim} 
            onClaimSuccess={onDailyClaimSuccess}
            onClaim={async () => {
              if (dashboardData.dailyClaim.claimId) {
                const res = await api.claimYield(dashboardData.dailyClaim.claimId);
                if (res.success) {
                  if (onRefresh) await onRefresh();
                } else {
                  throw new Error(res.error?.message || 'Failed to claim daily yield');
                }
              }
            }} 
          />
          <MonthlyEarningsChart data={dashboardData.earningsHistory || []} />
        </div>

        {/* 5. Network Levels + Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="recent-transactions-container">
          <NetworkLevels network={realNetwork} />
          <RecentActivity transactions={realRecentTransactions} onViewAll={() => onQuickAction?.('transactions')} />
        </div>

        {/* 6. Announcements (only rendered if admin published announcements; otherwise hidden) */}
        <Announcements />

        {/* 7. Download Apps Placeholders (Android APK, iOS, Chrome WebApp) */}
        <div className="w-full" id="download-apps-container">
          <DownloadAppsSection />
        </div>

      </div>
    );
};

export default DashboardHome;
