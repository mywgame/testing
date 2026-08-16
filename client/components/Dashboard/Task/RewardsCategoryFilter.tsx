/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useTheme } from '../../../hooks/useTheme.ts';

export type FilterTab = 'ALL' | 'DEPOSIT' | 'ACTIVITY' | 'REFERRAL';

interface CategoryFilterItem {
  id: FilterTab;
  label: string;
  count: number;
}

interface RewardsCategoryFilterProps {
  activeTab: FilterTab;
  onTabChange: (tab: FilterTab) => void;
  counts: {
    all: number;
    activity: number;
    deposit: number;
    referral: number;
  };
}

export const RewardsCategoryFilter: React.FC<RewardsCategoryFilterProps> = ({
  activeTab,
  onTabChange,
  counts,
}) => {
  const { isDark } = useTheme();

  const tabs: CategoryFilterItem[] = [
    { id: 'ALL', label: 'All Tasks', count: counts.all },
    { id: 'ACTIVITY', label: 'Activity Bonus', count: counts.activity },
    { id: 'DEPOSIT', label: 'Deposit Milestones', count: counts.deposit },
    { id: 'REFERRAL', label: 'Referral Milestones', count: counts.referral },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            type="button"
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              isActive
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/25 ring-1 ring-white/20'
                : isDark
                ? 'text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20'
                : 'text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm hover:border-slate-300'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                isActive
                  ? 'bg-white/25 text-white'
                  : isDark
                  ? 'bg-white/10 text-slate-300'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
