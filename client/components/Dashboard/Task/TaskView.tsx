/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Gift,
  ShieldCheck,
  Send,
  DollarSign,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  Lock,
  ExternalLink,
  Sparkles,
  TrendingUp,
  Award,
  Hourglass,
  ListTodo,
  Check,
  ChevronRight,
  Info,
} from 'lucide-react';
import { DashboardLayout } from '../Layout/DashboardLayout.tsx';
import { useTheme } from '../../../hooks/useTheme.ts';
import { useTasks } from '../../../hooks/useTasks.ts';
import { Toast } from '../../ui/Feedback/index.tsx';

interface TaskViewProps {
  onBack: () => void;
  onNavigateToReferrals?: () => void;
}

export type FilterTab = 'ALL' | 'DEPOSIT' | 'ACTIVITY' | 'REFERRAL';

export const TaskView: React.FC<TaskViewProps> = ({ onBack, onNavigateToReferrals }) => {
  const { t } = useTheme();
  const { tasks, summary, loading, claimingCode, claimReward } = useTasks();
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleClaim = async (taskCode: string, title: string, rewardAmount: number) => {
    const res = await claimReward(taskCode);
    if (res.success) {
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

        {/* Top Header Section with Stat Cards & Earnings Pills */}
        <div className={`relative overflow-hidden rounded-3xl p-5 sm:p-6 border shadow-2xl ${t.card}`}>
          {/* Ambient Lighting Orbs */}
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-purple-600/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-cyan-600/15 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            
            {/* Title & Headline */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[10px] sm:text-xs font-mono font-bold tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>MetaFirm Rewards Program</span>
              </div>
              <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight font-display ${t.text}`}>
                Tasks & Rewards
              </h2>
              <p className={`text-xs sm:text-sm ${t.textSub}`}>
                Complete tasks and unlock exciting rewards credited directly to your balance.
              </p>
            </div>

            {/* Total Earned & Available to Claim Pills */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="flex-1 sm:flex-none px-4 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-left min-w-[140px]">
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block font-bold">
                  Total Earned
                </span>
                <span className="text-xl sm:text-2xl font-extrabold font-mono text-emerald-400">
                  ${summary.totalEarned.toFixed(2)}{' '}
                  <span className="text-xs font-sans font-semibold text-emerald-400/80">USDT</span>
                </span>
              </div>

              <div className="flex-1 sm:flex-none px-4 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-left min-w-[140px]">
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block font-bold">
                  Claimable
                </span>
                <span className="text-xl sm:text-2xl font-extrabold font-mono text-amber-400">
                  ${summary.claimableTotal.toFixed(2)}{' '}
                  <span className="text-xs font-sans font-semibold text-amber-400/80">USDT</span>
                </span>
              </div>
            </div>
          </div>

          {/* 4 Stat Boxes Metric Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
            {/* Completed */}
            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className={`text-[10px] font-mono block ${t.textMuted}`}>Completed</span>
                <span className={`text-lg font-extrabold font-mono ${t.text}`}>
                  {summary.completedCount}
                </span>
              </div>
            </div>

            {/* In Progress */}
            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                <Hourglass className="w-5 h-5" />
              </div>
              <div>
                <span className={`text-[10px] font-mono block ${t.textMuted}`}>In Progress</span>
                <span className={`text-lg font-extrabold font-mono ${t.text}`}>
                  {summary.inProgressCount}
                </span>
              </div>
            </div>

            {/* Available */}
            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <span className={`text-[10px] font-mono block ${t.textMuted}`}>Available</span>
                <span className={`text-lg font-extrabold font-mono ${t.text}`}>
                  {tasks.filter((t) => t.status === 'COMPLETED').length}
                </span>
              </div>
            </div>

            {/* Total Tasks */}
            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                <ListTodo className="w-5 h-5" />
              </div>
              <div>
                <span className={`text-[10px] font-mono block ${t.textMuted}`}>Total Tasks</span>
                <span className={`text-lg font-extrabold font-mono ${t.text}`}>
                  {summary.totalTasksCount || tasks.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Navigation Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'ALL' as FilterTab, label: 'All Tasks' },
            { id: 'DEPOSIT' as FilterTab, label: 'Deposit Milestones' },
            { id: 'ACTIVITY' as FilterTab, label: 'Activity Bonus' },
            { id: 'REFERRAL' as FilterTab, label: 'Referral Milestones' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/25'
                    : `${t.textSub} hover:${t.text} ${t.cardInner} border border-white/5`
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className={`text-xs ${t.textSub}`}>Loading tasks & reward eligibility...</p>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* SECTION 1: Activity Bonus */}
            {showActivity && activityTasks.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <h3 className={`text-base font-bold font-display ${t.text}`}>Activity Bonus</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activityTasks.map((task) => {
                    const isClaimed = task.status === 'CLAIMED';
                    const isCompleted = task.status === 'COMPLETED';
                    const isClaiming = claimingCode === task.taskCode;

                    return (
                      <div
                        key={task.id}
                        className={`rounded-2xl p-4 border transition-all flex items-center justify-between gap-4 ${t.card} hover:border-purple-500/30`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                              task.taskCode === 'REGISTRATION_TRIAL_FUND'
                                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                                : task.taskCode === 'AUTHENTICATOR_SETUP'
                                ? 'bg-blue-500/15 border-blue-500/30 text-blue-400'
                                : task.taskCode === 'JOIN_TELEGRAM'
                                ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400'
                                : 'bg-purple-500/15 border-purple-500/30 text-purple-400'
                            }`}
                          >
                            {task.taskCode === 'REGISTRATION_TRIAL_FUND' ? (
                              <Gift className="w-5 h-5" />
                            ) : task.taskCode === 'AUTHENTICATOR_SETUP' ? (
                              <ShieldCheck className="w-5 h-5" />
                            ) : task.taskCode === 'JOIN_TELEGRAM' ? (
                              <Send className="w-5 h-5" />
                            ) : (
                              <Users className="w-5 h-5" />
                            )}
                          </div>

                          <div className="min-w-0 text-left">
                            <h4 className={`text-sm font-bold truncate ${t.text}`}>
                              {task.title}
                            </h4>
                            <p className={`text-[11px] truncate ${t.textMuted}`}>
                              {task.description}
                            </p>
                          </div>
                        </div>

                        {/* Reward Amount & Claim Button */}
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <span className="text-sm font-extrabold font-mono text-emerald-400 block">
                              ${task.rewardAmount < 1 ? task.rewardAmount.toFixed(2) : task.rewardAmount}
                            </span>
                            <span className="text-[9px] font-mono text-slate-400 block uppercase">
                              {task.rewardType === 'TRIAL_FUND' ? 'Trial Fund' : 'USDT'}
                            </span>
                          </div>

                          {isClaimed ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                              <Check className="w-3.5 h-3.5" />
                              <span>Claimed</span>
                            </span>
                          ) : isCompleted ? (
                            <button
                              onClick={() => handleClaim(task.taskCode, task.title, task.rewardAmount)}
                              disabled={isClaiming}
                              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-600/20 active:scale-95 cursor-pointer transition-all disabled:opacity-50"
                            >
                              {isClaiming ? 'Claiming...' : 'Claim'}
                            </button>
                          ) : task.actionUrl ? (
                            <a
                              href={task.actionUrl}
                              target={task.actionUrl.startsWith('http') ? '_blank' : '_self'}
                              rel="noreferrer"
                              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all inline-flex items-center gap-1"
                            >
                              <span>Go</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/5 border border-white/10 text-slate-400 flex items-center gap-1">
                              <Lock className="w-3 h-3" />
                              <span>Locked</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SECTION 2: Deposit Milestones */}
            {showDeposit && depositTasks.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                  <h3 className={`text-base font-bold font-display ${t.text}`}>Deposit Milestones</h3>
                </div>

                <div className="space-y-3">
                  {depositTasks.map((task) => {
                    const isClaimed = task.status === 'CLAIMED';
                    const isCompleted = task.status === 'COMPLETED';
                    const isClaiming = claimingCode === task.taskCode;
                    const progressPercent = Math.min(
                      100,
                      Math.round((task.currentProgress / task.targetProgress) * 100)
                    );

                    return (
                      <div
                        key={task.id}
                        className={`rounded-2xl p-4 sm:p-5 border transition-all ${t.card} hover:border-blue-500/30 space-y-3`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
                              <DollarSign className="w-5 h-5" />
                            </div>
                            <div className="min-w-0 text-left">
                              <h4 className={`text-sm font-bold ${t.text}`}>{task.title}</h4>
                              <p className={`text-xs ${t.textMuted}`}>{task.description}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right">
                              <span className="text-base font-extrabold font-mono text-emerald-400 block">
                                ${task.rewardAmount}
                              </span>
                              <span className="text-[9px] font-mono text-slate-400 uppercase block">
                                USDT
                              </span>
                            </div>

                            {isClaimed ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                                <Check className="w-3.5 h-3.5" />
                                <span>Claimed</span>
                              </span>
                            ) : isCompleted ? (
                              <button
                                onClick={() => handleClaim(task.taskCode, task.title, task.rewardAmount)}
                                disabled={isClaiming}
                                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-600/20 active:scale-95 cursor-pointer transition-all disabled:opacity-50"
                              >
                                {isClaiming ? 'Claiming...' : 'Claim'}
                              </button>
                            ) : (
                              <span className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white/5 border border-white/10 text-slate-400 flex items-center gap-1">
                                <Lock className="w-3 h-3" />
                                <span>Locked</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-mono">
                            <span className={t.textMuted}>
                              Progress (${task.currentProgress} / ${task.targetProgress})
                            </span>
                            <span className="font-bold text-blue-400">{progressPercent}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden p-0.5">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SECTION 3: Referral Milestones */}
            {showReferral && referralMilestoneTasks.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <h3 className={`text-base font-bold font-display ${t.text}`}>
                      Referral Milestones <span className="text-xs font-normal text-slate-400">(Verified Referrals - min $50 deposit)</span>
                    </h3>
                  </div>

                  {onNavigateToReferrals && (
                    <button
                      onClick={onNavigateToReferrals}
                      className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
                    >
                      <span>View My Referrals</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Horizontal Stepper Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {referralMilestoneTasks.map((task) => {
                    const isClaimed = task.status === 'CLAIMED';
                    const isCompleted = task.status === 'COMPLETED';
                    const isInProgress = task.status === 'IN_PROGRESS';
                    const isClaiming = claimingCode === task.taskCode;

                    return (
                      <div
                        key={task.id}
                        className={`rounded-2xl p-4 border text-center transition-all flex flex-col justify-between ${
                          isInProgress
                            ? 'bg-amber-500/10 border-amber-500/40 shadow-lg shadow-amber-500/10'
                            : isCompleted || isClaimed
                            ? 'bg-emerald-500/10 border-emerald-500/30'
                            : `${t.card} border-white/5`
                        }`}
                      >
                        <div className="space-y-2">
                          <span className={`text-[10px] font-mono font-bold block ${t.textMuted}`}>
                            {task.targetProgress} Referrals
                          </span>
                          <span className="text-xl font-extrabold font-mono text-amber-400 block">
                            ${task.rewardAmount}
                          </span>
                        </div>

                        <div className="pt-3 mt-2 border-t border-white/10">
                          {isClaimed ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                              <Check className="w-3 h-3" />
                              <span>Claimed</span>
                            </span>
                          ) : isCompleted ? (
                            <button
                              onClick={() => handleClaim(task.taskCode, task.title, task.rewardAmount)}
                              disabled={isClaiming}
                              className="w-full py-1.5 rounded-lg text-[11px] font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 active:scale-95 cursor-pointer transition-all"
                            >
                              {isClaiming ? 'Claiming...' : 'Claim'}
                            </button>
                          ) : isInProgress ? (
                            <span className="text-[10px] font-mono font-bold text-amber-400 block">
                              In Progress ({task.currentProgress}/{task.targetProgress})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-400">
                              <Lock className="w-3 h-3" />
                              <span>Locked</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Informational Footer Banner */}
            <div className="rounded-2xl p-4 bg-white/5 border border-white/10 flex items-start gap-3.5 text-left">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <p className={`text-xs font-semibold ${t.text}`}>
                  All rewards are USDT and distributed instantly to your account balance.
                </p>
                <p className={`text-[11px] ${t.textMuted}`}>
                  Only REAL deposits count towards deposit and referral milestone progress. Trial Fund balance does not count as a deposit.
                </p>
              </div>
            </div>

          </div>
        )}

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
