/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Clock } from 'lucide-react';
import { SuccessModal } from '../../ui/SuccessModal.tsx';

export interface WithdrawalSuccessModalProps {
  isOpen: boolean;
  amount: string;
  currency?: string;
  onClose: () => void;
}

export const WithdrawalSuccessModal: React.FC<WithdrawalSuccessModalProps> = ({
  isOpen,
  amount,
  currency = 'USDT',
  onClose,
}) => {
  const numAmount = Math.abs(parseFloat(amount || '0'));
  const formattedAmount = numAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });

  return (
    <SuccessModal
      isOpen={isOpen}
      onClose={onClose}
      badge="REQUEST SUBMITTED"
      badgeIcon={<Clock className="w-3.5 h-3.5" />}
      badgeColor="amber"
      topIcon={<Clock className="w-10 h-10 text-amber-400" />}
      topIconColor="amber"
      title="Withdrawal Request Submitted"
      amount={formattedAmount}
      amountPrefix="-"
      currency={currency}
      amountColor="text-cyan-400"
      description="Your withdrawal request has been submitted successfully."
      statusIcon="⏳"
      statusTitle="Awaiting System Approval"
      statusDescription="Your request has been sent for review. Funds will be transferred to your selected wallet after approval."
      buttonText="Got it"
    />
  );
};

export default WithdrawalSuccessModal;
