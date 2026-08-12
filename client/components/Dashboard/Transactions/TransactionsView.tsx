/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../hooks/useTheme.ts';
import { SearchInput } from '../../ui/Inputs/index.tsx';
import { DashboardLayout } from '../Layout/DashboardLayout.tsx';
import { Transaction, TransactionType } from './types.ts';
import { TransactionTable } from './TransactionTable.tsx';
import { ReceiptModal } from './ReceiptModal.tsx';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../../../services/api.ts';

export const TransactionsView: React.FC = () => {
  const { t } = useTheme();
  const [filterType, setFilterType] = useState<'all' | 'deposits' | 'withdrawals' | 'claims'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState<boolean>(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Real transactions state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      try {
        const res = await api.getUserTransactions();
        if (res.success && Array.isArray(res.data)) {
          const mapped: Transaction[] = res.data.map((dbTx: any) => {
            let mappedType: TransactionType = 'Deposit';
            const rawType = (dbTx.type || '').toUpperCase();
            if (rawType.includes('WITHDRAW')) mappedType = 'Withdrawal';
            else if (rawType.includes('CLAIM') || rawType.includes('YIELD')) mappedType = 'Yield Claim';
            else if (rawType.includes('REWARD')) mappedType = 'Reward';
            else if (rawType.includes('TEAM')) mappedType = 'Team Income';
            else if (rawType.includes('REFERRAL')) mappedType = 'Referral Income';
            else if (rawType.includes('SALARY')) mappedType = 'Salary';
            else if (rawType.includes('BONUS')) mappedType = 'Bonus';
            else mappedType = 'Deposit';

            let mappedStatus: any = 'Completed';
            const rawStatus = (dbTx.status || '').toUpperCase();
            if (rawStatus === 'PENDING') mappedStatus = 'Pending';
            else if (rawStatus === 'PROCESSING') mappedStatus = 'Processing';
            else if (rawStatus === 'FAILED' || rawStatus === 'REJECTED') mappedStatus = 'Failed';
            else mappedStatus = 'Completed';

            const numericAmount = parseFloat(dbTx.amount || '0');
            const isNegative = numericAmount < 0 || mappedType === 'Withdrawal';
            const formattedAmount = `${isNegative ? '-' : '+'}$${Math.abs(numericAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

            const dateStr = dbTx.createdAt ? new Date(dbTx.createdAt).toLocaleString() : 'N/A';

            return {
              id: dbTx.id,
              type: mappedType,
              amount: formattedAmount,
              status: mappedStatus,
              method: dbTx.description || 'USDT',
              date: dateStr,
            };
          });
          setTransactions(mapped);
        }
      } catch (err) {
        console.error('Failed to load user transactions:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Handle Clipboard copies securely
  const handleCopy = (text: string, isHash: boolean = false) => {
    navigator.clipboard.writeText(text);
    if (isHash) {
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    } else {
      setCopiedId(text);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Filter based on tabs selection and search string
  const filteredTransactions = transactions.filter((tx) => {
    // 1. Tab Filter Match
    let tabMatch = true;
    if (filterType === 'deposits') {
      tabMatch = tx.type === 'Deposit';
    } else if (filterType === 'withdrawals') {
      tabMatch = tx.type === 'Withdrawal';
    } else if (filterType === 'claims') {
      tabMatch = tx.type === 'Yield Claim' || tx.type === 'Reward';
    }

    // 2. Search Query Match
    let queryMatch = true;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      queryMatch = 
        tx.id.toLowerCase().includes(q) || 
        tx.type.toLowerCase().includes(q) || 
        tx.method.toLowerCase().includes(q) ||
        tx.status.toLowerCase().includes(q);
    }

    return tabMatch && queryMatch;
  });

  return (
    <DashboardLayout
      title="Transaction History"
      description="View and track all your secure, verified blockchain wallet transactions in real-time."
    >
      <div className="space-y-6 text-left" id="transactions-view-feature-container">
        
        {/* Navigation Filters & Search bar row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Glassmorphic Sliding Tabs */}
          <div className={`flex flex-wrap gap-1 p-1 rounded-2xl border transition-all duration-300 ${t.isDark ? 'bg-white/3 border-white/5' : 'bg-black/3 border-black/5'}`}>
            {[
              { id: 'all', label: 'All Transactions' },
              { id: 'deposits', label: 'Deposits' },
              { id: 'withdrawals', label: 'Withdrawals' },
              { id: 'claims', label: 'Yield Claims' },
            ].map((btn) => {
              const isActive = filterType === btn.id;
              return (
                <button
                  key={btn.id}
                  onClick={() => setFilterType(btn.id as any)}
                  className={`relative text-[10px] xs:text-xs font-bold px-2.5 xs:px-4 py-2 sm:py-2.5 rounded-xl transition-colors duration-200 cursor-pointer focus:outline-none select-none z-10 ${
                    isActive 
                      ? t.isDark ? 'text-cyan-400' : 'text-blue-600'
                      : `${t.textSub} hover:${t.text}`
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabGlow"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      className={`absolute inset-0 rounded-xl -z-10 border ${
                        t.isDark
                          ? 'bg-white/8 border-white/12 shadow-[0_0_12px_rgba(34,211,238,0.12)]'
                          : 'bg-white border-black/5 shadow-xs'
                      }`}
                    />
                  )}
                  {btn.label}
                </button>
              );
            })}
          </div>

          {/* Premium Search Box */}
          <div className="w-full lg:max-w-xs relative">
            <SearchInput
              placeholder="Search transaction..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Ledger Table Component */}
        <TransactionTable
          transactions={filteredTransactions}
          onSelectTransaction={setSelectedTx}
          copiedId={copiedId}
          onCopy={(id) => handleCopy(id)}
          t={t}
        />

        {/* Audit Receipt Modal Component overlay */}
        <AnimatePresence>
          {selectedTx && (
            <ReceiptModal
              transaction={selectedTx}
              onClose={() => setSelectedTx(null)}
              copiedId={copiedId}
              copiedHash={copiedHash}
              onCopy={handleCopy}
              t={t}
            />
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default TransactionsView;
