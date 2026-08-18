/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Gift, Clock, ShieldCheck, ArrowRight, X } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme.ts';
import { TaskItemDTO } from '../../services/taskService.ts';

export interface WelcomeTrialFundModalProps {
  isOpen: boolean;
  trialTask: TaskItemDTO;
  isClaiming: boolean;
  onClaim: () => Promise<boolean>;
  onClose: () => void;
  onGoToTasks: () => void;
}

export const WelcomeTrialFundModal: React.FC<WelcomeTrialFundModalProps> = ({
  isOpen,
  trialTask,
  isClaiming,
  onClaim,
  onClose,
  onGoToTasks,
}) => {
  const { isDark } = useTheme();
  const [hasActivated, setHasActivated] = useState(false);

  if (!isOpen) return null;

  const rewardAmount = trialTask.rewardAmount || 100;

  const handleActivateClick = async () => {
    const success = await onClaim();
    if (success) {
      setHasActivated(true);
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6"
        id="welcome-trial-fund-modal"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
          aria-hidden="true"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className={`w-full max-w-md border rounded-[32px] p-6 sm:p-8 relative z-10 overflow-hidden text-center shadow-2xl transition-all ${
            isDark
              ? 'bg-[#10142e]/95 border-purple-500/30 text-white shadow-purple-950/60'
              : 'bg-white border-purple-200 text-slate-900 shadow-purple-900/15'
          }`}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            type="button"
            className={`absolute top-5 right-5 p-2 rounded-full transition-colors cursor-pointer ${
              isDark
                ? 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900'
            }`}
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Ambient Glow & Icon */}
          <div className="relative mx-auto w-20 h-20 mb-4 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500/20 via-purple-500/20 to-cyan-500/20 border border-emerald-400/40 flex items-center justify-center relative shadow-inner">
              <Gift className="w-9 h-9 text-emerald-400" />
            </div>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[11px] font-mono font-bold tracking-wider uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome Gift</span>
          </div>

          {/* Title & Subtitle */}
          <h3 className="text-xl sm:text-2xl font-bold font-display tracking-tight">
            {hasActivated ? 'Trial Fund Activated!' : 'Welcome to MetaFirm!'}
          </h3>

          <p className={`text-xs sm:text-sm mt-1.5 mb-4 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            {hasActivated
              ? 'Your Trial Fund registration reward has been acknowledged. Your trial duration countdown is now active.'
              : 'As a new member gift, your account has been credited with a $100 Trial Fund to jumpstart your earnings.'}
          </p>

          {/* Gift Display Card */}
          <div
            className={`p-4 rounded-2xl border my-4 text-center transition-all ${
              isDark
                ? 'bg-purple-950/30 border-purple-500/30'
                : 'bg-purple-50/70 border-purple-200'
            }`}
          >
            <span className="text-[10px] font-mono uppercase tracking-wider block opacity-75 font-semibold">
              New Member Reward
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-400 my-1">
              +${rewardAmount}{' '}
              <span className="text-xs font-sans font-bold text-slate-300">Trial Fund</span>
            </div>
            <p className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Risk-free trial balance automatically granted upon registration.
            </p>
          </div>

          {/* Important Rules / Expiry Note */}
          <div
            className={`p-3 rounded-xl border text-left mb-5 space-y-1 text-xs ${
              isDark
                ? 'bg-white/[0.03] border-white/10 text-slate-300'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-purple-400">
              <Clock className="w-3.5 h-3.5" />
              <span>3-Day Trial Activation</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Activating your welcome gift confirms your trial registration and activates the 3-day trial countdown.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5">
            {!hasActivated ? (
              <button
                type="button"
                onClick={handleActivateClick}
                disabled={isClaiming}
                className="w-full py-3.5 px-6 rounded-2xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-600 hover:opacity-95 shadow-lg shadow-purple-600/30 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {isClaiming ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Activating Gift...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Activate Trial Fund Gift</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={onGoToTasks}
                className="w-full py-3.5 px-6 rounded-2xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-600/30 active:scale-[0.98] transition-all cursor-pointer inline-flex items-center justify-center gap-2"
              >
                <span>Go to Tasks & Rewards</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {!hasActivated && (
              <button
                type="button"
                onClick={onGoToTasks}
                className={`w-full py-2.5 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
                  isDark
                    ? 'text-slate-400 hover:text-white hover:bg-white/5'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                View Tasks & Rewards Directly
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WelcomeTrialFundModal;
