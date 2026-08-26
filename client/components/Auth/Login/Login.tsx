/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../../../hooks/useAuth.ts';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button } from '../../ui/index.ts';
import { playSuccessSound } from '../../../utils/sound.ts';

interface LoginProps {
  onForgotPasswordClick: (email: string) => void;
  onSuccess: () => void;
  onError: (msg: string | null) => void;
  onSuccessMsg: (msg: string | null) => void;
  onRequireMfa?: (mfaToken: string, email: string, totpRequired: boolean) => void;
}

export const Login: React.FC<LoginProps> = ({
  onForgotPasswordClick,
  onSuccess,
  onError,
  onSuccessMsg,
  onRequireMfa,
}) => {
  const { login } = useAuth();
  
  const rememberedEmail = (() => {
    try {
      return localStorage.getItem('metafirm_remembered_email') || sessionStorage.getItem('login_email') || '';
    } catch (e) {
      return '';
    }
  })();

  const [email, setEmail] = useState(rememberedEmail);
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(() => !!rememberedEmail);
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleEmailChange = (val: string) => {
    setEmail(val);
    try { sessionStorage.setItem('login_email', val); } catch (e) {}
  };

  const handleLocalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onError(null);
    onSuccessMsg(null);

    if (!email.trim() || !password.trim()) {
      onError('Please enter both your Username/Email and password.');
      return;
    }

    setBusy(true);
    try {
      // Save or clear remembered email
      try {
        if (rememberMe) {
          localStorage.setItem('metafirm_remembered_email', email.trim());
        } else {
          localStorage.removeItem('metafirm_remembered_email');
        }
      } catch (e) {}

      const res = await login(email.trim(), password, false);
      playSuccessSound();

      if (res && res.requiresMfa) {
        if (onRequireMfa) {
          onRequireMfa(res.mfaToken, res.email || email.trim(), !!res.totpRequired);
        }
      } else {
        onSuccess();
      }
    } catch (err: any) {
      onError(err.message || 'An unexpected authentication error occurred.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div
      key="login-fields"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <form onSubmit={handleLocalSubmit} method="POST" action="#" name="loginForm" autoComplete="on" className="space-y-5 sm:space-y-6">
        <div className="space-y-4 sm:space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="auth-email-input-login" className="block text-xs font-bold text-slate-800 dark:text-slate-200 tracking-wide mb-1.5">
              Username or Email Address
            </label>
            <input
              id="auth-email-input-login"
              name="username"
              type="text"
              inputMode="email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              onInput={(e) => handleEmailChange((e.target as HTMLInputElement).value)}
              placeholder="Username or email address"
              autoComplete="username"
              className="w-full px-4 py-3 sm:py-3.5 text-sm font-medium border border-slate-300/80 dark:border-white/15 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-400 bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-150 focus-visible:outline-none shadow-sm"
              required
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="auth-password-input-login" className="block text-xs font-bold text-slate-800 dark:text-slate-200 tracking-wide mb-1.5">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  onError(null);
                  onSuccessMsg(null);
                  onForgotPasswordClick(email);
                }}
                className="text-[11px] font-mono font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline cursor-pointer focus:outline-none bg-transparent border-none p-0"
              >
                Forgot password?
              </button>
            </div>
            
            <div className="relative">
              <input
                id="auth-password-input-login"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full pl-4 pr-10 py-3 sm:py-3.5 text-sm font-medium border border-slate-300/80 dark:border-white/15 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-400 bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-150 focus-visible:outline-none shadow-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 focus:outline-none bg-transparent border-none p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center space-x-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Remember me</span>
            </label>
          </div>
        </div>

        <Button
          type="submit"
          isLoading={busy}
          className="w-full mt-2 !py-3.5 !bg-[image:var(--background-image-brand-gradient)] hover:!opacity-90 !shadow-lg !shadow-blue-500/25 !text-white !border-none"
          variant="primary"
          size="lg"
          id="auth-submit-btn"
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Sign In
        </Button>
      </form>
    </motion.div>
  );
};

export default Login;

