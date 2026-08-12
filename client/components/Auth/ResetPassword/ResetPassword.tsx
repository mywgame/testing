/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button } from '../../ui/index.ts';
import { getApiUrl } from '../../../services/apiConfig.ts';

interface ResetPasswordProps {
  email: string;
  onSuccess: () => void;
  onError: (msg: string | null) => void;
  onSuccessMsg: (msg: string | null) => void;
  onBackToLogin: () => void;
}

export const ResetPassword: React.FC<ResetPasswordProps> = ({
  email,
  onSuccess,
  onError,
  onSuccessMsg,
  onBackToLogin,
}) => {
  const [otp, setOtp] = useState(() => {
    try { return sessionStorage.getItem('reset_otp') || ''; } catch (e) { return ''; }
  });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleOtpChange = (val: string) => {
    const clean = val.replace(/\D/g, '');
    setOtp(clean);
    try { sessionStorage.setItem('reset_otp', clean); } catch (e) {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onError(null);
    onSuccessMsg(null);

    if (otp.length < 6) {
      onError('Please enter the 6-digit recovery code.');
      return;
    }
    if (!password.trim()) {
      onError('Please enter your new password.');
      return;
    }
    if (password !== confirmPassword) {
      onError('Passwords do not match.');
      return;
    }

    // Password validation rules
    if (password.length < 8) {
      onError('Password must be at least 8 characters long.');
      return;
    }
    if (!/[A-Z]/.test(password)) {
      onError('Password must contain at least one uppercase letter.');
      return;
    }
    if (!/[a-z]/.test(password)) {
      onError('Password must contain at least one lowercase letter.');
      return;
    }
    if (!/\d/.test(password)) {
      onError('Password must contain at least one number.');
      return;
    }

    setBusy(true);
    try {
      const response = await fetch(getApiUrl('/auth/reset-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          token: otp,
          password: password,
        }),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error?.message || 'Password reset failed.');
      }

      onSuccessMsg('Your password has been reset successfully! Please sign in with your new credentials.');
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err: any) {
      onError(err.message || 'Password reset failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div
      key="reset-fields"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5 text-center py-1">
          <label htmlFor="auth-recovery-otp" className="block text-xs font-semibold text-gray-700 tracking-wide uppercase font-mono">
            Recovery Code (OTP)
          </label>
          <input
            id="auth-recovery-otp"
            type="text"
            maxLength={6}
            value={otp}
            onChange={(e) => handleOtpChange(e.target.value)}
            placeholder="000000"
            className="w-full max-w-[200px] mx-auto text-center tracking-[0.5em] font-mono text-2xl font-bold px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-gray-50 text-gray-900 shadow-inner placeholder:text-gray-400"
            required
            autoFocus
            disabled={busy}
          />
        </div>

        <div className="space-y-1.5 min-w-0 relative">
          <label htmlFor="auth-password-reset-input" className="block text-xs font-semibold text-gray-800 tracking-wide mb-1">
            New Password
          </label>
          <div className="relative">
            <input
              id="auth-password-reset-input"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-4 pr-10 py-3 text-sm font-medium border border-gray-300 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 bg-white text-gray-900 placeholder:text-gray-400 transition-all duration-150 focus-visible:outline-none"
              required
              disabled={busy}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none bg-transparent border-none p-1"
              disabled={busy}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5 min-w-0 relative">
          <label htmlFor="auth-confirm-password-reset-input" className="block text-xs font-semibold text-gray-800 tracking-wide mb-1">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              id="auth-confirm-password-reset-input"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-4 pr-10 py-3 text-sm font-medium border border-gray-300 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 bg-white text-gray-900 placeholder:text-gray-400 transition-all duration-150 focus-visible:outline-none"
              required
              disabled={busy}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none bg-transparent border-none p-1"
              disabled={busy}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
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
          Reset Password
        </Button>
      </form>
    </motion.div>
  );
};

export default ResetPassword;
