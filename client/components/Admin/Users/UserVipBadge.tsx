/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Award } from 'lucide-react';

export const getVipBadgeStyle = (rank: string) => {
  const vipColors: Record<string, { bg: string; text: string; border: string; glow?: string }> = {
    VIP1: { bg: 'bg-orange-500/10 dark:bg-orange-500/15', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-500/20' },
    VIP2: { bg: 'bg-slate-500/10 dark:bg-slate-400/15', text: 'text-slate-600 dark:text-slate-300', border: 'border-slate-500/20' },
    VIP3: { bg: 'bg-amber-500/10 dark:bg-amber-500/15', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/20' },
    VIP4: { bg: 'bg-emerald-500/10 dark:bg-emerald-500/15', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/20' },
    VIP5: { bg: 'bg-cyan-500/10 dark:bg-cyan-500/15', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-500/20' },
    VIP6: { bg: 'bg-purple-500/10 dark:bg-purple-500/15', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500/20' },
    VIP7: { bg: 'bg-rose-500/10 dark:bg-rose-500/15', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-500/20' },
    VIP8: { bg: 'bg-indigo-500/15 dark:bg-indigo-500/20', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-500/30', glow: 'shadow-xs shadow-indigo-500/25 animate-pulse' },
  };

  return vipColors[rank] || { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/20' };
};

export const UserVipBadge: React.FC<{ rank: string }> = ({ rank }) => {
  const style = getVipBadgeStyle(rank);

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-extrabold uppercase tracking-wider border ${style.bg} ${style.text} ${style.border} ${style.glow || ''}`}>
      <Award className="w-2.5 h-2.5" />
      {rank}
    </span>
  );
};
