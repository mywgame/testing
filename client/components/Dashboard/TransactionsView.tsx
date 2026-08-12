/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Card, TableContainer } from '../ui/Cards/index.tsx';
import { Badge } from '../ui/Feedback/index.tsx';
import { SearchInput } from '../ui/Inputs/index.tsx';
import { History, Download, RefreshCw, Calendar, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export const TransactionsView: React.FC = () => {
  const [filterType, setFilterType] = useState<'all' | 'deposits' | 'withdrawals' | 'claims'>('all');

  const allTx = [
    { id: 'TX-83921', type: 'Claim', amount: '+$245.82', status: 'Complete', method: 'Reward Pool', date: '2026-06-28 12:45 UTC' },
    { id: 'TX-83905', type: 'Deposit', amount: '+$50,000.00', status: 'Complete', method: 'USDT ERC20', date: '2026-06-27 18:20 UTC' },
    { id: 'TX-83894', type: 'Withdrawal', amount: '-$12,500.00', status: 'Complete', method: 'USDC TRC20', date: '2026-06-27 09:14 UTC' },
    { id: 'TX-83782', type: 'Salary', amount: '+$1,500.00', status: 'Complete', method: 'Direct Deposit', date: '2026-06-26 00:00 UTC' },
    { id: 'TX-83741', type: 'Referral Bonus', amount: '+$340.50', status: 'Complete', method: 'Affiliate Credit', date: '2026-06-25 15:32 UTC' },
    { id: 'TX-83601', type: 'Reward', amount: '+$124.15', status: 'Processing', method: 'Staking Booster', date: '2026-06-24 11:05 UTC' },
    { id: 'TX-83542', type: 'Withdrawal', amount: '-$5,000.00', status: 'Failed', method: 'USDT ERC20', date: '2026-06-23 04:12 UTC' },
    { id: 'TX-83492', type: 'Deposit', amount: '+$12,000.00', status: 'Complete', method: 'Bank Wire Direct', date: '2026-06-22 10:45 UTC' },
  ];

  // Apply visual filter
  const filteredTx = allTx.filter((tx) => {
    if (filterType === 'all') return true;
    if (filterType === 'deposits') return tx.type === 'Deposit';
    if (filterType === 'withdrawals') return tx.type === 'Withdrawal';
    if (filterType === 'claims') return tx.type === 'Claim' || tx.type === 'Reward';
    return true;
  });

  return (
    <div className="space-y-6 text-left" id="transactions-view-tab">
      
      {/* Search and Filters Block */}
      <Card hoverEffect={true} className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h3 className="text-sm font-display font-extrabold text-gray-950 tracking-tight">
              Cryptographic Transaction Ledgers
            </h3>
            <p className="text-xs text-gray-400 font-sans">
              Audit secure, time-stamped hashes of all funds received, claimed, and debited under your cryptographic address.
            </p>
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button className="p-2 rounded-xl bg-white border border-gray-200 hover:text-blue-600 hover:border-blue-100 shadow-3xs cursor-pointer" title="Refresh Ledgers">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-xl bg-white border border-gray-200 hover:text-blue-600 hover:border-blue-100 shadow-3xs flex items-center space-x-1.5 cursor-pointer text-xs font-bold font-sans">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export Ledger CSV</span>
            </button>
          </div>
        </div>

        {/* Filters control row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-gray-50">
          <div className="flex flex-wrap gap-1.5 p-1 bg-gray-50 rounded-2xl border border-gray-100">
            {[
              { id: 'all', label: 'All Transactions' },
              { id: 'deposits', label: 'Deposits' },
              { id: 'withdrawals', label: 'Withdrawals' },
              { id: 'claims', label: 'Yield Claims' },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setFilterType(btn.id as any)}
                className={`text-[10px] sm:text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer focus:outline-none ${
                  filterType === btn.id
                    ? 'bg-white text-blue-600 shadow-sm border border-gray-100/50'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <div className="max-w-xs w-full">
            <SearchInput placeholder="Filter ledger by TxID..." />
          </div>
        </div>

        {/* Ledger Table */}
        <TableContainer>
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 font-semibold text-gray-500 font-display text-[11px] tracking-wider uppercase">Reference TxID</th>
                <th className="py-4 px-6 font-semibold text-gray-500 font-display text-[11px] tracking-wider uppercase">Operation Type</th>
                <th className="py-4 px-6 font-semibold text-gray-500 font-display text-[11px] tracking-wider uppercase">Value Amount</th>
                <th className="py-4 px-6 font-semibold text-gray-500 font-display text-[11px] tracking-wider uppercase">Gateway Method</th>
                <th className="py-4 px-6 font-semibold text-gray-500 font-display text-[11px] tracking-wider uppercase">Status Code</th>
                <th className="py-4 px-6 font-semibold text-gray-500 font-display text-[11px] tracking-wider uppercase">Settled Time (UTC)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-700">
              {filteredTx.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50/40 transition-colors">
                  <td className="py-3.5 px-6 font-mono font-bold text-gray-950">{tx.id}</td>
                  <td className="py-3.5 px-6 font-semibold">
                    <div className="flex items-center space-x-2">
                      {tx.type === 'Deposit' ? (
                        <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-500" />
                      ) : tx.type === 'Withdrawal' ? (
                        <ArrowUpRight className="w-3.5 h-3.5 text-red-500" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      )}
                      <span>{tx.type}</span>
                    </div>
                  </td>
                  <td className={`py-3.5 px-6 font-mono font-bold ${tx.amount.startsWith('-') ? 'text-red-600' : 'text-emerald-600'}`}>
                    {tx.amount}
                  </td>
                  <td className="py-3.5 px-6 text-gray-500 font-medium font-sans">{tx.method}</td>
                  <td className="py-3.5 px-6">
                    <Badge variant={tx.status === 'Complete' ? 'emerald' : tx.status === 'Processing' ? 'amber' : 'rose'}>
                      {tx.status}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-6 text-gray-400 font-mono text-[11px] font-semibold">{tx.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableContainer>
      </Card>

    </div>
  );
};

export default TransactionsView;
