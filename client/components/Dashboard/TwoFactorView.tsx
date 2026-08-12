/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.ts';
import { useTheme } from '../../hooks/useTheme.ts';
import { Fingerprint, ShieldCheck, Key, AlertTriangle, CheckCircle, Smartphone } from 'lucide-react';
import { Mfa } from '../Auth/Mfa/Mfa.tsx';
import { getApiUrl } from '../../services/apiConfig.ts';

export const TwoFactorView: React.FC = () => {
  const { user, token, syncProfile } = useAuth();
  const { t } = useTheme();

  const [mfaEnabled, setMfaEnabled] = useState(false);

  useEffect(() => {
    if (token) {
      fetchSecuritySummary();
    }
  }, [token]);

  const fetchSecuritySummary = async () => {
    try {
      const res = await fetch(getApiUrl('/users/security/summary'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const body = await res.json();
        if (body.success) {
          setMfaEnabled(body.data.mfaEnabled || false);
        }
      }
    } catch (err) {
      console.error('Failed to load security summary:', err);
    }
  };

  const handleMfaStatusChange = async (enabled: boolean) => {
    setMfaEnabled(enabled);
    fetchSecuritySummary();
    await syncProfile();
  };

  return (
    <div className="space-y-6 text-left" id="two-factor-view-tab">
      {/* 1. Header Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`rounded-2xl border p-4 backdrop-blur-lg flex flex-col justify-between ${t.card}`}>
          <span className={`text-[10px] font-bold uppercase tracking-widest ${t.textMuted}`}>2FA Status</span>
          <h4 className={`text-base font-extrabold flex items-center gap-1.5 mt-1 ${mfaEnabled ? 'text-emerald-500' : 'text-amber-500'}`}>
            {mfaEnabled ? (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Enabled & Protected
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" /> Disabled (Action Advised)
              </>
            )}
          </h4>
        </div>

        <div className={`rounded-2xl border p-4 backdrop-blur-lg flex flex-col justify-between ${t.card}`}>
          <span className={`text-[10px] font-bold uppercase tracking-widest ${t.textMuted}`}>Protection Standard</span>
          <h4 className={`text-sm font-extrabold flex items-center gap-1.5 mt-1 ${t.text}`}>
            <ShieldCheck className="w-4 h-4 text-cyan-500 shrink-0" /> TOTP (RFC 6238)
          </h4>
        </div>

        <div className={`rounded-2xl border p-4 backdrop-blur-lg flex flex-col justify-between ${t.card}`}>
          <span className={`text-[10px] font-bold uppercase tracking-widest ${t.textMuted}`}>Required For</span>
          <h4 className={`text-xs font-bold mt-1 ${t.text}`}>
            Withdrawals & Sensitive Actions
          </h4>
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className={`rounded-2xl border p-6 backdrop-blur-lg space-y-6 ${t.card}`}>
            <div className={`pb-4 border-b ${t.sep}`}>
              <h3 className={`text-base font-extrabold flex items-center gap-2 ${t.text}`}>
                <Fingerprint className="w-5 h-5 text-cyan-500" /> Two-Factor Authentication (2FA)
              </h3>
              <p className={`text-xs mt-1 ${t.textMuted}`}>
                Bind your account with Google Authenticator or any TOTP application to protect your balance and outbound withdrawals.
              </p>
            </div>

            <Mfa
              token={token || ''}
              mfaEnabled={mfaEnabled}
              onMfaStatusChange={handleMfaStatusChange}
              onSuccess={handleMfaStatusChange}
            />
          </div>
        </div>

        {/* Side Info Cards */}
        <div className="lg:col-span-4 space-y-4">
          <div className={`rounded-2xl border p-5 backdrop-blur-lg space-y-3 ${t.card}`}>
            <div className="flex items-center gap-2 text-cyan-500">
              <Smartphone className="w-4 h-4" />
              <h5 className="text-xs font-bold">Supported Apps</h5>
            </div>
            <p className={`text-[11px] leading-relaxed ${t.textMuted}`}>
              Compatible with Google Authenticator, Authy, Microsoft Authenticator, 1Password, Bitwarden, and standard TOTP authenticator tools.
            </p>
          </div>

          <div className={`rounded-2xl border p-5 backdrop-blur-lg space-y-3 ${t.card}`}>
            <div className="flex items-center gap-2 text-amber-500">
              <AlertTriangle className="w-4 h-4" />
              <h5 className="text-xs font-bold">Security Best Practices</h5>
            </div>
            <p className={`text-[11px] leading-relaxed ${t.textMuted}`}>
              Never share your 6-digit verification code or manual secret key with anyone. MetaFirm staff will never ask for your 2FA credentials.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorView;
