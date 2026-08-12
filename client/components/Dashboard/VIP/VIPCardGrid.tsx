/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Crown, Lock, CheckCircle2, ChevronRight, Award, Shield, Users, Wallet, Sparkles, TrendingUp } from 'lucide-react';
import { VipMatrixTier, VipStatusData } from './types.ts';

interface VIPCardGridProps {
  currentVipTier: string;
  vipStatus: VipStatusData | null;
  walletBalance: number;
  vipMatrix: VipMatrixTier[];
  t: any; // theme object
}

// Color maps and icons for the tiers to feel bespoke
const CARD_THEMES: Record<string, { color: string; bg: string; border: string; glow: string; text: string }> = {
  VIP1: { color: '#94a3b8', bg: 'bg-slate-500/10 dark:bg-slate-400/5', border: 'border-slate-500/20', glow: 'shadow-slate-500/5', text: 'text-slate-400' },
  VIP2: { color: '#f59e0b', bg: 'bg-amber-500/10 dark:bg-amber-500/5', border: 'border-amber-500/20', glow: 'shadow-amber-500/5', text: 'text-amber-500' },
  VIP3: { color: '#38bdf8', bg: 'bg-cyan-500/10 dark:bg-cyan-500/5', border: 'border-cyan-500/20', glow: 'shadow-cyan-500/5', text: 'text-cyan-400' },
  VIP4: { color: '#a855f7', bg: 'bg-indigo-500/10 dark:bg-indigo-500/5', border: 'border-indigo-500/20', glow: 'shadow-indigo-500/5', text: 'text-indigo-400' },
  VIP5: { color: '#ec4899', bg: 'bg-pink-500/10 dark:bg-pink-500/5', border: 'border-pink-500/20', glow: 'shadow-pink-500/5', text: 'text-pink-400' },
  VIP6: { color: '#f43f5e', bg: 'bg-rose-500/10 dark:bg-rose-500/5', border: 'border-rose-500/20', glow: 'shadow-rose-500/5', text: 'text-rose-400' },
  VIP7: { color: '#14b8a6', bg: 'bg-teal-500/10 dark:bg-teal-500/5', border: 'border-teal-500/20', glow: 'shadow-teal-500/5', text: 'text-teal-400' },
  VIP8: { color: '#eab308', bg: 'bg-yellow-500/10 dark:bg-yellow-500/5', border: 'border-yellow-500/20', glow: 'shadow-yellow-500/5', text: 'text-yellow-400' },
};

export const VIPCardGrid: React.FC<VIPCardGridProps> = ({
  currentVipTier,
  vipStatus,
  walletBalance,
  vipMatrix,
  t,
}) => {
  const [selectedTier, setSelectedTier] = useState<string>(currentVipTier);

  const currentTierIndex = useMemo(() => {
    return vipMatrix.findIndex((item) => item.tier.toUpperCase() === currentVipTier.toUpperCase());
  }, [vipMatrix, currentVipTier]);

  // Map each tier with its status
  const processedTiers = useMemo(() => {
    return vipMatrix.map((item, index) => {
      let status: 'completed' | 'active' | 'locked' = 'locked';
      if (index < currentTierIndex) {
        status = 'completed';
      } else if (index === currentTierIndex) {
        status = 'active';
      }
      return {
        ...item,
        status,
        theme: CARD_THEMES[item.tier] || CARD_THEMES.VIP1,
      };
    });
  }, [vipMatrix, currentTierIndex]);

  const activeInspection = useMemo(() => {
    const tierData = vipMatrix.find((item) => item.tier.toUpperCase() === selectedTier.toUpperCase());
    if (!tierData) return null;

    const index = vipMatrix.findIndex((item) => item.tier.toUpperCase() === selectedTier.toUpperCase());
    let status: 'completed' | 'active' | 'locked' = 'locked';
    if (index < currentTierIndex) {
      status = 'completed';
    } else if (index === currentTierIndex) {
      status = 'active';
    }

    const conditions = [
      {
        label: 'Minimum Personal Funds',
        required: `${tierData.minBalance} USDT`,
        current: `${walletBalance.toFixed(2)} USDT`,
        met: walletBalance >= tierData.minBalance,
        icon: Wallet,
      },
      {
        label: 'Direct Level A Valid Referrals',
        required: `${tierData.levelA} Users`,
        current: `${vipStatus?.levelAValidCount ?? 0} Users`,
        met: (vipStatus?.levelAValidCount ?? 0) >= tierData.levelA,
        icon: Users,
      }
    ];

    if (tierData.levelBCD > 0) {
      conditions.push({
        label: 'Downline Level B+C+D Valid Members',
        required: `${tierData.levelBCD} Users`,
        current: `${vipStatus?.levelBcdValidCount ?? 0} Users`,
        met: (vipStatus?.levelBcdValidCount ?? 0) >= tierData.levelBCD,
        icon: Users,
      });
    }

    if (tierData.teamTotal > 0) {
      conditions.push({
        label: 'Total Active Team Partners',
        required: `${tierData.teamTotal} Users`,
        current: `${vipStatus?.teamTotalCount ?? 0} Users`,
        met: (vipStatus?.teamTotalCount ?? 0) >= tierData.teamTotal,
        icon: Shield,
      });
    }

    return {
      ...tierData,
      status,
      conditions,
      theme: CARD_THEMES[tierData.tier] || CARD_THEMES.VIP1,
    };
  }, [selectedTier, vipMatrix, currentTierIndex, walletBalance, vipStatus]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
      
      {/* 1. VIP Cards Grid */}
      <div className="xl:col-span-8 space-y-4">
        <h3 className={`text-xs font-semibold uppercase tracking-wider ${t.textMuted}`}>
          Elite Tier Progression Model
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {processedTiers.map((tier) => {
            const isSelected = selectedTier === tier.tier;
            return (
              <button
                key={tier.tier}
                onClick={() => setSelectedTier(tier.tier)}
                className={`text-left p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden focus:outline-none flex flex-col justify-between cursor-pointer h-36 ${
                  tier.status === 'active'
                    ? 'ring-2 ring-cyan-500 shadow-md shadow-cyan-500/10'
                    : isSelected
                    ? 'ring-1 ring-cyan-500/50'
                    : ''
                } ${tier.theme.bg} ${tier.theme.border} ${tier.theme.glow} hover:scale-[1.02]`}
              >
                {/* Visual state background patterns */}
                {tier.status === 'completed' && (
                  <div className="absolute right-0 top-0 translate-x-2 -translate-y-2 opacity-5">
                    <CheckCircle2 className="w-24 h-24 text-emerald-500" />
                  </div>
                )}

                {/* Card Top: Level Name & Badge */}
                <div className="flex justify-between items-start w-full">
                  <div>
                    <span className={`text-[10px] font-bold uppercase ${tier.theme.text}`}>
                      Tier Level
                    </span>
                    <h4 className={`text-2xl font-extrabold tracking-tight ${t.text} mt-0.5`}>
                      {tier.tier}
                    </h4>
                  </div>

                  {/* Top-Right Badge Status */}
                  <div className="shrink-0">
                    {tier.status === 'completed' ? (
                      <span className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 block" title="Completed">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </span>
                    ) : tier.status === 'active' ? (
                      <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-[8px] font-bold tracking-wider block">
                        ACTIVE
                      </span>
                    ) : (
                      <span className="p-1 rounded-full bg-black/20 dark:bg-white/5 text-gray-500 block" title="Locked">
                        <Lock className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Bottom: DPY and Action indicator */}
                <div className="w-full">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className={`text-[9px] ${t.textMuted}`}>Daily Yield (DPY)</p>
                      <p className={`text-sm font-bold ${tier.theme.text}`}>
                        {(tier.dpy * 100).toFixed(2)}%
                      </p>
                    </div>
                    
                    <span className="text-[10px] text-cyan-500/60 font-semibold flex items-center group-hover:translate-x-1 transition-transform">
                      Inspect <ChevronRight className="w-3 h-3 ml-0.5" />
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Interactive Inspection & Specification Panel */}
      <div className="xl:col-span-4">
        <AnimatePresence mode="wait">
          {activeInspection && (
            <motion.div
              key={activeInspection.tier}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className={`p-6 rounded-3xl border shadow-lg ${t.card} ${t.sep} space-y-6`}
            >
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-1.5">
                    <Award className={`w-5 h-5 ${activeInspection.theme.text}`} />
                    <span className={`text-xs font-semibold ${activeInspection.theme.text}`}>
                      Qualification Specifications
                    </span>
                  </div>
                  <h3 className={`text-xl font-bold tracking-tight ${t.text} mt-1`}>
                    {activeInspection.tier} Audit Matrix
                  </h3>
                </div>

                <div>
                  {activeInspection.status === 'completed' ? (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold tracking-wider border border-emerald-500/20">
                      COMPLETED
                    </span>
                  ) : activeInspection.status === 'active' ? (
                    <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] font-semibold tracking-wider border border-cyan-500/20">
                      CURRENT RANK
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-semibold tracking-wider border border-amber-500/20 flex items-center space-x-1">
                      <Lock className="w-3 h-3" />
                      <span>LOCKED</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Reward yield benefit */}
              <div className={`p-4 rounded-2xl border ${t.isDark ? 'bg-cyan-500/5 border-cyan-500/10' : 'bg-cyan-50/50 border-cyan-100'} flex items-center justify-between`}>
                <div className="space-y-0.5">
                  <span className={`text-[10px] font-semibold uppercase tracking-wider ${t.textMuted}`}>
                    Smart Yield Claim Rate
                  </span>
                  <p className={`text-xs ${t.textSub}`}>
                    Automated principal interest generated daily
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-cyan-400">
                    {(activeInspection.dpy * 100).toFixed(2)}%
                  </span>
                  <p className="text-[9px] text-cyan-500 font-bold">DPY RETURN</p>
                </div>
              </div>

              {/* Requirement Items Checklist */}
              <div className="space-y-3">
                <span className={`text-[10px] font-semibold uppercase tracking-widest ${t.textMuted} block`}>
                  Requirement Parameters Checklist
                </span>

                <div className="space-y-2.5">
                  {activeInspection.conditions.map((cond, i) => {
                    const CondIcon = cond.icon;
                    return (
                      <div
                        key={i}
                        className={`p-3.5 rounded-xl border flex items-center justify-between transition-colors ${
                          cond.met
                            ? 'bg-emerald-500/5 border-emerald-500/10'
                            : 'bg-black/5 dark:bg-white/5 border-transparent'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-xl ${
                            cond.met 
                              ? 'bg-emerald-500/10 text-emerald-400' 
                              : 'bg-black/10 dark:bg-white/5 text-gray-500'
                          }`}>
                            <CondIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className={`text-xs font-semibold ${t.text}`}>{cond.label}</p>
                            <div className="flex items-center space-x-2 mt-0.5">
                              <span className={`text-[10px] ${t.textMuted}`}>Required:</span>
                              <span className={`text-[10px] font-semibold ${t.textSub}`}>{cond.required}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right flex flex-col items-end">
                          <span className={`text-xs font-bold ${
                            cond.met ? 'text-emerald-500' : 'text-amber-500'
                          }`}>
                            {cond.current}
                          </span>
                          <span className="text-[9px] text-gray-400 font-medium">Current Status</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer status banner */}
              <div className="pt-2">
                {activeInspection.status !== 'locked' ? (
                  <div className="flex items-center space-x-2 text-emerald-500 text-xs font-semibold bg-emerald-500/10 px-4 py-3 rounded-xl border border-emerald-500/15">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>You meet all requirements for {activeInspection.tier}!</span>
                  </div>
                ) : (
                  <div className="flex items-start space-x-2.5 text-amber-500 text-xs font-semibold bg-amber-500/10 px-4 py-3 rounded-xl border border-amber-500/15">
                    <Lock className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      Requires additional funds or active downline referrals to unlock this tier automatically.
                    </span>
                  </div>
                )}
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};
