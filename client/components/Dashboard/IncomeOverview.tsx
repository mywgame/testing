/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Link as LinkIcon, Users, Award, ChevronUp, ChevronDown, ChevronRight } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme.ts';
import { useLocalization } from '../../contexts/LocalizationContext.tsx';

interface IncomeOverviewProps {
  totalEarned: number;
  dailyYield: {
    today: number;
    total: number;
  };
  referralIncome: {
    today: number;
    total: number;
  };
  teamIncome: {
    today: number;
    total: number;
  };
  incentiveIncome: {
    today: number;
    total: number;
  };
  onRowClick?: (type: 'daily' | 'referral' | 'team' | 'incentive') => void;
}

export const IncomeOverview: React.FC<IncomeOverviewProps> = ({
  totalEarned,
  dailyYield,
  referralIncome,
  teamIncome,
  incentiveIncome,
  onRowClick,
}) => {
  const { isDark, t: themeTokens } = useTheme();
  const { formatCurrency, t } = useLocalization();
  const [isExpanded, setIsExpanded] = useState(true);

  // Calculate percentage ratios for the subtle progress accents (relative to total or normalized)
  const calcProgressPercent = (amount: number) => {
    if (totalEarned <= 0 || amount <= 0) return 0;
    return Math.min(100, Math.max(6, Math.round((amount / totalEarned) * 100)));
  };

  const incomeRows = [
    {
      id: 'daily',
      label: t('dailyYield', 'Daily Yield'),
      icon: Zap,
      today: dailyYield.today,
      total: dailyYield.total,
      progress: calcProgressPercent(dailyYield.total),
      iconColor: isDark ? 'text-emerald-400' : 'text-emerald-600',
      iconContainerBg: isDark ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200',
      todayAmountColor: isDark ? 'text-emerald-400' : 'text-emerald-600',
      progressBarColor: 'bg-emerald-400',
    },
    {
      id: 'referral',
      label: t('referralIncome', 'Referral Income'),
      icon: LinkIcon,
      today: referralIncome.today,
      total: referralIncome.total,
      progress: calcProgressPercent(referralIncome.total),
      iconColor: isDark ? 'text-cyan-400' : 'text-cyan-600',
      iconContainerBg: isDark ? 'bg-cyan-500/10 border-cyan-500/20' : 'bg-cyan-50 border-cyan-200',
      todayAmountColor: isDark ? 'text-cyan-400' : 'text-cyan-600',
      progressBarColor: 'bg-cyan-400',
    },
    {
      id: 'team',
      label: t('teamIncome', 'Team Income'),
      icon: Users,
      today: teamIncome.today,
      total: teamIncome.total,
      progress: calcProgressPercent(teamIncome.total),
      iconColor: isDark ? 'text-purple-400' : 'text-purple-600',
      iconContainerBg: isDark ? 'bg-purple-500/10 border-purple-500/20' : 'bg-purple-50 border-purple-200',
      todayAmountColor: isDark ? 'text-purple-400' : 'text-purple-600',
      progressBarColor: 'bg-purple-400',
    },
    {
      id: 'incentive',
      label: t('incentiveIncome', 'Incentive Income'),
      icon: Award,
      today: incentiveIncome.today,
      total: incentiveIncome.total,
      progress: calcProgressPercent(incentiveIncome.total),
      iconColor: isDark ? 'text-amber-400' : 'text-amber-600',
      iconContainerBg: isDark ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-200',
      todayAmountColor: isDark ? 'text-amber-400' : 'text-amber-600',
      progressBarColor: 'bg-amber-400',
    },
  ];

  return (
    <div
      id="income-overview-panel"
      className={`w-full rounded-2xl p-4 sm:p-5 transition-all duration-300 bg-gradient-to-b backdrop-blur-xl border ${themeTokens.claimCard}`}
    >
      {/* Header Section */}
      <div
        className={`flex items-center justify-between cursor-pointer select-none pb-4 ${isExpanded ? 'border-b ' + themeTokens.sep : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setIsExpanded(!isExpanded);
          }
        }}
        aria-expanded={isExpanded}
      >
        {/* Left Side: Eyebrow + Primary Title */}
        <div className="min-w-0 pr-2">
          <p
            className={`text-xs uppercase tracking-widest font-semibold whitespace-nowrap ${themeTokens.textSub}`}
          >
            {t('incomeOverview', 'INCOME OVERVIEW')}
          </p>
          <p className={`text-base sm:text-lg font-bold mt-0.5 whitespace-nowrap ${themeTokens.text}`}>
            {t('totalEarnings', 'Total Earnings')}
          </p>
        </div>

        {/* Right Side: Total Combined Earnings + Chevron */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0 pl-2">
          <span
            className={`font-bold text-2xl sm:text-3xl tracking-tight leading-none ${themeTokens.text}`}
          >
            {formatCurrency(totalEarned)}
          </span>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              isDark
                ? 'bg-slate-800/90 text-cyan-400 border border-slate-700/70 hover:bg-slate-700'
                : 'bg-slate-100 text-cyan-600 border border-slate-200 hover:bg-slate-200'
            }`}
            aria-label="Toggle income overview"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            ) : (
              <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            )}
          </div>
        </div>
      </div>

      {/* Expandable Body: 4 Integrated Rows */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-2 sm:space-y-2.5 pt-1">
              {incomeRows.map((row) => {
                const Icon = row.icon;
                return (
                  <div
                    key={row.id}
                    id={`income-row-${row.id}`}
                    onClick={() => onRowClick?.(row.id as any)}
                    className={`group relative rounded-xl sm:rounded-2xl p-3 sm:p-3.5 border transition-all duration-200 cursor-pointer ${
                      isDark
                        ? 'bg-[#121538]/60 hover:bg-[#181c47]/80 border-white/[0.06] hover:border-white/[0.12]'
                        : 'bg-slate-50/90 hover:bg-slate-100/90 border-slate-200/70 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2.5 sm:gap-4">
                      {/* Left: Icon + Label + Today Amount */}
                      <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
                        {/* Rounded squircle icon container */}
                        <div
                          className={`shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-105 ${row.iconContainerBg}`}
                        >
                          <Icon className={`w-5 h-5 stroke-[2] ${row.iconColor}`} />
                        </div>

                        {/* Title & Today Metric */}
                        <div className="min-w-0 text-left">
                          <h3
                            className={`text-sm sm:text-base font-semibold leading-snug truncate ${
                              isDark ? 'text-white' : 'text-slate-900'
                            }`}
                          >
                            {row.label}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`text-xs font-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                              {t('today', 'Today')}
                            </span>
                            <span className={`text-xs font-medium ${row.todayAmountColor}`}>
                              +{formatCurrency(row.today)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Total Amount + Progress Indicator + Chevron */}
                      <div className="flex items-center gap-2 sm:gap-3 shrink-0 text-right">
                        <div className="flex flex-col items-end">
                          <span
                            className={`font-semibold text-base sm:text-lg md:text-xl tracking-tight leading-none ${
                              isDark ? 'text-white' : 'text-slate-900'
                            }`}
                          >
                            {formatCurrency(row.total)}
                          </span>

                          {/* Subtle minimal progress accent */}
                          <div
                            className={`w-16 sm:w-20 md:w-24 h-1 rounded-full overflow-hidden mt-1.5 ${
                              isDark ? 'bg-slate-800/90' : 'bg-slate-200'
                            }`}
                          >
                            <div
                              className={`h-full rounded-full ${row.progressBarColor} transition-all duration-500`}
                              style={{ width: `${Math.max(row.progress, row.total > 0 ? 12 : 0)}%` }}
                            />
                          </div>
                        </div>

                        <ChevronRight
                          className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-0.5 ${
                            isDark ? 'text-slate-500 group-hover:text-slate-300' : 'text-slate-400 group-hover:text-slate-600'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IncomeOverview;

