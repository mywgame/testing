/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useTheme } from '../../../hooks/useTheme.ts';

interface RewardsSummaryCardsProps {
  totalEarned: number;
  claimableTotal: number;
}

export const RewardsSummaryCards: React.FC<RewardsSummaryCardsProps> = ({
  totalEarned,
  claimableTotal,
}) => {
  const { isDark } = useTheme();

  return (
    <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-3.5 w-full lg:w-auto">
      {/* Total Earned Card */}
      <div
        className={`p-4 sm:px-5 sm:py-4 rounded-2xl text-left flex-1 min-w-[145px] relative overflow-hidden group transition-all duration-300 ${
          isDark
            ? 'bg-gradient-to-br from-purple-600/40 via-purple-700/30 to-indigo-950/50 border border-purple-500/40 shadow-lg shadow-purple-950/50 backdrop-blur-md'
            : 'bg-gradient-to-br from-purple-600 via-purple-600 to-indigo-700 border border-purple-400 shadow-lg shadow-purple-600/30 backdrop-blur-md'
        }`}
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none -mr-8 -mt-8" />
        <span className="text-[11px] font-mono text-purple-100 uppercase tracking-wider block font-bold">
          Total Earned
        </span>
        <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white block mt-1 drop-shadow-md">
          ${totalEarned.toFixed(2)}{' '}
          <span className="text-xs font-sans font-bold text-purple-200 ml-0.5">USDT</span>
        </span>
      </div>

      {/* Claimable Now Card */}
      <div
        className={`p-4 sm:px-5 sm:py-4 rounded-2xl text-left flex-1 min-w-[145px] relative overflow-hidden group transition-all duration-300 ${
          isDark
            ? 'bg-gradient-to-br from-indigo-600/40 via-purple-700/30 to-indigo-950/50 border border-indigo-500/40 shadow-lg shadow-indigo-950/50 backdrop-blur-md'
            : 'bg-gradient-to-br from-indigo-600 via-purple-600 to-purple-700 border border-indigo-400 shadow-lg shadow-indigo-600/30 backdrop-blur-md'
        }`}
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none -mr-8 -mt-8" />
        <span className="text-[11px] font-mono text-indigo-100 uppercase tracking-wider block font-bold">
          Claimable Now
        </span>
        <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white block mt-1 drop-shadow-md">
          ${claimableTotal.toFixed(2)}{' '}
          <span className="text-xs font-sans font-bold text-indigo-200 ml-0.5">USDT</span>
        </span>
      </div>
    </div>
  );
};
