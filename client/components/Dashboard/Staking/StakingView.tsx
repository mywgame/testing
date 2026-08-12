/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Coins, Sparkles, Clock, Lock, TrendingUp, ShieldCheck, Bell, CheckCircle2 } from 'lucide-react';
import { DashboardLayout } from '../Layout/DashboardLayout.tsx';
import { useTheme } from '../../../hooks/useTheme.ts';

interface StakingViewProps {
  onBack: () => void;
}

export const StakingView: React.FC<StakingViewProps> = ({ onBack }) => {
  const { t } = useTheme();
  const [isNotified, setIsNotified] = useState(false);

  const stakingPools = [
    {
      title: 'Flexible Liquidity Vault',
      apy: '8.5%',
      period: 'Flexible / No Lock',
      minStake: '50 USDT',
      rewardToken: 'USDT',
      riskLevel: 'Conservative',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    {
      title: '15-Day High-Yield Lock',
      apy: '14.2%',
      period: '15 Days',
      minStake: '100 USDT',
      rewardToken: 'USDT',
      riskLevel: 'Moderate',
      badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    },
    {
      title: '30-Day Prime Staking',
      apy: '19.8%',
      period: '30 Days',
      minStake: '250 USDT',
      rewardToken: 'USDT + MFM',
      riskLevel: 'High Yield',
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    },
    {
      title: '90-Day VIP Institutional Pool',
      apy: '28.5%',
      period: '90 Days',
      minStake: '1,000 USDT',
      rewardToken: 'USDT + MFM Bonus',
      riskLevel: 'VIP Tier Exclusive',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },
  ];

  return (
    <DashboardLayout
      title="Staking & Yield Vaults"
      description="Lock USDT & MetaFirm tokens for fixed term durations to unlock passive compounding APY yield payouts."
      onBack={onBack}
    >
      <div className="space-y-6 w-full text-left" id="staking-view-container">
        
        {/* Coming Soon Hero Banner */}
        <div className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 border shadow-xl ${t.isDark ? 'bg-gradient-to-br from-navy-900 via-navy-950 to-purple-950/40 border-white/10' : 'bg-gradient-to-br from-slate-900 via-navy-900 to-indigo-950 text-white border-slate-800'}`}>
          {/* Ambient radial lighting */}
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold tracking-wider uppercase shadow-sm">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>FEATURE LAUNCHING SOON</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display flex items-center gap-3">
              <Coins className="w-8 h-8 text-cyan-400" />
              <span>USDT Staking & Yield Vaults</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              Our institutional grade Staking Smart Contracts are currently undergoing third-party security audit. Soon you will be able to lock your idle balances to earn up to <strong className="text-cyan-300">28.5% APY</strong> credited daily directly to your wallet.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={() => setIsNotified(true)}
                disabled={isNotified}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold tracking-wider uppercase transition-all shadow-lg ${
                  isNotified
                    ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/20 active:scale-95 cursor-pointer'
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

              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Audited Smart Contracts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Vault Tiers Preview Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className={`text-base sm:text-lg font-bold flex items-center gap-2 ${t.text}`}>
              <TrendingUp className="w-5 h-5 text-cyan-500" />
              <span>Upcoming Staking Pools</span>
            </h3>
            <span className="text-xs font-mono text-amber-400 font-semibold bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
              Preview Mode
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stakingPools.map((pool, idx) => (
              <div
                key={idx}
                className={`relative rounded-2xl p-5 border transition-all ${t.card} hover:border-cyan-500/30 overflow-hidden group`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${pool.badgeColor}`}>
                      {pool.riskLevel}
                    </span>
                    <h4 className={`text-base font-bold mt-2 ${t.text}`}>{pool.title}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 font-mono block">Est. APY</span>
                    <span className="text-xl font-extrabold text-cyan-400 font-mono">{pool.apy}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 py-3 my-2 border-y border-white/5 text-xs">
                  <div>
                    <span className={`block text-[10px] ${t.textMuted}`}>Lock Term</span>
                    <span className={`font-mono font-semibold ${t.text}`}>{pool.period}</span>
                  </div>
                  <div>
                    <span className={`block text-[10px] ${t.textMuted}`}>Min Stake</span>
                    <span className={`font-mono font-semibold ${t.text}`}>{pool.minStake}</span>
                  </div>
                  <div>
                    <span className={`block text-[10px] ${t.textMuted}`}>Payout Token</span>
                    <span className={`font-mono font-semibold ${t.text}`}>{pool.rewardToken}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-amber-400/90 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Coming Soon</span>
                  </div>
                  <button
                    disabled
                    className="px-4 py-1.5 rounded-xl text-xs font-bold bg-white/5 border border-white/10 text-slate-400 cursor-not-allowed flex items-center gap-1.5 opacity-70"
                  >
                    <Lock className="w-3 h-3" />
                    <span>Locked</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default StakingView;
