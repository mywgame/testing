/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Check, Sparkles, Lock, ExternalLink } from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme.ts';

interface TaskStatusButtonProps {
  status: 'LOCKED' | 'IN_PROGRESS' | 'COMPLETED' | 'CLAIMED';
  taskCode: string;
  title: string;
  rewardAmount: number;
  actionUrl?: string;
  isClaiming?: boolean;
  onClaim: (taskCode: string, title: string, rewardAmount: number) => void;
  onNavigate?: (tab: string) => void;
  fullWidth?: boolean;
  currentProgress?: number;
  targetProgress?: number;
}

export const TaskStatusButton: React.FC<TaskStatusButtonProps> = ({
  status,
  taskCode,
  title,
  rewardAmount,
  actionUrl,
  isClaiming = false,
  onClaim,
  onNavigate,
  fullWidth = false,
  currentProgress,
  targetProgress,
}) => {
  const { isDark } = useTheme();

  if (status === 'CLAIMED') {
    return (
      <span
        className={`inline-flex items-center justify-center gap-1.5 ${
          fullWidth ? 'w-full py-1.5' : 'px-4 py-2'
        } rounded-xl text-xs font-bold text-white bg-emerald-600 border border-emerald-500/30 shadow-md shadow-emerald-600/20`}
      >
        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
        <span>Claimed</span>
      </span>
    );
  }

  if (status === 'COMPLETED') {
    return (
      <button
        onClick={() => onClaim(taskCode, title, rewardAmount)}
        disabled={isClaiming}
        className={`${
          fullWidth ? 'w-full py-1.5' : 'px-4 py-2'
        } rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-600/30 active:scale-95 cursor-pointer transition-all disabled:opacity-50 inline-flex items-center justify-center gap-1.5`}
      >
        <Sparkles className="w-3.5 h-3.5 text-purple-200" />
        <span>{isClaiming ? 'Claiming...' : 'Claim'}</span>
      </button>
    );
  }

  if (status === 'IN_PROGRESS' && fullWidth && currentProgress !== undefined && targetProgress !== undefined) {
    return (
      <span
        className={`text-[10px] font-mono font-bold block ${
          isDark ? 'text-amber-400' : 'text-amber-600'
        }`}
      >
        In Progress ({currentProgress}/{targetProgress})
      </span>
    );
  }

  // Handle action navigation for Authenticator Setup and other action URLs
  if (taskCode === 'AUTHENTICATOR_SETUP' || actionUrl) {
    if (taskCode === 'AUTHENTICATOR_SETUP' || (actionUrl && !actionUrl.startsWith('http'))) {
      const handleActionClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (taskCode === 'AUTHENTICATOR_SETUP') {
          if (onNavigate) {
            onNavigate('twoFactor');
          } else {
            window.location.href = '/dashboard?tab=twoFactor';
          }
          return;
        }

        if (actionUrl) {
          if (onNavigate && actionUrl.includes('tab=')) {
            const tabParam = new URLSearchParams(actionUrl.split('?')[1] || '').get('tab');
            if (tabParam) {
              onNavigate(tabParam);
              return;
            }
          }
          window.location.href = actionUrl;
        }
      };

      return (
        <button
          type="button"
          onClick={handleActionClick}
          className={`${
            fullWidth ? 'w-full py-1.5' : 'px-4 py-2'
          } rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/30 active:scale-95 transition-all inline-flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer`}
        >
          <span>Go</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      );
    }

    return (
      <a
        href={actionUrl}
        target="_blank"
        rel="noreferrer"
        className={`${
          fullWidth ? 'w-full py-1.5' : 'px-4 py-2'
        } rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/30 active:scale-95 transition-all inline-flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20`}
      >
        <span>Go</span>
        <ExternalLink className="w-3 h-3" />
      </a>
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center gap-1.5 ${
        fullWidth ? 'w-full text-[11px] font-mono' : 'px-3.5 py-2 text-xs font-semibold border rounded-xl'
      } ${
        isDark
          ? 'bg-white/[0.04] border-white/10 text-slate-400'
          : 'bg-slate-100 border-slate-200 text-slate-500'
      }`}
    >
      <Lock className="w-3 h-3" />
      <span>Locked</span>
    </span>
  );
};
