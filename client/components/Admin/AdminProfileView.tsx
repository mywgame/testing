/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  QrCode,
  Copy,
  Check,
  Download,
  RefreshCw,
  AlertCircle,
  FileText,
  Lock,
  Mail,
  Shield
} from 'lucide-react';
import { Card, Button, Badge, Input } from '../ui/index.ts';
import { ThemeTokens } from '../ui/themeTokens.ts';
import { Toast } from '../ui/Feedback/index.tsx';
import { getApiUrl } from '../../services/apiConfig.ts';
import { useAuth } from '../../hooks/useAuth.ts';

interface AdminProfileViewProps {
  t: ThemeTokens;
  isDark: boolean;
}

interface AdminProfile {
  id: string;
  uid: string;
  name: string;
  email: string;
  username: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  totpEnabled: boolean;
  hasRecoveryCodes: boolean;
}

export const AdminProfileView: React.FC<AdminProfileViewProps> = ({ t, isDark }) => {
  const { token } = useAuth();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Setup 2FA state
  const [setupStep, setSetupStep] = useState<'idle' | 'configuring' | 'success'>('idle');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [mfaBusy, setMfaBusy] = useState(false);
  const [mfaError, setMfaError] = useState<string | null>(null);

  // Disable 2FA state
  const [disableModalOpen, setDisableModalOpen] = useState(false);
  const [disableCode, setDisableCode] = useState('');

  // Recovery Codes display state
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [copiedCodes, setCopiedCodes] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(getApiUrl('/admin/profile'), {
        headers: {
          Authorization: `Bearer ${token || localStorage.getItem('metafirm_token')}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to load admin profile');
      }
      setProfile(data.data);
    } catch (err: any) {
      setError(err.message || 'Error fetching profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleStart2faSetup = async () => {
    setMfaBusy(true);
    setMfaError(null);
    try {
      const res = await fetch(getApiUrl('/admin/security/setup'), {
        headers: {
          Authorization: `Bearer ${token || localStorage.getItem('metafirm_token')}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to initiate 2FA setup');
      }

      setSecretKey(data.data.secret);
      setQrCodeUrl(data.data.qrCodeUrl);
      setSetupStep('configuring');
    } catch (err: any) {
      setMfaError(err.message || 'Error starting 2FA setup');
    } finally {
      setMfaBusy(false);
    }
  };

  const handleEnable2fa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyCode || verifyCode.trim().length !== 6) {
      setMfaError('Please enter a valid 6-digit Google Authenticator code.');
      return;
    }

    setMfaBusy(true);
    setMfaError(null);
    try {
      const res = await fetch(getApiUrl('/admin/security/enable'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || localStorage.getItem('metafirm_token')}`,
        },
        body: JSON.stringify({
          code: verifyCode.trim(),
          secret: secretKey,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to enable 2FA');
      }

      setRecoveryCodes(data.data.recoveryCodes || []);
      setSetupStep('success');
      showToast('Google Authenticator 2FA enabled successfully!');
      fetchProfile();
    } catch (err: any) {
      setMfaError(err.message || '2FA activation failed.');
    } finally {
      setMfaBusy(false);
    }
  };

  const handleDisable2fa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disableCode || disableCode.trim().length !== 6) {
      setMfaError('Please enter your 6-digit code to confirm disabling 2FA.');
      return;
    }

    setMfaBusy(true);
    setMfaError(null);
    try {
      const res = await fetch(getApiUrl('/admin/security/disable'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || localStorage.getItem('metafirm_token')}`,
        },
        body: JSON.stringify({ code: disableCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to disable 2FA');
      }

      setDisableModalOpen(false);
      setDisableCode('');
      setSetupStep('idle');
      showToast('Google Authenticator 2FA disabled.');
      fetchProfile();
    } catch (err: any) {
      setMfaError(err.message || 'Failed to disable 2FA');
    } finally {
      setMfaBusy(false);
    }
  };

  const handleRegenerateRecoveryCodes = async () => {
    const code = prompt('Enter your 6-digit Google Authenticator code to generate new recovery codes:');
    if (!code) return;

    setMfaBusy(true);
    try {
      const res = await fetch(getApiUrl('/admin/security/regenerate-recovery'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || localStorage.getItem('metafirm_token')}`,
        },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to regenerate recovery codes');
      }

      setRecoveryCodes(data.data.recoveryCodes || []);
      setSetupStep('success');
      showToast('New recovery codes generated!');
    } catch (err: any) {
      alert(err.message || 'Error regenerating recovery codes');
    } finally {
      setMfaBusy(false);
    }
  };

  const handleCopyRecoveryCodes = () => {
    navigator.clipboard.writeText(recoveryCodes.join('\n'));
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 2000);
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-gray-500 animate-pulse">
        Loading Admin Profile & Security state…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toastMsg && <Toast message={toastMsg} type="success" onClose={() => setToastMsg(null)} />}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-gray-900 dark:text-white">
              Admin Profile & Security
            </h1>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Manage your Root Operator credentials, Google Authenticator (TOTP), and multi-factor security rules.
          </p>
        </div>

        <button
          onClick={fetchProfile}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer text-gray-700 dark:text-gray-300"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Status
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid: Operator Info + Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Operator Info Card */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center text-blue-600 font-bold text-lg font-mono">
                {(profile?.name || 'A').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  {profile?.name}
                </h3>
                <span className="text-xs font-mono text-gray-500">{profile?.email}</span>
              </div>
            </div>
            <Badge variant={profile?.role === 'SUPERADMIN' ? 'amber' : 'blue'}>
              {profile?.role || 'ADMIN'}
            </Badge>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-white/5">
              <span className="text-gray-500">Username</span>
              <span className="font-mono font-bold text-gray-900 dark:text-white">@{profile?.username}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-white/5">
              <span className="text-gray-500">Account ID</span>
              <span className="font-mono text-gray-700 dark:text-gray-300 text-[11px]">{profile?.id}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-white/5">
              <span className="text-gray-500">System Status</span>
              <span className="text-emerald-600 font-bold uppercase tracking-wider text-[11px]">
                {profile?.status || 'ACTIVE'}
              </span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-gray-500">Multi-Factor Enforced</span>
              <span className="font-bold text-blue-600">Yes (Email + TOTP)</span>
            </div>
          </div>
        </Card>

        {/* Security Overview Card */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Multi-Factor Security Status
              </h3>
            </div>
            <Badge variant={profile?.totpEnabled ? 'emerald' : 'rose'}>
              {profile?.totpEnabled ? '2FA ACTIVE' : '2FA INACTIVE'}
            </Badge>
          </div>

          <div className="space-y-3 text-xs text-gray-600 dark:text-gray-300">
            <p>
              Google Authenticator (TOTP) generates time-based single use passcodes required alongside email verification when logging into the Admin Control Panel.
            </p>

            <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-500" /> Email OTP
                </span>
                <span className="text-emerald-500 font-bold">ACTIVE</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-purple-500" /> Google Authenticator (TOTP)
                </span>
                <span className={profile?.totpEnabled ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                  {profile?.totpEnabled ? 'CONFIGURED' : 'NOT CONFIGURED'}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Google Authenticator (TOTP) Management Section */}
      <Card className="p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <KeyRound className="w-5 h-5 text-purple-600" />
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Google Authenticator (2FA) Configuration
              </h3>
              <p className="text-xs text-gray-500">
                Encrypted TOTP secrets with SHA-256 hashed single-use recovery fallback codes.
              </p>
            </div>
          </div>
        </div>

        {mfaError && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{mfaError}</span>
          </div>
        )}

        {/* 2FA Inactive / Idle State */}
        {!profile?.totpEnabled && setupStep === 'idle' && (
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-700/30 rounded-xl text-xs text-amber-800 dark:text-amber-300">
              <span className="font-bold block mb-1">Recommended Action</span>
              Pair your Google Authenticator app to enable hardware-backed TOTP verification for all Admin operations.
            </div>

            <Button
              onClick={handleStart2faSetup}
              disabled={mfaBusy}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl cursor-pointer"
            >
              {mfaBusy ? 'Initializing Setup…' : 'Setup Google Authenticator'}
            </Button>
          </div>
        )}

        {/* 2FA Setup Step: Configuring QR Code */}
        {!profile?.totpEnabled && setupStep === 'configuring' && (
          <div className="space-y-5 border-t border-gray-100 dark:border-white/10 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="flex flex-col items-center p-4 bg-white rounded-2xl border border-gray-200 shadow-sm max-w-xs mx-auto">
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="Google Authenticator QR Code" className="w-44 h-44" />
                ) : (
                  <div className="w-44 h-44 bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                    Generating QR…
                  </div>
                )}
                <span className="text-[11px] font-mono font-bold text-gray-500 mt-2">
                  Scan with Google Authenticator
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Manual Secret Key (Encrypted on Server)
                  </label>
                  <div className="p-2.5 bg-gray-100 dark:bg-white/5 rounded-xl font-mono font-bold text-purple-600 dark:text-purple-400 break-all select-all border border-gray-200 dark:border-white/10">
                    {secretKey}
                  </div>
                </div>

                <form onSubmit={handleEnable2fa} className="space-y-3 pt-2">
                  <Input
                    label="Enter 6-Digit Code from Authenticator App"
                    placeholder="000000"
                    maxLength={6}
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                  />

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSetupStep('idle')}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 border border-gray-200 dark:border-white/10 bg-transparent cursor-pointer"
                    >
                      Cancel
                    </button>
                    <Button
                      type="submit"
                      disabled={verifyCode.length !== 6 || mfaBusy}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2 px-5 rounded-xl cursor-pointer"
                    >
                      {mfaBusy ? 'Verifying…' : 'Verify & Enable 2FA'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* 2FA Active State */}
        {profile?.totpEnabled && (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-medium flex items-center justify-between">
              <span className="flex items-center gap-2 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Google Authenticator 2FA is active.
              </span>
              <span className="text-[11px] font-mono opacity-80">Encrypted Secret Stored</span>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                onClick={() => setDisableModalOpen(true)}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2 px-4 rounded-xl cursor-pointer"
              >
                Disable 2FA
              </Button>
              <Button
                onClick={handleRegenerateRecoveryCodes}
                disabled={mfaBusy}
                className="bg-gray-800 dark:bg-white/10 hover:bg-gray-900 text-white font-bold text-xs py-2 px-4 rounded-xl cursor-pointer"
              >
                Regenerate Recovery Codes
              </Button>
            </div>
          </div>
        )}

        {/* Modal/Section for Recovery Codes when generated */}
        {recoveryCodes.length > 0 && (
          <div className="p-5 bg-gray-900 text-white rounded-2xl space-y-4 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold flex items-center gap-2 text-amber-400">
                  <KeyRound className="w-4 h-4" /> Save Your 2FA Recovery Codes
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  Store these one-time codes in a safe place. They allow account recovery if you lose access to Google Authenticator.
                </p>
              </div>
              <button
                onClick={handleCopyRecoveryCodes}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                {copiedCodes ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCodes ? 'Copied!' : 'Copy Codes'}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-xs text-cyan-300 bg-black/40 p-4 rounded-xl border border-white/10">
              {recoveryCodes.map((code, idx) => (
                <div key={idx} className="p-1.5 text-center bg-white/5 rounded font-bold tracking-wider">
                  {code}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Disable 2FA Dialog */}
      {disableModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#0a0d26] border border-gray-200 dark:border-white/10 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-500" /> Disable Google Authenticator
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Disabling 2FA reduces account protection. Please enter your current 6-digit Google Authenticator code to confirm.
            </p>

            <form onSubmit={handleDisable2fa} className="space-y-4">
              <Input
                label="Verification Code"
                placeholder="000000"
                maxLength={6}
                value={disableCode}
                onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                autoFocus
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDisableModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 border border-gray-200 dark:border-white/10 bg-transparent cursor-pointer"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  disabled={disableCode.length !== 6 || mfaBusy}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2 px-5 rounded-xl cursor-pointer"
                >
                  {mfaBusy ? 'Disabling…' : 'Confirm Disable 2FA'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfileView;
