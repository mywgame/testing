/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth.ts';
import { Input } from '../../ui/index.ts';
import { getApiUrl } from '../../../services/apiConfig.ts';

interface MfaProps {
  token?: string;
  mfaEnabled?: boolean;
  onMfaStatusChange?: (enabled: boolean) => void;
  onSuccess?: (enabled: boolean) => void;
}

export const Mfa: React.FC<MfaProps> = ({
  token: propToken,
  mfaEnabled: propMfaEnabled,
  onMfaStatusChange,
  onSuccess,
}) => {
  const { token: authToken, user } = useAuth();
  const token = propToken || authToken || '';
  const mfaEnabled = propMfaEnabled !== undefined ? propMfaEnabled : ((user as any)?.mfaEnabled || false);

  const notifyStatusChange = (enabled: boolean) => {
    if (onMfaStatusChange) onMfaStatusChange(enabled);
    if (onSuccess) onSuccess(enabled);
  };

  const [setupStep, setSetupStep] = useState<'idle' | 'configuring'>('idle');
  const [mfaSecret, setMfaSecret] = useState('');
  const [mfaQrCode, setMfaQrCode] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaBusy, setMfaBusy] = useState(false);
  const [mfaMsgSuccess, setMfaMsgSuccess] = useState('');
  const [mfaMsgError, setMfaMsgError] = useState('');

  // ---- Two-Factor Authentication (MFA) handlers ----
  const handleInitiateMfa = async () => {
    setMfaBusy(true);
    setMfaMsgSuccess('');
    setMfaMsgError('');
    try {
      const res = await fetch(getApiUrl('/users/security/mfa/setup'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error?.message || 'MFA initialization failed.');

      setMfaSecret(body.data.secret);
      const qrUrl = body.data.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(body.data.otpauthUrl)}`;
      setMfaQrCode(qrUrl);
      setSetupStep('configuring');
    } catch (err: any) {
      setMfaMsgError(err.message || 'Failed to initialize MFA.');
    } finally {
      setMfaBusy(false);
    }
  };

  const handleEnableMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mfaCode.trim().length !== 6) return;

    setMfaBusy(true);
    setMfaMsgSuccess('');
    setMfaMsgError('');
    try {
      const res = await fetch(getApiUrl('/users/security/mfa/enable'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          secret: mfaSecret,
          code: mfaCode.trim()
        })
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error?.message || 'MFA activation failed.');

      notifyStatusChange(true);
      setSetupStep('idle');
      setMfaCode('');
      setMfaSecret('');
      setMfaQrCode('');
      setMfaMsgSuccess('Google Authenticator 2FA enabled successfully!');
    } catch (err: any) {
      setMfaMsgError(err.message || 'MFA activation failed.');
    } finally {
      setMfaBusy(false);
    }
  };

  const handleDisableMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mfaCode.trim().length !== 6) return;

    setMfaBusy(true);
    setMfaMsgSuccess('');
    setMfaMsgError('');
    try {
      const res = await fetch(getApiUrl('/users/security/mfa/disable'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          code: mfaCode.trim()
        })
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error?.message || 'Failed to disable MFA.');

      notifyStatusChange(false);
      setMfaCode('');
      setMfaMsgSuccess('Google Authenticator 2FA has been disabled.');
    } catch (err: any) {
      setMfaMsgError(err.message || 'Failed to disable MFA.');
    } finally {
      setMfaBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {mfaMsgSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs rounded-xl">
          {mfaMsgSuccess}
        </div>
      )}
      {mfaMsgError && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl">
          {mfaMsgError}
        </div>
      )}

      {!mfaEnabled && setupStep === 'idle' && (
        <div className="space-y-3">
          <p className="text-xs text-gray-400">
            Secure your account transactions and critical profile settings with an additional layer of security.
          </p>
          <button
            onClick={handleInitiateMfa}
            disabled={mfaBusy}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {mfaBusy ? 'Initializing Setup…' : 'Enable 2FA Protection'}
          </button>
        </div>
      )}

      {!mfaEnabled && setupStep === 'configuring' && (
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {mfaQrCode ? (
              <div className="p-2.5 bg-white rounded-xl border border-gray-100">
                <img src={mfaQrCode} alt="TOTP Setup QR" className="w-36 h-36" />
              </div>
            ) : (
              <div className="w-36 h-36 bg-gray-100 dark:bg-white/5 rounded-xl flex items-center justify-center text-xs text-gray-400">
                Generating QR…
              </div>
            )}
            <div className="flex-1 space-y-1.5 text-center sm:text-left min-w-0">
              <h5 className="text-xs font-bold text-gray-900 dark:text-white">Scan Setup Code</h5>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Scan this QR code with Google Authenticator or any TOTP application to link your MetaFirm account.
              </p>
              <div className="pt-1.5">
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Manual Setup Key</p>
                <code className="text-xs font-mono font-bold text-cyan-500 break-all select-all">
                  {mfaSecret}
                </code>
              </div>
            </div>
          </div>

          <form onSubmit={handleEnableMfa} className="space-y-4">
            <Input
              label="Verification Code"
              placeholder="000000"
              maxLength={6}
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
            />
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setMfaCode('');
                  setMfaSecret('');
                  setMfaQrCode('');
                  setSetupStep('idle');
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-gray-600 border border-gray-200 dark:border-white/10 cursor-pointer bg-transparent"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={mfaCode.length !== 6 || mfaBusy}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {mfaBusy ? 'Activating…' : 'Verify & Enable'}
              </button>
            </div>
          </form>
        </div>
      )}

      {mfaEnabled && (
        <div className="space-y-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/15 text-emerald-500 rounded-xl text-xs font-medium">
            Google Authenticator 2FA is currently active.
          </div>
          <form onSubmit={handleDisableMfa} className="w-full max-w-xs flex gap-2">
            <input
              type="text"
              maxLength={6}
              placeholder="000000"
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 font-mono text-center tracking-widest font-bold"
              required
            />
            <button
              type="submit"
              disabled={mfaCode.length !== 6 || mfaBusy}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors cursor-pointer shrink-0"
            >
              {mfaBusy ? 'Disabling…' : 'Disable 2FA'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Mfa;
