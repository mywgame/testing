/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { TOKENS } from '../theme.ts';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'icon';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  type = 'button',
  ...props
}) => {
  // Base classes for consistent sizing, layout, accessibility, and typography
  const baseClasses = 'inline-flex items-center justify-center font-bold tracking-wide transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';

  // Size variations
  const sizeClasses = {
    sm: 'px-4 py-2 text-xs rounded-xl space-x-1.5',
    md: 'px-5 py-2.5 text-xs sm:text-sm rounded-2xl space-x-2',
    lg: 'px-7 py-3.5 text-xs sm:text-sm rounded-2xl space-x-2.5',
  };

  // Color & layout variations based on design tokens
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/10 focus-visible:ring-blue-600 hover:scale-[1.02] hover:-translate-y-0.5',
    secondary: 'bg-white dark:bg-white/10 hover:bg-gray-50 dark:hover:bg-white/15 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-white/10 shadow-xs focus-visible:ring-blue-600 hover:scale-[1.02] hover:-translate-y-0.5',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/10 focus-visible:ring-red-500 hover:scale-[1.02] hover:-translate-y-0.5',
    ghost: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 focus-visible:ring-blue-600',
    icon: 'p-2.5 rounded-2xl bg-white dark:bg-white/10 border border-gray-100 dark:border-white/10 text-gray-600 dark:text-gray-300 shadow-xs hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-100 dark:hover:border-blue-900 focus-visible:ring-blue-600',
  };

  // Override specific classes if it's an icon-only button without children
  const isIconOnly = variant === 'icon' || (!children && (leftIcon || rightIcon));
  const finalSizeClass = isIconOnly ? 'p-2.5 rounded-2xl' : sizeClasses[size];

  return (
    <motion.button
      type={type}
      className={`${baseClasses} ${finalSizeClass} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      whileTap={{ scale: 0.97 }}
      {...(props as any)}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {!isLoading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
      {children && <span>{children}</span>}
      {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </motion.button>
  );
};
