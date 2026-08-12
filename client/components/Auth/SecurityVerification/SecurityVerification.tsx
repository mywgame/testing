/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Input } from '../../ui/index.ts';
import { getApiUrl } from '../../../services/apiConfig.ts';

interface SecurityVerificationProps {
  token: string;
  network: string;
  networkLabel: string;
  userEmail?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const SecurityVerification: React.FC<SecurityVerificationProps> = ({
  token,
  network,
  networkLabel,
  userEmail,
  onSuccess,
  onCancel,
}) => {
  const [draftAddress, setDraftAddress] = useState('');
  const [otpStep, setOtpStep] = useState<'idle' | 'sent'>('idle');
  const [otpCode, setOtpCode] = useState('');
  const [otpBusy, setOtpBusy] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');

  const validateAddress = (addr: string): string | null => {
    const trimmed = addr.trim();
    if (!trimmed) return 'Address cannot be empty.';
    if (network === 'USDT_BEP20' || network === 'USDT_POLYGON') {
      if (!/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
        return 'Invalid EVM address format. Must be a 0x-prefixed 40-character hex string (42 characters total).';
      }
    } else if (network === 'USDT_TRC20') {
      if (!/^T[a-zA-Z0-9]{33}$/.test(trimmed)) {
        return 'Invalid Tron address format. Must start with "T" and be exactly 34 characters long.';
      }
    }
    return null;
  };

  const sendOtp = async () => {
    const errorMsg = validateAddress(draftAddress);
    if (errorMsg) {
      setOtpError(errorMsg);
      return;
    }

    setOtpBusy(true);
    setOtpError('');
    setOtpSuccess('');
    try {
      const res = await fetch(getApiUrl('/users/security/withdrawal-addresses/send-otp'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          network,
          address: draftAddress.trim(),
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error?.message || 'Failed to dispatch verification OTP.');

      setOtpStep('sent');
      setOtpSuccess('A verification OTP has been sent to your email.');
    } catch (err: any) {
      setOtpError(err.message || 'An error occurred.');
    } finally {
      setOtpBusy(false);
    }
  };

  const verifyOtp = async () => {
    if (otpCode.trim().length !== 6) return;
    setOtpBusy(true);
    setOtpError('');
    setOtpSuccess('');
    try {
      const res = await fetch(getApiUrl('/users/security/withdrawal-addresses'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          network,
          address: draftAddress.trim(),
          otp: otpCode.trim(),
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error?.message || 'Validation failed. Please verify your OTP.');

      setOtpSuccess('Withdrawal address successfully bound and verified!');
      setOtpStep('idle');
      setOtpCode('');
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (err: any) {
      setOtpError(err.message || 'An error occurred.');
    } finally {
      setOtpBusy(false);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t space-y-3 border-gray-200 dark:border-white/10">
      {otpSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs rounded-xl">
          {otpSuccess}
        </div>
      )}
      {otpError && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl">
          {otpError}
        </div>
      )}

      <Input
        label={`${networkLabel} Address`}
        placeholder="Paste wallet address"
        value={draftAddress}
        onChange={(e) => setDraftAddress(e.target.value)}
        disabled={otpStep === 'sent'}
      />

      {otpStep === 'idle' ? (
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer text-gray-400 hover:text-gray-600 bg-transparent border-none"
          >
            Cancel
          </button>
          <button
            onClick={sendOtp}
            disabled={!draftAddress.trim() || otpBusy}
            className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90 disabled:opacity-40 cursor-pointer transition-opacity"
          >
            {otpBusy ? 'Sending…' : 'Send Email OTP'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-[11px] text-gray-400">
            A 6-digit verification code has been sent to <span className="text-gray-900 dark:text-white">{userEmail}</span>.
          </p>
          <Input
            label="Enter OTP"
            placeholder="000000"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={onCancel}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer text-gray-400 hover:text-gray-600 bg-transparent border-none"
            >
              Cancel
            </button>
            <button
              onClick={verifyOtp}
              disabled={otpCode.length !== 6 || otpBusy}
              className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 disabled:opacity-40 cursor-pointer transition-opacity"
            >
              {otpBusy ? 'Verifying…' : 'Verify & Save'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityVerification;
