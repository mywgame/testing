/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Sparkles, 
  Copy, 
  Check, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Receipt as ReceiptIcon,
  ShieldCheck
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
  // Lock body scroll when modal is open and handle ESC key
  useEffect(() => {
    if (!transaction) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [transaction, onClose]);

  if (!transaction || typeof document === 'undefined') return null;

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
  const isDark = t?.isDark ?? true;

  const mockTxHash = `0x${(transaction.id || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase().padEnd(12, 'a')}d5fe294bc1779ea445cbf92b005fe`;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[99999] overflow-y-auto flex items-center justify-center p-3.5 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop blur overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/75 dark:bg-[#02030a]/90 backdrop-blur-md transition-opacity z-0"
      />

      {/* Receipt Modal Card - perfectly centered in viewport & scrollable if screen is small */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ type: 'spring', damping: 26, stiffness: 340 }}
        className={`relative w-full max-w-md my-auto max-h-[92vh] flex flex-col backdrop-blur-2xl rounded-3xl overflow-hidden z-10 text-left transition-all ${
          isDark
            ? 'bg-[#0b0f24]/95 border border-white/15 text-white shadow-[0_25px_60px_rgba(0,0,0,0.8)] ring-1 ring-white/10'
            : 'bg-white/95 border border-gray-200/90 text-gray-900 shadow-[0_25px_60px_rgba(0,0,0,0.2)] ring-1 ring-gray-900/5'
        }`}
      >
        {/* Colored ambient glow orb behind modal based on status */}
        <div 
          className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-32 blur-3xl rounded-full opacity-20 pointer-events-none"
          style={{ background: statusColor }}
        />

        {/* Modal Header */}
        <div className={`flex items-center justify-between p-4 sm:p-5 border-b shrink-0 ${
          isDark ? 'border-white/10 bg-white/[0.02]' : 'border-gray-100 bg-gray-50/80'
        }`}>
          <div className="flex items-center space-x-2.5">
            <div className={`p-1.5 rounded-xl border ${
              isDark ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-cyan-50 border-cyan-200 text-cyan-600'
            }`}>
              <ReceiptIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className={`text-xs sm:text-sm font-display font-bold tracking-wider uppercase ${
                isDark ? 'text-gray-200' : 'text-gray-800'
              }`}>
                Audit Transaction Receipt
              </h3>
              <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                <ShieldCheck className="w-3 h-3 inline" /> Verified On-Chain Record
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
              isDark 
                ? 'bg-white/5 hover:bg-white/15 border-white/10 text-gray-400 hover:text-white' 
                : 'bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-500 hover:text-gray-900'
            }`}
            title="Close receipt"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Receipt Core */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto">
          {/* Visual Amount & Status Display Box */}
          <div className={`p-4 sm:p-5 rounded-2xl text-center border relative overflow-hidden transition-all ${
            isDark 
              ? 'bg-gradient-to-b from-white/[0.06] to-white/[0.02] border-white/10 shadow-inner' 
              : 'bg-gradient-to-b from-gray-50 to-gray-100/70 border-gray-200/90 shadow-xs'
          }`}>
            <span className={`text-[10px] font-mono font-bold uppercase tracking-widest block mb-1.5 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Settlement Value
            </span>
            
            <span className={`text-3xl sm:text-4xl font-mono font-black tracking-tight block ${
              isNegative 
                ? (isDark ? 'text-rose-400' : 'text-rose-600') 
                : (isDark ? 'text-emerald-400' : 'text-emerald-600')
            }`}>
              {transaction.amount}
            </span>

            <div className="mt-3 flex justify-center">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wide ${
                transaction.status === 'Completed'
                  ? (isDark ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs')
                  : transaction.status === 'Pending' || transaction.status === 'Processing'
                  ? (isDark ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-amber-100 text-amber-800 border border-amber-300')
                  : (isDark ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-rose-100 text-rose-800 border border-rose-300')
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  transaction.status === 'Completed' ? 'bg-emerald-500' : transaction.status === 'Pending' ? 'bg-amber-500 animate-pulse' : 'bg-rose-500'
                }`} />
                {transaction.status}
              </span>
            </div>
          </div>

          {/* Receipt Fields */}
          <div className={`space-y-3 text-xs p-3.5 sm:p-4 rounded-2xl border ${
            isDark ? 'bg-black/30 border-white/10' : 'bg-gray-50/80 border-gray-200/90'
          }`}>
            {/* Reference ID */}
            <div className={`flex items-center justify-between py-1.5 border-b border-dashed ${
              isDark ? 'border-white/10' : 'border-gray-200'
            }`}>
              <span className={`font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Ledger Reference ID</span>
              <div className="flex items-center space-x-1.5 font-mono">
                <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{transaction.id}</span>
                <button
                  onClick={() => onCopy(transaction.id)}
                  className={`p-1 rounded transition-colors cursor-pointer ${
                    isDark 
                      ? 'hover:bg-white/10 text-gray-400 hover:text-white' 
                      : 'hover:bg-gray-200 text-gray-500 hover:text-gray-900'
                  }`}
                  title="Copy TxID"
                >
                  {copiedId === transaction.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Operation Type */}
            <div className={`flex items-center justify-between py-1.5 border-b border-dashed ${
              isDark ? 'border-white/10' : 'border-gray-200'
            }`}>
              <span className={`font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Operation Type</span>
              <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{transaction.type}</span>
            </div>

            {/* Settlement Gateway */}
            <div className={`flex items-center justify-between py-1.5 border-b border-dashed ${
              isDark ? 'border-white/10' : 'border-gray-200'
            }`}>
              <span className={`font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Gateway / Method</span>
              <span className={`font-mono font-semibold ${isDark ? 'text-cyan-400' : 'text-blue-600'}`}>{transaction.method}</span>
            </div>

            {/* Settled Time */}
            <div className={`flex items-center justify-between py-1.5 border-b border-dashed ${
              isDark ? 'border-white/10' : 'border-gray-200'
            }`}>
              <span className={`font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Settled Time</span>
              <div className="flex items-center space-x-1.5 font-mono">
                <Clock className={`w-3.5 h-3.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <span className={`font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{transaction.date}</span>
              </div>
            </div>

            {/* Mimic of Transaction Proof Hash on chain */}
            <div className={`space-y-1.5 py-1.5 border-b border-dashed ${
              isDark ? 'border-white/10' : 'border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Block Audit Proof</span>
                <button
                  onClick={() => onCopy(mockTxHash, true)}
                  className={`text-[11px] font-semibold flex items-center space-x-1 cursor-pointer transition-colors ${
                    isDark ? 'text-cyan-400 hover:text-cyan-300' : 'text-blue-600 hover:text-blue-700'
                  }`}
                >
                  {copiedHash ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Copied Proof!
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <span>Copy Proof</span>
                      <Copy className="w-3 h-3" />
                    </span>
                  )}
                </button>
              </div>
              <p className={`font-mono text-[10px] break-all p-2 rounded-lg border leading-relaxed select-all ${
                isDark 
                  ? 'bg-black/50 text-gray-300 border-white/10' 
                  : 'bg-white text-gray-700 border-gray-300 shadow-2xs'
              }`}>
                {mockTxHash}
              </p>
            </div>

            {/* Confirmations and finality check */}
            <div className="flex items-center justify-between pt-1">
              <span className={`font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Consensus Status</span>
              {transaction.status === 'Completed' ? (
                <div className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>100% Finalized</span>
                </div>
              ) : transaction.status === 'Pending' || transaction.status === 'Processing' ? (
                <div className="flex items-center space-x-1.5 text-amber-600 dark:text-amber-400 font-bold font-mono animate-pulse">
                  <Clock className="w-4 h-4" />
                  <span>Pending Consensus</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1.5 text-rose-600 dark:text-rose-400 font-bold font-mono">
                  <AlertCircle className="w-4 h-4" />
                  <span>Audit Rejected</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Close Action Block */}
        <div className={`p-3.5 sm:p-4 border-t flex gap-3 shrink-0 ${
          isDark ? 'border-white/10 bg-white/[0.02]' : 'border-gray-100 bg-gray-50/80'
        }`}>
          <button
            onClick={onClose}
            className={`w-full py-2.5 sm:py-3 rounded-2xl text-xs font-bold transition-all duration-150 cursor-pointer text-center shadow-xs ${
              isDark
                ? 'bg-white/10 hover:bg-white/15 text-white border border-white/15 hover:border-white/25'
                : 'bg-gray-900 hover:bg-black text-white border border-gray-900 shadow-sm'
            }`}
          >
            Dismiss Receipt
          </button>
        </div>
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

