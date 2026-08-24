/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  id?: string;
  forceLight?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  id,
  forceLight = false,
}) => {
  // Prevent scrolling behind open modal
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={`fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3.5 sm:p-6 ${forceLight ? 'light' : ''}`} id={id}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-gray-950/40 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Modal content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={`w-full ${sizes[size]} ${
              forceLight
                ? 'bg-white border border-slate-200 text-slate-900'
                : 'bg-white dark:bg-[#0f112e] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white'
            } rounded-[24px] sm:rounded-[28px] p-6 sm:p-8 shadow-2xl relative z-10 overflow-hidden text-left`}
            role="dialog"
            aria-modal="true"
          >
            {/* Header row / Close button */}
            {title ? (
              <div className={`flex items-center justify-between pb-3.5 border-b ${forceLight ? 'border-slate-100' : 'border-slate-100 dark:border-white/10'} mb-4 sm:mb-5`}>
                <h3 className={`text-base sm:text-lg font-display font-bold ${forceLight ? 'text-slate-950' : 'text-slate-950 dark:text-white'}`}>
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  className={`w-8 h-8 rounded-full ${
                    forceLight
                      ? 'bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-200'
                      : 'bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/20'
                  } flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer`}
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onClose}
                className={`absolute top-4 right-4 sm:top-5 sm:right-5 z-20 w-8 h-8 rounded-full ${
                  forceLight
                    ? 'bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-200'
                    : 'bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/20'
                } flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer`}
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Main content body */}
            <div className={`max-h-[70vh] overflow-y-auto pr-1 ${forceLight ? 'text-slate-900' : 'text-slate-900 dark:text-white'}`}>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

interface DialogProps extends ModalProps {
  type?: 'success' | 'warning' | 'error' | 'info';
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  description: string;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  type = 'info',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  size = 'sm',
}) => {
  const icons = {
    info: <AlertCircle className="w-6 h-6 text-blue-600" />,
    success: <CheckCircle2 className="w-6 h-6 text-emerald-600" />,
    warning: <ShieldAlert className="w-6 h-6 text-amber-600" />,
    error: <ShieldAlert className="w-6 h-6 text-red-600" />,
  };

  const ringColors = {
    info: 'bg-blue-50 border-blue-100 text-blue-600',
    success: 'bg-emerald-50 border-emerald-100 text-emerald-600',
    warning: 'bg-amber-50 border-amber-100 text-amber-600',
    error: 'bg-red-50 border-red-100 text-red-600',
  };

  const confirmColors = {
    info: 'bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-600 shadow-blue-500/10',
    success: 'bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-600 shadow-emerald-500/10',
    warning: 'bg-amber-500 hover:bg-amber-600 focus-visible:ring-amber-500 shadow-amber-500/10',
    error: 'bg-red-600 hover:bg-red-700 focus-visible:ring-red-500 shadow-red-500/10',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={size}>
      <div className="flex flex-col items-center text-center space-y-4 py-4">
        <div className={`p-3.5 rounded-2xl border flex items-center justify-center ${ringColors[type]} shadow-2xs`}>
          {icons[type]}
        </div>
        
        <div className="space-y-1.5 max-w-sm">
          {title && (
            <h4 className="text-base sm:text-lg font-display font-bold text-gray-950 dark:text-white">
              {title}
            </h4>
          )}
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-sans">
            {description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-sm">
          <button
            onClick={onClose}
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center px-5 py-2.5 bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200 font-bold rounded-2xl text-xs sm:text-sm transition-all hover:bg-gray-50 dark:hover:bg-white/15 active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
          >
            {cancelLabel}
          </button>
          {onConfirm && (
            <button
              onClick={onConfirm}
              className={`w-full sm:w-auto flex-1 inline-flex items-center justify-center px-5 py-2.5 text-white font-bold rounded-2xl text-xs sm:text-sm transition-all hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 shadow-md ${confirmColors[type]}`}
            >
              {confirmLabel}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};
