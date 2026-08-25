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
        localStorage.setItem('metafirm_promo_popup_dismissed_until', (Date.now() + 86400000 * 3).toString());
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
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border shadow-2xl transition-all duration-300 text-left"
        style={{
          background: t.isDark
            ? 'linear-gradient(135deg, #0b1120 0%, #060b18 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          borderColor: t.isDark ? 'rgba(99, 102, 241, 0.3)' : 'rgba(0, 0, 0, 0.1)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 40px rgba(99, 102, 241, 0.2)',
        }}
      >
        {/* Top Radial Glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />

        {/* Header Bar */}
        <div className="relative z-10 flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-gradient-to-tr from-purple-500 to-cyan-400 text-white shadow-sm">
              <Gift className="w-4 h-4" />
            </div>
            <div>
              <h3 className={`text-sm font-sans font-extrabold tracking-wider uppercase ${t.text}`}>
                Exclusive Promotions
              </h3>
              <p className={`text-[11px] font-medium ${t.textMuted}`}>
                Earn bonus USDT rewards directly into your wallet
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className={`p-1.5 rounded-full border transition-all cursor-pointer ${
              t.isDark ? 'border-white/10 hover:bg-white/10 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-600'
            }`}
            aria-label="Close promotion modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 pt-3">
          <div className={`grid grid-cols-2 p-1 rounded-2xl border ${t.isDark ? 'bg-slate-900/80 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
            <button
              onClick={() => setActiveTab('refer')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer ${
                activeTab === 'refer'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : t.isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-black'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Refer &amp; Earn ($0.10)</span>
            </button>
            <button
              onClick={() => setActiveTab('deposit')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer ${
                activeTab === 'deposit'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                  : t.isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-black'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Deposit Milestones</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {activeTab === 'refer' ? (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Banner visual */}
              <div className="relative rounded-2xl overflow-hidden aspect-[16/9] border border-purple-500/30 shadow-lg bg-slate-950 group cursor-pointer"
                   onClick={() => handleAction('team')}>
                <img
                  src="https://pub-9c62303890854a49a9eda8efb728c7ff.r2.dev/assets/images/branding/reffer.webp"
                  alt="Refer & Earn $0.10 USDT"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2.5 right-2.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-600/90 backdrop-blur-md text-white border border-purple-400/40 shadow-md">
                    <Gift className="w-3.5 h-3.5 text-amber-300" />
                    <span>$0.10 / Referral</span>
                  </span>
                </div>
              </div>

              {/* Offer highlights */}
              <div className={`p-3.5 rounded-2xl border ${t.isDark ? 'bg-purple-950/20 border-purple-500/20' : 'bg-purple-50 border-purple-100'}`}>
                <ul className="text-xs space-y-1.5 font-sans leading-relaxed">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                    <span><strong>$0.10 USDT per registration:</strong> Rewarded instantly when your friend registers.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                    <span><strong>Multi-tier commissions:</strong> Earn compounding yield from Level 1–4 downline activity.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                    <span><strong>No limit:</strong> Invite unlimited friends to maximize your daily passive income.</span>
                  </li>
                </ul>
              </div>

              {/* Quick Referral Link Copy Box */}
              {referralCode && (
                <div className="space-y-1.5">
                  <label className={`text-[11px] font-bold uppercase tracking-wider ${t.textMuted}`}>
                    Your Invitation Link
                  </label>
                  <div className={`flex items-center justify-between p-2 sm:p-2.5 rounded-xl border ${t.isDark ? 'bg-slate-900 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
                    <span className={`text-xs font-mono truncate mr-2 ${t.text}`}>
                      {referralLink}
                    </span>
                    <button
                      onClick={handleCopyLink}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all active:scale-95 cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Primary Action Button */}
              <button
                onClick={() => handleAction('team')}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:opacity-95 transition-all shadow-lg shadow-purple-900/20 active:scale-[0.99] cursor-pointer"
              >
                <span>Go to My Team &amp; Referrals</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Banner visual */}
              <div className="relative rounded-2xl overflow-hidden aspect-[16/9] border border-cyan-500/30 shadow-lg bg-slate-950 group cursor-pointer"
                   onClick={() => handleAction('deposit')}>
                <img
                  src="https://pub-9c62303890854a49a9eda8efb728c7ff.r2.dev/assets/images/branding/milestone.webp"
                  alt="Deposit Milestones Rewards"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2.5 right-2.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-cyan-600/90 backdrop-blur-md text-white border border-cyan-400/40 shadow-md">
                    <Gift className="w-3.5 h-3.5 text-amber-300" />
                    <span>Tier Rewards</span>
                  </span>
                </div>
              </div>

              {/* Offer highlights */}
              <div className={`p-3.5 rounded-2xl border ${t.isDark ? 'bg-cyan-950/20 border-cyan-500/20' : 'bg-cyan-50 border-cyan-100'}`}>
                <ul className="text-xs space-y-1.5 font-sans leading-relaxed">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                    <span><strong>Cumulative Milestones:</strong> Unlock bonus cash as your total deposits grow.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                    <span><strong>VIP Upgrades:</strong> Higher deposit tiers automatically promote your VIP rank.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                    <span><strong>Zero Fee TRC20/BEP20:</strong> Fast automated confirmations within minutes.</span>
                  </li>
                </ul>
              </div>

              {/* Primary Action Button */}
              <button
                onClick={() => handleAction('deposit')}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:opacity-95 transition-all shadow-lg shadow-cyan-900/20 active:scale-[0.99] cursor-pointer"
              >
                <span>Make a Deposit Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Footer with "Don't show again" */}
        <div className={`px-5 py-3 border-t flex items-center justify-between text-xs ${t.sep}`}>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300"
            />
            <span className={t.textMuted}>Don&apos;t show again for 3 days</span>
          </label>

          <button
            onClick={handleClose}
            className={`font-semibold hover:underline cursor-pointer ${t.textMuted}`}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfferPromoModal;
