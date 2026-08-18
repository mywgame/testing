/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Gift, ShieldCheck, Send, Users, Info } from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme.ts';
import { TaskItemDTO } from '../../../services/taskService.ts';
import { TaskStatusButton } from './TaskStatusButton.tsx';
import { ReferralDetailsModal } from './ReferralDetailsModal.tsx';

interface ActivityBonusListProps {
  tasks: TaskItemDTO[];
  claimingCode: string | null;
  onClaim: (taskCode: string, title: string, rewardAmount: number) => void;
  onNavigate?: (tab: string) => void;
}

export const ActivityBonusList: React.FC<ActivityBonusListProps> = ({
  tasks,
  claimingCode,
  onClaim,
  onNavigate,
}) => {
  const { t, isDark } = useTheme();
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);

  if (tasks.length === 0) return null;

  const referralTask = tasks.find((t) => t.taskCode === 'REFERRAL_REGISTRATION_SINGLE');
  const referralList = referralTask?.referralDetails || [];
  const unclaimedRefsCount = referralList.filter((r) => !r.isClaimed).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
        <h3 className={`text-base font-bold font-display ${t.text}`}>Activity Bonus</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {tasks.map((task) => {
          const isClaimed = task.status === 'CLAIMED';
          const isCompleted = task.status === 'COMPLETED';
          const isClaiming = claimingCode === task.taskCode;
          const isReferralTask = task.taskCode === 'REFERRAL_REGISTRATION_SINGLE';

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
                  <div className="flex items-center gap-2">
                    <h4 className={`text-sm font-bold leading-snug ${t.text}`}>
                      {task.title}
                    </h4>
                    {isReferralTask && (
                      <button
                        id="btn-open-referral-breakdown"
                        onClick={() => setIsReferralModalOpen(true)}
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-mono font-semibold transition-all border ${
                          isDark
                            ? 'bg-white/5 border-white/10 hover:bg-purple-500/20 hover:border-purple-500/30 text-purple-300'
                            : 'bg-slate-100 border-slate-200 hover:bg-purple-50 hover:border-purple-200 text-purple-700'
                        }`}
                        title="View referred users breakdown"
                      >
                        <Info className="w-3 h-3" />
                        <span>Breakdown</span>
                      </button>
                    )}
                  </div>
                  <p className={`text-xs leading-relaxed ${t.textMuted}`}>
                    {task.description}
                  </p>
                  {isReferralTask && task.referralDetails && task.referralDetails.length > 0 && (
                    <div className="pt-0.5">
                      <button
                        onClick={() => setIsReferralModalOpen(true)}
                        className={`text-[11px] font-medium underline underline-offset-2 hover:opacity-80 transition-opacity ${
                          isDark ? 'text-purple-400' : 'text-purple-600'
                        }`}
                      >
                        {task.referralDetails.length} user{task.referralDetails.length === 1 ? '' : 's'} registered ({task.referralDetails.filter((r) => r.isClaimed).length} claimed) • View details
                      </button>
                    </div>
                  )}
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
                  <TaskStatusButton
                    status={task.status}
                    taskCode={task.taskCode}
                    title={task.title}
                    rewardAmount={task.rewardAmount}
                    actionUrl={task.actionUrl}
                    isClaiming={isClaiming}
                    onClaim={onClaim}
                    onNavigate={onNavigate}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Referral Aggregated Details Dialogue Box */}
      {referralTask && (
        <ReferralDetailsModal
          isOpen={isReferralModalOpen}
          onClose={() => setIsReferralModalOpen(false)}
          referrals={referralList}
          unitReward={referralTask.rewardPerUnit || 0.1}
          unclaimedCount={unclaimedRefsCount}
          isClaiming={claimingCode === referralTask.taskCode}
          onClaim={() => {
            if (referralTask.status === 'COMPLETED') {
              onClaim(referralTask.taskCode, referralTask.title, referralTask.rewardAmount);
            }
          }}
        />
      )}
    </div>
  );
};
