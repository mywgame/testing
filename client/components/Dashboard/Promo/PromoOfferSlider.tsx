/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../hooks/useTheme.ts';
import { useAuth } from '../../../hooks/useAuth.ts';
import { getReferralLink } from '../../../utils/referral.ts';
import { ArrowRight, ChevronLeft, ChevronRight, Gift, Users, Coins, Copy, Check } from 'lucide-react';

interface PromoSlide {
  id: string;
  image: string;
  badge: string;
  badgeClass: string;
  dotClass: string;
  title: string;
  subtitle: string;
  actionText: string;
  actionType: 'copy-referral' | 'deposit';
  icon: typeof Gift;
}

const PROMO_SLIDES: PromoSlide[] = [
  {
    id: 'refer-earn',
    image: 'https://pub-9c62303890854a49a9eda8efb728c7ff.r2.dev/assets/images/branding/reffer.webp',
    badge: 'Referral Bonus',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-300/80 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/40 shadow-xs',
    dotClass: 'bg-purple-600 dark:bg-purple-400',
    title: 'Refer & Earn $0.10 USDT Instantly',
    subtitle: 'Share your invitation link. Earn $0.10 USDT for every verified user who registers using your link.',
    actionText: 'Refer Friends Now',
    actionType: 'copy-referral',
    icon: Users,
  },
  {
    id: 'deposit-milestones',
    image: 'https://pub-9c62303890854a49a9eda8efb728c7ff.r2.dev/assets/images/branding/milestone.webp',
    badge: 'Milestone Rewards',
    badgeClass: 'bg-cyan-100 text-cyan-900 border-cyan-300/80 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/40 shadow-xs',
    dotClass: 'bg-cyan-600 dark:bg-cyan-400',
    title: 'Deposit Milestones & Tier Bonuses',
    subtitle: 'Reach cumulative deposit milestones and unlock high-tier VIP bonus rewards credited automatically.',
    actionText: 'Deposit & Unlock Rewards',
    actionType: 'deposit',
    icon: Coins,
  },
];

interface PromoOfferSliderProps {
  onQuickAction?: (action: 'deposit' | 'withdraw' | 'claim' | 'staking' | 'team' | 'invite' | 'task' | 'transactions') => void;
}

export const PromoOfferSlider: React.FC<PromoOfferSliderProps> = ({ onQuickAction }) => {
  const { t } = useTheme();
  const { user } = useAuth();
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [copied, setCopied] = useState(false);

  const referralCode = user?.referralCode || user?.userId || '';
  const referralLink = referralCode ? getReferralLink(referralCode) : `${window.location.origin}/register`;

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % PROMO_SLIDES.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const current = PROMO_SLIDES[activeIdx];

  const handleAction = () => {
    if (current.actionType === 'copy-referral' || current.id === 'refer-earn') {
      if (referralLink) {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } else if (current.actionType === 'deposit') {
      onQuickAction?.('deposit');
    }
  };

  return (
    <div
      id="dashboard-promo-slider"
      className="relative w-full rounded-3xl overflow-hidden border shadow-xl transition-all duration-300 group"
      style={{
        background: t.isDark
          ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(10, 15, 30, 0.95) 100%)'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(241, 245, 249, 0.95) 100%)',
        borderColor: t.isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Ambient Glows */}
      <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

      {/* Main Grid: Responsive 2-column or Mobile stack */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 items-center min-h-[190px]">
        {/* Visual Banner Media Column (Proper 16:9 Aspect Ratio to prevent stretching or cropping) */}
        <div 
          onClick={handleAction}
          className="md:col-span-6 lg:col-span-5 relative w-full aspect-[16/9] md:aspect-auto md:h-full min-h-[180px] sm:min-h-[210px] overflow-hidden cursor-pointer bg-slate-950 flex items-center justify-center"
        >
          {PROMO_SLIDES.map((slide, idx) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ${
                activeIdx === idx ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-top sm:object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-slate-950/70 via-transparent to-transparent md:from-transparent md:via-black/20 md:to-black/50" />
            </div>
          ))}
        </div>

        {/* Text & Action Column */}
        <div className="md:col-span-6 lg:col-span-7 p-4 sm:p-6 text-left flex flex-col justify-between h-full space-y-3">
          <div className="space-y-2">
            {/* Badge & Step indicator */}
            <div className="flex items-center justify-between gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${current.badgeClass}`}>
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${current.dotClass}`} />
                {current.badge}
              </span>

              <div className="flex items-center gap-1.5">
                {PROMO_SLIDES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIdx(i)}
                    className="h-1.5 transition-all duration-300 rounded-full cursor-pointer"
                    style={{
                      width: activeIdx === i ? '20px' : '6px',
                      background: activeIdx === i ? '#38bdf8' : t.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                    }}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Headline */}
            <h3 className={`text-base sm:text-lg font-display font-extrabold tracking-tight ${t.text}`}>
              {current.title}
            </h3>

            {/* Description */}
            <p className={`text-xs leading-relaxed ${t.textMuted} line-clamp-2`}>
              {current.subtitle}
            </p>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-1 gap-3">
            <button
              onClick={handleAction}
              className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white transition-all shadow-md active:scale-95 cursor-pointer ${
                current.id === 'refer-earn' && copied
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/30'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-cyan-500/20'
              }`}
            >
              {current.id === 'refer-earn' ? (
                copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Referral Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{current.actionText}</span>
                  </>
                )
              ) : (
                <>
                  <span>{current.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            {/* Manual Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveIdx((prev) => (prev === 0 ? PROMO_SLIDES.length - 1 : prev - 1))}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  t.isDark ? 'border-white/10 hover:bg-white/5 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-600'
                }`}
                aria-label="Previous Offer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveIdx((prev) => (prev + 1) % PROMO_SLIDES.length)}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  t.isDark ? 'border-white/10 hover:bg-white/5 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-600'
                }`}
                aria-label="Next Offer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoOfferSlider;
