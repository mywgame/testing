/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Input, Button } from '../../ui/index.ts';
import { ArrowRight } from 'lucide-react';
import { getApiUrl } from '../../../services/apiConfig.ts';

interface ForgotPasswordProps {
  initialEmail?: string;
  onSuccess: (email: string) => void;
  onError: (msg: string | null) => void;
  onSuccessMsg: (msg: string | null) => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({
  initialEmail = '',
  onSuccess,
  onError,
  onSuccessMsg,
}) => {
  const [resetEmail, setResetEmail] = useState(() => {
    if (initialEmail) return initialEmail;
    try { return sessionStorage.getItem('forgot_email') || ''; } catch (e) { return ''; }
  });
  const [busy, setBusy] = useState(false);

  const handleEmailChange = (val: string) => {
    setResetEmail(val);
    try { sessionStorage.setItem('forgot_email', val); } catch (e) {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onError(null);
    onSuccessMsg(null);

    if (!resetEmail.trim()) {
      onError('Please enter your registered email address.');
      return;
    }

    setBusy(true);
    try {
      const response = await fetch(getApiUrl('/auth/forgot-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail.trim() }),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error?.message || 'Unable to handle forgot password request.');
      }

      onSuccessMsg(resData.message || 'A 6-digit recovery code has been dispatched.');
      onSuccess(resetEmail.trim());
    } catch (err: any) {
      onError(err.message || 'Error executing password recovery.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div
      key="forgot-fields"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Registered Email Address"
          type="email"
          value={resetEmail}
          onChange={(e) => handleEmailChange(e.target.value)}
          placeholder="investor@metafirm.io"
          id="auth-forgot-email-input"
          className="!rounded-2xl !border-slate-300/80 !bg-white/70 !backdrop-blur-sm !shadow-sm !py-3 focus-visible:!ring-blue-500 focus-visible:!border-blue-400"
          required
          autoFocus
          disabled={busy}
        />

        <Button
          type="submit"
          isLoading={busy}
          className="w-full mt-2 !py-3.5 !bg-[image:var(--background-image-brand-gradient)] hover:!opacity-90 !shadow-lg !shadow-blue-500/25 !text-white !border-none"
          variant="primary"
          size="lg"
          id="auth-submit-btn"
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Request Recovery Code
        </Button>
      </form>
    </motion.div>
  );
};

export default ForgotPassword;
