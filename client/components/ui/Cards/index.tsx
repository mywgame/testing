/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { TOKENS } from '../theme.ts';
import { Copy, Check } from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme.ts';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverEffect = true,
  ...props
}) => {
  const { t, isDark } = useTheme();
  return (
    <div
      className={`backdrop-blur-xl border rounded-2xl p-5 transition-all duration-300 ${t.card} ${
        hoverEffect 
          ? isDark 
            ? 'hover:border-white/25 hover:shadow-[0_12px_32px_rgba(255,255,255,0.02)]' 
            : 'hover:border-blue-100/80 hover:shadow-[0_12px_32px_rgba(37,99,235,0.035)]' 
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
}

const truncateId = (str: string) => {
  if (str.length <= 15) return str;
  return `${str.slice(0, 9)}...${str.slice(-4)}`;
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  trendDirection = 'neutral',
  className = '',
  ...props
}) => {
  const { t, isDark } = useTheme();
  const [copied, setCopied] = useState(false);
  const isUserId = title.toLowerCase().includes('user id') || title.toLowerCase().includes('operator');

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(String(value));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayValue = isUserId ? truncateId(String(value)) : value;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className={`backdrop-blur-xl border rounded-2xl p-4.5 flex flex-col justify-between h-full w-full min-h-[135px] relative overflow-hidden group transition-all duration-300 ${t.card} ${className}`}
      {...props}
    >
      <div className="flex items-start justify-between w-full gap-2 mb-2.5">
        <span className={`text-[10px] font-mono font-bold uppercase tracking-wider block truncate ${t.textMuted}`}>
          {title}
        </span>
        {icon && (
          <div className={`p-2 rounded-xl transition-all duration-300 flex-shrink-0 border ${
            isDark 
              ? 'bg-white/5 border-white/10 text-gray-400 group-hover:scale-105 group-hover:bg-blue-600/20 group-hover:text-blue-400' 
              : 'bg-gray-50 border-gray-100 text-gray-400 group-hover:scale-105 group-hover:bg-blue-50 group-hover:text-blue-600'
          }`}>
            {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement, { className: 'w-4 h-4' }) : icon}
          </div>
        )}
      </div>

      <div className="space-y-1 text-left w-full flex-grow flex flex-col justify-end">
        <div className="flex items-center gap-1.5 min-w-0">
          <span 
            className={`text-base sm:text-lg font-display font-extrabold tracking-tight leading-none truncate flex-grow ${t.text}`}
            title={String(value)}
          >
            {displayValue}
          </span>
          {isUserId && (
            <button
              onClick={handleCopy}
              className={`p-1 rounded border transition-colors flex-shrink-0 cursor-pointer ${
                isDark 
                  ? 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border-white/10' 
                  : 'bg-gray-50 hover:bg-blue-50 text-gray-400 hover:text-blue-600 border-gray-100'
              }`}
              title="Copy ID"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
            </button>
          )}
        </div>
        
        {trend && (
          <div className={`pt-2 border-t w-full flex items-center space-x-1.5 text-[9px] font-mono leading-none mt-1.5 ${t.sep}`}>
            <span
              className={`font-bold ${
                trendDirection === 'up'
                  ? 'text-emerald-500'
                  : trendDirection === 'down'
                  ? 'text-red-400'
                  : t.textSub
              }`}
            >
              {trend}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

interface InfoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  icon?: React.ReactNode;
  badge?: string;
  badgeVariant?: 'primary' | 'amber' | 'emerald';
}

export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  children,
  icon,
  badge,
  badgeVariant = 'primary',
  className = '',
  ...props
}) => {
  const { t, isDark } = useTheme();
  const badgeColors = isDark 
    ? {
        primary: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
        amber: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
        emerald: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      }
    : {
        primary: 'bg-blue-50 text-blue-700 border border-blue-100',
        amber: 'bg-amber-50 text-amber-700 border border-amber-100',
        emerald: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
      };

  return (
    <div
      className={`backdrop-blur-xl border rounded-2xl p-5 transition-all duration-300 text-left space-y-4 group ${t.card} ${className}`}
      {...props}
    >
      <div className="flex items-center justify-between">
        {icon && (
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-xs transition-all duration-300 ${
            isDark 
              ? 'bg-blue-500/10 text-blue-400 group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white' 
              : 'bg-blue-50 text-blue-600 group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white'
          }`}>
            {icon}
          </div>
        )}
        {badge && (
          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-extrabold uppercase tracking-wider ${badgeColors[badgeVariant]}`}>
            {badge}
          </span>
        )}
      </div>
      <div className="space-y-1.5">
        <h3 className={`font-display font-semibold text-sm sm:text-base group-hover:text-blue-500 transition-colors duration-200 ${t.text}`}>
          {title}
        </h3>
        <div className={`text-xs leading-relaxed font-sans ${t.textSub}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export const GlassCard: React.FC<CardProps> = ({
  children,
  className = '',
  hoverEffect = true,
  ...props
}) => {
  const { t } = useTheme();
  return (
    <div
      className={`backdrop-blur-xl border rounded-2xl p-5 sm:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.02)] relative overflow-hidden transition-all duration-300 ${t.card} ${
        hoverEffect ? 'hover:shadow-[0_16px_48px_rgba(0,0,0,0.04)]' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const TableContainer: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => {
  const { t } = useTheme();
  return (
    <div
      className={`backdrop-blur-xl border rounded-2xl shadow-xs overflow-hidden transition-all duration-300 ${t.card} ${className}`}
      {...props}
    >
      <div className="overflow-x-auto">
        {children}
      </div>
    </div>
  );
};
