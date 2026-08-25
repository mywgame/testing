/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Zap, CheckCircle, Clock, Flame } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme.ts';
import { useLocalization } from '../../contexts/LocalizationContext.tsx';
import { RingProgress } from '../ui/RingProgress.tsx';
import { MockDailyClaim } from '../../types/index.ts';

interface DailyClaimCardProps {
  dailyClaim: {
    percent: number;
    secondsRemaining: number;
    rewardAmount: number;
    lastStatus: 'success' | 'failed' | 'none';
    streakDays: number;
    status?: string;
    history7Days?: Array<{
      date: string;
      status: 'CLAIMED' | 'MISSED' | 'PENDING' | 'NONE';
    }>;
  };
  onClaim?: () => Promise<any>;
  onClaimSuccess?: (info: { amount: number; streakDays: number }) => void;
}

/**
 * Daily Claim / Rewards Center card — pixel-matched to the figma reference.
 * All starting values (percent, countdown seconds, reward amount, streak)
 * arrive via the `dailyClaim` prop; the ticking countdown and the
 * claim/claimed transition are local UI state driven off of it. In Phase 2,
 * `onClaim` will call the real `/users/claim-yield` endpoint instead of the
 * local mock timeout below.
 */
export const DailyClaimCard: React.FC<DailyClaimCardProps> = ({ dailyClaim, onClaim, onClaimSuccess }) => {
  const { t } = useTheme();
  const { formatCurrency, t: translate } = useLocalization();
  const [secondsLeft, setSecondsLeft] = useState(dailyClaim.secondsRemaining);
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(dailyClaim.status === 'CLAIMED');

  useEffect(() => {
    setSecondsLeft(dailyClaim.secondsRemaining);
    setClaimed(dailyClaim.status === 'CLAIMED');
  }, [dailyClaim]);

  useEffect(() => {
    const interval = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(interval);
  }, []);

  const claimReady = secondsLeft === 0;
  const h = Math.floor(secondsLeft / 3600);
  const m = Math.floor((secondsLeft % 3600) / 60);
  const s = secondsLeft % 60;

  const handleClaim = async () => {
    if (claiming || claimed || !claimReady) return;
    setClaiming(true);
    try {
      if (onClaim) {
        await onClaim();
        setClaimed(true);
        if (onClaimSuccess) {
          onClaimSuccess({
            amount: dailyClaim.rewardAmount,
            streakDays: (dailyClaim.streakDays || 0) + 1,
          });
        }
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div
      id="daily-claim-widget"
      className={`relative backdrop-blur-xl rounded-3xl border overflow-hidden transition-all duration-300 ${
        t.isDark
          ? 'bg-white/5 border-white/10 hover:border-white/18 shadow-xl shadow-black/20'
          : 'border-white/80 hover:border-white shadow-[0_20px_40px_rgba(31,38,135,0.06)]'
      }`}
      style={
        !t.isDark
          ? {
              background: 'linear-gradient(135deg, #F5F7FF 0%, #ECE8FF 100%)',
            }
          : undefined
      }
    >
      {/* Decorative glow blobs matching the hero wallet card */}
      <div className={`absolute -right-16 -top-16 w-60 h-60 rounded-full blur-3xl pointer-events-none ${t.isDark ? 'bg-cyan-500/15' : 'bg-violet-400/20'}`} />
      <div className={`absolute -left-10 -bottom-10 w-48 h-48 rounded-full blur-3xl pointer-events-none ${t.isDark ? 'bg-purple-600/15' : 'bg-sky-400/20'}`} />

      {/* Header bar */}
      <div className={`relative flex items-center justify-between px-6 pt-6 pb-4 border-b ${t.sep}`}>
        <div>
          <p className={`text-xs uppercase tracking-widest font-semibold ${t.textSub}`}>Daily Claim</p>
          <p className={`text-base sm:text-lg font-bold mt-0.5 ${t.text}`}>Rewards Center</p>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/30 rounded-full px-3 py-1">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-xs text-emerald-500 font-semibold tracking-wide">24H EPOCH</span>
        </div>
      </div>

      <div className="relative px-6 py-6 space-y-6">
        {/* Ring + countdown */}
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <RingProgress percent={dailyClaim.percent} size={100} stroke={7} color="#10b981" trackColor={t.ringTrack} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-xl font-extrabold ${t.text}`}>{dailyClaim.percent}%</span>
              <span className={`text-[9px] uppercase tracking-wide ${t.textMuted}`}>Yield</span>
            </div>
          </div>
          <div className="flex-1">
            <p className={`text-xs mb-2 ${t.textSub}`}>Next Claim Available In</p>
            <div className="flex items-end gap-1">
              {[{ v: h, l: 'HRS' }, { v: m, l: 'MIN' }, { v: s, l: 'SEC' }].map(({ v, l }, i) => (
                <div key={l} className="flex items-end gap-1">
                  <div className="flex flex-col items-center">
                    <span className={`font-mono font-bold text-2xl rounded-2xl px-2.5 py-1 min-w-[2.5rem] text-center backdrop-blur-sm ${
                      t.isDark ? 'bg-white/8 border border-white/10' : 'bg-white/80 border border-slate-200/80 shadow-sm'
                    } ${t.text}`}>
                      {String(v).padStart(2, '0')}
                    </span>
                    <span className={`text-[9px] mt-1 tracking-widest font-medium ${t.textMuted}`}>{l}</span>
                  </div>
                  {i < 2 && <span className={`font-bold pb-4 text-lg ${t.textMuted}`}>:</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Status + rewards */}
        <div className="flex justify-between items-center text-sm">
          <div>
            <p className={`text-xs uppercase tracking-wider mb-0.5 ${t.textMuted}`}>Last Status</p>
            <div className="flex items-center gap-1.5 text-emerald-500 font-semibold">
              <CheckCircle className="w-4 h-4" /> {dailyClaim.lastStatus === 'success' ? 'Success' : dailyClaim.lastStatus === 'failed' ? 'Failed' : 'None'}
            </div>
          </div>
          <div className="text-right">
            <p className={`text-xs uppercase tracking-wider mb-0.5 ${t.textMuted}`}>Est. Rewards</p>
            <span className="text-emerald-500 font-bold text-base">+{formatCurrency(dailyClaim.rewardAmount)}</span>
          </div>
        </div>

        {/* Claim button */}
        <button
          onClick={handleClaim}
          disabled={!claimReady || claiming}
          className={`w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer ${
            claimed
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 cursor-default'
              : claimReady
              ? 'bg-gradient-to-r from-emerald-500 to-green-400 text-black hover:opacity-90 shadow-lg shadow-emerald-500/30'
              : `${t.isDark ? 'bg-white/5 border-white/10' : 'bg-slate-200/60 border-slate-300/60'} ${t.textMuted} cursor-not-allowed border`
          }`}
        >
          {claiming ? (
            <><Clock className="w-4 h-4 animate-spin" /> Processing…</>
          ) : claimed ? (
            <><CheckCircle className="w-4 h-4" /> {translate('claimed', 'Claimed')}</>
          ) : claimReady ? (
            <><Zap className="w-4 h-4" /> {translate('triggerClaim', 'Trigger Claim')}</>
          ) : (
            <><Clock className="w-4 h-4" /> {translate('cooldown', 'Cooldown Active')}</>
          )}
        </button>

        {/* Streak dots */}
        <div className={`flex items-center justify-between rounded-2xl px-4 py-3 border backdrop-blur-sm ${
          t.isDark ? 'bg-white/5 border-white/10' : 'bg-white/70 border-slate-200/70 shadow-sm'
        }`}>
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className={`text-sm font-semibold ${t.text}`}>Daily Streak</span>
          </div>
          <div className="flex items-center gap-1.5">
            {(dailyClaim.history7Days && dailyClaim.history7Days.length > 0) ? (
              dailyClaim.history7Days.map((day, i) => (
                <div
                  key={i}
                  title={`${day.date}: ${day.status}`}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    day.status === 'CLAIMED'
                      ? 'bg-orange-400 shadow-sm shadow-orange-400/50'
                      : day.status === 'MISSED'
                      ? t.isDark ? 'bg-white/25' : 'bg-black/25'
                      : t.isDark ? 'bg-white/10' : 'bg-black/10'
                  }`}
                />
              ))
            ) : (
              Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i < (dailyClaim.streakDays % 7) || dailyClaim.streakDays >= 7
                      ? 'bg-orange-400 shadow-sm shadow-orange-400/50'
                      : t.isDark ? 'bg-white/15' : 'bg-black/12'
                  }`}
                />
              ))
            )}
            <span className="text-xs text-orange-400 font-bold ml-2">{dailyClaim.streakDays}d</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyClaimCard;
