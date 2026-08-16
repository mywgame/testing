/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CheckCircle2, Hourglass, Gift, ListTodo } from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme.ts';

interface RewardsMetricsGridProps {
  completedCount: number;
  inProgressCount: number;
  availableCount: number;
  totalTasksCount: number;
}

export const RewardsMetricsGrid: React.FC<RewardsMetricsGridProps> = ({
  completedCount,
  inProgressCount,
  availableCount,
  totalTasksCount,
}) => {
  const { isDark } = useTheme();

  return (
    <div
      className={`grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t ${
        isDark ? 'border-white/10' : 'border-slate-200/80'
      }`}
    >
      {/* Completed */}
      <div
        className={`relative overflow-hidden group flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl border transition-all duration-300 ${
          isDark
            ? 'bg-gradient-to-br from-purple-600/30 via-purple-700/20 to-indigo-950/40 border-purple-500/30 shadow-md shadow-purple-950/40 backdrop-blur-md hover:border-purple-400/50'
            : 'bg-gradient-to-br from-purple-600 via-purple-600 to-indigo-700 border-purple-400 shadow-md shadow-purple-600/20 text-white backdrop-blur-md'
        }`}
      >
        <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-lg pointer-events-none -mr-4 -mt-4" />
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border relative z-10 ${
            isDark
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-inner'
              : 'bg-white/15 border-white/25 text-emerald-200'
          }`}
        >
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div className="min-w-0 relative z-10">
          <span
            className={`text-[10px] font-mono block uppercase font-bold tracking-wider ${
              isDark ? 'text-purple-200/80' : 'text-purple-100'
            }`}
          >
            Completed
          </span>
          <span className="text-lg font-extrabold font-mono text-white block">
            {completedCount}
          </span>
        </div>
      </div>

      {/* In Progress */}
      <div
        className={`relative overflow-hidden group flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl border transition-all duration-300 ${
          isDark
            ? 'bg-gradient-to-br from-purple-600/30 via-indigo-700/20 to-indigo-950/40 border-indigo-500/30 shadow-md shadow-indigo-950/40 backdrop-blur-md hover:border-indigo-400/50'
            : 'bg-gradient-to-br from-purple-600 via-indigo-600 to-indigo-700 border-indigo-400 shadow-md shadow-indigo-600/20 text-white backdrop-blur-md'
        }`}
      >
        <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-lg pointer-events-none -mr-4 -mt-4" />
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border relative z-10 ${
            isDark
              ? 'bg-blue-500/20 border-blue-500/40 text-blue-300 shadow-inner'
              : 'bg-white/15 border-white/25 text-blue-200'
          }`}
        >
          <Hourglass className="w-5 h-5" />
        </div>
        <div className="min-w-0 relative z-10">
          <span
            className={`text-[10px] font-mono block uppercase font-bold tracking-wider ${
              isDark ? 'text-purple-200/80' : 'text-purple-100'
            }`}
          >
            In Progress
          </span>
          <span className="text-lg font-extrabold font-mono text-white block">
            {inProgressCount}
          </span>
        </div>
      </div>

      {/* Available */}
      <div
        className={`relative overflow-hidden group flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl border transition-all duration-300 ${
          isDark
            ? 'bg-gradient-to-br from-indigo-600/30 via-purple-700/20 to-purple-950/40 border-purple-500/30 shadow-md shadow-purple-950/40 backdrop-blur-md hover:border-purple-400/50'
            : 'bg-gradient-to-br from-indigo-600 via-purple-600 to-purple-700 border-purple-400 shadow-md shadow-purple-600/20 text-white backdrop-blur-md'
        }`}
      >
        <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-lg pointer-events-none -mr-4 -mt-4" />
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border relative z-10 ${
            isDark
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-inner'
              : 'bg-white/15 border-white/25 text-amber-200'
          }`}
        >
          <Gift className="w-5 h-5" />
        </div>
        <div className="min-w-0 relative z-10">
          <span
            className={`text-[10px] font-mono block uppercase font-bold tracking-wider ${
              isDark ? 'text-purple-200/80' : 'text-purple-100'
            }`}
          >
            Available
          </span>
          <span className="text-lg font-extrabold font-mono text-white block">
            {availableCount}
          </span>
        </div>
      </div>

      {/* Total Tasks */}
      <div
        className={`relative overflow-hidden group flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl border transition-all duration-300 ${
          isDark
            ? 'bg-gradient-to-br from-purple-600/30 via-purple-700/20 to-indigo-950/40 border-purple-500/30 shadow-md shadow-purple-950/40 backdrop-blur-md hover:border-purple-400/50'
            : 'bg-gradient-to-br from-purple-600 via-purple-600 to-indigo-700 border-purple-400 shadow-md shadow-purple-600/20 text-white backdrop-blur-md'
        }`}
      >
        <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-lg pointer-events-none -mr-4 -mt-4" />
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border relative z-10 ${
            isDark
              ? 'bg-purple-500/20 border-purple-500/40 text-purple-300 shadow-inner'
              : 'bg-white/15 border-white/25 text-purple-200'
          }`}
        >
          <ListTodo className="w-5 h-5" />
        </div>
        <div className="min-w-0 relative z-10">
          <span
            className={`text-[10px] font-mono block uppercase font-bold tracking-wider ${
              isDark ? 'text-purple-200/80' : 'text-purple-100'
            }`}
          >
            Total Tasks
          </span>
          <span className="text-lg font-extrabold font-mono text-white block">
            {totalTasksCount}
          </span>
        </div>
      </div>
    </div>
  );
};
