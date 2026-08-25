/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../../../hooks/useAuth.ts';
import { ShieldCheck, Mail, KeyRound, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { Input, Button } from '../../ui/index.ts';

interface AdminMfaLoginProps {
  mfaToken: string;
  email: string;
  totpRequired?: boolean;
  onSuccess: () => void;
  onError: (msg: string | null) => void;
  onSuccessMsg: (msg: string | null) => void;
  onCancel: () => void;
}

export const AdminMfaLogin: React.FC<AdminMfaLoginProps> = ({
  mfaToken,
  email,
  totpRequired = false,
  onSuccess,
  onError,
  onSuccessMsg,
  onCancel,
}) => {
  const { verifyAdminMfa, resendAdminMfaOtp } = useAuth();
  const [emailOtp, setEmailOtp] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [resendBusy, setResendBusy] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resendBusy) return;
    setResendBusy(true);
    onError(null);
    onSuccessMsg(null);
    try {
      await resendAdminMfaOtp(mfaToken);
      onSuccessMsg('A new verification OTP code has been sent to your email address.');
      setResendCooldown(30);
    } catch (err: any) {
      onError(err.message || 'Failed to resend verification code.');
    } finally {
      setResendBusy(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onError(null);
    onSuccessMsg(null);

    if (emailOtp.trim().length !== 6) {
      onError('Please enter the 6-digit verification code sent to your email.');
      return;
    }

    if (totpRequired && !totpCode.trim()) {
      onError('Google Authenticator 2FA is active on your account. Please enter your 6-digit authenticator code or recovery code.');
      return;
    }

    setBusy(true);
    try {
      await verifyAdminMfa(mfaToken, emailOtp.trim(), totpCode.trim());
      onSuccessMsg('Authentication successful. Welcome Admin!');
      onSuccess();
    } catch (err: any) {
      onError(err.message || 'MFA verification failed. Please check your verification code and try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div
      key="admin-mfa-fields"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="space-y-4 pt-1"
    >
      <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-extrabold text-amber-950 block">Admin Security Required</span>
          <p className="leading-relaxed font-medium">
            {totpRequired
              ? 'Two-factor verification (Email OTP + Google Authenticator) is required for this Administrator account.'
              : 'Email OTP verification is required to verify your Administrator identity.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Step 1: Email OTP */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" />
              1. Email Verification OTP
            </label>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendCooldown > 0 || resendBusy}
              className="text-[11px] font-mono font-bold text-blue-600 hover:text-blue-700 disabled:text-slate-400 hover:underline cursor-pointer flex items-center gap-1 border-none bg-transparent p-0"
            >
              <RefreshCw className={`w-3 h-3 ${resendBusy ? 'animate-spin' : ''}`} />
              {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend Code'}
            </button>
          </div>
          <p className="text-xs text-slate-600 leading-normal">
            A 6-digit code was sent to <span className="font-mono font-bold text-slate-950 bg-slate-200/80 px-1.5 py-0.5 rounded">{email}</span>
          </p>
          <input
            type="text"
            maxLength={6}
            placeholder="000000"
            value={emailOtp}
            onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="w-full px-4 py-2.5 text-center text-lg font-mono tracking-[0.3em] font-extrabold border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white text-slate-950 placeholder:text-slate-400 shadow-sm"
            required
            autoFocus
          />
        </div>

        {/* Step 2: Google Authenticator / Recovery Code (Only if enabled on account) */}
        {totpRequired ? (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <label className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-emerald-600" />
              2. Google Authenticator (TOTP)
            </label>
            <p className="text-xs text-slate-600 leading-normal">
              Enter the 6-digit code from Google Authenticator or a stored Recovery Code
            </p>
            <input
              type="text"
              maxLength={12}
              placeholder="000000 or Recovery Code"
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value.toUpperCase().trim())}
              className="w-full px-4 py-2.5 text-center text-base font-mono tracking-wider font-extrabold border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 bg-white text-slate-950 placeholder:text-slate-400 shadow-sm"
              required
            />
          </div>
        ) : (
          <div className="p-3.5 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-xs text-slate-600 flex items-center gap-2.5">
            <KeyRound className="w-4 h-4 text-slate-500 shrink-0" />
            <span>Google Authenticator (2FA): <strong className="text-slate-900">Not Enabled Yet</strong> (You can enable 2FA anytime in Admin Security Settings).</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2.5 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 border border-slate-300 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <Button
            type="submit"
            disabled={busy || emailOtp.length !== 6 || (totpRequired && !totpCode.trim())}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy ? 'Verifying...' : 'Verify & Admin Login'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default AdminMfaLogin;
