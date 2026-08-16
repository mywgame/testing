/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { playSuccessSound } from '../../utils/sound.ts';

export interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;

  // Header Badge
  badge?: string;
  badgeIcon?: React.ReactNode;
  badgeColor?: 'emerald' | 'amber' | 'blue' | 'purple' | 'cyan';

  // Top Animated Badge Icon
  topIcon?: React.ReactNode;
  topIconColor?: 'emerald' | 'amber' | 'blue' | 'purple' | 'cyan';

  // Header Title
  title: string;

  // Amount Card
  amount: string;
  currency?: string;
  amountPrefix?: string;
  amountColor?: string;
  description?: string;

  // Status Card
  statusIcon?: React.ReactNode;
  statusTitle?: string;
  statusDescription?: string;

  // Additional custom note block (e.g. Wallet Target note)
  customFooterNote?: React.ReactNode;

  // Action Button
  buttonText?: string;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  badge = 'VERIFIED',
  badgeIcon = <ShieldCheck className="w-3.5 h-3.5" />,
  badgeColor = 'emerald',
  topIcon = <CheckCircle2 className="w-10 h-10 text-emerald-400" />,
  topIconColor = 'emerald',
  title,
  amount,
  currency = 'USDT',
  amountPrefix = '',
  amountColor = 'text-cyan-400',
  description,
  statusIcon,
  statusTitle,
  statusDescription,
  customFooterNote,
  buttonText = 'Got it',
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      playSuccessSound();
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Badge color themes
  const badgeThemeStyles = {
    emerald: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    amber: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    blue: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    purple: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    cyan: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
  };

  // Top icon glow themes
  const topIconGlowStyles = {
    emerald: {
      blur: 'bg-emerald-500/20',
      gradient: 'from-emerald-500/20 to-cyan-500/20',
      border: 'border-emerald-400/40',
    },
    amber: {
      blur: 'bg-amber-500/20',
      gradient: 'from-amber-500/20 to-orange-500/20',
      border: 'border-amber-400/40',
    },
    blue: {
      blur: 'bg-blue-500/20',
      gradient: 'from-blue-500/20 to-cyan-500/20',
      border: 'border-blue-400/40',
    },
    purple: {
      blur: 'bg-purple-500/20',
      gradient: 'from-purple-500/20 to-pink-500/20',
      border: 'border-purple-400/40',
    },
    cyan: {
      blur: 'bg-cyan-500/20',
      gradient: 'from-cyan-500/20 to-blue-500/20',
      border: 'border-cyan-400/40',
    },
  };

  const currentBadgeStyle = badgeThemeStyles[badgeColor] || badgeThemeStyles.emerald;
  const currentTopIconStyle = topIconGlowStyles[topIconColor] || topIconGlowStyles.emerald;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6" id="success-modal">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-md"
          aria-hidden="true"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-md bg-slate-900/95 border border-cyan-500/30 rounded-[32px] p-6 sm:p-8 shadow-[0_0_60px_rgba(6,182,212,0.18)] relative z-10 overflow-hidden text-center text-white"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Animated Top Icon Badge */}
          <div className="relative mx-auto w-20 h-20 mb-5 flex items-center justify-center">
            <div className={`absolute inset-0 rounded-full ${currentTopIconStyle.blur} blur-xl animate-pulse`} />
            <div className={`w-20 h-20 rounded-full bg-gradient-to-tr ${currentTopIconStyle.gradient} border ${currentTopIconStyle.border} flex items-center justify-center relative shadow-inner`}>
              {topIcon}
            </div>
          </div>

          {/* Header Title & Badge */}
          <div className="space-y-1 mb-4">
            {badge && (
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${currentBadgeStyle} text-[11px] font-mono font-bold tracking-wider uppercase mb-1`}>
                {badgeIcon}
                <span>{badge}</span>
              </div>
            )}
            <h3 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight">
              {title}
            </h3>
          </div>

          {/* Amount Card */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 my-4 space-y-2">
            <div className={`flex items-center justify-center gap-2 text-2xl sm:text-3xl font-extrabold font-mono ${amountColor}`}>
              <span>{amountPrefix}{amount}</span>
              {currency && <span className="text-sm font-sans font-bold text-gray-300">{currency}</span>}
            </div>
            {description && (
              <p className="text-xs text-gray-300 font-medium leading-relaxed">
                {description}
              </p>
            )}
          </div>

          {/* Status Card */}
          {(statusTitle || statusDescription || statusIcon) && (
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 my-4 space-y-1.5 text-center">
              {(statusTitle || statusIcon) && (
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-amber-400">
                  {statusIcon && <span className="text-sm shrink-0">{statusIcon}</span>}
                  {statusTitle && <span>{statusTitle}</span>}
                </div>
              )}
              {statusDescription && (
                <p className="text-[11px] text-gray-300 leading-relaxed font-medium">
                  {statusDescription}
                </p>
              )}
            </div>
          )}

          {/* Custom Footer Note (if passed) */}
          {customFooterNote}

          {/* Action Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-full mt-2 py-3.5 px-6 rounded-2xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:opacity-95 shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-all cursor-pointer"
          >
            {buttonText}
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SuccessModal;
