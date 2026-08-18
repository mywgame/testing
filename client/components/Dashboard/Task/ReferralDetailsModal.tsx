/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Users, CheckCircle2, Clock, Calendar, UserCheck, Gift } from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme.ts';
import { ReferralChildDetailDTO } from '../../../services/taskService.ts';

interface ReferralDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  referrals: ReferralChildDetailDTO[];
  unitReward?: number;
  totalEarned?: number;
  onClaim?: () => void;
  isClaiming?: boolean;
  unclaimedCount?: number;
}

// Helper to extract first 2 uppercase characters from username or fallback to DS
const getInitials = (username?: string | null, userId?: string): string => {
  if (!username) {
    return userId ? userId.substring(0, 2).toUpperCase() : 'DS';
  }
  // Strip non-alphanumeric chars for initials
  const clean = username.trim().replace(/[^a-zA-Z0-9]/g, '');
  if (clean.length >= 2) {
    return clean.substring(0, 2).toUpperCase();
  } else if (clean.length === 1) {
    return (clean + 'X').toUpperCase();
  }
  return userId ? userId.substring(0, 2).toUpperCase() : 'DS';
};

// Deterministic pastel avatar gradient based on username/id
const getAvatarGradient = (str: string, isDark: boolean): string => {
  const charCode = (str.charCodeAt(0) || 0) + (str.charCodeAt(1) || 0);
  const variants = isDark
    ? [
        'from-purple-600/30 to-indigo-600/30 border-purple-500/40 text-purple-300',
        'from-blue-600/30 to-cyan-600/30 border-blue-500/40 text-cyan-300',
        'from-emerald-600/30 to-teal-600/30 border-emerald-500/40 text-emerald-300',
        'from-amber-600/30 to-orange-600/30 border-amber-500/40 text-amber-300',
        'from-pink-600/30 to-rose-600/30 border-pink-500/40 text-pink-300',
      ]
    : [
        'from-purple-100 to-indigo-100 border-purple-300 text-purple-700',
        'from-blue-100 to-cyan-100 border-blue-300 text-blue-700',
        'from-emerald-100 to-teal-100 border-emerald-300 text-emerald-700',
        'from-amber-100 to-orange-100 border-amber-300 text-amber-800',
        'from-pink-100 to-rose-100 border-pink-300 text-pink-700',
      ];
  return variants[charCode % variants.length];
};

export const ReferralDetailsModal: React.FC<ReferralDetailsModalProps> = ({
  isOpen,
  onClose,
  referrals,
  unitReward = 0.1,
  onClaim,
  isClaiming = false,
}) => {
  const { t, isDark } = useTheme();

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const totalAggregatedCount = referrals.length;
  const claimedCount = referrals.filter((r) => r.isClaimed).length;
  const pendingCount = totalAggregatedCount - claimedCount;
  const totalReceivedAmount = claimedCount * unitReward;
  const pendingClaimAmount = pendingCount * unitReward;

  const modalContent = (
    <div
      id="referral-details-modal-overlay"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="referral-details-modal-content"
        className={`w-full max-w-lg sm:max-w-xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[88vh] sm:max-h-[85vh] my-auto transition-all ${
          isDark
            ? 'bg-[#0f1422] border-white/10 text-white backdrop-blur-xl shadow-purple-950/40'
            : 'bg-white border-slate-200/90 text-slate-900 backdrop-blur-xl shadow-slate-900/20'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header with Subtle Glass Backdrop */}
        <div
          className={`px-4 sm:px-6 py-4 border-b flex items-center justify-between shrink-0 ${
            isDark
              ? 'border-white/10 bg-white/[0.03]'
              : 'border-slate-100 bg-gradient-to-r from-slate-50/90 to-purple-50/40'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center border shrink-0 shadow-sm ${
                isDark
                  ? 'bg-purple-500/15 border-purple-500/30 text-purple-400 shadow-purple-500/10'
                  : 'bg-purple-100/80 border-purple-300 text-purple-700 shadow-purple-200/50'
              }`}
            >
              <Users className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold font-display leading-tight truncate">
                Referral Registration Rewards
              </h3>
              <p className={`text-xs truncate ${t.textMuted}`}>
                Aggregated breakdown of registered direct referrals
              </p>
            </div>
          </div>
          <button
            id="btn-close-referral-details"
            onClick={onClose}
            className={`p-2 rounded-xl border transition-all shrink-0 ml-2 cursor-pointer active:scale-95 ${
              isDark
                ? 'border-white/10 hover:bg-white/10 text-slate-400 hover:text-white'
                : 'border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-900'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Metric Summary Ribbon with Glassy Cards */}
        <div
          className={`grid grid-cols-3 gap-2.5 p-3.5 sm:p-5 border-b shrink-0 ${
            isDark ? 'border-white/5 bg-black/20' : 'border-slate-100 bg-slate-50/60'
          }`}
        >
          <div
            className={`p-3 rounded-2xl border text-center sm:text-left transition-all ${
              isDark
                ? 'bg-white/[0.03] border-white/10 backdrop-blur-sm'
                : 'bg-white border-slate-200/90 shadow-2xs'
            }`}
          >
            <span className={`text-[9px] sm:text-[10px] font-mono uppercase block font-semibold leading-tight ${t.textMuted}`}>
              Direct Referrals
            </span>
            <span className="text-base sm:text-lg font-bold font-mono mt-1 block leading-tight">
              {totalAggregatedCount}
            </span>
          </div>

          <div
            className={`p-3 rounded-2xl border text-center sm:text-left transition-all ${
              isDark
                ? 'bg-emerald-500/[0.06] border-emerald-500/25 text-emerald-400 backdrop-blur-sm'
                : 'bg-emerald-50/80 border-emerald-200 text-emerald-700 shadow-2xs'
            }`}
          >
            <span className="text-[9px] sm:text-[10px] font-mono uppercase block font-semibold leading-tight">
              Total Received
            </span>
            <span className="text-base sm:text-lg font-extrabold font-mono mt-1 block leading-tight">
              +${totalReceivedAmount.toFixed(2)}
            </span>
          </div>

          <div
            className={`p-3 rounded-2xl border text-center sm:text-left transition-all ${
              pendingCount > 0
                ? isDark
                  ? 'bg-purple-500/[0.08] border-purple-500/30 text-purple-300 shadow-sm shadow-purple-500/10 backdrop-blur-sm'
                  : 'bg-purple-50/90 border-purple-300 text-purple-700 shadow-2xs'
                : isDark
                ? 'bg-white/[0.03] border-white/10 text-slate-400 backdrop-blur-sm'
                : 'bg-white border-slate-200/90 text-slate-500 shadow-2xs'
            }`}
          >
            <span className="text-[9px] sm:text-[10px] font-mono uppercase block font-semibold leading-tight">
              Claimable Bonus
            </span>
            <span className="text-base sm:text-lg font-extrabold font-mono mt-1 block leading-tight">
              ${pendingClaimAmount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Clean Responsive Table List */}
        <div className="flex-1 overflow-y-auto min-h-[220px]">
          {referrals.length === 0 ? (
            <div className="py-14 text-center space-y-3 px-4">
              <div
                className={`w-14 h-14 mx-auto rounded-3xl flex items-center justify-center border shadow-inner ${
                  isDark ? 'bg-white/5 border-white/10 text-slate-500' : 'bg-slate-100 border-slate-200 text-slate-400'
                }`}
              >
                <UserCheck className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold">No direct referrals yet</p>
                <p className={`text-xs max-w-xs mx-auto leading-relaxed ${t.textMuted}`}>
                  Share your referral link with friends. For every friend that registers, you receive $0.10 USDT instantly!
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full">
              {/* Table Header */}
              <div
                className={`flex items-center justify-between px-4 sm:px-6 py-2.5 border-b text-[10px] sm:text-[11px] font-extrabold font-display uppercase tracking-wider ${
                  isDark
                    ? 'border-white/5 bg-white/[0.02] text-slate-400'
                    : 'border-slate-100 bg-slate-50/90 text-slate-500'
                }`}
              >
                <span className="w-[58%] sm:w-[60%]">User / DS ID</span>
                <span className="w-[42%] sm:w-[40%] text-right">Reward / Status</span>
              </div>

              {/* Table Body / Rows */}
              <div className={`divide-y ${isDark ? 'divide-white/5' : 'divide-slate-100'}`}>
                {referrals.map((item, idx) => {
                  const formattedDate = new Date(item.registeredAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });

                  // Generate 2-letter initials from username (e.g., amit -> AM, Alex -> AL)
                  const initials = getInitials(item.username, item.userId);
                  const avatarColorClass = getAvatarGradient(item.username || item.userId, isDark);

                  return (
                    <div
                      key={item.childId || idx}
                      id={`referral-item-${item.userId}`}
                      className={`px-4 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between gap-2.5 transition-colors ${
                        item.isClaimed
                          ? isDark
                            ? 'hover:bg-white/[0.02]'
                            : 'hover:bg-slate-50/60'
                          : isDark
                          ? 'bg-purple-500/[0.03] hover:bg-purple-500/[0.07]'
                          : 'bg-purple-50/40 hover:bg-purple-50/80'
                      }`}
                    >
                      {/* Left: 2-Digit Avatar + Username + DS ID + Date */}
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 w-[58%] sm:w-[60%]">
                        {/* Dynamic 2-Letter Username Avatar */}
                        <div
                          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl border bg-gradient-to-br flex items-center justify-center shrink-0 font-mono font-black text-xs sm:text-sm shadow-xs ${avatarColorClass}`}
                          title={item.username}
                        >
                          {initials}
                        </div>

                        <div className="flex flex-col min-w-0 overflow-hidden space-y-0.5">
                          {/* Username and DS ID Badge */}
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span
                              className={`font-display font-bold text-xs sm:text-sm tracking-tight truncate ${
                                isDark ? 'text-slate-100' : 'text-slate-900'
                              }`}
                              title={item.username}
                            >
                              {item.username}
                            </span>
                            <span
                              className={`text-[10px] sm:text-xs font-mono font-semibold shrink-0 px-1 py-0.2 rounded ${
                                isDark
                                  ? 'text-cyan-400 bg-cyan-400/10 border border-cyan-400/20'
                                  : 'text-cyan-700 bg-cyan-50 border border-cyan-200'
                              }`}
                            >
                              {item.userId}
                            </span>
                          </div>

                          {/* Joined Date */}
                          <div className={`flex items-center gap-1 text-[10px] sm:text-[11px] font-mono leading-none ${t.textMuted}`}>
                            <Calendar className="w-2.5 h-2.5 shrink-0 opacity-70" />
                            <span className="truncate">{formattedDate}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Reward Amount + Status Badge */}
                      <div className="flex flex-col items-end justify-center min-w-0 w-[42%] sm:w-[40%] space-y-1">
                        <span
                          className={`font-mono font-extrabold text-xs sm:text-sm tracking-tight leading-tight ${
                            item.isClaimed
                              ? isDark
                                ? 'text-emerald-400'
                                : 'text-emerald-600'
                              : isDark
                              ? 'text-purple-300 font-black'
                              : 'text-purple-700 font-black'
                          }`}
                        >
                          +${item.rewardAmount.toFixed(2)} USDT
                        </span>

                        {item.isClaimed ? (
                          <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 uppercase tracking-wider leading-none">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            <span>Received</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-purple-300 bg-purple-500/15 px-2 py-0.5 rounded-md border border-purple-500/30 uppercase tracking-wider leading-none shadow-xs shadow-purple-500/10">
                            <Clock className="w-2.5 h-2.5 text-purple-300" />
                            <span>Ready to Claim</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer with Glass Blur */}
        <div
          className={`p-4 sm:p-5 border-t flex flex-col sm:flex-row items-center justify-between gap-3.5 shrink-0 ${
            isDark
              ? 'border-white/10 bg-black/30 backdrop-blur-md'
              : 'border-slate-100 bg-slate-50/90 backdrop-blur-md'
          }`}
        >
          <span className={`text-[11px] sm:text-xs text-center sm:text-left ${t.textMuted}`}>
            Rate: <strong className={t.text}>$0.10 USDT</strong> per direct registered user
          </span>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {pendingCount > 0 && onClaim && (
              <button
                id="btn-claim-aggregated-referrals-modal"
                onClick={onClaim}
                disabled={isClaiming}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-600/30 transition-all active:scale-95 disabled:opacity-50 cursor-pointer text-center inline-flex items-center justify-center gap-1.5"
              >
                <Gift className="w-3.5 h-3.5" />
                <span>{isClaiming ? 'Claiming...' : `Claim $${pendingClaimAmount.toFixed(2)} USDT`}</span>
              </button>
            )}
            <button
              id="btn-close-referral-details-footer"
              onClick={onClose}
              className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer active:scale-95 ${
                isDark
                  ? 'border-white/10 hover:bg-white/10 text-slate-300'
                  : 'border-slate-200 hover:bg-slate-100 text-slate-700 bg-white shadow-2xs'
              }`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
