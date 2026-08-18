/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { DashboardLayout } from '../Layout/DashboardLayout.tsx';
import { useTheme } from '../../../hooks/useTheme.ts';
import { useTasks } from '../../../hooks/useTasks.ts';
import { Toast } from '../../ui/Feedback/index.tsx';

import { RewardsHeader } from './RewardsHeader.tsx';
import { RewardsSummaryCards } from './RewardsSummaryCards.tsx';
import { RewardsMetricsGrid } from './RewardsMetricsGrid.tsx';
import { RewardsCategoryFilter, FilterTab } from './RewardsCategoryFilter.tsx';
import { ActivityBonusList } from './ActivityBonusList.tsx';
import { DepositMilestonesList } from './DepositMilestonesList.tsx';
import { ReferralMilestonesGrid } from './ReferralMilestonesGrid.tsx';
import { ClaimSuccessModal } from './ClaimSuccessModal.tsx';
import { RewardsRulesModal } from './RewardsRulesModal.tsx';

interface TaskViewProps {
  onBack: () => void;
  onNavigateToReferrals?: () => void;
  onNavigate?: (tab: string) => void;
  onRefresh?: () => void;
}

export const TaskView: React.FC<TaskViewProps> = ({ onBack, onNavigateToReferrals, onNavigate, onRefresh }) => {
  const { t, isDark } = useTheme();
  const { tasks, summary, loading, claimingCode, claimReward } = useTasks();

  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState<boolean>(false);
  const [successModalData, setSuccessModalData] = useState<{
    isOpen: boolean;
    taskTitle: string;
    rewardAmount: number;
    rewardType?: 'CASH' | 'TRIAL_FUND' | 'BONUS';
  }>({
    isOpen: false,
    taskTitle: '',
    rewardAmount: 0,
    rewardType: 'CASH',
  });

  const handleClaim = async (taskCode: string, title: string, rewardAmount: number) => {
    const res = await claimReward(taskCode);
    if (res.success) {
      if (onRefresh) {
        onRefresh();
      }
      setSuccessModalData({
        isOpen: true,
        taskTitle: title,
        rewardAmount: ('rewardAmount' in res && res.rewardAmount) ? res.rewardAmount : rewardAmount,
        rewardType: taskCode === 'REGISTRATION_TRIAL_FUND' ? 'TRIAL_FUND' : 'CASH',
      });
      setToastMessage(res.message || `🎉 Successfully claimed $${rewardAmount} USDT!`);
    } else {
      setToastMessage(`⚠️ ${res.message || 'Claim failed. Please try again.'}`);
    }
  };

  // Group tasks by category
  const activityTasks = tasks.filter((t) => t.category === 'ACTIVITY');
  const depositTasks = tasks.filter((t) => t.category === 'DEPOSIT');
  const referralMilestoneTasks = tasks.filter((t) => t.category === 'REFERRAL');

  // Filter based on activeTab selection
  const showActivity = activeTab === 'ALL' || activeTab === 'ACTIVITY';
  const showDeposit = activeTab === 'ALL' || activeTab === 'DEPOSIT';
  const showReferral = activeTab === 'ALL' || activeTab === 'REFERRAL';

  return (
    <DashboardLayout
      title="Tasks & Rewards"
      description="Complete tasks • Earn rewards • Grow your earnings"
      onBack={onBack}
    >
      <div className="space-y-6 w-full text-left max-w-6xl mx-auto" id="tasks-and-rewards-view">

        {/* Top Premium Hero Section with Stat Cards & Earnings */}
        <div
          className={`relative overflow-hidden rounded-3xl p-5 sm:p-7 border transition-all duration-300 ${
            isDark
              ? 'bg-gradient-to-br from-[#121633]/95 via-[#0e122b]/95 to-[#0b0e24]/95 border-purple-500/20 shadow-2xl shadow-purple-950/40 backdrop-blur-2xl'
              : 'bg-gradient-to-br from-white via-[#f8f9ff] to-[#f0f3ff] border-purple-200/90 shadow-xl shadow-purple-900/10 backdrop-blur-2xl'
          }`}
        >
          {/* Ambient Lighting Glows */}
          <div
            className={`absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl pointer-events-none ${
              isDark ? 'bg-purple-600/20' : 'bg-purple-400/20'
            }`}
          />
          <div
            className={`absolute -bottom-24 -left-24 w-80 h-80 rounded-full blur-3xl pointer-events-none ${
              isDark ? 'bg-cyan-600/15' : 'bg-blue-400/15'
            }`}
          />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <RewardsHeader />
            <RewardsSummaryCards
              totalEarned={summary.totalEarned}
              claimableTotal={summary.claimableTotal}
            />
          </div>

          <RewardsMetricsGrid
            completedCount={summary.completedCount}
            inProgressCount={summary.inProgressCount}
            availableCount={tasks.filter((t) => t.status === 'COMPLETED').length}
            totalTasksCount={summary.totalTasksCount || tasks.length}
          />
        </div>

        {/* Category Navigation Filter Pills */}
        <RewardsCategoryFilter
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={{
            all: tasks.length,
            activity: activityTasks.length,
            deposit: depositTasks.length,
            referral: referralMilestoneTasks.length,
          }}
        />

        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className={`text-xs ${t.textSub}`}>Loading tasks & reward eligibility...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {showActivity && (
              <ActivityBonusList
                tasks={activityTasks}
                claimingCode={claimingCode}
                onClaim={handleClaim}
                onNavigate={onNavigate}
              />
            )}

            {showDeposit && (
              <DepositMilestonesList
                tasks={depositTasks}
                claimingCode={claimingCode}
                onClaim={handleClaim}
              />
            )}

            {showReferral && (
              <ReferralMilestonesGrid
                tasks={referralMilestoneTasks}
                claimingCode={claimingCode}
                onClaim={handleClaim}
                onNavigateToReferrals={onNavigateToReferrals}
              />
            )}

            {/* Informational Footer Banner */}
            <div
              className={`rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 text-left border transition-all ${
                isDark
                  ? 'bg-white/[0.03] border-white/10'
                  : 'bg-white border-slate-200/90 shadow-sm'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${
                  isDark
                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                    : 'bg-amber-50 border-amber-200 text-amber-600'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <p className={`text-xs sm:text-sm font-semibold ${t.text}`}>
                  All cash rewards are USDT and distributed instantly to your account balance.
                </p>
                <p className={`text-xs leading-relaxed ${t.textMuted}`}>
                  Only REAL deposits count towards deposit and referral milestone progress. Trial Fund balance does not count as a deposit.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Claim Success Celebration Modal */}
        <ClaimSuccessModal
          isOpen={successModalData.isOpen}
          taskTitle={successModalData.taskTitle}
          rewardAmount={successModalData.rewardAmount}
          rewardType={successModalData.rewardType}
          onClose={() => setSuccessModalData((prev) => ({ ...prev, isOpen: false }))}
        />

        {/* Rules & Eligibility Modal */}
        <RewardsRulesModal
          isOpen={isRulesModalOpen}
          onClose={() => setIsRulesModalOpen(false)}
        />

        {/* Toast Notification */}
        {toastMessage && (
          <Toast
            message={toastMessage}
            variant={toastMessage.includes('🎉') ? 'success' : 'info'}
            onClose={() => setToastMessage(null)}
          />
        )}

      </div>
    </DashboardLayout>
  );
};

export default TaskView;
