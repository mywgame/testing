/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Sparkles, Gift, Users, Coins, ArrowRight, Copy, Check, ExternalLink } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth.ts';
import { useTheme } from '../../../hooks/useTheme.ts';

interface OfferPromoModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onNavigate: (tab: 'team' | 'deposit' | 'task') => void;
}

export const OfferPromoModal: React.FC<OfferPromoModalProps> = ({
  isOpen = true,
  onClose,
  onNavigate,
}) => {
  const { user } = useAuth();
  const { t } = useTheme();
  const [activeTab, setActiveTab] = useState<'refer' | 'deposit'>('refer');
  const [copied, setCopied] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const referralCode = user?.referralCode || user?.userId || '';
  const referralLink = `${window.location.origin}/ref/${referralCode}`;

  const handleCopyLink = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleClose = () => {
    if (dontShowAgain) {
      try {
        // Set dismissed until end of today (midnight) or next 24 hours
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);
        localStorage.setItem('metafirm_promo_popup_dismissed_until', endOfToday.getTime().toString());
      } catch (e) {
        // ignore storage errors
      }
    } else {
      try {
        // Record last seen timestamp (capped to 12 hours between auto-popups)
        localStorage.setItem('metafirm_promo_popup_last_seen', Date.now().toString());
      } catch (e) {
        // ignore
      }
    }
    onClose();
  };

  const handleAction = (tab: 'team' | 'deposit') => {
    handleClose();
    onNavigate(tab);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/75 backdrop-blur-md transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Container: Always Crisp White / Light Theme */}
      <div
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200/90 bg-white text-slate-900 shadow-2xl shadow-black/40 transition-all duration-300 text-left"
      >
        {/* Subtle Decorative Ambient Accents */}
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        {/* Header Bar */}
        <div className="relative z-10 flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-sm">
              <Gift className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-sans font-extrabold tracking-wider uppercase text-slate-900">
                Exclusive Promotions
              </h3>
              <p className="text-[12px] font-medium text-slate-600">
                Earn bonus USDT rewards directly into your wallet
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-full border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-all cursor-pointer"
            aria-label="Close promotion modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 pt-3 bg-white">
          <div className="grid grid-cols-2 p-1 rounded-2xl border border-slate-200 bg-slate-100/90">
            <button
              onClick={() => setActiveTab('refer')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer ${
                activeTab === 'refer'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 font-semibold'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Refer &amp; Earn ($0.10)</span>
            </button>
            <button
              onClick={() => setActiveTab('deposit')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer ${
                activeTab === 'deposit'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 font-semibold'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Deposit Milestones</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto bg-white text-slate-900">
          {activeTab === 'refer' ? (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Banner visual */}
              <div
                className="relative rounded-2xl overflow-hidden aspect-[16/9] border border-purple-200 shadow-md bg-slate-950 group cursor-pointer"
                onClick={() => handleAction('team')}
              >
                <img
                  src="https://pub-9c62303890854a49a9eda8efb728c7ff.r2.dev/assets/images/branding/reffer.webp"
                  alt="Refer & Earn $0.10 USDT"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2.5 right-2.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-600/95 backdrop-blur-md text-white border border-purple-400/50 shadow-md">
                    <Gift className="w-3.5 h-3.5 text-amber-300" />
                    <span>$0.10 / Referral</span>
                  </span>
                </div>
              </div>

              {/* Offer highlights: High-contrast sharp text */}
              <div className="p-4 rounded-2xl border border-purple-200/80 bg-purple-50/70 shadow-xs">
                <ul className="text-xs space-y-2.5 font-sans leading-relaxed text-slate-800">
                  <li className="flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-purple-600 mt-1.5 shrink-0" />
                    <span className="text-slate-800">
                      <strong className="text-slate-950 font-bold">$0.10 USDT per registration:</strong> Rewarded instantly when your friend registers.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-purple-600 mt-1.5 shrink-0" />
                    <span className="text-slate-800">
                      <strong className="text-slate-950 font-bold">Multi-tier commissions:</strong> Earn compounding yield from Level 1–4 downline activity.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-purple-600 mt-1.5 shrink-0" />
                    <span className="text-slate-800">
                      <strong className="text-slate-950 font-bold">No limit:</strong> Invite unlimited friends to maximize your daily passive income.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Quick Referral Link Copy Box */}
              {referralCode && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                    Your Invitation Link
                  </label>
                  <div className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl border border-slate-300 bg-slate-50 shadow-xs">
                    <span className="text-xs font-mono font-semibold text-slate-900 truncate mr-2 select-all">
                      {referralLink}
                    </span>
                    <button
                      onClick={handleCopyLink}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Primary Action Button */}
              <button
                onClick={() => handleAction('team')}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 transition-all shadow-md shadow-purple-900/20 active:scale-[0.99] cursor-pointer"
              >
                <span>Go to My Team &amp; Referrals</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Banner visual */}
              <div
                className="relative rounded-2xl overflow-hidden aspect-[16/9] border border-cyan-200 shadow-md bg-slate-950 group cursor-pointer"
                onClick={() => handleAction('deposit')}
              >
                <img
                  src="https://pub-9c62303890854a49a9eda8efb728c7ff.r2.dev/assets/images/branding/milestone.webp"
                  alt="Deposit Milestones Rewards"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2.5 right-2.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-cyan-600/95 backdrop-blur-md text-white border border-cyan-400/50 shadow-md">
                    <Gift className="w-3.5 h-3.5 text-amber-300" />
                    <span>Tier Rewards</span>
                  </span>
                </div>
              </div>

              {/* Offer highlights: High-contrast sharp text */}
              <div className="p-4 rounded-2xl border border-cyan-200/80 bg-cyan-50/70 shadow-xs">
                <ul className="text-xs space-y-2.5 font-sans leading-relaxed text-slate-800">
                  <li className="flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-600 mt-1.5 shrink-0" />
                    <span className="text-slate-800">
                      <strong className="text-slate-950 font-bold">Cumulative Milestones:</strong> Unlock bonus cash as your total deposits grow.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-600 mt-1.5 shrink-0" />
                    <span className="text-slate-800">
                      <strong className="text-slate-950 font-bold">VIP Upgrades:</strong> Higher deposit tiers automatically promote your VIP rank.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-600 mt-1.5 shrink-0" />
                    <span className="text-slate-800">
                      <strong className="text-slate-950 font-bold">Zero Fee TRC20/BEP20:</strong> Fast automated confirmations within minutes.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Primary Action Button */}
              <button
                onClick={() => handleAction('deposit')}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider text-white bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-700 hover:to-indigo-700 transition-all shadow-md shadow-cyan-900/20 active:scale-[0.99] cursor-pointer"
              >
                <span>Make a Deposit Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Footer with "Don't show again" */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300"
            />
            <span className="text-slate-600 font-medium">Don&apos;t show again for today</span>
          </label>

          <button
            onClick={handleClose}
            className="font-bold text-slate-500 hover:text-slate-900 hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfferPromoModal;
