/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Users, TrendingUp, Sparkles, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface TeamStatsProps {
  totalMembers: number;
  totalValidCount: number;
  todaysTotalGeneration: string;
  levelACount: number;
  levelBCount: number;
  levelCCount: number;
  levelDCount: number;
  t: any; // Theme object from useTheme
}

export const TeamStats: React.FC<TeamStatsProps> = ({
  totalMembers,
  totalValidCount,
  todaysTotalGeneration,
  levelACount,
  levelBCount,
  levelCCount,
  levelDCount,
  t,
}) => {
  // Stagger animations config
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
    >
      {/* Total Active Downline Card */}
      <motion.div
        variants={itemVariants}
        className={`p-5 rounded-2xl border backdrop-blur-xl relative overflow-hidden transition-all duration-300 ${t.card} ${t.sep}`}
      >
        <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-cyan-500/5 blur-xl pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${t.textMuted}`}>
            Total Team Size
          </span>
          <div className="p-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className={`text-2xl font-mono font-extrabold tracking-tight ${t.text}`}>
            {totalMembers}
          </span>
          <span className={`text-[10px] font-semibold ${t.textSub}`}>Members</span>
        </div>
        <p className={`text-[10px] font-sans mt-2 ${t.textMuted}`}>
          Across Level A, B, C, and D networks.
        </p>
      </motion.div>

      {/* Verified / Valid Accounts Card */}
      <motion.div
        variants={itemVariants}
        className={`p-5 rounded-2xl border backdrop-blur-xl relative overflow-hidden transition-all duration-300 ${t.card} ${t.sep}`}
      >
        <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-indigo-500/5 blur-xl pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${t.textMuted}`}>
            Active VIP Status
          </span>
          <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className={`text-2xl font-mono font-extrabold tracking-tight ${t.text}`}>
            {totalValidCount}
          </span>
          <span className={`text-[10px] font-semibold ${t.textSub}`}>Verified</span>
        </div>
        <p className={`text-[10px] font-sans mt-2 ${t.textMuted}`}>
          Accounts meeting VIP compliance rules.
        </p>
      </motion.div>

      {/* Today's Estimated Referral Contribution Card */}
      <motion.div
        variants={itemVariants}
        className={`p-5 rounded-2xl border backdrop-blur-xl relative overflow-hidden transition-all duration-300 ${t.card} ${t.sep}`}
      >
        <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-emerald-500/5 blur-xl pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${t.textMuted}`}>
            Today's Team Generation
          </span>
          <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-mono font-extrabold tracking-tight text-emerald-400">
            {todaysTotalGeneration}
          </span>
          <span className="text-[10px] font-semibold text-emerald-500">Yield</span>
        </div>
        <p className={`text-[10px] font-sans mt-2 ${t.textMuted}`}>
          Estimated commissions accrued in the last 24 hours.
        </p>
      </motion.div>
    </motion.div>
  );
};
