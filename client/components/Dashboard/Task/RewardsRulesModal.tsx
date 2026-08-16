/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, X, CheckCircle2, AlertCircle, DollarSign, Users } from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme.ts';

interface RewardsRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RewardsRulesModal: React.FC<RewardsRulesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { isDark } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-lg rounded-3xl p-6 sm:p-7 text-left border shadow-2xl transition-all max-h-[90vh] overflow-y-auto ${
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

        {/* Title */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold font-display">
              Tasks & Rewards Rules
            </h3>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Program guidelines and eligibility requirements
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs leading-relaxed">
          {/* Rule 1 */}
          <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-white/[0.03] border-white/10' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-400 mb-1">
              <DollarSign className="w-4 h-4" />
              <span>Instant Balance Distribution</span>
            </div>
            <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>
              All cash rewards are in USDT and credited directly to your primary account balance immediately upon claiming.
            </p>
          </div>

          {/* Rule 2 */}
          <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-white/[0.03] border-white/10' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center gap-2 font-bold text-sm text-blue-400 mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Real Deposits Only</span>
            </div>
            <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>
              Only real on-chain cryptocurrency deposits count toward Deposit Milestones and verified referral qualifications. Trial Fund balances do not qualify as real deposits.
            </p>
          </div>

          {/* Rule 3 */}
          <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-white/[0.03] border-white/10' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center gap-2 font-bold text-sm text-amber-400 mb-1">
              <Users className="w-4 h-4" />
              <span>Verified Referral Qualifications</span>
            </div>
            <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>
              A referral is counted as &quot;Verified&quot; only when the referred user completes a minimum real deposit of $50 USDT.
            </p>
          </div>

          {/* Rule 4 */}
          <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-white/[0.03] border-white/10' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center gap-2 font-bold text-sm text-purple-400 mb-1">
              <AlertCircle className="w-4 h-4" />
              <span>Fair Play & Anti-Fraud Policy</span>
            </div>
            <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>
              Each user is eligible to claim milestone rewards once per unique account, IP address, and identity. Multi-account farming or fraudulent activity will result in immediate disqualification.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            type="button"
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 cursor-pointer transition-all shadow-md shadow-purple-600/30"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
