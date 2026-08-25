/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { RefreshCw, ArrowRight } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth.ts';
import { Button } from '../../ui/index.ts';
import { getApiUrl } from '../../../services/apiConfig.ts';

interface VerifyEmailProps {
  email: string;
  onSuccess: () => void;
  onError: (msg: string | null) => void;
  onSuccessMsg: (msg: string | null) => void;
}

export const VerifyEmail: React.FC<VerifyEmailProps> = ({
  email,
  onSuccess,
  onError,
  onSuccessMsg,
}) => {
  const { verifyOtp } = useAuth();
  const [otp, setOtp] = useState('');
  const [cooldown, setCooldown] = useState(60);
  const [busy, setBusy] = useState(false);

  // Cooldown effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    onError(null);
    onSuccessMsg(null);

    if (otp.length < 6) {
      onError('Please enter the full 6-digit verification code.');
      return;
    }

    setBusy(true);
    try {
      await verifyOtp(email, otp);
      onSuccessMsg('Account verified successfully! Initializing secure environment...');
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      onError(err.message || 'Invalid or expired verification code.');
    } finally {
      setBusy(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    onError(null);
    onSuccessMsg(null);

    try {
      const response = await fetch(getApiUrl('/auth/resend-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error?.message || 'Resending code failed.');
      }

      onSuccessMsg(resData.message || 'A new 6-digit verification code has been dispatched.');
      setCooldown(60);
    } catch (err: any) {
      onError(err.message || 'Error resending verification code.');
    }
  };

  return (
    <motion.div
      key="otp-fields"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <form onSubmit={handleVerify} className="space-y-4">
        <div className="space-y-1.5 text-center py-2">
          <label htmlFor="auth-otp-input" className="block text-xs font-semibold text-gray-700 tracking-wide uppercase font-mono">
            Security Verification Code
          </label>
          <input
            id="auth-otp-input"
            type="text"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            className="w-full max-w-[200px] mx-auto text-center tracking-[0.5em] font-mono text-2xl font-bold px-4 py-3.5 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-gray-50 text-gray-900 placeholder:text-gray-400 shadow-inner"
            required
            autoFocus
            disabled={busy}
          />
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || busy}
            className={`text-xs font-mono font-bold inline-flex items-center space-x-1 ${
              cooldown > 0 || busy
                ? 'text-gray-400 cursor-not-allowed bg-transparent border-none'
                : 'text-blue-600 hover:underline cursor-pointer bg-transparent border-none'
            }`}
          >
            <RefreshCw className={`w-3 h-3 ${cooldown > 0 && !busy ? 'animate-spin' : ''}`} />
            <span>{cooldown > 0 ? `Resend Code in ${cooldown}s` : 'Resend Verification Code'}</span>
          </button>
        </div>

        <Button
          type="submit"
          isLoading={busy}
          className="w-full mt-2"
          variant="primary"
          size="lg"
          id="auth-submit-btn"
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Verify & Activate
        </Button>
      </form>
    </motion.div>
  );
};

export default VerifyEmail;
