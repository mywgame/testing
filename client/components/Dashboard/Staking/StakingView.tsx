/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Coins, Bell, CheckCircle2 } from 'lucide-react';
import { DashboardLayout } from '../Layout/DashboardLayout.tsx';
import { useTheme } from '../../../hooks/useTheme.ts';

interface StakingViewProps {
  onBack: () => void;
}

export const StakingView: React.FC<StakingViewProps> = ({ onBack }) => {
  const { t } = useTheme();
  const [isNotified, setIsNotified] = useState(false);

  return (
    <DashboardLayout
      title="Staking & Yield Vaults"
      description="Lock USDT & MetaFirm tokens for fixed-term durations to unlock passive compounding APY yield payouts."
      onBack={onBack}
    >
      <div className="w-full text-left" id="staking-view-container">
        {/* Main Staking & Yield Vaults Announcement Card */}
        <div
          id="staking-announcement-card"
          className={`relative overflow-hidden rounded-3xl p-6 sm:p-10 border shadow-2xl ${
            t.isDark
              ? 'bg-gradient-to-br from-navy-900 via-navy-950 to-indigo-950/50 border-white/10'
              : 'bg-gradient-to-br from-slate-900 via-navy-900 to-indigo-950 text-white border-slate-800'
          }`}
        >
          {/* Ambient radial lighting */}
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-5">
            {/* FEATURE LAUNCHING SOON badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold tracking-wider uppercase shadow-sm">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>FEATURE LAUNCHING SOON</span>
            </div>

            {/* Main Title */}
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display flex items-center gap-3">
              <Coins className="w-7 h-7 sm:w-8 sm:h-8 text-cyan-400 shrink-0" />
              <span>USDT Staking &amp; Yield Vaults</span>
            </h3>

            {/* Third-Party Security Audit Notice & Explanatory Text */}
            <div className="space-y-3 text-slate-300 leading-relaxed font-sans text-sm sm:text-base">
              <p>
                Our institutional-grade Staking Smart Contracts are currently undergoing a third-party security audit.
              </p>
              <p className="text-slate-400 text-xs sm:text-sm">
                Soon, you will be able to lock your idle balances and earn additional yield through MetaFirm&apos;s Staking &amp; Yield Vaults.
              </p>
            </div>

            {/* Notify Me on Launch CTA */}
            <div className="pt-3">
              <button
                id="btn-notify-staking"
                onClick={() => setIsNotified(true)}
                disabled={isNotified}
                className={`inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold tracking-wider uppercase transition-all shadow-lg ${
                  isNotified
                    ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 cursor-default'
                    : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-blue-900/25 active:scale-95 cursor-pointer'
                }`}
              >
                {isNotified ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Priority Access Registered</span>
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4" />
                    <span>Notify Me On Launch</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StakingView;
