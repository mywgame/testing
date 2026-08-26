/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button } from '../../ui/index.ts';
import { COUNTRIES, COUNTRY_DATA } from '../Shared/countries.ts';
import { getApiUrl } from '../../../services/apiConfig.ts';

export function getPendingReferralCode(): string {
  try {
    if (typeof window === 'undefined') return '';
    const params = new URLSearchParams(window.location.search);
    const codeFromSearch = params.get('ref') || params.get('referralCode') || params.get('referral');
    if (codeFromSearch && codeFromSearch.trim()) {
      const trimmed = codeFromSearch.trim();
      sessionStorage.setItem('pendingReferralCode', trimmed);
      return trimmed;
    }

    const pathMatch = window.location.pathname.match(/^\/ref\/([^\/]+)/i);
    if (pathMatch && pathMatch[1]) {
      const trimmed = decodeURIComponent(pathMatch[1]).trim();
      sessionStorage.setItem('pendingReferralCode', trimmed);
      return trimmed;
    }

    const stored = sessionStorage.getItem('pendingReferralCode');
    if (stored && stored.trim()) {
      return stored.trim();
    }
  } catch (err) {
    console.error('Error parsing pending referral code:', err);
  }
  return '';
}

interface RegisterProps {
  onSuccess: (email: string) => void;
  onError: (msg: string | null) => void;
  onSuccessMsg: (msg: string | null) => void;
  initialReferralCode?: string;
}

export const Register: React.FC<RegisterProps> = ({
  onSuccess,
  onError,
  onSuccessMsg,
  initialReferralCode,
}) => {
  const [fullName, setFullName] = useState(() => {
    try { return sessionStorage.getItem('reg_fullName') || ''; } catch (e) { return ''; }
  });
  const [username, setUsername] = useState(() => {
    try { return sessionStorage.getItem('reg_username') || ''; } catch (e) { return ''; }
  });
  const [email, setEmail] = useState(() => {
    try { return sessionStorage.getItem('reg_email') || ''; } catch (e) { return ''; }
  });
  const [country, setCountry] = useState(() => {
    try { return sessionStorage.getItem('reg_country') || 'United States'; } catch (e) { return 'United States'; }
  });
  const [countryCode, setCountryCode] = useState(() => {
    const saved = (() => { try { return sessionStorage.getItem('reg_country'); } catch (e) { return null; } })();
    const info = COUNTRY_DATA[saved || 'United States'] || { flag: "🏳️", code: "+1" };
    return info.code;
  });
  const [mobileNumber, setMobileNumber] = useState(() => {
    try { return sessionStorage.getItem('reg_mobile') || ''; } catch (e) { return ''; }
  });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState(() => {
    const code = initialReferralCode || getPendingReferralCode();
    if (code) return code;
    try { return sessionStorage.getItem('reg_referralCode') || ''; } catch (e) { return ''; }
  });

  useEffect(() => {
    const code = initialReferralCode || getPendingReferralCode();
    if (code && !referralCode) {
      setReferralCode(code);
      try { sessionStorage.setItem('reg_referralCode', code); } catch (e) {}
    }
  }, [initialReferralCode]);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  const updateField = (key: string, val: string, setter: (v: string) => void) => {
    setter(val);
    try { sessionStorage.setItem(key, val); } catch (e) {}
  };

  const handleCountryChange = (selectedCountry: string) => {
    setCountry(selectedCountry);
    try { sessionStorage.setItem('reg_country', selectedCountry); } catch (e) {}
    const info = COUNTRY_DATA[selectedCountry] || { flag: "🏳️", code: "+1" };
    setCountryCode(info.code);
  };

  const handleLocalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onError(null);
    onSuccessMsg(null);

    if (!fullName.trim()) {
      onError('Please enter your Full Name.');
      return;
    }
    if (!username.trim()) {
      onError('Please enter a Username.');
      return;
    }
    if (!email.trim()) {
      onError('Please enter your Email Address.');
      return;
    }
    if (!mobileNumber.trim()) {
      onError('Please enter your Mobile Number.');
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
    if (!/[@$!%*?&()_+\-=\[\]{};':"\\|,.<>\/?#^]/.test(password)) {
      onError('Password must contain at least one special character (e.g., ! @ # $ % & *).');
      return;
    }

    setBusy(true);
    try {
      const fullPhone = `${countryCode} ${mobileNumber.trim()}`;
      const response = await fetch(getApiUrl('/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          username: username.trim(),
          name: fullName.trim(),
          phone: fullPhone,
          country,
          password,
          referralCode: referralCode.trim() || undefined,
        }),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error?.message || 'Failed to create user account.');
      }

      // Stripped all emojis/icons from the success message
      const cleanedMessage = (resData.message || 'Verification code sent to your email.').replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '');
      onSuccessMsg(cleanedMessage);
      onSuccess(email.trim());
    } catch (err: any) {
      onError(err.message || 'An unexpected registration error occurred.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div
      key="register-fields"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <form onSubmit={handleLocalSubmit} method="POST" action="#" name="registerForm" autoComplete="on" className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 min-w-0 w-full">
          <div className="min-w-0 space-y-1">
            <label htmlFor="auth-name-input" className="block text-xs font-semibold text-slate-800 dark:text-slate-200 tracking-wide mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              id="auth-name-input"
              name="name"
              autoComplete="name"
              value={fullName}
              onChange={(e) => updateField('reg_fullName', e.target.value, setFullName)}
              onInput={(e) => updateField('reg_fullName', (e.target as HTMLInputElement).value, setFullName)}
              placeholder="John Doe"
              className="w-full px-4 py-2.5 sm:py-3 text-sm font-medium border border-slate-300/80 dark:border-white/15 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-400 shadow-sm bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-150 focus-visible:outline-none"
              required
            />
          </div>

          <div className="min-w-0 space-y-1">
            <label htmlFor="auth-username-input" className="block text-xs font-semibold text-slate-800 dark:text-slate-200 tracking-wide mb-1.5">
              Username
            </label>
            <input
              type="text"
              id="auth-username-input"
              name="username"
              autoComplete="username"
              value={username}
              onChange={(e) => updateField('reg_username', e.target.value, setUsername)}
              onInput={(e) => updateField('reg_username', (e.target as HTMLInputElement).value, setUsername)}
              placeholder="johndoe"
              className="w-full px-4 py-2.5 sm:py-3 text-sm font-medium border border-slate-300/80 dark:border-white/15 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-400 shadow-sm bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-150 focus-visible:outline-none"
              required
            />
          </div>

          <div className="min-w-0 space-y-1">
            <label htmlFor="auth-email-input" className="block text-xs font-semibold text-slate-800 dark:text-slate-200 tracking-wide mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              id="auth-email-input"
              name="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => updateField('reg_email', e.target.value, setEmail)}
              onInput={(e) => updateField('reg_email', (e.target as HTMLInputElement).value, setEmail)}
              placeholder="investor@metafirm.io"
              className="w-full px-4 py-2.5 sm:py-3 text-sm font-medium border border-slate-300/80 dark:border-white/15 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-400 shadow-sm bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-150 focus-visible:outline-none"
              required
            />
          </div>

          {/* Country Selector */}
          <div className="space-y-1 min-w-0">
            <label htmlFor="auth-country-select" className="block text-xs font-semibold text-slate-800 dark:text-slate-200 tracking-wide mb-1.5">
              Country
            </label>
            <select
              id="auth-country-select"
              name="country"
              value={country}
              onChange={(e) => handleCountryChange(e.target.value)}
              className="w-full max-w-full min-w-0 px-3.5 py-2.5 sm:py-3 text-sm font-medium border border-slate-300/80 dark:border-white/15 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-400 shadow-sm bg-white/70 dark:bg-slate-900/80 backdrop-blur-sm text-slate-900 dark:text-white transition-all duration-150 focus-visible:outline-none cursor-pointer"
            >
              {COUNTRIES.map((c) => {
                return (
                  <option key={c} value={c} className="text-slate-900 dark:text-white bg-white dark:bg-slate-900 font-medium">
                    {c}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Country Code + Mobile Number */}
          <div className="space-y-1 md:col-span-2 min-w-0">
            <label htmlFor="auth-mobile-input" className="block text-xs font-semibold text-slate-800 dark:text-slate-200 tracking-wide mb-1.5">
              Mobile Number
            </label>
            <div className="flex space-x-2 min-w-0">
              <input
                type="text"
                id="auth-country-code"
                name="country-code"
                value={countryCode}
                readOnly
                placeholder="+1"
                className="w-20 flex-shrink-0 px-3 py-2.5 sm:py-3 text-sm border border-slate-300/80 dark:border-white/15 rounded-xl focus:outline-none bg-slate-100/80 dark:bg-white/10 backdrop-blur-sm text-slate-700 dark:text-slate-300 text-center transition-all duration-150 focus-visible:outline-none cursor-not-allowed font-bold"
                required
              />
              <input
                type="tel"
                id="auth-mobile-input"
                name="tel"
                autoComplete="tel"
                value={mobileNumber}
                onChange={(e) => updateField('reg_mobile', e.target.value, setMobileNumber)}
                onInput={(e) => updateField('reg_mobile', (e.target as HTMLInputElement).value, setMobileNumber)}
                placeholder="555-0199"
                className="flex-1 min-w-0 px-4 py-2.5 sm:py-3 text-sm font-medium border border-slate-300/80 dark:border-white/15 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-400 shadow-sm bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-150 focus-visible:outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-1 min-w-0 relative">
            <label htmlFor="auth-password-input-reg" className="block text-xs font-semibold text-slate-800 dark:text-slate-200 tracking-wide mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="auth-password-input-reg"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
                placeholder="••••••••"
                className="w-full pl-4 pr-10 py-2.5 sm:py-3 text-sm font-medium border border-slate-300/80 dark:border-white/15 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-400 shadow-sm bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-150 focus-visible:outline-none"
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

          <div className="space-y-1 min-w-0 relative">
            <label htmlFor="auth-confirm-password-input" className="block text-xs font-semibold text-slate-800 dark:text-slate-200 tracking-wide mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="auth-confirm-password-input"
                name="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onInput={(e) => setConfirmPassword((e.target as HTMLInputElement).value)}
                placeholder="••••••••"
                className="w-full pl-4 pr-10 py-2.5 sm:py-3 text-sm font-medium border border-slate-300/80 dark:border-white/15 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-400 shadow-sm bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-150 focus-visible:outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 focus:outline-none bg-transparent border-none p-1"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="md:col-span-2 min-w-0 space-y-1">
            <label htmlFor="auth-referral-input" className="block text-xs font-semibold text-slate-800 dark:text-slate-200 tracking-wide mb-1.5">
              Referral Code (Optional)
            </label>
            <input
              type="text"
              id="auth-referral-input"
              value={referralCode}
              onChange={(e) => updateField('reg_referralCode', e.target.value, setReferralCode)}
              placeholder="e.g. PARTNER88"
              className="w-full px-4 py-2.5 sm:py-3 text-sm font-medium border border-slate-300/80 dark:border-white/15 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-400 shadow-sm bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-150 focus-visible:outline-none"
            />
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
          Send Verification Code
        </Button>
      </form>
    </motion.div>
  );
};

export default Register;
