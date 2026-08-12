/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Mail,
  Wallet,
  Shield,
  HelpCircle,
  Save,
  Info,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { Card, Button, Input } from '../ui/index.ts';
import { ThemeTokens } from '../ui/themeTokens.ts';
import { Toast } from '../ui/Feedback/index.tsx';
import { api } from '../../services/api.ts';

interface SettingsViewProps {
  t: ThemeTokens;
  isDark: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ t, isDark }) => {
  const [platformName, setPlatformName] = useState('MetaFirm');
  const [supportEmail, setSupportEmail] = useState('operations@metafirm.app');
  const [minDeposit, setMinDeposit] = useState('100');
  const [minWithdrawal, setMinWithdrawal] = useState('50');
  const [withdrawalFee, setWithdrawalFee] = useState('2.5');
  const [baseRefBonus, setBaseRefBonus] = useState('5.0');
  
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isToastOpen, setIsToastOpen] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getAdminSettings();
      if (res.success && Array.isArray(res.data)) {
        const settingsMap = new Map<string, any>();
        res.data.forEach((s: any) => settingsMap.set(s.key, s));

        if (settingsMap.has('PLATFORM_NAME')) setPlatformName(settingsMap.get('PLATFORM_NAME').value);
        if (settingsMap.has('SUPPORT_EMAIL')) setSupportEmail(settingsMap.get('SUPPORT_EMAIL').value);
        if (settingsMap.has('MIN_DEPOSIT_THRESHOLD')) setMinDeposit(settingsMap.get('MIN_DEPOSIT_THRESHOLD').value);
        if (settingsMap.has('MIN_WITHDRAWAL_THRESHOLD')) setMinWithdrawal(settingsMap.get('MIN_WITHDRAWAL_THRESHOLD').value);
        if (settingsMap.has('WITHDRAWAL_PROCESSING_FEE')) setWithdrawalFee(settingsMap.get('WITHDRAWAL_PROCESSING_FEE').value);
        if (settingsMap.has('BASE_REFERRAL_BONUS')) setBaseRefBonus(settingsMap.get('BASE_REFERRAL_BONUS').value);
      } else {
        setError(res.error?.message || 'Failed to fetch platform configurations.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      await Promise.all([
        api.updateAdminSetting('PLATFORM_NAME', platformName),
        api.updateAdminSetting('SUPPORT_EMAIL', supportEmail),
        api.updateAdminSetting('MIN_DEPOSIT_THRESHOLD', minDeposit),
        api.updateAdminSetting('MIN_WITHDRAWAL_THRESHOLD', minWithdrawal),
        api.updateAdminSetting('WITHDRAWAL_PROCESSING_FEE', withdrawalFee),
        api.updateAdminSetting('BASE_REFERRAL_BONUS', baseRefBonus),
      ]);

      setIsToastOpen(true);
      setTimeout(() => setIsToastOpen(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-left relative">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Platform Configurations</h2>
          <p className={`text-xs mt-1 ${t.textSub}`}>Configure default operational nameplates, financial thresholds, withdrawal tax fees, and support emails.</p>
        </div>
        <Button onClick={fetchSettings} variant="secondary" className="flex items-center gap-1.5 px-3 py-2 text-xs">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{error}</span>
          </div>
          <Button variant="secondary" onClick={fetchSettings} className="px-3 py-1 text-xs">
            Retry
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Settings Inputs */}
        <Card className="lg:col-span-8 p-6">
          {loading ? (
            <div className="py-16 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
              <span className="text-xs font-medium">Loading platform configurations...</span>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              
              {/* Subsection 1: Branding */}
              <div className="space-y-4">
                <h3 className="font-display font-bold text-sm border-b pb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-500" />
                  <span>General Configurations & Branding</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Platform Identity Name"
                    value={platformName}
                    onChange={e => setPlatformName(e.target.value)}
                    required
                  />
                  <Input
                    label="Inbound Support Dispatch Email"
                    type="email"
                    value={supportEmail}
                    onChange={e => setSupportEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Subsection 2: Financial minimums */}
              <div className="space-y-4">
                <h3 className="font-display font-bold text-sm border-b pb-2 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-purple-500" />
                  <span>Transaction Limits & Thresholds</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Minimum Deposit Size Threshold (USD)"
                    type="number"
                    value={minDeposit}
                    onChange={e => setMinDeposit(e.target.value)}
                    required
                  />
                  <Input
                    label="Minimum Withdrawal Size Threshold (USD)"
                    type="number"
                    value={minWithdrawal}
                    onChange={e => setMinWithdrawal(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Subsection 3: Withdrawal fees */}
              <div className="space-y-4">
                <h3 className="font-display font-bold text-sm border-b pb-2 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-cyan-500" />
                  <span>Financial Ledger Charges</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Withdrawal Processing Fee Percentage (%)"
                    type="number"
                    step="0.01"
                    value={withdrawalFee}
                    onChange={e => setWithdrawalFee(e.target.value)}
                    required
                  />
                  <Input
                    label="Fallback Base Referral Bonus (%)"
                    type="number"
                    step="0.01"
                    value={baseRefBonus}
                    onChange={e => setBaseRefBonus(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t flex justify-end">
                <Button type="submit" variant="primary" disabled={saving} leftIcon={<Save className="w-4 h-4" />}>
                  {saving ? 'Saving...' : 'Save Configurations'}
                </Button>
              </div>
            </form>
          )}
        </Card>

        {/* Right Info card */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-5 space-y-4 text-xs">
            <h4 className="font-display font-bold text-xs flex items-center gap-2 text-blue-500 uppercase tracking-wider">
              <Info className="w-4 h-4 text-blue-500" />
              <span>Settings Guidelines</span>
            </h4>
            <div className="space-y-3">
              <div className="space-y-1">
                <span className="font-bold">Transaction Size Limits</span>
                <p className={`leading-relaxed text-[11px] ${t.textSub}`}>Prevents high-frequency microtransactions from clogging cold wallet nodes and inflating fee overheads.</p>
              </div>
              <div className="space-y-1">
                <span className="font-bold">Withdrawal tax fees</span>
                <p className={`leading-relaxed text-[11px] ${t.textSub}`}>Withheld automatically from outbound balances to cover gas limits on BNB chain/Polygon networks during transfers.</p>
              </div>
              <div className="space-y-1">
                <span className="font-bold">Support Dispatch</span>
                <p className={`leading-relaxed text-[11px] ${t.textSub}`}>System-generated alerts (such as failed OTP alerts) are directed to this mailbox for administrator moderation.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {isToastOpen && (
        <Toast
          message="Platform settings updated and deployed."
          variant="success"
          onClose={() => setIsToastOpen(false)}
        />
      )}
    </div>
  );
};
export default SettingsView;
