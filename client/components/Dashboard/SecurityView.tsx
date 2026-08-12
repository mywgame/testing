/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.ts';
import { useTheme } from '../../hooks/useTheme.ts';
import { Input, PasswordInput } from '../ui/Inputs/index.tsx';
import {
  Lock, ShieldCheck, Key, CheckCircle, XCircle, Smartphone, Laptop, Globe, Clock, Mail,
  AlertTriangle, RotateCw, LogOut, Fingerprint, Wallet, Plus, Pencil, BadgeCheck, Clock3,
} from 'lucide-react';
import { Mfa } from '../Auth/Mfa/Mfa.tsx';
import { SecurityVerification } from '../Auth/SecurityVerification/SecurityVerification.tsx';
import { getApiUrl } from '../../services/apiConfig.ts';

interface UserSession {
  id: string;
  device: string | null;
  browser: string | null;
  ipAddress: string | null;
  createdAt: string;
  lastActivity: string;
}

interface SecuritySummary {
  passwordChangedAt: string | null;
  failedLoginAttempts: number;
  accountLockStatus: string;
  currentLoginDevice: string | null;
  lastLoginTime: string | null;
  lastLoginIp: string | null;
}

type WithdrawalNetwork = 'USDT_BEP20' | 'USDT_POLYGON' | 'USDT_TRC20';

interface WithdrawalAddress {
  network: WithdrawalNetwork;
  address: string;
  verified: boolean;
}

const NETWORK_META: Record<WithdrawalNetwork, { label: string; color: string }> = {
  USDT_BEP20: { label: 'USDT · BEP20 (BNB Chain)', color: '#f0b90b' },
  USDT_POLYGON: { label: 'USDT · Polygon', color: '#8247e5' },
  USDT_TRC20: { label: 'USDT · TRC20 (Tron)', color: '#ef4444' },
};

// TODO(Phase 2 — backend integration): Withdrawal-address Add/Edit/Verify
// below is a UI-only mock (`mockOtpStep`/`mockOtpCode`, in-memory address
// list). Wire it to the real endpoints once available:
//   POST /users/security/withdrawal-addresses            (add/edit address)
//   POST /users/security/withdrawal-addresses/send-otp    (Email OTP via existing Redis OTP + EmailService)
//   POST /users/security/withdrawal-addresses/verify-otp  (confirm)
// No fake verification logic is performed server-side — this only simulates
// the UX flow so the screen can ship ahead of that backend work.

export const SecurityView: React.FC = () => {
  const { user, token, syncProfile } = useAuth();
  const { t } = useTheme();

  const [activeSubTab, setActiveSubTab] = useState<'password' | 'email' | 'sessions'>('password');

  // Password Form States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  // Email Form States
  const [emailPassword, setEmailPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

  // Sessions and Summary States
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [summary, setSummary] = useState<SecuritySummary | null>(null);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsSuccess, setSessionsSuccess] = useState('');
  const [sessionsError, setSessionsError] = useState('');

  // Withdrawal Addresses
  const [withdrawAddresses, setWithdrawAddresses] = useState<WithdrawalAddress[]>([
    { network: 'USDT_BEP20', address: '', verified: false },
    { network: 'USDT_POLYGON', address: '', verified: false },
    { network: 'USDT_TRC20', address: '', verified: false },
  ]);
  const [editingNetwork, setEditingNetwork] = useState<WithdrawalNetwork | null>(null);

  // Two-Factor Authentication States
  const [mfaEnabled, setMfaEnabled] = useState(false);

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: 'Empty', color: 'bg-gray-400/40', textColor: t.textMuted };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[a-z]/.test(pwd)) score += 1;
    if (/\d/.test(pwd)) score += 1;
    if (/[@$!%*?&()_+\-=\[\]{};':"\\|,.<>\/?#^]/.test(pwd)) score += 1;

    if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500', textColor: 'text-red-500' };
    if (score <= 4) return { score, label: 'Medium', color: 'bg-amber-500', textColor: 'text-amber-500' };
    return { score, label: 'Strong', color: 'bg-emerald-500', textColor: 'text-emerald-500' };
  };

  const strength = getPasswordStrength(newPassword);

  useEffect(() => {
    if (token) {
      fetchSecuritySummary();
      fetchSessionsList();
      fetchWithdrawalAddresses();
    }
  }, [token]);

  const fetchWithdrawalAddresses = async () => {
    try {
      const res = await fetch(getApiUrl('/users/security/withdrawal-addresses'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const body = await res.json();
        if (body.success && body.data) {
          const apiData = body.data as Record<WithdrawalNetwork, string[]>;
          setWithdrawAddresses((prev) =>
            prev.map((wa) => {
              const list = apiData[wa.network] || [];
              const lastAddress = list[list.length - 1] || '';
              return {
                ...wa,
                address: lastAddress,
                verified: !!lastAddress,
              };
            })
          );
        }
      }
    } catch (err) {
      console.error('Failed to load withdrawal addresses:', err);
    }
  };

  const fetchSecuritySummary = async () => {
    try {
      const res = await fetch(getApiUrl('/users/security/summary'), { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const body = await res.json();
        if (body.success) {
          setSummary(body.data);
          setMfaEnabled(body.data.mfaEnabled || false);
        }
      }
    } catch (err) {
      console.error('Failed to load security summary:', err);
    }
  };

  const fetchSessionsList = async () => {
    setSessionsLoading(true);
    try {
      const res = await fetch(getApiUrl('/users/security/sessions'), { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const body = await res.json();
        if (body.success) setSessions(body.data || []);
      }
    } catch (err) {
      console.error('Failed to load sessions:', err);
    } finally {
      setSessionsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdLoading(true);
    setPwdSuccess('');
    setPwdError('');

    if (newPassword !== confirmPassword) {
      setPwdError('Passwords do not match.');
      setPwdLoading(false);
      return;
    }

    try {
      const res = await fetch(getApiUrl('/users/security/change-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });

      const body = await res.json();
      if (!res.ok) throw new Error(body.error?.message || 'Failed to update credentials.');

      setPwdSuccess('Your account password was updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      fetchSecuritySummary();
      await syncProfile();
    } catch (err: any) {
      setPwdError(err.message || 'An error occurred.');
    } finally {
      setPwdLoading(false);
    }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailLoading(true);
    setEmailSuccess('');
    setEmailError('');

    try {
      const res = await fetch(getApiUrl('/users/security/change-email'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: emailPassword, newEmail }),
      });

      const body = await res.json();
      if (!res.ok) throw new Error(body.error?.message || 'Failed to change email.');

      setEmailSuccess('Your account email has been updated successfully.');
      setEmailPassword('');
      setNewEmail('');
      await syncProfile();
    } catch (err: any) {
      setEmailError(err.message || 'An error occurred.');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleLogoutOthers = async () => {
    setSessionsLoading(true);
    setSessionsSuccess('');
    setSessionsError('');

    try {
      const res = await fetch(getApiUrl('/users/security/sessions/logout-all-others'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ refreshToken: localStorage.getItem('metafirm_token') }),
      });

      const body = await res.json();
      if (!res.ok) throw new Error(body.error?.message || 'Failed to terminate sessions.');

      setSessionsSuccess('All other active sessions have been invalidated successfully.');
      fetchSessionsList();
      fetchSecuritySummary();
    } catch (err: any) {
      setSessionsError(err.message || 'An error occurred.');
    } finally {
      setSessionsLoading(false);
    }
  };

  // ---- Withdrawal address flow ----
  const startEdit = (network: WithdrawalNetwork) => {
    setEditingNetwork(network);
  };

  const alertBox = (kind: 'success' | 'error', message: string) => (
    <div
      className={`p-3.5 rounded-xl text-xs font-semibold flex items-center border ${
        kind === 'success'
          ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-500'
          : 'bg-red-500/10 border-red-500/25 text-red-400'
      }`}
    >
      {kind === 'success' ? <CheckCircle className="w-4 h-4 mr-2 shrink-0" /> : <XCircle className="w-4 h-4 mr-2 shrink-0" />}
      {message}
    </div>
  );

  const tabs: { id: typeof activeSubTab; label: string; badge?: number }[] = [
    { id: 'password', label: 'Change Password' },
    { id: 'email', label: 'Update Email' },
    { id: 'sessions', label: 'Active Sessions', badge: sessions.length > 1 ? sessions.length : undefined },
  ];

  return (
    <div className="space-y-6 text-left" id="security-view-tab">

      {/* 1. Header Overview Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`rounded-2xl border p-4 backdrop-blur-lg flex flex-col justify-between ${t.card}`}>
          <span className={`text-[10px] font-bold uppercase tracking-widest ${t.textMuted}`}>System Rating</span>
          <h4 className={`text-lg font-extrabold flex items-center gap-1.5 mt-1 ${t.text}`}>
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> A+ Secure
          </h4>
        </div>

        <div className={`rounded-2xl border p-4 backdrop-blur-lg flex flex-col justify-between ${t.card}`}>
          <span className={`text-[10px] font-bold uppercase tracking-widest ${t.textMuted}`}>Password Rotation</span>
          <h4 className={`text-xs font-bold mt-1 ${t.text}`}>
            {summary?.passwordChangedAt ? new Date(summary.passwordChangedAt).toLocaleDateString() : 'Never changed'}
          </h4>
        </div>

        <div className={`rounded-2xl border p-4 backdrop-blur-lg flex flex-col justify-between ${t.card}`}>
          <span className={`text-[10px] font-bold uppercase tracking-widest ${t.textMuted}`}>Login Security</span>
          <h4 className={`text-sm font-extrabold mt-1 ${summary?.accountLockStatus === 'LOCKED' ? 'text-red-500' : t.text}`}>
            {summary?.failedLoginAttempts ?? 0} failed attempts
          </h4>
        </div>

        <div className={`rounded-2xl border p-4 backdrop-blur-lg flex flex-col justify-between ${t.card}`}>
          <span className={`text-[10px] font-bold uppercase tracking-widest ${t.textMuted}`}>Last Login</span>
          <h4 className={`text-xs font-mono font-bold mt-1 truncate ${t.text}`}>{summary?.lastLoginIp || 'Unknown'}</h4>
        </div>
      </div>

      {/* 2. Sub-tab Navigation */}
      <div className={`flex gap-5 overflow-x-auto border-b ${t.sep}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeSubTab === tab.id ? 'border-cyan-500 text-cyan-500' : `border-transparent ${t.textMuted} hover:${t.text}`
            }`}
          >
            {tab.label}
            {tab.badge && (
              <span className="px-1.5 py-0.5 bg-cyan-500/15 text-cyan-500 text-[9px] rounded-full font-black">{tab.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* 3. Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">

          {activeSubTab === 'password' && (
            <div className={`rounded-2xl border p-6 backdrop-blur-lg space-y-5 ${t.card}`}>
              <div className={`pb-4 border-b ${t.sep}`}>
                <h3 className={`text-sm font-extrabold flex items-center gap-2 ${t.text}`}><Lock className="w-4 h-4 text-cyan-500" /> Update Account Password</h3>
                <p className={`text-xs mt-1 ${t.textMuted}`}>Use a strong password you don't reuse elsewhere.</p>
              </div>

              {pwdSuccess && alertBox('success', pwdSuccess)}
              {pwdError && alertBox('error', pwdError)}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <PasswordInput label="Current Password" placeholder="••••••••••••" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <PasswordInput label="New Password" placeholder="••••••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                    {newPassword && (
                      <div className={`space-y-1.5 p-3.5 rounded-xl ${t.inset}`}>
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className={t.textMuted}>Strength:</span>
                          <span className={strength.textColor}>{strength.label}</span>
                        </div>
                        <div className={`h-1.5 w-full rounded-full overflow-hidden ${t.isDark ? 'bg-white/10' : 'bg-black/10'}`}>
                          <div className={`h-full transition-all duration-300 ${strength.color}`} style={{ width: `${(strength.score / 5) * 100}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                  <PasswordInput label="Confirm New Password" placeholder="••••••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </div>

                <div className="pt-2 flex justify-end">
                  <button type="submit" disabled={pwdLoading || strength.score < 5} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity cursor-pointer">
                    {pwdLoading ? 'Updating…' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeSubTab === 'email' && (
            <div className={`rounded-2xl border p-6 backdrop-blur-lg space-y-5 ${t.card}`}>
              <div className={`pb-4 border-b ${t.sep}`}>
                <h3 className={`text-sm font-extrabold flex items-center gap-2 ${t.text}`}><Mail className="w-4 h-4 text-cyan-500" /> Update Registered Email</h3>
                <p className={`text-xs mt-1 ${t.textMuted}`}>Confirm your password to bind a new email to this account.</p>
              </div>

              {emailSuccess && alertBox('success', emailSuccess)}
              {emailError && alertBox('error', emailError)}

              <form onSubmit={handleChangeEmail} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <PasswordInput label="Current Password" placeholder="••••••••••••" value={emailPassword} onChange={(e) => setEmailPassword(e.target.value)} required />
                  <Input label="New Email Address" placeholder="you@domain.com" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} icon={<Mail className="w-4 h-4 text-gray-400" />} required />
                </div>
                <div className="pt-2 flex justify-end">
                  <button type="submit" disabled={emailLoading || !newEmail || !emailPassword} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity cursor-pointer">
                    {emailLoading ? 'Updating…' : 'Confirm Email Update'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeSubTab === 'sessions' && (
            <div className={`rounded-2xl border p-6 backdrop-blur-lg space-y-5 ${t.card}`}>
              <div className={`pb-4 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${t.sep}`}>
                <div>
                  <h3 className={`text-sm font-extrabold ${t.text}`}>Active Sessions</h3>
                  <p className={`text-xs mt-1 ${t.textMuted}`}>Devices currently signed in to your account.</p>
                </div>
                {sessions.length > 1 && (
                  <button onClick={handleLogoutOthers} disabled={sessionsLoading} className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 transition-colors cursor-pointer disabled:opacity-50">
                    <LogOut className="w-3.5 h-3.5" /> Terminate Others
                  </button>
                )}
              </div>

              {sessionsSuccess && alertBox('success', sessionsSuccess)}
              {sessionsError && alertBox('error', sessionsError)}

              {sessionsLoading && sessions.length === 0 ? (
                <div className={`py-8 text-center text-xs font-mono flex items-center justify-center gap-2 ${t.textMuted}`}>
                  <RotateCw className="w-4 h-4 animate-spin" /> Loading sessions…
                </div>
              ) : (
                <div className={`divide-y ${t.sep}`}>
                  {sessions.map((session, index) => {
                    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(session.device || '');
                    const isCurrent = index === 0;
                    return (
                      <div key={session.id} className="py-4 flex items-start gap-3.5">
                        <div className={`p-2.5 rounded-xl border shrink-0 ${isCurrent ? 'bg-cyan-500/10 border-cyan-500/25 text-cyan-500' : `${t.inset} ${t.textMuted}`}`}>
                          {isMobile ? <Smartphone className="w-4 h-4" /> : <Laptop className="w-4 h-4" />}
                        </div>
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs font-bold ${t.text}`}>{session.browser || 'Unknown Browser'} on {session.device || 'Unknown System'}</span>
                            {isCurrent && <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-cyan-500/15 text-cyan-500">Current</span>}
                          </div>
                          <div className={`flex items-center gap-4 text-[10px] font-mono flex-wrap ${t.textMuted}`}>
                            <span className="flex items-center"><Globe className="w-3 h-3 mr-1" /> {session.ipAddress || '127.0.0.1'}</span>
                            <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {new Date(session.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Side Info */}
        <div className="lg:col-span-4 space-y-4">
          <div className={`rounded-2xl border p-5 backdrop-blur-lg space-y-3 ${t.card}`}>
            <div className="flex items-center gap-2 text-cyan-500">
              <Key className="w-4 h-4" />
              <h5 className="text-xs font-bold">Session Encryption</h5>
            </div>
            <p className={`text-[11px] leading-relaxed ${t.textMuted}`}>
              Your session is protected end-to-end. Password rotation and logouts propagate instantly across every signed-in device.
            </p>
          </div>

          <div className={`rounded-2xl border p-5 backdrop-blur-lg space-y-3 ${t.card}`}>
            <div className="flex items-center gap-2 text-amber-500">
              <AlertTriangle className="w-4 h-4" />
              <h5 className="text-xs font-bold">Security Advice</h5>
            </div>
            <p className={`text-[11px] leading-relaxed ${t.textMuted}`}>
              Never share your password, OTP, or recovery codes with anyone. MetaFirm support will never ask for them.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityView;
