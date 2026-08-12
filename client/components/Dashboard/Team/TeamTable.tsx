/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User, Coins, Search, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';
import { TeamMember } from './types.ts';

interface TeamTableProps {
  members: TeamMember[];
  levelLabel: string;
  t: any; // Theme object from useTheme
}

const VIP_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  VIP1: { label: 'VIP1', color: '#94a3b8', bg: 'bg-slate-400/10 text-slate-400 border-slate-400/20', icon: '🥈' },
  VIP2: { label: 'VIP2', color: '#f59e0b', bg: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: '🥇' },
  VIP3: { label: 'VIP3', color: '#38bdf8', bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20', icon: '💎' },
  VIP4: { label: 'VIP4', color: '#a855f7', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20', icon: '👑' },
  VIP5: { label: 'VIP5', color: '#ec4899', bg: 'bg-pink-500/10 text-pink-400 border-pink-500/20', icon: '🌟' },
  VIP6: { label: 'VIP6', color: '#f43f5e', bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20', icon: '⚡' },
  VIP7: { label: 'VIP7', color: '#10b981', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: '🔥' },
  VIP8: { label: 'VIP8', color: '#3b82f6', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: '🚀' },
};

export const TeamTable: React.FC<TeamTableProps> = ({ members, levelLabel, t }) => {
  // Animation configs
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 6 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 350, damping: 28 } },
  };

  return (
    <div className="w-full rounded-2xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/1 overflow-hidden">
      {/* Scrollable table ledger container - optimized for no horizontal scrollbars on modern devices */}
      <div className="w-full overflow-x-auto no-scrollbar">
        <div className="min-w-[340px] xs:min-w-[420px] sm:min-w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${t.sep} ${t.isDark ? 'bg-white/1' : 'bg-black/1'}`}>
                <th className={`py-4 px-3 sm:px-6 font-bold font-display text-[11px] tracking-wider uppercase ${t.textMuted} w-[50%] sm:w-1/2`}>
                  Username / Identity
                </th>
                <th className={`py-4 px-3 sm:px-6 font-bold font-display text-[11px] tracking-wider uppercase ${t.textMuted} w-[25%] sm:w-1/4`}>
                  VIP Rank
                </th>
                <th className={`py-4 px-3 sm:px-6 font-bold font-display text-[11px] tracking-wider uppercase ${t.textMuted} w-[25%] sm:w-1/4 text-right`}>
                  Today's Contribution
                </th>
              </tr>
            </thead>
            
            <motion.tbody
              variants={container}
              initial="hidden"
              animate="show"
              className={`divide-y ${t.sep}`}
            >
              {members.length === 0 ? (
                <motion.tr variants={item}>
                  <td colSpan={3} className={`py-16 text-center text-xs sm:text-sm font-sans ${t.textMuted}`}>
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="p-3 bg-white/5 border border-white/10 rounded-full text-gray-400">
                        <Search className="w-5 h-5" />
                      </div>
                      <p className="font-bold">No members found</p>
                      <p className="text-xs text-gray-500 max-w-xs px-4">
                        There are no active members recorded in {levelLabel} yet.
                      </p>
                    </div>
                  </td>
                </motion.tr>
              ) : (
                members.map((member, index) => {
                  const vip = VIP_CONFIG[member.vipRank] || VIP_CONFIG['VIP1'];
                  const amountValue = parseFloat(member.todaysIncome.replace(/[^0-9.-]/g, ''));
                  const isZero = amountValue === 0;

                  return (
                    <motion.tr
                      key={`${member.username}-${index}`}
                      variants={item}
                      className="hover:bg-white/3 dark:hover:bg-white/2 transition-colors duration-150 group"
                    >
                      {/* Column 1: Secure Username with clean placeholder avatar */}
                      <td className="py-3.5 px-3 sm:px-6">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border flex items-center justify-center shrink-0 ${
                            t.isDark ? 'bg-white/5 border-white/10 text-gray-300' : 'bg-gray-100 border-black/5 text-gray-600'
                          }`}>
                            <span className="text-[10px] sm:text-xs font-mono font-bold uppercase">
                              {member.username.substring(0, 2)}
                            </span>
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className={`font-mono font-bold text-xs sm:text-sm truncate ${t.text}`}>
                              {member.username}
                            </span>
                            <span className={`text-[10px] ${t.textMuted}`}>
                              Partner Active
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: VIP Rank */}
                      <td className="py-3.5 px-3 sm:px-6">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold border ${vip.bg}`}>
                          <span>{vip.icon}</span>
                          <span className="font-mono tracking-tight">{vip.label}</span>
                        </span>
                      </td>

                      {/* Column 3: Today's Income generated (Contribution) */}
                      <td className="py-3.5 px-3 sm:px-6 text-right">
                        <div className="flex flex-col items-end">
                          <span className={`font-mono font-extrabold text-xs sm:text-sm ${
                            isZero ? t.textSub : 'text-emerald-500'
                          }`}>
                            {member.todaysIncome}
                          </span>
                          <span className={`text-[9px] font-medium font-sans ${t.textMuted} tracking-tight`}>
                            TODAY
                          </span>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </motion.tbody>
          </table>
        </div>
      </div>

      {/* Audit warning / compliance rule at the bottom of the table */}
      <div className={`p-3.5 bg-black/10 dark:bg-black/20 border-t ${t.sep} flex items-center justify-center space-x-2 text-[10px] font-mono ${t.textMuted}`}>
        <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        <span className="text-center">Aml/Kyc verification status is evaluated every 24h at UTC Midnight.</span>
      </div>
    </div>
  );
};
