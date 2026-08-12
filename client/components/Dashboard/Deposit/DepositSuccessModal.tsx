/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Wallet, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { SuccessModal } from '../../ui/SuccessModal.tsx';

export interface DepositSuccessModalProps {
  isOpen: boolean;
  amount: string;
  network?: string;
  onClose: () => void;
}

export const DepositSuccessModal: React.FC<DepositSuccessModalProps> = ({
  isOpen,
  amount,
  network = 'USDT',
  onClose,
}) => {
  const formattedAmount = parseFloat(amount || '0').toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });

  const formattedNetwork = network
    .replace('USDT_', '')
    .replace('USDT', '')
    .trim() || 'USDT';

  return (
    <SuccessModal
      isOpen={isOpen}
      onClose={onClose}
      badge="Verified On-Chain"
      badgeIcon={<ShieldCheck className="w-3.5 h-3.5" />}
      badgeColor="emerald"
      topIcon={<CheckCircle2 className="w-10 h-10 text-emerald-400" />}
      topIconColor="emerald"
      title="Deposit Successful"
      amount={formattedAmount}
      amountPrefix="+"
      currency="USDT"
      amountColor="text-cyan-400"
      description={`${formattedAmount} ${formattedNetwork} USDT has been successfully verified.`}
      customFooterNote={
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-400/90 mb-6 bg-emerald-500/5 py-2 px-3 rounded-xl border border-emerald-500/15">
          <Wallet className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Balance has been credited to your Main Wallet.</span>
        </div>
      }
      buttonText="Great, Thanks!"
    />
  );
};

export default DepositSuccessModal;
