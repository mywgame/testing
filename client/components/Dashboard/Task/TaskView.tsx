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

interface GradientGiftBoxProps {
  status: 'CLAIMED' | 'COMPLETED' | 'IN_PROGRESS' | 'LOCKED';
  size?: number;
  idSuffix: string | number;
}

const GradientGiftBox: React.FC<GradientGiftBoxProps> = ({ status, size = 42, idSuffix }) => {
  const gradientId = `gift-grad-${status.toLowerCase()}-${idSuffix}`;
  const ribbonId = `ribbon-grad-${status.toLowerCase()}-${idSuffix}`;

  const palettes = {
    CLAIMED: {
      boxStart: '#10B981',
      boxEnd: '#059669',
      ribbonStart: '#A7F3D0',
      ribbonEnd: '#34D399',
      glow: 'rgba(16, 185, 129, 0.28)',
      lidColor: '#047857',
    },
    COMPLETED: {
      boxStart: '#C084FC',
      boxEnd: '#7C3AED',
      ribbonStart: '#FDE047',
      ribbonEnd: '#F59E0B',
      glow: 'rgba(168, 85, 247, 0.4)',
      lidColor: '#6D28D9',
    },
    IN_PROGRESS: {
      boxStart: '#FBBF24',
      boxEnd: '#D97706',
      ribbonStart: '#FEF08A',
      ribbonEnd: '#F59E0B',
      glow: 'rgba(245, 158, 11, 0.3)',
      lidColor: '#B45309',
    },
    LOCKED: {
      boxStart: '#64748B',
      boxEnd: '#334155',
      ribbonStart: '#FBBF24',
      ribbonEnd: '#D97706',
      glow: 'rgba(245, 158, 11, 0.12)',
      lidColor: '#475569',
    },
  };

  const p = palettes[status] || palettes.LOCKED;

  return (
    <div className="relative inline-flex items-center justify-center my-1 group">
      {/* Ambient background glow orb */}
      <div
        className="absolute w-12 h-12 rounded-full blur-md opacity-80 pointer-events-none transition-transform duration-300 group-hover:scale-125"
        style={{ backgroundColor: p.glow }}
      />
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 drop-shadow-[0_4px_10px_rgba(0,0,0,0.4)] transition-transform duration-300 group-hover:scale-110"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={p.boxStart} />
            <stop offset="100%" stopColor={p.boxEnd} />
          </linearGradient>
          <linearGradient id={ribbonId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={p.ribbonStart} />
            <stop offset="100%" stopColor={p.ribbonEnd} />
          </linearGradient>
        </defs>

        {/* Gift Box Base */}
        <rect x="8" y="20" width="32" height="21" rx="4" fill={`url(#${gradientId})`} />
        <rect x="8" y="20" width="32" height="3.5" fill="white" fillOpacity="0.18" />

        {/* Vertical Ribbon */}
        <rect x="21.5" y="20" width="5" height="21" fill={`url(#${ribbonId})`} />

        {/* Gift Box Lid */}
        <rect x="6" y="14" width="36" height="7.5" rx="2.5" fill={p.lidColor} />
        <rect x="6" y="14" width="36" height="7.5" rx="2.5" fill={`url(#${gradientId})`} fillOpacity="0.85" />
        <rect x="6" y="14" width="36" height="2" fill="white" fillOpacity="0.3" />

        {/* Vertical Ribbon on Lid */}
        <rect x="21" y="14" width="6" height="7.5" fill={`url(#${ribbonId})`} />

        {/* Ribbon Bow Loops */}
        <path
          d="M24 14C20.5 7.5 12.5 7.5 15.5 13C17 15.5 21.5 14.5 24 14Z"
          fill={`url(#${ribbonId})`}
        />
        <path
          d="M24 14C27.5 7.5 35.5 7.5 32.5 13C31 15.5 26.5 14.5 24 14Z"
          fill={`url(#${ribbonId})`}
        />
        {/* Central Bow Knot */}
        <circle cx="24" cy="14" r="2.5" fill={`url(#${ribbonId})`} stroke="white" strokeWidth="0.6" strokeOpacity="0.5" />

        {/* Dynamic Sparkles */}
        {status === 'COMPLETED' && (
          <>
            <path d="M38 10L39 7L42 6L39 5L38 2L37 5L34 6L37 7L38 10Z" fill="#FDE047" />
            <path d="M10 32L10.7 30L13 29.3L10.7 28.6L10 26.5L9.3 28.6L7 29.3L9.3 30L10 32Z" fill="#FDE047" />
          </>
        )}
        {status === 'CLAIMED' && (
          <path d="M38 11L39 8.5L41.5 7.5L39 6.5L38 4L37 6.5L34.5 7.5L37 8.5L38 11Z" fill="#6EE7B7" />
        )}
      </svg>
    </div>
  );
};

export const TaskView: React.FC<TaskViewProps> = ({ onBack, onNavigateToReferrals }) => {
  const { t, isDark } = useTheme();
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
            
            {/* Title & Headline */}
            <div className="space-y-2 max-w-xl">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase transition-all ${
                  isDark
                    ? 'bg-purple-500/15 border border-purple-500/30 text-purple-300'
                    : 'bg-purple-100 border border-purple-300 text-purple-800 shadow-sm shadow-purple-500/10'
                }`}
              >
                <Sparkles className={`w-3.5 h-3.5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                <span>MetaFirm Rewards Program</span>
              </div>
              <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight font-display ${t.text}`}>
                Tasks & Rewards
              </h2>
              <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Complete ecosystem activities and unlock instant rewards credited directly to your account balance.
              </p>
            </div>

            {/* Total Earned & Available to Claim Cards */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-3.5 w-full lg:w-auto">
              {/* Total Earned Card */}
              <div
                className={`p-4 sm:px-5 sm:py-4 rounded-2xl text-left flex-1 min-w-[145px] relative overflow-hidden group transition-all duration-300 ${
                  isDark
                    ? 'bg-gradient-to-br from-emerald-600/40 via-emerald-700/30 to-teal-900/40 border border-emerald-500/40 shadow-lg shadow-emerald-950/50 backdrop-blur-md'
                    : 'bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-700 border border-emerald-400 shadow-lg shadow-emerald-600/30 backdrop-blur-md'
                }`}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none -mr-8 -mt-8" />
                <span className="text-[11px] font-mono text-emerald-100 uppercase tracking-wider block font-bold">
                  Total Earned
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white block mt-1 drop-shadow-md">
                  ${summary.totalEarned.toFixed(2)}{' '}
                  <span className="text-xs font-sans font-bold text-emerald-100 ml-0.5">USDT</span>
                </span>
              </div>

              {/* Claimable Now Card */}
              <div
                className={`p-4 sm:px-5 sm:py-4 rounded-2xl text-left flex-1 min-w-[145px] relative overflow-hidden group transition-all duration-300 ${
                  isDark
                    ? 'bg-gradient-to-br from-amber-600/40 via-amber-700/30 to-orange-900/40 border border-amber-500/40 shadow-lg shadow-amber-950/50 backdrop-blur-md'
                    : 'bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 border border-amber-400 shadow-lg shadow-amber-600/30 backdrop-blur-md'
                }`}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none -mr-8 -mt-8" />
                <span className="text-[11px] font-mono text-amber-100 uppercase tracking-wider block font-bold">
                  Claimable Now
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white block mt-1 drop-shadow-md">
                  ${summary.claimableTotal.toFixed(2)}{' '}
                  <span className="text-xs font-sans font-bold text-amber-100 ml-0.5">USDT</span>
                </span>
              </div>
            </div>
          </div>

          {/* 4 Stat Boxes Metric Bar */}
          <div
            className={`grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t ${
              isDark ? 'border-white/10' : 'border-slate-200/80'
            }`}
          >
            {/* Completed */}
            <div
              className={`flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl border transition-all ${
                isDark
                  ? 'bg-white/[0.04] border-white/10 hover:bg-white/[0.07] hover:border-white/20'
                  : 'bg-white/90 border-slate-200/90 shadow-sm hover:shadow hover:border-slate-300'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  isDark
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-600'
                }`}
              >
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className={`text-[10px] font-mono block uppercase font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Completed
                </span>
                <span className={`text-lg font-extrabold font-mono ${t.text}`}>
                  {summary.completedCount}
                </span>
              </div>
            </div>

            {/* In Progress */}
            <div
              className={`flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl border transition-all ${
                isDark
                  ? 'bg-white/[0.04] border-white/10 hover:bg-white/[0.07] hover:border-white/20'
                  : 'bg-white/90 border-slate-200/90 shadow-sm hover:shadow hover:border-slate-300'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  isDark
                    ? 'bg-blue-500/15 border-blue-500/30 text-blue-400'
                    : 'bg-blue-50 border-blue-200 text-blue-600'
                }`}
              >
                <Hourglass className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className={`text-[10px] font-mono block uppercase font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  In Progress
                </span>
                <span className={`text-lg font-extrabold font-mono ${t.text}`}>
                  {summary.inProgressCount}
                </span>
              </div>
            </div>

            {/* Available */}
            <div
              className={`flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl border transition-all ${
                isDark
                  ? 'bg-white/[0.04] border-white/10 hover:bg-white/[0.07] hover:border-white/20'
                  : 'bg-white/90 border-slate-200/90 shadow-sm hover:shadow hover:border-slate-300'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  isDark
                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                    : 'bg-amber-50 border-amber-200 text-amber-600'
                }`}
              >
                <Gift className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className={`text-[10px] font-mono block uppercase font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Available
                </span>
                <span className={`text-lg font-extrabold font-mono ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                  {tasks.filter((t) => t.status === 'COMPLETED').length}
                </span>
              </div>
            </div>

            {/* Total Tasks */}
            <div
              className={`flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl border transition-all ${
                isDark
                  ? 'bg-white/[0.04] border-white/10 hover:bg-white/[0.07] hover:border-white/20'
                  : 'bg-white/90 border-slate-200/90 shadow-sm hover:shadow hover:border-slate-300'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  isDark
                    ? 'bg-purple-500/15 border-purple-500/30 text-purple-400'
                    : 'bg-purple-50 border-purple-200 text-purple-600'
                }`}
              >
                <ListTodo className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className={`text-[10px] font-mono block uppercase font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Total Tasks
                </span>
                <span className={`text-lg font-extrabold font-mono ${t.text}`}>
                  {summary.totalTasksCount || tasks.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Navigation Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar">
          {[
            { id: 'ALL' as FilterTab, label: 'All Tasks', count: tasks.length },
            { id: 'ACTIVITY' as FilterTab, label: 'Activity Bonus', count: activityTasks.length },
            { id: 'DEPOSIT' as FilterTab, label: 'Deposit Milestones', count: depositTasks.length },
            { id: 'REFERRAL' as FilterTab, label: 'Referral Milestones', count: referralMilestoneTasks.length },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/25 ring-1 ring-white/20'
                    : isDark
                    ? 'text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20'
                    : 'text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm hover:border-slate-300'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                    isActive
                      ? 'bg-white/25 text-white'
                      : isDark
                      ? 'bg-white/10 text-slate-300'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {activityTasks.map((task) => {
                    const isClaimed = task.status === 'CLAIMED';
                    const isCompleted = task.status === 'COMPLETED';
                    const isClaiming = claimingCode === task.taskCode;

                    return (
                      <div
                        key={task.id}
                        className={`rounded-2xl p-4 sm:p-5 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                          isCompleted
                            ? isDark
                              ? 'border-purple-500/40 shadow-lg shadow-purple-500/10 bg-purple-500/[0.05]'
                              : 'border-purple-300 shadow-md shadow-purple-900/5 bg-purple-50/60'
                            : isClaimed
                            ? isDark
                              ? 'border-emerald-500/20 bg-emerald-500/[0.03]'
                              : 'border-emerald-200 bg-emerald-50/50'
                            : isDark
                            ? 'bg-white/[0.03] border-white/10 hover:border-white/20'
                            : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-sm'
                        }`}
                      >
                        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                          <div
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                              task.taskCode === 'REGISTRATION_TRIAL_FUND'
                                ? isDark
                                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                                  : 'bg-emerald-50 border-emerald-200 text-emerald-600'
                                : task.taskCode === 'AUTHENTICATOR_SETUP'
                                ? isDark
                                  ? 'bg-blue-500/15 border-blue-500/30 text-blue-400'
                                  : 'bg-blue-50 border-blue-200 text-blue-600'
                                : task.taskCode === 'JOIN_TELEGRAM'
                                ? isDark
                                  ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400'
                                  : 'bg-cyan-50 border-cyan-200 text-cyan-600'
                                : isDark
                                ? 'bg-purple-500/15 border-purple-500/30 text-purple-400'
                                : 'bg-purple-50 border-purple-200 text-purple-600'
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

                          <div className="min-w-0 text-left space-y-0.5">
                            <h4 className={`text-sm font-bold leading-snug ${t.text}`}>
                              {task.title}
                            </h4>
                            <p className={`text-xs leading-relaxed ${t.textMuted}`}>
                              {task.description}
                            </p>
                          </div>
                        </div>

                        {/* Reward Amount & Action/State Button */}
                        <div
                          className={`flex items-center justify-between sm:justify-end gap-3.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 ${
                            isDark ? 'border-white/5' : 'border-slate-200/60'
                          }`}
                        >
                          <div className="text-left sm:text-right">
                            <span
                              className={`text-base font-extrabold font-mono block ${
                                isDark ? 'text-emerald-400' : 'text-emerald-600'
                              }`}
                            >
                              +${task.rewardAmount < 1 ? task.rewardAmount.toFixed(2) : task.rewardAmount}
                            </span>
                            <span
                              className={`text-[9px] font-mono block uppercase font-semibold ${
                                isDark ? 'text-slate-400' : 'text-slate-500'
                              }`}
                            >
                              {task.rewardType === 'TRIAL_FUND' ? 'Trial Fund' : 'USDT'}
                            </span>
                          </div>

                          <div className="shrink-0">
                            {isClaimed ? (
                              <span
                                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold font-mono border ${
                                  isDark
                                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                                    : 'bg-emerald-50 border-emerald-300 text-emerald-700'
                                }`}
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Claimed</span>
                              </span>
                            ) : isCompleted ? (
                              <button
                                onClick={() => handleClaim(task.taskCode, task.title, task.rewardAmount)}
                                disabled={isClaiming}
                                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-600/30 active:scale-95 cursor-pointer transition-all disabled:opacity-50 inline-flex items-center gap-1.5"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-purple-200" />
                                <span>{isClaiming ? 'Claiming...' : 'Claim'}</span>
                              </button>
                            ) : task.actionUrl ? (
                              <a
                                href={task.actionUrl}
                                target={task.actionUrl.startsWith('http') ? '_blank' : '_self'}
                                rel="noreferrer"
                                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/30 active:scale-95 transition-all inline-flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                              >
                                <span>Go</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <span
                                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border ${
                                  isDark
                                    ? 'bg-white/[0.04] border-white/10 text-slate-400'
                                    : 'bg-slate-100 border-slate-200 text-slate-500'
                                }`}
                              >
                                <Lock className="w-3 h-3" />
                                <span>Locked</span>
                              </span>
                            )}
                          </div>
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

                <div className="space-y-3.5">
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
                        className={`rounded-2xl p-4 sm:p-5 border transition-all ${
                          isCompleted
                            ? isDark
                              ? 'border-purple-500/40 shadow-lg shadow-purple-500/10 bg-purple-500/[0.04]'
                              : 'border-purple-300 shadow-md shadow-purple-900/5 bg-purple-50/60'
                            : isClaimed
                            ? isDark
                              ? 'border-emerald-500/20 bg-emerald-500/[0.02]'
                              : 'border-emerald-200 bg-emerald-50/50'
                            : isDark
                            ? 'bg-white/[0.03] border-white/10 hover:border-blue-500/30'
                            : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-sm'
                        } space-y-3.5`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                                isDark
                                  ? 'bg-blue-500/15 border-blue-500/30 text-blue-400'
                                  : 'bg-blue-50 border-blue-200 text-blue-600'
                              }`}
                            >
                              <DollarSign className="w-5 h-5" />
                            </div>
                            <div className="min-w-0 text-left space-y-0.5">
                              <h4 className={`text-sm font-bold ${t.text}`}>{task.title}</h4>
                              <p className={`text-xs ${t.textMuted}`}>{task.description}</p>
                            </div>
                          </div>

                          <div
                            className={`flex items-center justify-between sm:justify-end gap-3.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 ${
                              isDark ? 'border-white/5' : 'border-slate-200/60'
                            }`}
                          >
                            <div className="text-left sm:text-right">
                              <span
                                className={`text-base font-extrabold font-mono block ${
                                  isDark ? 'text-emerald-400' : 'text-emerald-600'
                                }`}
                              >
                                +${task.rewardAmount}
                              </span>
                              <span
                                className={`text-[9px] font-mono uppercase block font-semibold ${
                                  isDark ? 'text-slate-400' : 'text-slate-500'
                                }`}
                              >
                                USDT
                              </span>
                            </div>

                            <div className="shrink-0">
                              {isClaimed ? (
                                <span
                                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold font-mono border ${
                                    isDark
                                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                                      : 'bg-emerald-50 border-emerald-300 text-emerald-700'
                                  }`}
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Claimed</span>
                                </span>
                              ) : isCompleted ? (
                                <button
                                  onClick={() => handleClaim(task.taskCode, task.title, task.rewardAmount)}
                                  disabled={isClaiming}
                                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-600/30 active:scale-95 cursor-pointer transition-all disabled:opacity-50 inline-flex items-center gap-1.5"
                                >
                                  <Sparkles className="w-3.5 h-3.5 text-purple-200" />
                                  <span>{isClaiming ? 'Claiming...' : 'Claim'}</span>
                                </button>
                              ) : (
                                <span
                                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border ${
                                    isDark
                                      ? 'bg-white/[0.04] border-white/10 text-slate-400'
                                      : 'bg-slate-100 border-slate-200 text-slate-500'
                                  }`}
                                >
                                  <Lock className="w-3 h-3" />
                                  <span>Locked</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar with current vs target */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] font-mono">
                            <span className={t.textMuted}>
                              Deposit Progress:{' '}
                              <span className={`font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                                ${task.currentProgress}
                              </span>{' '}
                              / ${task.targetProgress} USDT
                            </span>
                            <span className={`font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                              {progressPercent}%
                            </span>
                          </div>
                          <div
                            className={`w-full h-2 rounded-full overflow-hidden p-0.5 ${
                              isDark ? 'bg-white/10' : 'bg-slate-200'
                            }`}
                          >
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
                      Referral Milestones{' '}
                      <span className={`text-xs font-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        (Verified Referrals • min $50 deposit)
                      </span>
                    </h3>
                  </div>

                  {onNavigateToReferrals && (
                    <button
                      onClick={onNavigateToReferrals}
                      className="text-xs font-bold text-purple-500 hover:text-purple-600 dark:text-purple-400 dark:hover:text-purple-300 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>View Referrals</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Stepper Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {referralMilestoneTasks.map((task) => {
                    const isClaimed = task.status === 'CLAIMED';
                    const isCompleted = task.status === 'COMPLETED';
                    const isInProgress = task.status === 'IN_PROGRESS';
                    const isClaiming = claimingCode === task.taskCode;

                    return (
                      <div
                        key={task.id}
                        className={`rounded-2xl p-4 border text-center transition-all flex flex-col justify-between group ${
                          isCompleted
                            ? isDark
                              ? 'bg-purple-500/10 border-purple-500/40 shadow-lg shadow-purple-500/15 ring-1 ring-purple-500/30'
                              : 'bg-purple-50/80 border-purple-300 shadow-md shadow-purple-900/5 ring-1 ring-purple-400/30'
                            : isClaimed
                            ? isDark
                              ? 'bg-emerald-500/10 border-emerald-500/30'
                              : 'bg-emerald-50/80 border-emerald-300 shadow-sm'
                            : isInProgress
                            ? isDark
                              ? 'bg-amber-500/10 border-amber-500/30 shadow-md shadow-amber-500/5'
                              : 'bg-amber-50/80 border-amber-300 shadow-sm'
                            : isDark
                            ? 'bg-white/[0.03] border-white/10 hover:border-white/20'
                            : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-sm'
                        }`}
                      >
                        <div className="space-y-2 flex flex-col items-center">
                          {/* Target referrals pill */}
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                              isCompleted
                                ? isDark
                                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                                  : 'bg-purple-100 text-purple-700 border-purple-300'
                                : isClaimed
                                ? isDark
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                  : 'bg-emerald-100 text-emerald-700 border-emerald-300'
                                : isInProgress
                                ? isDark
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                  : 'bg-amber-100 text-amber-700 border-amber-300'
                                : isDark
                                ? 'bg-white/5 text-slate-400 border-white/5'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {task.targetProgress} Referrals
                          </span>

                          {/* Gradient Gift Box SVG */}
                          <div className="py-1">
                            <GradientGiftBox
                              status={task.status as any}
                              size={44}
                              idSuffix={task.id || task.taskCode}
                            />
                          </div>

                          {/* Reward typography */}
                          <div className="space-y-0.5">
                            <span
                              className={`text-xl sm:text-2xl font-extrabold font-mono block ${
                                isDark ? 'text-amber-400' : 'text-amber-600'
                              }`}
                            >
                              +${task.rewardAmount}
                            </span>
                            <span
                              className={`text-[9px] font-mono uppercase block font-semibold tracking-wide ${
                                isDark ? 'text-slate-400' : 'text-slate-500'
                              }`}
                            >
                              USDT Reward
                            </span>
                          </div>
                        </div>

                        <div
                          className={`pt-3 mt-2 border-t w-full ${
                            isDark ? 'border-white/10' : 'border-slate-200/80'
                          }`}
                        >
                          {isClaimed ? (
                            <span
                              className={`inline-flex items-center justify-center gap-1 w-full text-[11px] font-bold font-mono ${
                                isDark ? 'text-emerald-400' : 'text-emerald-600'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Claimed</span>
                            </span>
                          ) : isCompleted ? (
                            <button
                              onClick={() => handleClaim(task.taskCode, task.title, task.rewardAmount)}
                              disabled={isClaiming}
                              className="w-full py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 active:scale-95 cursor-pointer transition-all shadow-md shadow-purple-600/25 inline-flex items-center justify-center gap-1"
                            >
                              <Sparkles className="w-3 h-3 text-purple-200" />
                              <span>{isClaiming ? 'Claiming...' : 'Claim'}</span>
                            </button>
                          ) : isInProgress ? (
                            <span
                              className={`text-[10px] font-mono font-bold block ${
                                isDark ? 'text-amber-400' : 'text-amber-600'
                              }`}
                            >
                              In Progress ({task.currentProgress}/{task.targetProgress})
                            </span>
                          ) : (
                            <span
                              className={`inline-flex items-center justify-center gap-1 w-full text-[11px] font-mono ${
                                isDark ? 'text-slate-400' : 'text-slate-500'
                              }`}
                            >
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
