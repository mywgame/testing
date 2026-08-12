/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowDownLeft, ArrowUpRight, Star, ChevronRight } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme.ts';
import { MockTransaction } from '../../types/index.ts';

interface RecentActivityProps {
  transactions: MockTransaction[];
  onViewAll?: () => void;
}

/**
 * Recent Transactions list — pixel-matched to the figma reference. Every
 * row (type icon, hash, amount, relative time) comes from the
 * `transactions` prop only, so Phase 2 can pass the real
 * `dashboardData.recentTransactions` array without touching this component.
 */
export const RecentActivity: React.FC<RecentActivityProps> = ({ transactions, onViewAll }) => {
  const { t } = useTheme();

  return (
    <div className={`backdrop-blur-lg rounded-2xl p-5 border transition-all duration-300 lg:col-span-2 ${t.card}`} id="recent-activity-section">
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-base font-semibold ${t.text}`}>Recent Transactions</h3>
        <button
          onClick={onViewAll}
          className="text-xs text-cyan-500 hover:text-cyan-400 transition-colors flex items-center gap-1 cursor-pointer"
        >
          View all <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-2">
        {transactions.map((tx) => {
          const lowerType = (tx.type || '').toLowerCase();
          const isDeposit = lowerType.includes('deposit');
          const isWithdrawal = lowerType.includes('withdrawal');
          const displayType =
            tx.displayType ||
            (tx.type || '')
              .replace(/_/g, ' ')
              .toLowerCase()
              .replace(/\b\w/g, (c) => c.toUpperCase());

          return (
            <div key={tx.id} className={`flex items-center justify-between rounded-xl p-3.5 transition-colors ${t.cardInner}`}>
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-xl shrink-0 ${
                    isDeposit
                      ? 'bg-green-500/15 ring-1 ring-green-500/25'
                      : isWithdrawal
                      ? 'bg-red-500/15 ring-1 ring-red-500/25'
                      : 'bg-blue-500/15 ring-1 ring-blue-500/25'
                  }`}
                >
                  {isDeposit ? (
                    <ArrowDownLeft className="w-4 h-4 text-green-500" />
                  ) : isWithdrawal ? (
                    <ArrowUpRight className="w-4 h-4 text-red-500" />
                  ) : (
                    <Star className="w-4 h-4 text-blue-500" />
                  )}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${t.text}`}>{displayType}</p>
                  <p className={`text-xs font-mono ${t.textMuted}`}>{tx.hash}</p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`text-sm font-bold ${
                    isDeposit ? 'text-green-500' : isWithdrawal ? 'text-red-500' : 'text-blue-500'
                  }`}
                >
                  {isWithdrawal ? '-' : '+'}${typeof tx.amount === 'number' ? tx.amount.toLocaleString() : tx.amount} {tx.token || 'USDT'}
                </p>
                <p className={`text-xs ${t.textMuted}`}>{tx.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentActivity;
