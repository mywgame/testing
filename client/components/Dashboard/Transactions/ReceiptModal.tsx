/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  X, 
  Sparkles, 
  Copy, 
  Check, 
  Clock, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { motion } from 'motion/react';
import { Transaction } from './types.ts';

interface ReceiptModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  copiedId: string | null;
  copiedHash: boolean;
  onCopy: (text: string, isHash?: boolean) => void;
  t: any; // Theme object passed down
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  transaction,
  onClose,
  copiedId,
  copiedHash,
  onCopy,
  t,
}) => {
  if (!transaction) return null;

  const isNegative = transaction.amount.startsWith('-');

  // Get status badge variant colors specifically for background styling
  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('complete') || s.includes('success')) return '#10b981'; // emerald
    if (s.includes('process') || s.includes('pending')) return '#f59e0b'; // amber
    if (s.includes('fail') || s.includes('reject')) return '#ef4444'; // rose
    return '#3b82f6'; // blue
  };

  const statusColor = getStatusColor(transaction.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop blur effect */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-[#02030a]/80 backdrop-blur-md"
      />

      {/* Receipt Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        transition={{ type: 'spring', damping: 24, stiffness: 320 }}
        className={`relative w-full max-w-md backdrop-blur-2xl border rounded-3xl shadow-[0_24px_50px_rgba(0,0,0,0.5)] overflow-hidden ${t.card} z-10 text-left`}
      >
        {/* Colored ambient glow orb behind modal based on status */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 blur-3xl rounded-full opacity-15 pointer-events-none"
          style={{ background: statusColor }}
        />

        {/* Close Button Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center space-x-2">
            <div className="p-1 rounded bg-white/5 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            </div>
            <h3 className={`text-sm font-display font-bold tracking-wider uppercase ${t.textSub}`}>
              Cryptographic Audit Receipt
            </h3>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
              t.isDark 
                ? 'bg-white/5 hover:bg-white/10 border-white/10 text-gray-400 hover:text-white' 
                : 'bg-gray-50 hover:bg-gray-100 border-gray-100 text-gray-500 hover:text-gray-900'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Digital Tear-off Receipt Core */}
        <div className="p-6 space-y-6">
          {/* Visual Amount & Status Display Box */}
          <div className={`p-5 rounded-2xl text-center border relative overflow-hidden ${
            t.isDark ? 'bg-white/3 border-white/5' : 'bg-gray-50 border-black/5'
          }`}>
            <div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-white/2 pointer-events-none" />

            <span className={`text-[9px] font-mono font-bold uppercase tracking-widest ${t.textMuted} block mb-1.5`}>
              Settlement value
            </span>
            
            <span className={`text-3xl font-mono font-extrabold tracking-tight block ${
              isNegative ? 'text-rose-500' : 'text-emerald-500'
            }`}>
              {transaction.amount}
            </span>

            <div className="mt-3 flex justify-center">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono border ${
                transaction.status === 'Completed'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : transaction.status === 'Pending' || transaction.status === 'Processing'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}>
                {transaction.status}
              </span>
            </div>
          </div>

          {/* Receipt Fields */}
          <div className="space-y-4 text-xs">
            {/* Reference ID */}
            <div className="flex items-center justify-between py-1.5 border-b border-dashed border-white/5">
              <span className={`font-semibold ${t.textMuted}`}>Ledger Reference ID</span>
              <div className="flex items-center space-x-1.5">
                <span className={`font-mono font-bold ${t.text}`}>{transaction.id}</span>
                <button
                  onClick={() => onCopy(transaction.id)}
                  className="p-1 rounded hover:bg-white/5 transition-colors cursor-pointer text-gray-400 hover:text-white"
                  title="Copy TxID"
                >
                  {copiedId === transaction.id ? (
                    <Check className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>

            {/* Operation Type */}
            <div className="flex items-center justify-between py-1.5 border-b border-dashed border-white/5">
              <span className={`font-semibold ${t.textMuted}`}>Operation Type</span>
              <span className={`font-bold ${t.text}`}>{transaction.type}</span>
            </div>

            {/* Settlement Gateway */}
            <div className="flex items-center justify-between py-1.5 border-b border-dashed border-white/5">
              <span className={`font-semibold ${t.textMuted}`}>Gateway Method</span>
              <span className={`font-mono font-semibold ${t.textSub}`}>{transaction.method}</span>
            </div>

            {/* Settled UTC Time */}
            <div className="flex items-center justify-between py-1.5 border-b border-dashed border-white/5">
              <span className={`font-semibold ${t.textMuted}`}>Settled Time (UTC)</span>
              <div className="flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-gray-500" />
                <span className={`font-mono font-semibold ${t.textSub}`}>{transaction.date}</span>
              </div>
            </div>

            {/* Mimic of Transaction Proof Hash on chain */}
            <div className="space-y-1 py-1.5 border-b border-dashed border-white/5">
              <div className="flex items-center justify-between">
                <span className={`font-semibold ${t.textMuted}`}>Block Audit Proof</span>
                <button
                  onClick={() => onCopy(`0x${transaction.id.replace('TX-', '9c3b8a')}d5fe294bc1779ea`, true)}
                  className="text-[10px] text-cyan-400 hover:underline flex items-center space-x-0.5 cursor-pointer"
                >
                  {copiedHash ? (
                    <span className="text-emerald-500">Copied!</span>
                  ) : (
                    <span className="flex items-center gap-0.5">
                      Copy Hash <Copy className="w-2.5 h-2.5" />
                    </span>
                  )}
                </button>
              </div>
              <p className={`font-mono text-[10px] ${t.textMuted} break-all bg-black/15 p-2 rounded-lg border border-white/5`}>
                0x{transaction.id.replace('TX-', '9c3b8a')}d5fe294bc1779ea445cbf92b005fe
              </p>
            </div>

            {/* Confirmations and finality check */}
            <div className="flex items-center justify-between pt-1">
              <span className={`font-semibold ${t.textMuted}`}>Ledger Status</span>
              {transaction.status === 'Completed' ? (
                <div className="flex items-center space-x-1 text-emerald-400 font-bold font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>100% Finalized</span>
                </div>
              ) : transaction.status === 'Pending' || transaction.status === 'Processing' ? (
                <div className="flex items-center space-x-1 text-amber-500 font-bold font-mono animate-pulse">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Pending Consensus</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1 text-rose-500 font-bold font-mono">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Audit Rejected</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Close Action Block */}
        <div className="p-5 border-t border-white/5 flex gap-3">
          <button
            onClick={onClose}
            className={`w-full py-3 rounded-2xl text-xs font-bold transition-all duration-150 cursor-pointer text-center ${
              t.isDark
                ? 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 hover:text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 hover:text-gray-900'
            }`}
          >
            Dismiss Receipt
          </button>
        </div>
      </motion.div>
    </div>
  );
};
