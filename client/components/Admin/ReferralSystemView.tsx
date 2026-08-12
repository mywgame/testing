/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Share2,
  Percent,
  DollarSign,
  Save,
  RotateCcw,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  Award,
  Clock,
  Info
} from 'lucide-react';
import { Card, Button, Input, Badge } from '../ui/index.ts';
import { ThemeTokens } from '../ui/themeTokens.ts';
import { api } from '../../services/api.ts';

interface ReferralSystemViewProps {
  t: ThemeTokens;
  isDark: boolean;
}

export const ReferralSystemView: React.FC<ReferralSystemViewProps> = ({ t, isDark }) => {
  const defaultSettings = {
    mode: 'PERCENTAGE',
    percentage: '10',
    fixedAmount: '20',
  };

  const [mode, setMode] = useState<'PERCENTAGE' | 'FIXED'>(defaultSettings.mode as 'PERCENTAGE' | 'FIXED');
  const [percentage, setPercentage] = useState<string>(defaultSettings.percentage);
  const [fixedAmount, setFixedAmount] = useState<string>(defaultSettings.fixedAmount);

  const [lastUpdated, setLastUpdated] = useState<string>('Just now');
  const [isSaved, setIsSaved] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getAdminSettings();
      if (res.success && Array.isArray(res.data)) {
        const settingsMap = new Map<string, any>();
        res.data.forEach((s: any) => settingsMap.set(s.key, s));

        if (settingsMap.has('REFERRAL_REWARD_MODE')) {
          const val = settingsMap.get('REFERRAL_REWARD_MODE').value.toUpperCase();
          if (val === 'FIXED' || val === 'PERCENTAGE') {
            setMode(val as 'PERCENTAGE' | 'FIXED');
          }
        }
        if (settingsMap.has('REFERRAL_REWARD_PERCENTAGE')) {
          setPercentage(settingsMap.get('REFERRAL_REWARD_PERCENTAGE').value);
        }
        if (settingsMap.has('REFERRAL_REWARD_FIXED_AMOUNT')) {
          setFixedAmount(settingsMap.get('REFERRAL_REWARD_FIXED_AMOUNT').value);
        }

        const latestUpdated = res.data
          .filter((s: any) => s.key.startsWith('REFERRAL_REWARD'))
          .map((s: any) => new Date(s.updatedAt || Date.now()).getTime())
          .sort((a: number, b: number) => b - a)[0];

        if (latestUpdated) {
          setLastUpdated(new Date(latestUpdated).toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
        }
        setIsSaved(true);
      } else {
        setError(res.error?.message || 'Failed to retrieve referral settings.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading referral settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleModeChange = (newMode: 'PERCENTAGE' | 'FIXED') => {
    setMode(newMode);
    setIsSaved(false);
  };

  const handlePercentageChange = (val: string) => {
    setPercentage(val);
    setIsSaved(false);
  };

  const handleFixedAmountChange = (val: string) => {
    setFixedAmount(val);
    setIsSaved(false);
  };

  const validateForm = (): string | null => {
    if (mode === 'PERCENTAGE') {
      const p = parseFloat(percentage);
      if (isNaN(p) || p < 0 || p > 100) {
        return 'Referral Percentage must be a valid number between 0% and 100%.';
      }
    } else {
      const f = parseFloat(fixedAmount);
      if (isNaN(f) || f < 0) {
        return 'Fixed Reward Amount must be a valid non-negative number.';
      }
    }
    return null;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError(null);

      await Promise.all([
        api.updateAdminSetting('REFERRAL_REWARD_MODE', mode),
        api.updateAdminSetting('REFERRAL_REWARD_PERCENTAGE', percentage),
        api.updateAdminSetting('REFERRAL_REWARD_FIXED_AMOUNT', fixedAmount),
      ]);

      const now = new Date();
      const formattedDate = now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

      setLastUpdated(formattedDate);
      setIsSaved(true);

      const rewardDesc = mode === 'PERCENTAGE' ? `${percentage}% commission` : `${fixedAmount} USDT fixed amount`;
      setNotification({
        type: 'success',
        text: `Referral configuration published successfully! Mode set to ${mode} (${rewardDesc}).`
      });

      setTimeout(() => {
        setNotification(null);
      }, 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to save referral configuration settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setMode(defaultSettings.mode as 'PERCENTAGE' | 'FIXED');
    setPercentage(defaultSettings.percentage);
    setFixedAmount(defaultSettings.fixedAmount);
    setIsSaved(false);

    setNotification({
      type: 'info',
      text: 'Referral parameters reset to system defaults. Click Save Configuration to publish.'
    });

    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Sample calculation preview based on a 1,000 USDT deposit
  const sampleDeposit = 1000;
  const sampleReward = mode === 'PERCENTAGE' 
    ? ((parseFloat(percentage) || 0) / 100) * sampleDeposit 
    : (parseFloat(fixedAmount) || 0);

  return (
    <div className="space-y-6 text-left relative animate-fade-in" id="referral-system-management">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold tracking-tight">Referral System Management</h2>
            <Badge variant="brand" className="text-[10px] px-2 py-0.5 uppercase tracking-wider">
              Section 9 Spec
            </Badge>
          </div>
          <p className={`text-xs mt-1 ${t.textSub}`}>
            Configure platform referral commission structures for first-time user deposits as specified in Section 9.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={saving || loading}
            className="flex items-center gap-1.5 text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={saving || loading || isSaved}
            className="flex items-center gap-1.5 text-xs shadow-md"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>
      </div>

      {/* Status Alerts */}
      {notification && (
        <div className={`p-4 rounded-xl text-xs flex items-center space-x-3 border ${
          notification.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
        }`}>
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notification.text}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl text-xs flex items-center space-x-3 bg-rose-500/10 border border-rose-500/20 text-rose-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Highlights / Quick Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="glass" className="p-4 flex items-center space-x-4">
          <div className="p-3 bg-brand-cyan/10 text-brand-cyan rounded-xl">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <p className={`text-[10px] font-mono uppercase font-semibold ${t.textSub}`}>Active Reward Mode</p>
            <p className="text-base font-bold capitalize mt-0.5">{mode.toLowerCase()} Mode</p>
          </div>
        </Card>

        <Card variant="glass" className="p-4 flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            {mode === 'PERCENTAGE' ? <Percent className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />}
          </div>
          <div>
            <p className={`text-[10px] font-mono uppercase font-semibold ${t.textSub}`}>Configured Rate / Amount</p>
            <p className="text-base font-bold mt-0.5">
              {mode === 'PERCENTAGE' ? `${percentage}%` : `${fixedAmount} USDT`}
            </p>
          </div>
        </Card>

        <Card variant="glass" className="p-4 flex items-center space-x-4">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className={`text-[10px] font-mono uppercase font-semibold ${t.textSub}`}>Last Configuration Audit</p>
            <p className="text-xs font-mono font-bold mt-0.5 truncate max-w-[150px]">{lastUpdated}</p>
          </div>
        </Card>
      </div>

      {/* Main Configuration Card & Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card variant="glass" className="p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h3 className="text-sm font-bold tracking-tight">Referral Reward Calculation Mode</h3>
                <p className={`text-xs mt-0.5 ${t.textSub}`}>
                  Select whether referrers receive a percentage of the downline's first real deposit or a fixed USDT amount.
                </p>
              </div>
            </div>

            {/* Mode Selector Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Percentage Mode Selector */}
              <div
                onClick={() => handleModeChange('PERCENTAGE')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  mode === 'PERCENTAGE'
                    ? 'bg-brand-cyan/10 border-brand-cyan text-white shadow-lg'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Percent className={`w-4 h-4 ${mode === 'PERCENTAGE' ? 'text-brand-cyan' : 'text-gray-400'}`} />
                    <span className="text-xs font-bold text-white">Percentage Mode</span>
                  </div>
                  <input
                    type="radio"
                    name="rewardMode"
                    checked={mode === 'PERCENTAGE'}
                    onChange={() => handleModeChange('PERCENTAGE')}
                    className="accent-brand-cyan cursor-pointer"
                  />
                </div>
                <p className={`text-[11px] leading-relaxed ${t.textSub}`}>
                  Calculates reward as a percentage of the referred user's first successful REAL deposit.
                </p>
              </div>

              {/* Fixed Amount Mode Selector */}
              <div
                onClick={() => handleModeChange('FIXED')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  mode === 'FIXED'
                    ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-lg'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <DollarSign className={`w-4 h-4 ${mode === 'FIXED' ? 'text-emerald-400' : 'text-gray-400'}`} />
                    <span className="text-xs font-bold text-white">Fixed Amount Mode</span>
                  </div>
                  <input
                    type="radio"
                    name="rewardMode"
                    checked={mode === 'FIXED'}
                    onChange={() => handleModeChange('FIXED')}
                    className="accent-emerald-500 cursor-pointer"
                  />
                </div>
                <p className={`text-[11px] leading-relaxed ${t.textSub}`}>
                  Credits a flat USDT bonus to the referrer upon the referred user's first successful REAL deposit.
                </p>
              </div>
            </div>

            {/* Input Parameters according to selected Mode */}
            <div className="pt-2">
              {mode === 'PERCENTAGE' ? (
                <div className="space-y-2">
                  <label className="text-xs font-bold block text-white">
                    Referral Percentage (%) <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={percentage}
                      onChange={(e) => handlePercentageChange(e.target.value)}
                      placeholder="e.g. 10"
                      className="pr-10"
                    />
                    <div className="absolute right-3 top-2.5 text-xs font-bold text-gray-400">
                      %
                    </div>
                  </div>
                  <p className={`text-[11px] ${t.textSub}`}>
                    Example: Setting 10% credits 100 USDT to the referrer when downline makes a 1,000 USDT deposit.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-xs font-bold block text-white">
                    Fixed Reward Amount (USDT) <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="1"
                      min="0"
                      value={fixedAmount}
                      onChange={(e) => handleFixedAmountChange(e.target.value)}
                      placeholder="e.g. 20"
                      className="pr-16"
                    />
                    <div className="absolute right-3 top-2.5 text-xs font-bold text-emerald-400">
                      USDT
                    </div>
                  </div>
                  <p className={`text-[11px] ${t.textSub}`}>
                    Example: Setting 20 USDT credits exactly 20 USDT to the referrer regardless of deposit size.
                  </p>
                </div>
              )}
            </div>

            {/* Dynamic Calculation Live Simulator Box */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-brand-cyan" />
                  Live Calculation Simulator
                </span>
                <span className="text-[10px] font-mono text-gray-400">First Deposit = 1,000 USDT</span>
              </div>
              <div className="text-xs flex items-center justify-between pt-1 border-t border-white/5">
                <span className={t.textSub}>Referrer Receives:</span>
                <span className="font-bold font-mono text-emerald-400 text-sm">
                  {sampleReward.toFixed(2)} USDT
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Business Logic Specification Sidebar Panel */}
        <div className="space-y-6">
          <Card variant="glass" className="p-6 space-y-4">
            <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Section 9 Specification Rules
              </h4>
            </div>

            <ul className="space-y-3 text-xs leading-relaxed">
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>One-Time Only:</strong> Reward is generated <em>only once</em> for each referred user.
                </span>
              </li>

              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>First REAL Deposit:</strong> Paid exclusively on the first successful REAL deposit.
                </span>
              </li>

              <li className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Trial Fund Excluded:</strong> Trial Fund activations do <em>not</em> generate referral rewards.
                </span>
              </li>

              <li className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Subsequent Deposits Excluded:</strong> 2nd, 3rd, 4th, or future deposits never trigger rewards.
                </span>
              </li>

              <li className="flex items-start space-x-2">
                <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Forward-Only Impact:</strong> Configuration updates affect <em>only future</em> referral rewards; historical rewards remain immutable.
                </span>
              </li>
            </ul>
          </Card>

          <Card variant="glass" className="p-5 border-l-4 border-l-brand-cyan">
            <div className="flex items-start space-x-3">
              <HelpCircle className="w-4 h-4 text-brand-cyan shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold text-white">Need help?</p>
                <p className={t.textSub}>
                  Referral rewards are automatically credited directly into the referrer's main wallet as referral income.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReferralSystemView;
