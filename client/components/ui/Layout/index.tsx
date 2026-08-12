/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { AlertCircle, CheckCircle2, Inbox } from 'lucide-react';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const Container: React.FC<ContainerProps> = ({
  children,
  className = '',
  size = 'lg',
  ...props
}) => {
  const maxWithClass = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-7xl',
    xl: 'max-w-[1440px]',
    full: 'max-w-full',
  };

  return (
    <div
      className={`w-full mx-auto px-4 sm:px-6 lg:px-8 ${maxWithClass[size]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  badge?: string;
  title: string;
  description?: string;
  centered?: boolean;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  badge,
  title,
  description,
  centered = true,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`space-y-3 max-w-3xl ${centered ? 'mx-auto text-center' : 'text-left'} ${className}`}
      {...props}
    >
      {badge && (
        <span className="text-[10px] font-mono text-blue-600 uppercase font-bold tracking-widest block">
          {badge}
        </span>
      )}
      <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-gray-950 tracking-tight leading-none">
        {title}
      </h2>
      {description && (
        <p className="text-xs sm:text-sm text-gray-500 leading-relaxed font-sans max-w-2xl mx-auto">
          {description}
        </p>
      )}
    </div>
  );
};

interface StateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<StateProps> = ({
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/20 ${className}`}>
      <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 text-gray-400 mb-4 shadow-2xs">
        <Inbox className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-gray-950 mb-1 font-display">{title}</h3>
      <p className="text-xs text-gray-500 max-w-xs leading-relaxed font-sans mb-5">{description}</p>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
};

export const ErrorState: React.FC<StateProps> = ({
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 border border-red-100 rounded-3xl bg-red-50/10 ${className}`}>
      <div className="p-3 bg-red-50 rounded-2xl border border-red-100 text-red-600 mb-4 shadow-2xs">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-red-950 mb-1 font-display">{title}</h3>
      <p className="text-xs text-red-600/80 max-w-xs leading-relaxed font-sans mb-5">{description}</p>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
};

export const SuccessState: React.FC<StateProps> = ({
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 border border-emerald-100 rounded-3xl bg-emerald-50/10 ${className}`}>
      <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-600 mb-4 shadow-2xs">
        <CheckCircle2 className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-emerald-950 mb-1 font-display">{title}</h3>
      <p className="text-xs text-emerald-600/80 max-w-xs leading-relaxed font-sans mb-5">{description}</p>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
};
