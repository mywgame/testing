/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Crown, Sparkles, TrendingUp, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { VipMatrixTier, VipStatusData } from './types.ts';

interface VIPProgressProps {
  currentVipTier: string;
  vipStatus: VipStatusData | null;
  walletBalance: number;
  vipMatrix: VipMatrixTier[];
  t: any; // theme object
}

export const VIPProgress: React.FC<VIPProgressProps> = ({
  currentVipTier,
  vipStatus,
  walletBalance,
  vipMatrix,
  t,
}) => {
  // Find current and next tier configs
  const currentTierIndex = useMemo(() => {
    return vipMatrix.findIndex((item) => item.tier.toUpperCase() === currentVipTier.toUpperCase());
  }, [vipMatrix, currentVipTier]);

  const currentTierConfig = vipMatrix[currentTierIndex] || vipMatrix[0];
  const nextTierConfig = vipMatrix[currentTierIndex + 1] || null;

  // Current statistics
  const stats = useMemo(() => {
    return {
      balance: walletBalance,
      levelA: vipStatus?.levelAValidCount ?? 0,
      levelBCD: vipStatus?.levelBcdValidCount ?? 0,
      teamTotal: vipStatus?.teamTotalCount ?? 0,
    };
  }, [walletBalance, vipStatus]);

  // Calculate percentages for next level requirements
  const progressDetails = useMemo(() => {
    if (!nextTierConfig) return null;

    const balancePct = Math.min((stats.balance / nextTierConfig.minBalance) * 100, 100);
    const levelAPct = nextTierConfig.levelA > 0 
      ? Math.min((stats.levelA / nextTierConfig.levelA) * 100, 100) 
      : 100;
    const levelBCDPct = nextTierConfig.levelBCD > 0 
      ? Math.min((stats.levelBCD / nextTierConfig.levelBCD) * 100, 100) 
      : 100;
    const teamTotalPct = nextTierConfig.teamTotal > 0 
      ? Math.min((stats.teamTotal / nextTierConfig.teamTotal) * 100, 100) 
      : 100;

    // Overall progress is the average of active requirements
    const activeRequirements = [
      { current: stats.balance, req: nextTierConfig.minBalance, pct: balancePct },
      ...(nextTierConfig.levelA > 0 ? [{ current: stats.levelA, req: nextTierConfig.levelA, pct: levelAPct }] : []),
      ...(nextTierConfig.levelBCD > 0 ? [{ current: stats.levelBCD, req: nextTierConfig.levelBCD, pct: levelBCDPct }] : []),
      ...(nextTierConfig.teamTotal > 0 ? [{ current: stats.teamTotal, req: nextTierConfig.teamTotal, pct: teamTotalPct }] : []),
    ];

    const overallPct = activeRequirements.reduce((sum, item) => sum + item.pct, 0) / activeRequirements.length;

    return {
      balancePct,
      levelAPct,
      levelBCDPct,
      teamTotalPct,
      overallPct,
      requirements: activeRequirements,
    };
  }, [nextTierConfig, stats]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Current VIP Status Card (Sleek Fintech Card with glassmorphic shine) */}
      <div className={`lg:col-span-5 p-6 rounded-3xl border relative overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-xl ${
        t.isDark 
          ? 'bg-gradient-to-br from-slate-900/90 via-slate-950 to-cyan-950/20 border-cyan-500/15 text-white shadow-cyan-950/10' 
          : 'bg-gradient-to-br from-white via-slate-50 to-cyan-50/10 border-black/5 text-slate-900'
      }`}>
        {/* Hologram orbs */}
        <div className="absolute -right-12 -top-12 w-32 h-32 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-32 h-32 rounded-full bg-purple-500/5 blur-2xl pointer-events-none" />

        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <span className={`text-[10px] font-semibold uppercase tracking-widest ${t.textMuted}`}>
              MetaFirm VIP Elite Club
            </span>
            <div className={`px-2.5 py-1 rounded-full text-[10px] font-semibold flex items-center space-x-1 ${
              t.isDark ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-blue-50 text-blue-600 border border-blue-100'
            }`}>
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Rank Verified</span>
            </div>
          </div>

          {/* Large Rank Visualizer */}
          <div className="flex items-center space-x-4 mb-6">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border shadow-lg ${
              t.isDark ? 'bg-cyan-950/30 border-cyan-500/30' : 'bg-cyan-50 border-cyan-100'
            }`}>
              <Crown className="w-8 h-8 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-1">
                <span className={`text-3xl font-extrabold tracking-tight ${t.text}`}>
                  {currentVipTier}
                </span>
                <span className="text-xl">🏆</span>
              </div>
              <p className={`text-xs ${t.textMuted} font-sans`}>
                Daily Yield (DPY): <span className="font-bold text-cyan-400">{((currentTierConfig?.dpy ?? 0) * 100).toFixed(2)}%</span>
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Balance Indicator */}
        <div className={`mt-4 pt-4 border-t ${t.isDark ? 'border-cyan-500/10' : 'border-black/5'}`}>
          <div className="flex justify-between items-center text-xs">
            <span className={t.textMuted}>Qualified Portfolio Wallet</span>
            <span className={`font-bold ${t.text}`}>
              {stats.balance.toFixed(2)} USDT
            </span>
          </div>
          <div className="flex justify-between items-center text-[10px] mt-1">
            <span className={t.textMuted}>Active Team Partners</span>
            <span className={`font-medium ${t.textSub}`}>
              {stats.levelA} Direct (A) · {stats.levelBCD} Downline (B+C+D)
            </span>
          </div>
        </div>
      </div>

      {/* Progress towards Next Tier */}
      <div className={`lg:col-span-7 p-6 rounded-3xl border flex flex-col justify-between transition-all duration-300 shadow-md ${t.card} ${t.sep}`}>
        {nextTierConfig ? (
          <div className="space-y-4">
            {/* Header info */}
            <div className="flex justify-between items-center">
              <div>
                <h4 className={`text-xs font-semibold uppercase tracking-wider ${t.textMuted}`}>
                  Path to Next Elite Tier
                </h4>
                <p className={`text-sm font-bold ${t.text} flex items-center space-x-1.5 mt-0.5`}>
                  <span>Upgrade to</span>
                  <span className="font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded-md">{nextTierConfig.tier}</span>
                  <span className="text-xs text-gray-500">({(nextTierConfig.dpy * 100).toFixed(2)}% DPY)</span>
                </p>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-lg text-cyan-400">
                  {progressDetails ? Math.round(progressDetails.overallPct) : 0}%
                </span>
                <p className={`text-[10px] ${t.textMuted}`}>Progress Match</p>
              </div>
            </div>

            {/* Main level progression bar */}
            <div className="w-full bg-black/10 dark:bg-white/5 rounded-full h-2.5 overflow-hidden border border-black/5 dark:border-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressDetails?.overallPct ?? 0}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="bg-gradient-to-r from-cyan-400 to-purple-500 h-full rounded-full"
              />
            </div>

            {/* Individual Criteria Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              
              {/* Criteria 1: Wallet Balance */}
              <div className={`p-3 rounded-2xl border ${t.isDark ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-black/5'} flex flex-col justify-between`}>
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span className={`font-semibold ${t.textSub}`}>Required Funds</span>
                  <span className={`font-semibold text-[10px] ${stats.balance >= nextTierConfig.minBalance ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {Math.round(progressDetails?.balancePct ?? 0)}%
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className={`text-[10px] font-bold ${t.text}`}>
                    {stats.balance.toFixed(0)} <span className="text-[8px] text-gray-500">/ {nextTierConfig.minBalance}</span>
                  </span>
                  <span className="text-[9px] font-medium text-gray-400">USDT</span>
                </div>
              </div>

              {/* Criteria 2: Level A (Direct) */}
              <div className={`p-3 rounded-2xl border ${t.isDark ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-black/5'} flex flex-col justify-between`}>
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span className={`font-semibold ${t.textSub}`}>Direct VIPs (Level A)</span>
                  <span className={`font-semibold text-[10px] ${stats.levelA >= nextTierConfig.levelA ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {Math.round(progressDetails?.levelAPct ?? 0)}%
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className={`text-[10px] font-bold ${t.text}`}>
                    {stats.levelA} <span className="text-[8px] text-gray-500">/ {nextTierConfig.levelA}</span>
                  </span>
                  <span className="text-[9px] font-medium text-gray-400">Users</span>
                </div>
              </div>

              {/* Criteria 3: Level B+C+D (Downline) */}
              {nextTierConfig.levelBCD > 0 && (
                <div className={`p-3 rounded-2xl border ${t.isDark ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-black/5'} flex flex-col justify-between`}>
                  <div className="flex items-center justify-between text-[11px] mb-1.5">
                    <span className={`font-semibold ${t.textSub}`}>Subteam (B+C+D)</span>
                    <span className={`font-semibold text-[10px] ${stats.levelBCD >= nextTierConfig.levelBCD ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {Math.round(progressDetails?.levelBCDPct ?? 0)}%
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className={`text-[10px] font-bold ${t.text}`}>
                      {stats.levelBCD} <span className="text-[8px] text-gray-500">/ {nextTierConfig.levelBCD}</span>
                    </span>
                    <span className="text-[9px] font-medium text-gray-400">Users</span>
                  </div>
                </div>
              )}

              {/* Criteria 4: Team Total */}
              {nextTierConfig.teamTotal > 0 && (
                <div className={`p-3 rounded-2xl border ${t.isDark ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-black/5'} flex flex-col justify-between`}>
                  <div className="flex items-center justify-between text-[11px] mb-1.5">
                    <span className={`font-semibold ${t.textSub}`}>Team Size Requirement</span>
                    <span className={`font-semibold text-[10px] ${stats.teamTotal >= nextTierConfig.teamTotal ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {Math.round(progressDetails?.teamTotalPct ?? 0)}%
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className={`text-[10px] font-bold ${t.text}`}>
                      {stats.teamTotal} <span className="text-[8px] text-gray-500">/ {nextTierConfig.teamTotal}</span>
                    </span>
                    <span className="text-[9px] font-medium text-gray-400">Users</span>
                  </div>
                </div>
              )}

            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-2 h-full">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400">
              <Sparkles className="w-6 h-6 animate-spin" />
            </div>
            <h4 className={`text-sm font-bold ${t.text}`}>Peak Achievement Unlocked</h4>
            <p className={`text-xs ${t.textMuted} max-w-sm`}>
              Congratulations! You have reached the absolute zenith of the VIP Club at **VIP8**. You are currently enjoying maximum benefits and 2.50% Daily Yield.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
