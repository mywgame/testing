/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, UserPlus } from 'lucide-react';
import { Modal, Alert } from './ui/index.ts';
import logoImg from '../../assets/images/branding/logo.png';

// Import refactored feature components
import { Login } from './Auth/Login/Login.tsx';
import { Register, getPendingReferralCode } from './Auth/Register/Register.tsx';
import { VerifyEmail } from './Auth/VerifyEmail/VerifyEmail.tsx';
import { ForgotPassword } from './Auth/ForgotPassword/ForgotPassword.tsx';
import { ResetPassword } from './Auth/ResetPassword/ResetPassword.tsx';
import { AdminMfaLogin } from './Auth/Mfa/AdminMfaLogin.tsx';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  initialReferralCode?: string;
}

type AuthView = 'login' | 'register' | 'otp-verify' | 'forgot-password' | 'reset-password' | 'admin-mfa';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  initialReferralCode,
}) => {
  const [activeView, setActiveView] = useState<AuthView>(initialMode === 'register' ? 'register' : 'login');

  useEffect(() => {
    if (isOpen) {
      setActiveView(initialMode === 'register' ? 'register' : 'login');
    }
  }, [isOpen, initialMode]);
  
  // States to pass between steps
  const [email, setEmail] = useState('');
  const [mfaToken, setMfaToken] = useState('');
  const [totpRequired, setTotpRequired] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const resetMessages = () => {
    setValidationError(null);
    setSuccessMsg(null);
  };

  const handleSuccess = () => {
    resetMessages();
    onClose();
  };

  const handleError = (msg: string | null) => {
    setValidationError(msg);
  };

  const handleSuccessMsg = (msg: string | null) => {
    setSuccessMsg(msg);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      id="auth-modal-portal"
      size="md"
      backdropClassName="auth-glass-backdrop"
      contentClassName="auth-glass-card !border-none !p-0 !rounded-[28px] sm:!rounded-[32px] !shadow-[0_25px_80px_-20px_rgba(21,101,240,0.35)] text-slate-900 dark:text-white"
      bodyClassName="!max-h-[92vh] text-slate-900 dark:text-white"
    >
      {/* Top Decorative gradient strip */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-[image:var(--background-image-brand-gradient)] w-full z-[3]" />

      {/* Soft decorative glow blobs */}
      <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-[#29ABE2]/20 dark:bg-[#29ABE2]/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-16 w-56 h-56 rounded-full bg-[#E91E8C]/15 dark:bg-[#E91E8C]/10 blur-3xl pointer-events-none" />

      <div className="relative z-[3] p-6 sm:p-9">
        {/* Logo */}
        <div className="flex justify-start pr-10">
          <img
            src={logoImg}
            alt="MetaFirm Logo"
            referrerPolicy="no-referrer"
            className="h-9 sm:h-10 object-contain animate-fade-in drop-shadow-sm"
          />
        </div>

        {/* Thin divider line between Logo and MetaFirm Secure Gateway */}
        <div className="my-5 sm:my-6 border-t border-slate-200 dark:border-white/10" />

        {/* Header Identity */}
        <div className="mb-6 sm:mb-7 space-y-2">
          <div className="auth-glass-chip inline-flex items-center space-x-1.5 text-blue-700 dark:text-blue-300 border border-blue-200/70 dark:border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/40 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>MetaFirm Secure Gateway</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight pt-1">
            {activeView === 'login' && 'Sign In'}
            {activeView === 'register' && 'Create Account'}
            {activeView === 'otp-verify' && 'Verify Your Email'}
            {activeView === 'forgot-password' && 'Password Recovery'}
            {activeView === 'reset-password' && 'Set New Password'}
            {activeView === 'admin-mfa' && 'Admin Multi-Factor Verification'}
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans font-medium pt-0.5">
            {activeView === 'login' && 'Access your secure ledger balance, team statistics, and automated payout channels.'}
            {activeView === 'register' && 'Open an institutional-grade account with real-time reserve auditing and compound yields.'}
            {activeView === 'otp-verify' && `We sent a secure 6-digit confirmation code to ${email || 'your email'}.`}
            {activeView === 'forgot-password' && 'Enter your registered email address to receive a secure recovery code.'}
            {activeView === 'reset-password' && 'Complete the recovery process by inputting the verification code and creating a new password.'}
            {activeView === 'admin-mfa' && 'Verify your Email OTP (and Google Authenticator code if enabled) to unlock the Admin Dashboard.'}
          </p>
        </div>

        {/* Error Alerts */}
        {validationError && (
          <Alert variant="error" className="mb-4">
            {validationError}
          </Alert>
        )}

        {/* Success Alerts */}
        {successMsg && (
          <Alert variant="success" className="mb-4">
            {successMsg}
          </Alert>
        )}

        {/* Active Child View */}
        <AnimatePresence mode="wait">
          {activeView === 'login' && (
            <Login
              onForgotPasswordClick={(enteredEmail) => {
                resetMessages();
                setEmail(enteredEmail);
                setActiveView('forgot-password');
              }}
              onSuccess={handleSuccess}
              onError={handleError}
              onSuccessMsg={handleSuccessMsg}
              onRequireMfa={(token, adminEmail, isTotpRequired) => {
                resetMessages();
                setMfaToken(token);
                setEmail(adminEmail);
                setTotpRequired(isTotpRequired);
                setActiveView('admin-mfa');
              }}
            />
          )}

          {activeView === 'admin-mfa' && (
            <AdminMfaLogin
              mfaToken={mfaToken}
              email={email}
              totpRequired={totpRequired}
              onSuccess={handleSuccess}
              onError={handleError}
              onSuccessMsg={handleSuccessMsg}
              onCancel={() => {
                resetMessages();
                setActiveView('login');
              }}
            />
          )}

          {activeView === 'register' && (
            <Register
              initialReferralCode={initialReferralCode || getPendingReferralCode()}
              onSuccess={(registeredEmail) => {
                resetMessages();
                setEmail(registeredEmail);
                setActiveView('otp-verify');
              }}
              onError={handleError}
              onSuccessMsg={handleSuccessMsg}
            />
          )}

          {activeView === 'otp-verify' && (
            <VerifyEmail
              email={email}
              onSuccess={handleSuccess}
              onError={handleError}
              onSuccessMsg={handleSuccessMsg}
            />
          )}

          {activeView === 'forgot-password' && (
            <ForgotPassword
              initialEmail={email}
              onSuccess={(resetEmail) => {
                resetMessages();
                setEmail(resetEmail);
                setActiveView('reset-password');
              }}
              onError={handleError}
              onSuccessMsg={handleSuccessMsg}
            />
          )}

          {activeView === 'reset-password' && (
            <ResetPassword
              email={email}
              onSuccess={() => {
                resetMessages();
                setActiveView('login');
              }}
              onError={handleError}
              onSuccessMsg={handleSuccessMsg}
              onBackToLogin={() => {
                resetMessages();
                setActiveView('login');
              }}
            />
          )}
        </AnimatePresence>

        {/* Bottom Switch Links */}
        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-white/10 text-center">
          {activeView === 'login' && (
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium font-sans">
              New to MetaFirm?
              <button
                onClick={() => {
                  resetMessages();
                  setActiveView('register');
                }}
                className="ml-1.5 font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline inline-flex items-center space-x-0.5 cursor-pointer font-mono text-[11px] focus:outline-none"
                id="auth-toggle-mode-btn"
              >
                <UserPlus className="w-3.5 h-3.5 mr-1" /> Create Account
              </button>
            </p>
          )}

          {activeView === 'register' && (
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium font-sans">
              Already have an account?
              <button
                onClick={() => {
                  resetMessages();
                  setActiveView('login');
                }}
                className="ml-1.5 font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline inline-flex items-center space-x-0.5 cursor-pointer font-mono text-[11px] focus:outline-none"
                id="auth-toggle-mode-btn"
              >
                Sign In
              </button>
            </p>
          )}

          {activeView === 'otp-verify' && (
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium font-sans">
              Wrong email address or want to start over?
              <button
                onClick={() => {
                  resetMessages();
                  setActiveView('register');
                }}
                className="ml-1.5 font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline cursor-pointer font-mono text-[11px] focus:outline-none"
              >
                Back to Registration
              </button>
            </p>
          )}

          {activeView === 'forgot-password' && (
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium font-sans">
              Remembered your password?
              <button
                onClick={() => {
                  resetMessages();
                  setActiveView('login');
                }}
                className="ml-1.5 font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline cursor-pointer font-mono text-[11px] focus:outline-none"
              >
                Back to Sign In
              </button>
            </p>
          )}

          {activeView === 'reset-password' && (
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium font-sans">
              Want to change email?
              <button
                onClick={() => {
                  resetMessages();
                  setActiveView('forgot-password');
                }}
                className="ml-1.5 font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline cursor-pointer font-mono text-[11px] focus:outline-none"
              >
                Change Email Address
              </button>
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default AuthModal;
