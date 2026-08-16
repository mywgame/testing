/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { playSuccessSound, playNotificationSound, playErrorSound } from '../../../utils/sound.ts';

interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  onClose,
  className = '',
}) => {
  const styles = {
    info: {
      bg: 'bg-blue-50/50 border-blue-100/80 text-blue-800',
      icon: <Info className="w-4 h-4 text-blue-600 mt-0.5" />,
    },
    success: {
      bg: 'bg-emerald-50/50 border-emerald-100/80 text-emerald-800',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" />,
    },
    warning: {
      bg: 'bg-amber-50/50 border-amber-100/80 text-amber-800',
      icon: <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />,
    },
    error: {
      bg: 'bg-red-50/50 border-red-100/80 text-red-800',
      icon: <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />,
    },
  };

  return (
    <div className={`p-4 border rounded-2xl flex items-start space-x-3 text-left text-xs sm:text-sm ${styles[variant].bg} ${className}`}>
      <span className="flex-shrink-0">{styles[variant].icon}</span>
      <div className="flex-grow space-y-1">
        {title && <h5 className="font-bold font-display">{title}</h5>}
        <div className="font-sans leading-relaxed opacity-90">{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-black/5 text-current opacity-60 hover:opacity-100 transition-opacity"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

interface BadgeProps {
  variant?: 'primary' | 'amber' | 'emerald' | 'rose' | 'neutral';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'primary',
  children,
  className = '',
}) => {
  const styles = {
    primary: 'bg-blue-50 text-blue-700 border border-blue-100',
    amber: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30',
    emerald: 'bg-emerald-600 text-white font-bold shadow-xs',
    rose: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30',
    neutral: 'bg-gray-100 text-gray-700 border border-gray-200',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-mono font-extrabold uppercase tracking-wider ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
};

interface ChipProps {
  label: string;
  selected?: boolean;
  onSelect?: () => void;
  onDelete?: () => void;
  className?: string;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onSelect,
  onDelete,
  className = '',
}) => {
  return (
    <div
      onClick={onSelect}
      className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border select-none transition-all duration-150 ${
        selected
          ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
      } ${className}`}
    >
      <span>{label}</span>
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className={`p-0.5 rounded-md ${selected ? 'hover:bg-blue-700' : 'hover:bg-gray-100'} transition-colors`}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  // Generate clean initials
  const initials = name
    .split(' ')
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div
      className={`flex-shrink-0 relative rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center font-bold text-gray-700 font-display ${sizeClasses[size]} ${className}`}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  className = '',
}) => {
  const [show, setShow] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-950 text-white text-[10px] font-semibold rounded-lg shadow-sm whitespace-nowrap z-50 pointer-events-none font-sans ${className}`}>
          {content}
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-950" />
        </div>
      )}
    </div>
  );
};

interface PopoverProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Popover: React.FC<PopoverProps> = ({ trigger, children, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">{trigger}</div>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className={`absolute bottom-full mb-3 right-0 w-64 p-4 rounded-2xl bg-white border border-gray-100 shadow-[0_12px_36px_rgba(0,0,0,0.08)] z-50 text-left ${className}`}>
            {children}
          </div>
        </>
      )}
    </div>
  );
};

interface ToastProps {
  message: string;
  variant?: 'info' | 'success' | 'error';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  variant = 'success',
  onClose,
}) => {
  useEffect(() => {
    if (variant === 'success') {
      playSuccessSound();
    } else if (variant === 'error') {
      playErrorSound();
    } else {
      playNotificationSound();
    }
  }, [variant, message]);

  const icons = {
    info: <Info className="w-4 h-4 text-blue-600" />,
    success: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
    error: <AlertCircle className="w-4 h-4 text-red-600" />,
  };

  const borders = {
    info: 'border-blue-100',
    success: 'border-emerald-100',
    error: 'border-red-100',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={`fixed bottom-6 left-6 z-50 max-w-sm flex items-center space-x-3 bg-white border ${borders[variant]} px-4 py-3.5 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.08)] text-left`}
    >
      <span className="flex-shrink-0">{icons[variant]}</span>
      <span className="text-xs font-bold text-gray-800 leading-none flex-grow font-sans">{message}</span>
      <button
        onClick={onClose}
        className="p-1 rounded-md hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </motion.div>
  );
};
