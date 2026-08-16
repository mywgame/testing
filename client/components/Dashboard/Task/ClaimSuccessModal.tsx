/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, CheckCircle, X } from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme.ts';

interface ClaimSuccessModalProps {
  isOpen: boolean;
  taskTitle: string;
  rewardAmount: number;
  rewardType?: 'CASH' | 'TRIAL_FUND' | 'BONUS';
  onClose: () => void;
}

export const ClaimSuccessModal: React.FC<ClaimSuccessModalProps> = ({
  isOpen,
  taskTitle,
  rewardAmount,
  rewardType = 'CASH',
  onClose,
}) => {
  const { isDark } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-sm rounded-3xl p-6 sm:p-7 text-center border shadow-2xl transition-all ${
          isDark
            ? 'bg-[#13162b] border-purple-500/30 text-white shadow-purple-950/60'
            : 'bg-white border-purple-200 text-slate-900 shadow-purple-900/20'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className={`absolute top-4 right-4 p-2 rounded-xl transition-colors cursor-pointer ${
            isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Ambient Top Glow */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-600 to-emerald-400 mx-auto flex items-center justify-center p-1 shadow-lg shadow-purple-600/30">
          <div className="w-full h-full rounded-full bg-[#13162b] flex items-center justify-center">
            <Sparkles className="w-9 h-9 text-amber-300 animate-bounce" />
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Reward Claimed</span>
          </span>

          <h3 className="text-xl font-extrabold font-display">
            Congratulations!
          </h3>

          <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            You have successfully completed and claimed your reward for:
          </p>
          <p className="text-sm font-bold text-purple-400 dark:text-purple-300">
            {taskTitle}
          </p>
        </div>

        {/* Reward Amount Badge */}
        <div
          className={`my-5 py-3.5 px-4 rounded-2xl border ${
            isDark
              ? 'bg-purple-950/40 border-purple-500/30 text-white'
              : 'bg-purple-50 border-purple-200 text-purple-950'
          }`}
        >
          <span className="text-[10px] font-mono uppercase tracking-wider block opacity-75 font-semibold">
            Credited Amount
          </span>
          <span className="text-3xl font-extrabold font-mono text-emerald-400 block mt-0.5">
            +${rewardAmount < 1 ? rewardAmount.toFixed(2) : rewardAmount}{' '}
            <span className="text-xs font-sans font-bold">
              {rewardType === 'TRIAL_FUND' ? 'Trial Fund' : 'USDT'}
            </span>
          </span>
        </div>

        <button
          onClick={onClose}
          type="button"
          className="w-full py-3 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-600/30 active:scale-95 cursor-pointer transition-all"
        >
          Done
        </button>
      </div>
    </div>
  );
};
