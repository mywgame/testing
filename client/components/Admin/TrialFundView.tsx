/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Info,
  Save,
  RotateCcw,
  Clock,
  CheckCircle,
  HelpCircle,
  ShieldCheck,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { Card, Button, Input, Badge } from '../ui/index.ts';
import { ThemeTokens } from '../ui/themeTokens.ts';
import { api } from '../../services/api.ts';

interface TrialFundViewProps {
  t: ThemeTokens;
  isDark: boolean;
}

export const TrialFundView: React.FC<TrialFundViewProps> = ({ t, isDark }) => {
  const defaultSettings = {
    amount: '1000',
    duration: '7',
    isEnabled: true,
  };

  const [amount, setAmount] = useState(defaultSettings.amount);
  const [duration, setDuration] = useState(defaultSettings.duration);
  const [isEnabled, setIsEnabled] = useState(defaultSettings.isEnabled);
  
  const [lastUpdated, setLastUpdated] = useState<string>('Just now');
  const [isSaved, setIsSaved] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'info'; text: string } | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getAdminSettings();
      if (res.success && Array.isArray(res.data)) {
        const settingsMap = new Map<string, any>();
        res.data.forEach((s: any) => settingsMap.set(s.key, s));

        if (settingsMap.has('TRIAL_FUND_AMOUNT')) {
          setAmount(settingsMap.get('TRIAL_FUND_AMOUNT').value);
        }
        if (settingsMap.has('TRIAL_FUND_DURATION_DAYS')) {
          setDuration(settingsMap.get('TRIAL_FUND_DURATION_DAYS').value);
        }
        if (settingsMap.has('TRIAL_FUND_ENABLED')) {
          setIsEnabled(settingsMap.get('TRIAL_FUND_ENABLED').value === 'true');
        }

        const latestUpdated = res.data
          .filter((s: any) => s.key.startsWith('TRIAL_FUND'))
          .map((s: any) => new Date(s.updatedAt || Date.now()).getTime())
          .sort((a: number, b: number) => b - a)[0];

        if (latestUpdated) {
          setLastUpdated(new Date(latestUpdated).toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
        }
        setIsSaved(true);
      } else {
        setError(res.error?.message || 'Failed to retrieve trial fund settings.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading trial settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const hasChanges = !isSaved;

  const handleFieldChange = (setter: (val: string) => void, val: string) => {
    setter(val);
    setIsSaved(false);
  };

  const handleToggleChange = () => {
    setIsEnabled(prev => !prev);
    setIsSaved(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      await Promise.all([
        api.updateAdminSetting('TRIAL_FUND_AMOUNT', amount),
        api.updateAdminSetting('TRIAL_FUND_DURATION_DAYS', duration),
        api.updateAdminSetting('TRIAL_FUND_ENABLED', String(isEnabled)),
      ]);

      const now = new Date();
      const formattedDate = now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
      
      setLastUpdated(formattedDate);
      setIsSaved(true);
      
      setNotification({
        type: 'success',
        text: `Configuration saved and deployed! New Trial Fund: ${amount} USDT for ${duration} days (${isEnabled ? 'Enabled' : 'Disabled'}).`
      });

      setTimeout(() => {
        setNotification(null);
      }, 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to save configuration settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setAmount(defaultSettings.amount);
    setDuration(defaultSettings.duration);
    setIsEnabled(defaultSettings.isEnabled);
    setIsSaved(false);
    
    setNotification({
      type: 'info',
      text: 'Settings restored to factory defaults. Click Save Configuration to publish.'
    });

    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  return (
    <div className="space-y-6 text-left relative animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className={`text-xl font-bold tracking-tight ${t.text}`}>Trial Fund Settings</h2>
            
            {/* Dynamic Status Badge */}
            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-extrabold uppercase tracking-wider border transition-all ${
              isSaved
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
            }`}>
              {isSaved ? 'Configuration Synced' : 'Draft Changes • Unsaved'}
            </span>
          </div>
          <p className={`text-xs mt-1 ${t.textSub}`}>
            Configure the default trial asset allocation and duration for newly registered platform accounts.
          </p>
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

      {/* Interactive Form Chassis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Settings Form Body (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Notifications Panel */}
          {notification && (
            <div className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
              notification.type === 'success'
                ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                : 'bg-blue-500/5 border-blue-500/20 text-blue-400'
            }`}>
              {notification.type === 'success' ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-500" />
              ) : (
                <Info className="w-5 h-5 flex-shrink-0 text-blue-500" />
              )}
              <div className="space-y-0.5">
                <span className="text-xs font-bold font-display">
                  {notification.type === 'success' ? 'System Updated' : 'System Notice'}
                </span>
                <p className={`text-[11px] leading-relaxed ${t.textSub}`}>
                  {notification.text}
                </p>
              </div>
            </div>
          )}

          <Card className="p-6 border border-black/5 dark:border-white/5 relative overflow-hidden">
            {loading ? (
              <div className="py-16 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
                <span className="text-xs font-medium">Loading Trial Fund configuration...</span>
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-6">
                
                {/* Inputs Group */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  {/* Trial Amount */}
                  <div className="space-y-2 text-left">
                    <label className={`block text-xs font-bold tracking-tight ${t.text}`}>
                      Trial Fund Amount (USDT)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        required
                        min="0"
                        placeholder="e.g. 1000"
                        value={amount}
                        onChange={(e) => handleFieldChange(setAmount, e.target.value)}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold outline-none border transition-all ${
                          isDark 
                            ? 'bg-white/5 border-white/10 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50' 
                            : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/50'
                        }`}
                      />
                      <span className="absolute right-3.5 top-2.5 text-[10px] font-mono font-extrabold text-blue-500 uppercase">
                        USDT
                      </span>
                    </div>
                    <span className={`block text-[10px] ${t.textMuted}`}>
                      Trial amount issued to new registration wallets when enabled.
                    </span>
                  </div>

                  {/* Trial Duration */}
                  <div className="space-y-2 text-left">
                    <label className={`block text-xs font-bold tracking-tight ${t.text}`}>
                      Trial Duration (Days)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        required
                        min="1"
                        max="365"
                        placeholder="e.g. 7"
                        value={duration}
                        onChange={(e) => handleFieldChange(setDuration, e.target.value)}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold outline-none border transition-all ${
                          isDark 
                            ? 'bg-white/5 border-white/10 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50' 
                            : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/50'
                        }`}
                      />
                      <span className="absolute right-3.5 top-2.5 text-[10px] font-mono font-extrabold text-blue-500 uppercase">
                        Days
                      </span>
                    </div>
                    <span className={`block text-[10px] ${t.textMuted}`}>
                      Number of days trial principal generates interest before expiring.
                    </span>
                  </div>

                </div>

                {/* Toggle Switch */}
                <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                  isEnabled
                    ? (isDark ? 'bg-blue-500/5 border-blue-500/15' : 'bg-blue-50/50 border-blue-100')
                    : (isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100')
                }`}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                      <span className={`text-xs font-extrabold ${t.text}`}>
                        Enable Trial Fund Program
                      </span>
                    </div>
                    <p className={`text-[10px] ${t.textMuted}`}>
                      When active, newly created profiles will automatically start with the trial amount.
                    </p>
                  </div>

                  {/* IOS Switch */}
                  <button
                    type="button"
                    onClick={handleToggleChange}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      isEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-white/10'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        isEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-black/5 dark:border-white/5">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span className={`text-[10px] font-mono ${t.textMuted}`}>
                      Last Updated: <span className="font-bold text-gray-400">{lastUpdated}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Reset Button */}
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleReset}
                      className="flex items-center gap-1.5 px-4 py-2"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset
                    </Button>

                    {/* Save Button */}
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={saving}
                      className={`flex items-center gap-1.5 px-5 py-2 ${
                        !hasChanges ? 'opacity-80' : ''
                      }`}
                    >
                      <Save className="w-3.5 h-3.5" />
                      {saving ? 'Saving...' : 'Save Configuration'}
                    </Button>
                  </div>
                </div>

              </form>
            )}
          </Card>

        </div>

        {/* Informational sidebar context card (1 Col) */}
        <div className="space-y-6">
          <Card className="p-6 border border-amber-500/20 bg-amber-500/[0.02] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <h4 className="text-xs font-bold text-amber-500 font-display uppercase tracking-wider">
                  Admin Control Notice
                </h4>
              </div>

              <div className="space-y-3">
                <p className={`text-[11px] leading-relaxed ${t.textSub}`}>
                  This dashboard manages registration trial parameters in real-time.
                </p>
                
                <div className="space-y-2.5 pt-2 border-t border-amber-500/10">
                  <div className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                    <p className={`text-[11px] leading-normal ${t.textSub}`}>
                      <strong>New Registrants:</strong> Applied immediately upon user account creation.
                    </p>
                  </div>

                  <div className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                    <p className={`text-[11px] leading-normal ${t.textSub}`}>
                      <strong>Backend Persistence:</strong> Saved to systemSettings database table.
                    </p>
                  </div>

                  <div className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                    <p className={`text-[11px] leading-normal ${t.textSub}`}>
                      <strong>Isolation:</strong> Existing user trial wallets remain unaffected by changes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default TrialFundView;
