/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DollarSign } from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme.ts';
import { TaskItemDTO } from '../../../services/taskService.ts';
import { TaskStatusButton } from './TaskStatusButton.tsx';

interface DepositMilestonesListProps {
  tasks: TaskItemDTO[];
  claimingCode: string | null;
  onClaim: (taskCode: string, title: string, rewardAmount: number) => void;
}

export const DepositMilestonesList: React.FC<DepositMilestonesListProps> = ({
  tasks,
  claimingCode,
  onClaim,
}) => {
  const { t, isDark } = useTheme();

  if (tasks.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
        <h3 className={`text-base font-bold font-display ${t.text}`}>Deposit Milestones</h3>
      </div>

      <div className="space-y-3.5">
        {tasks.map((task) => {
          const isClaimed = task.status === 'CLAIMED';
          const isCompleted = task.status === 'COMPLETED';
          const isClaiming = claimingCode === task.taskCode;
          const progressPercent = Math.min(
            100,
            Math.round((task.currentProgress / (task.targetProgress || 1)) * 100)
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
                    <TaskStatusButton
                      status={task.status}
                      taskCode={task.taskCode}
                      title={task.title}
                      rewardAmount={task.rewardAmount}
                      actionUrl={task.actionUrl}
                      isClaiming={isClaiming}
                      onClaim={onClaim}
                    />
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
  );
};
