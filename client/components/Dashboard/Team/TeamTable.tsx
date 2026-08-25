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
  isLoading?: boolean;
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

const VIP_AVATAR_THEME: Record<string, { dark: string; light: string }> = {
  VIP1: { dark: 'bg-slate-800/90 border-slate-700/80 text-cyan-300', light: 'bg-slate-100 border-slate-300 text-cyan-700' },
  VIP2: { dark: 'bg-slate-800/90 border-amber-500/40 text-amber-300', light: 'bg-amber-50 border-amber-300 text-amber-700' },
  VIP3: { dark: 'bg-slate-800/90 border-sky-500/40 text-sky-300', light: 'bg-sky-50 border-sky-300 text-sky-700' },
  VIP4: { dark: 'bg-slate-800/90 border-purple-500/40 text-purple-300', light: 'bg-purple-50 border-purple-300 text-purple-700' },
  VIP5: { dark: 'bg-slate-800/90 border-pink-500/40 text-pink-300', light: 'bg-pink-50 border-pink-300 text-pink-700' },
  VIP6: { dark: 'bg-slate-800/90 border-rose-500/40 text-rose-300', light: 'bg-rose-50 border-rose-300 text-rose-700' },
  VIP7: { dark: 'bg-slate-800/90 border-emerald-500/40 text-emerald-300', light: 'bg-emerald-50 border-emerald-300 text-emerald-700' },
  VIP8: { dark: 'bg-slate-800/90 border-blue-500/40 text-blue-300', light: 'bg-blue-50 border-blue-300 text-blue-700' },
};

export const TeamTable: React.FC<TeamTableProps> = ({ members, levelLabel, isLoading = false, t }) => {
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
      {/* 100% Responsive table ledger container - fits natively on mobile without horizontal scrolling */}
      <div className="w-full overflow-hidden">
        <table className="w-full table-fixed text-left border-collapse">
          <thead>
            <tr className={`border-b ${t.sep} ${t.isDark ? 'bg-white/3' : 'bg-black/3'}`}>
              <th className={`py-2.5 sm:py-3 pl-3 sm:pl-5 pr-1.5 sm:pr-3 font-extrabold font-display text-[10px] sm:text-xs tracking-wider uppercase ${t.isDark ? 'text-slate-300' : 'text-slate-700'} w-[38%] sm:w-[40%]`}>
                <span className="pl-[2.375rem] sm:pl-[2.75rem] block truncate">
                  User
                </span>
              </th>
              <th className={`py-2.5 sm:py-3 px-1 sm:px-3 font-extrabold font-display text-[9px] sm:text-xs tracking-tight uppercase ${t.isDark ? 'text-slate-300' : 'text-slate-700'} w-[30%] text-right`}>
                <span className="hidden sm:inline">Total Contribution</span>
                <span className="sm:hidden block truncate">Total</span>
              </th>
              <th className={`py-2.5 sm:py-3 pl-1 sm:pl-3 pr-3 sm:pr-5 font-extrabold font-display text-[9px] sm:text-xs tracking-tight uppercase ${t.isDark ? 'text-slate-300' : 'text-slate-700'} w-[32%] sm:w-[30%] text-right`}>
                <span className="hidden sm:inline">Today's Contribution</span>
                <span className="sm:hidden block truncate">Today</span>
              </th>
            </tr>
          </thead>
          
          <motion.tbody
            key={`${levelLabel}-${members.length}-${isLoading}`}
            variants={container}
            initial="hidden"
            animate="show"
            className={`divide-y ${t.sep}`}
          >
            {isLoading ? (
              // Loading skeleton placeholder rows
              [...Array(4)].map((_, i) => (
                <motion.tr key={`skeleton-${i}`} variants={item} className="animate-pulse">
                  <td className="py-2.5 sm:py-3 pl-3 sm:pl-5 pr-2 sm:pr-3">
                    <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
                      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full shrink-0 ${t.isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className={`h-3.5 w-16 sm:w-24 rounded ${t.isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
                        <div className={`h-2.5 w-12 sm:w-16 rounded ${t.isDark ? 'bg-white/5' : 'bg-gray-100'}`} />
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 sm:py-3 px-1.5 sm:px-3 text-right">
                    <div className={`h-3.5 w-12 sm:w-16 ml-auto rounded ${t.isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
                  </td>
                  <td className="py-2.5 sm:py-3 pl-1.5 sm:pl-3 pr-3 sm:pr-5 text-right">
                    <div className="flex flex-col items-end space-y-1">
                      <div className={`h-3.5 w-12 sm:w-16 rounded ${t.isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
                      <div className={`h-2 w-10 rounded ${t.isDark ? 'bg-white/5' : 'bg-gray-100'}`} />
                    </div>
                  </td>
                </motion.tr>
              ))
            ) : members.length === 0 ? (
              <motion.tr variants={item}>
                <td colSpan={3} className={`py-12 sm:py-14 text-center text-xs sm:text-sm font-sans ${t.textMuted}`}>
                  <div className="flex flex-col items-center justify-center space-y-2 px-4">
                    <div className="p-3 bg-white/5 border border-white/10 rounded-full text-gray-400">
                      <Search className="w-5 h-5" />
                    </div>
                    <p className="font-bold text-sm">No members found</p>
                    <p className="text-xs text-gray-500 max-w-xs">
                      There are no active members recorded in {levelLabel} yet.
                    </p>
                  </div>
                </td>
              </motion.tr>
            ) : (
              members.map((member, index) => {
                const vip = VIP_CONFIG[member.vipRank] || VIP_CONFIG['VIP1'];
                const avatarTheme = VIP_AVATAR_THEME[member.vipRank] || VIP_AVATAR_THEME['VIP1'];
                const amountValue = parseFloat(member.todaysIncome.replace(/[^0-9.-]/g, '')) || 0;
                const hasContribution = amountValue >= 0.01;

                return (
                  <motion.tr
                    key={`${member.username}-${index}`}
                    variants={item}
                    className="hover:bg-white/4 dark:hover:bg-white/3 transition-colors duration-150 group"
                  >
                    {/* Column 1: Secure Username with VIP rank circle icon and DS ID */}
                    <td className="py-2.5 sm:py-3 pl-3 sm:pl-5 pr-2 sm:pr-3 overflow-hidden align-middle">
                      <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
                        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border flex items-center justify-center shrink-0 shadow-2xs font-black ${
                          t.isDark ? avatarTheme.dark : avatarTheme.light
                        }`}>
                          <span className="text-[10px] sm:text-xs font-mono tracking-tight font-black">
                            {(member.vipRank || 'VIP1').replace('VIP', 'V')}
                          </span>
                        </div>
                        <div className="flex flex-col min-w-0 flex-1 overflow-hidden space-y-0.5">
                          <span className={`font-mono font-bold text-xs sm:text-sm tracking-tight truncate leading-snug ${t.isDark ? 'text-slate-100' : 'text-slate-900'}`} title={member.username}>
                            {member.username}
                          </span>
                          <span className={`text-[10px] sm:text-xs font-mono font-semibold tracking-normal truncate leading-none ${
                            t.isDark ? 'text-cyan-400/90' : 'text-blue-600'
                          }`} title={member.userId}>
                            {member.userId}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Column 2: Total Contribution - vertically centered */}
                    <td className="py-2.5 sm:py-3 px-1.5 sm:px-3 text-right overflow-hidden align-middle">
                      <span className={`font-mono font-extrabold text-xs sm:text-sm md:text-base tracking-tight truncate max-w-full block leading-tight ${
                        t.isDark ? 'text-slate-200' : 'text-slate-800'
                      }`}>
                        {member.totalContribution || '$0.00'}
                      </span>
                    </td>

                    {/* Column 3: Today's Contribution (Qualified / Missed / Standard) */}
                    <td className="py-2.5 sm:py-3 pl-1.5 sm:pl-3 pr-3 sm:pr-5 text-right overflow-hidden align-middle">
                      <div className="flex flex-col items-end justify-center min-w-0 space-y-0.5">
                        <span className={`font-mono font-extrabold text-xs sm:text-sm md:text-base tracking-tight truncate max-w-full leading-snug ${
                          hasContribution && member.contributionStatus === 'Qualified'
                            ? 'text-emerald-400 font-black'
                            : t.isDark ? 'text-slate-200' : 'text-slate-800'
                        }`}>
                          {member.todaysIncome || '$0.00'}
                        </span>
                        {hasContribution ? (
                          <span className={`text-[9px] sm:text-[10px] font-bold tracking-wide uppercase truncate max-w-full leading-none ${
                            member.contributionStatus === 'Qualified'
                              ? 'text-emerald-400'
                              : 'text-rose-400'
                          }`}>
                            {member.contributionStatus}
                          </span>
                        ) : (
                          <span className="text-[9px] sm:text-[10px] font-semibold tracking-wide uppercase text-transparent select-none leading-none">
                            -
                          </span>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </motion.tbody>
        </table>
      </div>

      {/* Audit warning / compliance rule at the bottom of the table */}
      <div className={`p-3.5 bg-black/10 dark:bg-black/20 border-t ${t.sep} flex items-center justify-center space-x-2 text-[10px] font-mono ${t.textMuted}`}>
        <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        <span className="text-center">Aml/Kyc verification status is evaluated every 24h at UTC Midnight.</span>
      </div>
    </div>
  );
};
