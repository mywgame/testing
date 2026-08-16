/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { Zap, Flame, ShieldCheck } from 'lucide-react';
import { SuccessModal } from '../ui/SuccessModal.tsx';
import { playSuccessSound } from '../../utils/sound.ts';

export interface DailyClaimModalProps {
  isOpen: boolean;
  amount: number | string;
  streakDays?: number;
  onClose: () => void;
}

export const DailyClaimModal: React.FC<DailyClaimModalProps> = ({
  isOpen,
  amount,
  streakDays = 1,
  onClose,
}) => {
  useEffect(() => {
    if (isOpen) {
      playSuccessSound();
    }
  }, [isOpen]);

  const numAmount = typeof amount === 'string' ? parseFloat(amount || '0') : amount;
  const formattedAmount = numAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });

  return (
    <SuccessModal
      isOpen={isOpen}
      onClose={onClose}
      badge="24H Yield Settled"
      badgeIcon={<ShieldCheck className="w-3.5 h-3.5" />}
      badgeColor="emerald"
      topIcon={<Zap className="w-10 h-10 text-emerald-400 fill-emerald-400" />}
      topIconColor="emerald"
      title="Daily Yield Claimed!"
      amount={formattedAmount}
      amountPrefix="+"
      currency="USDT"
      amountColor="text-emerald-400"
      description="Your 24-hour daily staking yield has been successfully calculated and credited."
      customFooterNote={
        <div className="flex flex-col gap-2 mb-6 text-left">
          <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl py-2.5 px-3.5 text-xs">
            <span className="text-gray-300 flex items-center gap-1.5 font-medium">
              <Flame className="w-4 h-4 text-orange-400 shrink-0" />
              Daily Active Streak
            </span>
            <span className="font-mono font-bold text-orange-400">{streakDays} Days</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-400/90 bg-emerald-500/5 py-2 px-3 rounded-xl border border-emerald-500/15">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Balance has been credited directly to your Main Wallet.</span>
          </div>
        </div>
      }
      buttonText="Awesome, Continue!"
    />
  );
};

export default DailyClaimModal;
