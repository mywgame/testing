/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ToggleLeft,
  ToggleRight,
  UserX,
  Lock,
  Unlock,
  Key,
  Laptop,
  Globe,
  Bell,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { Card, Button, Badge } from '../ui/index.ts';
import { ThemeTokens } from '../ui/themeTokens.ts';
import { Toast } from '../ui/Feedback/index.tsx';
import { api } from '../../services/api.ts';

interface SecuritySession {
  id: string;
  admin: string;
  ip: string;
  location: string;
  device: string;
  active: boolean;
  sessionTime?: string;
}

interface SecurityAlert {
  msg: string;
  time: string;
  level: 'High' | 'Medium' | 'Low';
}

interface SecurityViewProps {
  t: ThemeTokens;
  isDark: boolean;
}

export const SecurityView: React.FC<SecurityViewProps> = ({ t, isDark }) => {
  const [sessions, setSessions] = useState<SecuritySession[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Security Switches
  const [freezeWithdrawals, setFreezeWithdrawals] = useState(false);
  const [freezeRegistrations, setFreezeRegistrations] = useState(false);
  const [enforce2FA, setEnforce2FA] = useState(true);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadSecurityOverview = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getSecurityOverview();
      if (res.success && res.data) {
        if (res.data.switches) {
          setFreezeWithdrawals(!!res.data.switches.freezeWithdrawals);
          setFreezeRegistrations(!!res.data.switches.freezeRegistrations);
          setEnforce2FA(res.data.switches.enforce2FA !== false);
        }

        if (res.data.activeSessions) {
          const mappedSessions = res.data.activeSessions.map((s: any) => ({
            id: s.id,
            admin: s.adminName || 'Admin User',
            ip: s.ip || '127.0.0.1',
            location: s.location || 'Verified Gateway',
            device: s.device || 'Admin Portal',
            active: s.status === 'Active',
            sessionTime: s.sessionTime
          }));
          setSessions(mappedSessions);
        }

        if (res.data.alerts) {
          setAlerts(res.data.alerts);
        }
      } else {
        setError(res.error?.message || 'Failed to retrieve security configuration.');
      }
    } catch (err: any) {
      setError(err.message || 'Error executing request.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSecurityOverview();
  }, []);

  const saveSwitches = async (newSwitches: { freezeWithdrawals: boolean; freezeRegistrations: boolean; enforce2FA: boolean }) => {
    try {
      const res = await api.updateSecuritySwitches(newSwitches);
      if (res.success) {
        showToast('Platform security switches updated on live server.');
      } else {
        showToast(res.error?.message || 'Failed to save security switches.');
      }
    } catch (err: any) {
      showToast(err.message || 'Error updating switches.');
    }
  };

  // Toggle global lock
  const handleToggleFreezeWithdrawals = () => {
    const nextState = !freezeWithdrawals;
    setFreezeWithdrawals(nextState);
    saveSwitches({ freezeWithdrawals: nextState, freezeRegistrations, enforce2FA });
  };

  const handleToggleFreezeRegistrations = () => {
    const nextState = !freezeRegistrations;
    setFreezeRegistrations(nextState);
    saveSwitches({ freezeWithdrawals, freezeRegistrations: nextState, enforce2FA });
  };

  const handleToggle2FA = () => {
    const nextState = !enforce2FA;
    setEnforce2FA(nextState);
    saveSwitches({ freezeWithdrawals, freezeRegistrations, enforce2FA: nextState });
  };

  // Revoke session
  const revokeSession = async (sessionId: string, adminName: string) => {
    try {
      const res = await api.revokeAdminSession(sessionId);
      if (res.success) {
        setSessions(prev => prev.map(s => (s.id === sessionId ? { ...s, active: false } : s)));
        showToast(`Session for auditor account ${adminName} has been revoked.`);
      } else {
        showToast(res.error?.message || 'Failed to revoke session.');
      }
    } catch (err: any) {
      showToast(err.message || 'Error revoking session.');
    }
  };

  // Clear alerts feed
  const clearAlerts = async () => {
    try {
      const res = await api.clearSecurityAlerts();
      if (res.success) {
        setAlerts([]);
        showToast('Alerts threat logs feed cleared.');
      } else {
        showToast(res.error?.message || 'Failed to clear alerts.');
      }
    } catch (err: any) {
      showToast(err.message || 'Error clearing alerts.');
    }
  };

  if (loading) {
    return (
      <Card className="p-12 text-center flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
        <p className={`text-xs font-bold ${t.textMuted}`}>Loading Security Command feeds...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6 text-left">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Security Command</h2>
          <p className={`text-xs mt-1 ${t.textSub}`}>Monitor administrator sessions, deploy emergency circuit breakers, and review security threat logs.</p>
        </div>
        <Button onClick={loadSecurityOverview} variant="secondary" size="sm" leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
          Sync Feeds
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Global Emergency Breaks & Switches */}
        <div className="lg:col-span-5 space-y-5">
          <Card className="p-6 space-y-5">
            <h3 className="font-display font-bold text-sm border-b pb-2 flex items-center gap-2">
              <Lock className="w-4 h-4 text-red-500" />
              <span>Platform Security Switches</span>
            </h3>

            <div className="space-y-4">
              {/* Switch 1: Withdrawals block */}
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold block">Freeze All Withdrawals</span>
                  <p className={`text-[10px] leading-relaxed ${t.textMuted}`}>Emergency break. Halts all outbound payouts immediately.</p>
                </div>
                <button onClick={handleToggleFreezeWithdrawals} className="cursor-pointer shrink-0 transition-all text-red-500">
                  {freezeWithdrawals ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10 text-gray-400" />}
                </button>
              </div>

              {/* Switch 2: Registrations freeze */}
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold block">Freeze Registrations</span>
                  <p className={`text-[10px] leading-relaxed ${t.textMuted}`}>Blocks new users from creating credentials temporarily.</p>
                </div>
                <button onClick={handleToggleFreezeRegistrations} className="cursor-pointer shrink-0 transition-all text-amber-500">
                  {freezeRegistrations ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10 text-gray-400" />}
                </button>
              </div>

              {/* Switch 3: 2FA Enforce */}
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold block">Mandatory Auditor 2FA</span>
                  <p className={`text-[10px] leading-relaxed ${t.textMuted}`}>Forces secure token authentication for all admin levels.</p>
                </div>
                <button onClick={handleToggle2FA} className="cursor-pointer shrink-0 transition-all text-emerald-500">
                  {enforce2FA ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10 text-gray-400" />}
                </button>
              </div>
            </div>
          </Card>

          {/* Security alerts Feed bento */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-display font-bold text-xs flex items-center gap-2 text-red-400 uppercase tracking-wider">
                <Bell className="w-4 h-4" />
                <span>Threat Alerts Feed</span>
              </h4>
              {alerts.length > 0 && (
                <button
                  onClick={clearAlerts}
                  className={`text-[9px] font-mono font-bold uppercase transition-all hover:underline cursor-pointer ${t.textMuted}`}
                >
                  Dismiss Feed
                </button>
              )}
            </div>

            <div className="space-y-3">
              {alerts.length > 0 ? (
                alerts.map((al, idx) => (
                  <div
                    key={idx}
                    className={`rounded-xl p-3 border text-left flex items-start gap-3 ${
                      al.level === 'High' ? 'border-red-500/20 bg-red-500/5' : 'border-amber-500/20 bg-amber-500/5'
                    }`}
                  >
                    <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${al.level === 'High' ? 'text-red-500' : 'text-amber-500'}`} />
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-xs font-bold truncate leading-tight">{al.msg}</p>
                      <p className={`text-[9px] font-mono font-medium ${t.textMuted}`}>{al.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className={`p-4 text-center font-medium text-xs ${t.textMuted}`}>
                  No active security threats registered.
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right: Active auditor sessions */}
        <Card className="lg:col-span-7 p-0 overflow-hidden flex flex-col justify-between">
          <div>
            <div className={`p-4 border-b ${t.sep}`}>
              <h3 className="font-display font-bold text-sm flex items-center gap-2">
                <Key className="w-4 h-4 text-purple-500" />
                <span>Active Administrator Sessions</span>
              </h3>
            </div>

            <div className="divide-y divide-gray-100/10">
              {sessions.length > 0 ? (
                sessions.map((sess) => (
                  <div key={sess.id} className={`p-4 flex items-center justify-between gap-4 text-xs transition-colors ${t.cardInner}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        sess.active ? 'bg-emerald-500/15 text-emerald-500' : 'bg-gray-500/15 text-gray-500'
                      }`}>
                        {(sess.admin[0] || 'A').toUpperCase()}
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold">{sess.admin}</span>
                          <Badge variant={sess.active ? 'emerald' : 'neutral'}>
                            {sess.active ? 'Active Now' : 'Closed'}
                          </Badge>
                        </div>
                        <div className={`flex items-center gap-3 text-[10px] font-medium mt-1 ${t.textMuted}`}>
                          <span className="flex items-center gap-1">
                            <Globe className="w-3.5 h-3.5" />
                            {sess.location} ({sess.ip})
                          </span>
                          <span className="flex items-center gap-1">
                            <Laptop className="w-3.5 h-3.5" />
                            {sess.device}
                          </span>
                        </div>
                      </div>
                    </div>

                    {sess.active ? (
                      <button
                        onClick={() => revokeSession(sess.id, sess.admin)}
                        className="p-1.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer shrink-0"
                        title="Revoke session credentials"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className={`text-[10px] font-mono font-bold uppercase shrink-0 ${t.textMuted}`}>Expired</span>
                    )}
                  </div>
                ))
              ) : (
                <div className={`p-8 text-center font-medium ${t.textMuted}`}>
                  No active administrator sessions found.
                </div>
              )}
            </div>
          </div>

          <div className={`p-4 border-t bg-black/5 text-center text-[10px] font-medium ${t.sep} ${t.textMuted}`}>
            Zero-Trust access policies are enforced. Sessions terminate automatically after 15 minutes of inactivity.
          </div>
        </Card>
      </div>

      {toastMessage && (
        <Toast
          message={toastMessage}
          variant="success"
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
};
export default SecurityView;
