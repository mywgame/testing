/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Coins, 
  Gift, 
  Users, 
  TrendingUp, 
  Landmark, 
  Award,
  Layers,
  Calendar,
  Copy,
  Check,
  Search
} from 'lucide-react';
import { motion } from 'motion/react';
import { Transaction } from './types.ts';
import { Badge } from '../../ui/Feedback/index.tsx';

interface TransactionTableProps {
  transactions: Transaction[];
  onSelectTransaction: (tx: Transaction) => void;
  copiedId: string | null;
  onCopy: (id: string) => void;
  t: any; // Theme configuration
}

// Map transaction type to appropriate icons and style configs
const getTypeMeta = (type: string) => {
  switch (type) {
    case 'Deposit':
      return {
        icon: ArrowDownLeft,
        bg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      };
    case 'Withdrawal':
      return {
        icon: ArrowUpRight,
        bg: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
      };
    case 'Yield Claim':
      return {
        icon: Coins,
        bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      };
    case 'Reward':
      return {
        icon: Gift,
        bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      };
    case 'Referral Income':
      return {
        icon: Users,
        bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      };
    case 'Team Income':
      return {
        icon: TrendingUp,
        bg: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
      };
    case 'Salary':
      return {
        icon: Landmark,
        bg: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      };
    case 'Bonus':
      return {
        icon: Award,
        bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      };
    default:
      return {
        icon: Layers,
        bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      };
  }
};

const getStatusVariant = (status: string) => {
  const s = status.toLowerCase();
  if (s.includes('complete') || s.includes('success')) return 'emerald';
  if (s.includes('process') || s.includes('pending')) return 'amber';
  if (s.includes('fail') || s.includes('reject')) return 'rose';
  return 'neutral';
};

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  onSelectTransaction,
  copiedId,
  onCopy,
  t,
}) => {
  // Animation configurations
  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.02,
      },
    },
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 4 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 350, damping: 28 } },
  };

  return (
    <>
      {/* Desktop and Tablet Ledger (hidden on mobile) */}
      <div className="hidden sm:block w-full overflow-x-auto rounded-2xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/1 no-scrollbar">
        {/* Scrollable table ledger view */}
        <div className="min-w-[480px] sm:min-w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${t.sep} ${t.isDark ? 'bg-white/1' : 'bg-black/1'}`}>
                <th className={`py-3 sm:py-4 px-2 sm:px-4 font-bold font-display text-[10px] sm:text-[11px] tracking-wider uppercase ${t.textMuted} w-[20%] sm:w-1/4`}>
                  Transaction ID
                </th>
                <th className={`py-3 sm:py-4 px-2 sm:px-4 font-bold font-display text-[10px] sm:text-[11px] tracking-wider uppercase ${t.textMuted} w-[22%] sm:w-1/4`}>
                  Type
                </th>
                <th className={`py-3 sm:py-4 px-2 sm:px-4 font-bold font-display text-[10px] sm:text-[11px] tracking-wider uppercase ${t.textMuted} w-[18%] sm:w-1/6`}>
                  Amount
                </th>
                <th className={`py-3 sm:py-4 px-2 sm:px-4 font-bold font-display text-[10px] sm:text-[11px] tracking-wider uppercase ${t.textMuted} w-[25%] sm:w-1/4`}>
                  Date & Time
                </th>
                <th className={`py-3 sm:py-4 px-2 sm:px-4 font-bold font-display text-[10px] sm:text-[11px] tracking-wider uppercase ${t.textMuted} w-[15%] sm:w-1/6`}>
                  Status
                </th>
              </tr>
            </thead>
            <motion.tbody 
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className={`divide-y ${t.sep}`}
            >
              {transactions.length === 0 ? (
                <motion.tr variants={staggerItem}>
                  <td colSpan={5} className={`py-16 text-center text-xs sm:text-sm font-sans ${t.textMuted}`}>
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="p-3 bg-white/5 border border-white/10 rounded-full text-gray-400">
                        <Search className="w-5 h-5" />
                      </div>
                      <p className="font-bold">No transactions matched</p>
                      <p className="text-xs text-gray-500 max-w-xs">
                        Try adjusting your search filter or picking another tab.
                      </p>
                    </div>
                  </td>
                </motion.tr>
              ) : (
                transactions.map((tx) => {
                  const isNegative = tx.amount.startsWith('-');
                  const meta = getTypeMeta(tx.type);
                  const TypeIcon = meta.icon;

                  return (
                    <motion.tr 
                      key={tx.id} 
                      variants={staggerItem}
                      className="hover:bg-white/3 dark:hover:bg-white/2 transition-colors duration-150 group cursor-pointer"
                      onClick={() => onSelectTransaction(tx)}
                    >
                      {/* Column 1: Transaction ID */}
                      <td className="py-3 sm:py-3.5 px-2 sm:px-4">
                        <div className="flex items-center space-x-1 sm:space-x-2" onClick={(e) => e.stopPropagation()}>
                          <span className={`font-mono font-bold text-[11px] xs:text-xs tracking-tight ${t.text}`}>
                            {tx.id}
                          </span>
                          <button
                            onClick={() => onCopy(tx.id)}
                            className={`p-1 rounded-md opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all cursor-pointer ${
                              t.isDark ? 'hover:bg-white/8 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-900'
                            }`}
                            title="Copy ID"
                          >
                            {copiedId === tx.id ? (
                              <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Column 2: Mapped Type with micro-icon */}
                      <td className="py-3 sm:py-3.5 px-2 sm:px-4">
                        <div className="flex items-center space-x-1 sm:space-x-2.5">
                          <div className={`p-1 sm:p-1.5 rounded-lg border flex-shrink-0 ${meta.bg}`}>
                            <TypeIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          </div>
                          <span className={`font-bold text-[11px] xs:text-xs tracking-tight ${t.text}`}>
                            {tx.type}
                          </span>
                        </div>
                      </td>

                      {/* Column 3: Amount */}
                      <td className="py-3 sm:py-3.5 px-2 sm:px-4">
                        <span className={`font-mono font-extrabold text-[11px] xs:text-xs sm:text-sm ${isNegative ? 'text-rose-500' : 'text-emerald-500'}`}>
                          {tx.amount}
                        </span>
                      </td>

                      {/* Column 4: Date & Time */}
                      <td className="py-3 sm:py-3.5 px-2 sm:px-4">
                        <div className="flex items-center space-x-1 sm:space-x-1.5">
                          <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-500 shrink-0" />
                          <span className={`font-mono text-[9px] xs:text-[10px] sm:text-[11px] font-semibold tracking-tight ${t.textSub}`}>
                            {tx.date}
                          </span>
                        </div>
                      </td>

                      {/* Column 5: Status Badge */}
                      <td className="py-3 sm:py-3.5 px-2 sm:px-4">
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <Badge variant={getStatusVariant(tx.status)}>
                            <span className="text-[10px] sm:text-xs">{tx.status}</span>
                          </Badge>
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

      {/* Premium Optimized Mobile View (hidden on tablet/desktop) */}
      <div className="block sm:hidden w-full rounded-2xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/1 overflow-hidden">
        {transactions.length === 0 ? (
          <div className={`py-12 text-center text-xs font-sans ${t.textMuted}`}>
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="p-3 bg-white/5 border border-white/10 rounded-full text-gray-400">
                <Search className="w-5 h-5" />
              </div>
              <p className="font-bold">No transactions matched</p>
              <p className="text-[11px] text-gray-500 max-w-xs">
                Try adjusting your search filter or picking another tab.
              </p>
            </div>
          </div>
        ) : (
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className={`divide-y ${t.sep}`}
          >
            {transactions.map((tx) => {
              const isNegative = tx.amount.startsWith('-');
              const meta = getTypeMeta(tx.type);
              const TypeIcon = meta.icon;

              const getMobileTypeLabel = (type: string) => {
                switch (type) {
                  case 'Yield Claim':
                    return 'Yield';
                  case 'Referral Income':
                    return 'Referral';
                  case 'Team Income':
                    return 'Team';
                  default:
                    return type;
                }
              };

              return (
                <motion.div
                  key={tx.id}
                  variants={staggerItem}
                  onClick={() => onSelectTransaction(tx)}
                  className="flex items-start space-x-3 py-3 px-3 hover:bg-white/3 dark:hover:bg-white/2 transition-colors duration-150 active:bg-white/5 cursor-pointer"
                >
                  {/* Left Column: Icon */}
                  <div className={`p-2 rounded-xl border flex-shrink-0 mt-0.5 ${meta.bg}`}>
                    <TypeIcon className="w-4 h-4" />
                  </div>

                  {/* Right Column: 3-line structured information */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    {/* Line 1: Transaction Type and Amount */}
                    <div className="flex items-center justify-between">
                      <span className={`font-bold text-[13px] tracking-tight ${t.text} truncate`}>
                        {getMobileTypeLabel(tx.type)}
                      </span>
                      <span className={`font-mono font-extrabold text-[13px] ${isNegative ? 'text-rose-500' : 'text-emerald-500'} shrink-0 ml-2`}>
                        {tx.amount}
                      </span>
                    </div>

                    {/* Line 2: Transaction ID and Status Badge */}
                    <div className="flex items-center justify-between mt-1">
                      <span className={`font-mono text-[10px] text-gray-400 dark:text-gray-500 truncate mr-2`}>
                        {tx.id}
                      </span>
                      <div className="shrink-0">
                        <Badge variant={getStatusVariant(tx.status)}>
                          <span className="text-[9px] font-bold uppercase tracking-wider">{tx.status}</span>
                        </Badge>
                      </div>
                    </div>

                    {/* Line 3: Date & Time */}
                    <div className="flex items-center space-x-1 mt-1">
                      <Calendar className="w-2.5 h-2.5 text-gray-400 dark:text-gray-500 shrink-0" />
                      <span className={`font-mono text-[10px] font-semibold tracking-tight text-gray-400 dark:text-gray-500 truncate`}>
                        {tx.date}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </>
  );
};
