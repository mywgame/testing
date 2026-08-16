/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme.ts';
import { TaskItemDTO } from '../../../services/taskService.ts';
import { TaskStatusButton } from './TaskStatusButton.tsx';

interface GradientGiftBoxProps {
  status: 'CLAIMED' | 'COMPLETED' | 'IN_PROGRESS' | 'LOCKED';
  size?: number;
  idSuffix: string | number;
}

export const GradientGiftBox: React.FC<GradientGiftBoxProps> = ({ status, size = 42, idSuffix }) => {
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

interface ReferralMilestonesGridProps {
  tasks: TaskItemDTO[];
  claimingCode: string | null;
  onClaim: (taskCode: string, title: string, rewardAmount: number) => void;
  onNavigateToReferrals?: () => void;
}

export const ReferralMilestonesGrid: React.FC<ReferralMilestonesGridProps> = ({
  tasks,
  claimingCode,
  onClaim,
  onNavigateToReferrals,
}) => {
  const { t, isDark } = useTheme();

  if (tasks.length === 0) return null;

  return (
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
            type="button"
            className="text-xs font-bold text-purple-500 hover:text-purple-600 dark:text-purple-400 dark:hover:text-purple-300 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>View Referrals</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Stepper Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {tasks.map((task) => {
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
                <TaskStatusButton
                  status={task.status}
                  taskCode={task.taskCode}
                  title={task.title}
                  rewardAmount={task.rewardAmount}
                  actionUrl={task.actionUrl}
                  isClaiming={isClaiming}
                  onClaim={onClaim}
                  fullWidth
                  currentProgress={task.currentProgress}
                  targetProgress={task.targetProgress}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
