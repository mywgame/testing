/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme.ts';

interface DashboardLayoutProps {
  title?: string;
  description?: string;
  onBack?: () => void;
  children: React.ReactNode;
  variant?: 'card' | 'blank';
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  title,
  description,
  onBack,
  children,
  variant = 'card',
}) => {
  const { t } = useTheme();

  if (variant === 'blank') {
    return (
      <div className="space-y-6 w-full text-left">
        {onBack && (
          <div className="flex items-center">
            <button
              onClick={onBack}
              className={`inline-flex items-center space-x-1.5 text-xs font-semibold transition-colors cursor-pointer ${t.textSub} hover:text-cyan-500`}
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
              <span>Back to Overview</span>
            </button>
          </div>
        )}
        {children}
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full text-left" id="dashboard-layout-container">
      {onBack && (
        <div className="flex items-center mb-1">
          <button
            onClick={onBack}
            className={`inline-flex items-center space-x-1.5 text-xs font-semibold transition-colors cursor-pointer ${t.textSub} hover:text-cyan-500`}
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
            <span>Back to Overview</span>
          </button>
        </div>
      )}
      
      <div className={`rounded-2xl sm:rounded-3xl border p-3 xs:p-4 sm:p-6 md:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl ${t.card} ${t.sep}`}>
        {/* Subtle decorative glow orbs inside the layout container */}
        <div className={`absolute -right-16 -top-16 w-64 h-64 rounded-full blur-3xl pointer-events-none transform-gpu ${t.isDark ? 'bg-cyan-500/10' : 'bg-violet-400/10'}`} />
        <div className={`absolute -left-10 -bottom-10 w-48 h-48 rounded-full blur-3xl pointer-events-none transform-gpu ${t.isDark ? 'bg-purple-600/10' : 'bg-sky-400/10'}`} />

        <div className="relative space-y-6">
          {(title || description) && (
            <div className={`space-y-1 border-b pb-4 ${t.sep}`}>
              {title && (
                <h2 className={`font-display font-extrabold text-xl sm:text-2xl ${t.text} tracking-tight`}>
                  {title}
                </h2>
              )}
              {description && (
                <p className={`text-xs sm:text-sm ${t.textSub} leading-relaxed max-w-2xl`}>
                  {description}
                </p>
              )}
            </div>
          )}
          
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
