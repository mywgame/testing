/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowDownLeft, ArrowUpRight, ChevronRight, Calendar } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme.ts';
import { useLocalization } from '../../contexts/LocalizationContext.tsx';
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
  const { formatCurrency, formatDate, t: translate } = useLocalization();

  const formatDateTime = (tx: MockTransaction): string => {
    const rawDate = tx.createdAt || tx.timestampIso || tx.time;
    if (!rawDate) return '';
    try {
      const d = new Date(rawDate);
      if (!isNaN(d.getTime())) {
        return formatDate(d);
      }
    } catch {
      // fallback
    }
    return typeof tx.time === 'string' ? tx.time : '';
  };

  return (
    <div className={`backdrop-blur-lg rounded-2xl p-5 border transition-all duration-300 lg:col-span-2 ${t.card}`} id="recent-activity-section">
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-base font-semibold ${t.text}`}>{translate('recentTransactions', 'Recent Transactions')}</h3>
        <button
          onClick={onViewAll}
          className="text-xs text-cyan-500 hover:text-cyan-400 transition-colors flex items-center gap-1 cursor-pointer"
        >
          {translate('viewAll', 'View all')} <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-2">
        {transactions.map((tx) => {
          const lowerType = (tx.type || '').toLowerCase();
          const isWithdrawal = lowerType.includes('withdrawal');
          const isExpiry = lowerType.includes('expiry') || lowerType.includes('expire');
          const isDebit = lowerType.includes('debit') || lowerType.includes('penalty') || lowerType.includes('fee') || lowerType.includes('deduct');
          const isDeduction = isWithdrawal || isExpiry || isDebit;

          const displayType =
            tx.displayType ||
            (tx.type || '')
              .replace(/_/g, ' ')
              .toLowerCase()
              .replace(/\b\w/g, (c) => c.toUpperCase());
          const formattedTime = formatDateTime(tx);
          const rawNum = typeof tx.amount === 'number' ? tx.amount : parseFloat(tx.amount || '0');

          return (
            <div key={tx.id} className={`flex items-center justify-between rounded-xl p-3.5 transition-colors ${t.cardInner}`}>
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`p-2 rounded-xl shrink-0 ${
                    isDeduction
                      ? 'bg-red-500/15 ring-1 ring-red-500/25'
                      : 'bg-emerald-500/15 ring-1 ring-emerald-500/25'
                  }`}
                >
                  {isDeduction ? (
                    <ArrowUpRight className="w-4 h-4 text-red-500" />
                  ) : (
                    <ArrowDownLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className={`text-sm font-semibold truncate ${t.text}`}>{displayType}</p>
                  {formattedTime && (
                    <p className={`text-xs flex items-center gap-1.5 mt-0.5 ${t.textMuted}`}>
                      <Calendar className="w-3 h-3 shrink-0 opacity-70" />
                      <span>{formattedTime}</span>
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0 ml-3">
                <p
                  className={`text-sm font-bold font-mono ${
                    isDeduction ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {isDeduction ? '-' : '+'}{formatCurrency(rawNum)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentActivity;
