/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles } from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme.ts';

interface RewardsHeaderProps {
  onOpenRules?: () => void;
}

export const RewardsHeader: React.FC<RewardsHeaderProps> = () => {
  const { t, isDark } = useTheme();

  return (
    <div className="space-y-2 max-w-xl text-left">
      <div className="flex items-center gap-2">
        <div
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase transition-all ${
            isDark
              ? 'bg-purple-500/15 border border-purple-500/30 text-purple-300'
              : 'bg-purple-100 border border-purple-300 text-purple-800 shadow-sm shadow-purple-500/10'
          }`}
        >
          <Sparkles className={`w-3.5 h-3.5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
          <span>MetaFirm Rewards Program</span>
        </div>
      </div>

      <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight font-display ${t.text}`}>
        Tasks & Rewards
      </h2>
      <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
        Complete ecosystem activities and unlock instant rewards credited directly to your account balance.
      </p>
    </div>
  );
};
