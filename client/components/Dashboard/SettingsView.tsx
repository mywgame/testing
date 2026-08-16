/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Globe,
  Bell,
  Sliders,
  Shield,
  CheckCircle2,
  Moon,
  Sun,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Lock,
  Fingerprint,
  Wallet,
  ExternalLink,
  Trash2,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.ts';
import { useTheme } from '../../hooks/useTheme.ts';
import { useLocalization, SupportedLanguage, SupportedCurrency, SupportedTimeFormat } from '../../contexts/LocalizationContext.tsx';
import { DashboardTab } from './Sidebar.tsx';
import { playSuccessSound } from '../../utils/sound.ts';

interface SettingsViewProps {
  onNavigate?: (tab: DashboardTab) => void;
  showToast?: (message: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onNavigate, showToast }) => {
  const { user, logout } = useAuth();
  const { t: themeTokens, isDark, theme, setTheme } = useTheme();
  const {
    language,
    currency,
    timeFormat,
    setLanguage,
    setCurrency,
    setTimeFormat,
    t,
  } = useLocalization();

  // Notification Preferences
  const [notifyDeposits, setNotifyDeposits] = useState<boolean>(() => {
    return localStorage.getItem('metafirm_notify_deposits') !== 'false';
  });
  const [notifyYield, setNotifyYield] = useState<boolean>(() => {
    return localStorage.getItem('metafirm_notify_yield') !== 'false';
  });
  const [notifySecurity, setNotifySecurity] = useState<boolean>(() => {
    return localStorage.getItem('metafirm_notify_security') !== 'false';
  });
  // Task & Promotional Announcements is always ON
  const notifyMarketing = true;

  // Display & Privacy Preferences
  const [hideBalance, setHideBalance] = useState<boolean>(() => {
    return localStorage.getItem('metafirm_hide_balance') === 'true';
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('metafirm_sound_effects') !== 'false';
  });

  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const saveSettings = () => {
    try {
      localStorage.setItem('metafirm_language', language);
      localStorage.setItem('metafirm_currency', currency);
      localStorage.setItem('metafirm_date_format', timeFormat);
      localStorage.setItem('metafirm_notify_deposits', String(notifyDeposits));
      localStorage.setItem('metafirm_notify_yield', String(notifyYield));
      localStorage.setItem('metafirm_notify_security', String(notifySecurity));
      localStorage.setItem('metafirm_notify_marketing', String(notifyMarketing));
      localStorage.setItem('metafirm_hide_balance', String(hideBalance));
      localStorage.setItem('metafirm_sound_effects', String(soundEnabled));

      if (soundEnabled) {
        playSuccessSound();
      }

      setSavedSuccess(true);
      if (showToast) {
        showToast(language === 'hi' ? 'सेटिंग्स सफलतापूर्वक सहेजी गईं!' : 'Settings saved successfully!');
      }
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearCache = () => {
    const confirmClear = window.confirm(
      'Are you sure you want to clear local application cache? This will reset local view preferences.'
    );
    if (confirmClear) {
      try {
        localStorage.removeItem('metafirm_language');
        localStorage.removeItem('metafirm_currency');
        localStorage.removeItem('metafirm_date_format');
        localStorage.removeItem('metafirm_hide_balance');
        localStorage.removeItem('metafirm_sound_effects');
        if (showToast) {
          showToast('Local application cache cleared.');
        }
        setTimeout(() => {
          window.location.reload();
        }, 600);
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="space-y-6 text-left max-w-6xl mx-auto w-full pb-10" id="settings-view-tab">
      
      {/* 1. Header Banner */}
      <div
        className={`relative overflow-hidden rounded-3xl p-6 sm:p-7 border transition-all duration-300 ${
          isDark
            ? 'bg-gradient-to-br from-[#121633]/95 via-[#0e122b]/95 to-[#0b0e24]/95 border-cyan-500/20 shadow-2xl shadow-cyan-950/30 backdrop-blur-2xl'
            : 'bg-gradient-to-br from-white via-[#f4f8ff] to-[#eef4ff] border-cyan-200/80 shadow-xl shadow-cyan-900/10 backdrop-blur-2xl'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                <Sliders className="w-5 h-5" />
              </div>
              <h2 className={`text-xl sm:text-2xl font-extrabold tracking-tight ${themeTokens.text}`}>
                {t('accountSettings', 'Account & App Settings')}
              </h2>
            </div>
            <p className={`text-xs sm:text-sm ${themeTokens.textSub}`}>
              {t('settingsSubtitle', 'Customize your regional display, notifications, balance privacy, and interface preferences.')}
            </p>
          </div>

          <button
            type="button"
            onClick={saveSettings}
            className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25 active:scale-95 transition-all inline-flex items-center justify-center cursor-pointer shrink-0"
          >
            {savedSuccess ? (
              <span>{t('saved', 'Saved!')}</span>
            ) : (
              <span>{t('saveChanges', 'Save Changes')}</span>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left / Main Configurations (8 cols) */}
        <div className="lg:col-span-8 space-y-6">

          {/* Section 1: Regional & Localization */}
          <div className={`rounded-2xl border p-5 sm:p-6 backdrop-blur-xl space-y-5 ${themeTokens.card}`}>
            <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
              <Globe className="w-4 h-4 text-cyan-400" />
              <h3 className={`text-sm font-extrabold uppercase tracking-wider ${themeTokens.text}`}>
                {t('regionalLocalization', 'Regional & Localization')}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Language Selection */}
              <div className="space-y-1.5 text-left">
                <label className={`block text-xs font-semibold ${themeTokens.textSub}`}>
                  {t('platformLanguage', 'Platform Display Language')}
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/40 ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white [&>option]:bg-slate-900 [&>option]:text-white'
                      : 'bg-white border-slate-200 text-slate-900 shadow-sm [&>option]:bg-white [&>option]:text-slate-900'
                  }`}
                >
                  <option value="en">English (US) — Default</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                  <option value="es">Español (Spanish)</option>
                  <option value="ar">العربية (Arabic)</option>
                  <option value="vi">Tiếng Việt (Vietnamese)</option>
                  <option value="de">Deutsch (German)</option>
                  <option value="ja">日本語 (Japanese)</option>
                </select>
              </div>

              {/* Reference Currency */}
              <div className="space-y-1.5 text-left">
                <label className={`block text-xs font-semibold ${themeTokens.textSub}`}>
                  {t('referenceCurrency', 'Reference Currency (USDT base)')}
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as SupportedCurrency)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/40 ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white [&>option]:bg-slate-900 [&>option]:text-white'
                      : 'bg-white border-slate-200 text-slate-900 shadow-sm [&>option]:bg-white [&>option]:text-slate-900'
                  }`}
                >
                  <option value="USD">USD ($) — Standard (1 USDT ≈ $1.00)</option>
                  <option value="INR">INR (₹) — Indian Rupee (1 USDT ≈ ₹86.50)</option>
                  <option value="EUR">EUR (€) — Euro (1 USDT ≈ €0.92)</option>
                  <option value="GBP">GBP (£) — British Pound (1 USDT ≈ £0.79)</option>
                  <option value="AED">AED (د.إ) — UAE Dirham (1 USDT ≈ 3.67 AED)</option>
                </select>
              </div>

              {/* Date & Time format */}
              <div className="space-y-1.5 text-left sm:col-span-2">
                <label className={`block text-xs font-semibold ${themeTokens.textSub}`}>
                  {t('timestampDisplay', 'Timestamp & Date Display')}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setTimeFormat('12h')}
                    className={`px-3.5 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      timeFormat === '12h'
                        ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400'
                        : `${isDark ? 'border-white/10 bg-white/[0.02] text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-600'}`
                    }`}
                  >
                    <span>12-Hour (e.g. 8/15/2026, 8:15 PM)</span>
                    {timeFormat === '12h' && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setTimeFormat('24h')}
                    className={`px-3.5 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      timeFormat === '24h'
                        ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400'
                        : `${isDark ? 'border-white/10 bg-white/[0.02] text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-600'}`
                    }`}
                  >
                    <span>24-Hour (e.g. 15/08/2026, 20:15)</span>
                    {timeFormat === '24h' && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Display & Privacy Preferences */}
          <div className={`rounded-2xl border p-5 sm:p-6 backdrop-blur-xl space-y-5 ${themeTokens.card}`}>
            <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
              <Eye className="w-4 h-4 text-purple-400" />
              <h3 className={`text-sm font-extrabold uppercase tracking-wider ${themeTokens.text}`}>
                {t('displayPrivacy', 'Display & Privacy Preferences')}
              </h3>
            </div>

            <div className="space-y-4">
              {/* Theme Selector */}
              <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="space-y-0.5">
                  <p className={`text-xs font-bold ${themeTokens.text}`}>{t('themeAppearance', 'Theme Appearance')}</p>
                  <p className={`text-[11px] ${themeTokens.textSub}`}>Choose between Dark Glassmorphic and Clean Light mode.</p>
                </div>
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/20 border border-white/10">
                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                      isDark ? 'bg-cyan-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" />
                    <span>Dark</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                      !isDark ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" />
                    <span>Light</span>
                  </button>
                </div>
              </div>

              {/* Hide Balance Toggle */}
              <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="space-y-0.5">
                  <p className={`text-xs font-bold ${themeTokens.text}`}>{t('maskBalances', 'Mask Balances by Default')}</p>
                  <p className={`text-[11px] ${themeTokens.textSub}`}>Hide total wallet balances (`••••••`) across the dashboard for public privacy.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setHideBalance(!hideBalance)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none cursor-pointer ${
                    hideBalance ? 'bg-purple-600 justify-end' : 'bg-slate-700 justify-start'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-md" />
                </button>
              </div>

              {/* Sound Effects Toggle */}
              <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="space-y-0.5">
                  <p className={`text-xs font-bold ${themeTokens.text}`}>{t('audioEffects', 'Audio Chimes & Sound Effects')}</p>
                  <p className={`text-[11px] ${themeTokens.textSub}`}>Play celebratory sound chimes upon successful deposit or daily yield claims.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none cursor-pointer ${
                    soundEnabled ? 'bg-cyan-500 justify-end' : 'bg-slate-700 justify-start'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-md" />
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Notification Alerts */}
          <div className={`rounded-2xl border p-5 sm:p-6 backdrop-blur-xl space-y-5 ${themeTokens.card}`}>
            <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
              <Bell className="w-4 h-4 text-amber-400" />
              <h3 className={`text-sm font-extrabold uppercase tracking-wider ${themeTokens.text}`}>
                {t('notificationPreferences', 'Notification & Alert Preferences')}
              </h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="space-y-0.5">
                  <p className={`text-xs font-bold ${themeTokens.text}`}>{t('depositAlerts', 'Deposit & Withdrawal Payout Alerts')}</p>
                  <p className={`text-[11px] ${themeTokens.textSub}`}>Receive instant popup alerts when on-chain deposits confirm or payouts execute.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifyDeposits(!notifyDeposits)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none cursor-pointer ${
                    notifyDeposits ? 'bg-emerald-600 justify-end' : 'bg-slate-700 justify-start'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-md" />
                </button>
              </div>

              <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="space-y-0.5">
                  <p className={`text-xs font-bold ${themeTokens.text}`}>{t('yieldAlerts', 'Daily Staking Yield Summary')}</p>
                  <p className={`text-[11px] ${themeTokens.textSub}`}>Notifications for 24-hour yield settlement and reward claim availability.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifyYield(!notifyYield)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none cursor-pointer ${
                    notifyYield ? 'bg-emerald-600 justify-end' : 'bg-slate-700 justify-start'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-md" />
                </button>
              </div>

              <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="space-y-0.5">
                  <p className={`text-xs font-bold ${themeTokens.text}`}>{t('securityAlerts', 'Security & Unrecognized Login Alerts')}</p>
                  <p className={`text-[11px] ${themeTokens.textSub}`}>Critical notifications if a new IP, browser, or device accesses your account.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifySecurity(!notifySecurity)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none cursor-pointer ${
                    notifySecurity ? 'bg-emerald-600 justify-end' : 'bg-slate-700 justify-start'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-md" />
                </button>
              </div>

              <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/5 opacity-90">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <p className={`text-xs font-bold ${themeTokens.text}`}>{t('taskAlerts', 'Task & Promotional Announcements')}</p>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                      {t('alwaysOn', 'Always On')}
                    </span>
                  </div>
                  <p className={`text-[11px] ${themeTokens.textSub}`}>Periodic notices about new reward tasks, VIP milestones, and seasonal events.</p>
                </div>
                <button
                  type="button"
                  disabled
                  title="System announcement alerts are permanently enabled"
                  className="w-11 h-6 flex items-center rounded-full p-1 bg-emerald-600 justify-end cursor-not-allowed opacity-90"
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-md" />
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column / Quick Shortcuts & Safety (4 cols) */}
        <div className="lg:col-span-4 space-y-6">

          {/* Quick Security Shortcuts */}
          <div className={`rounded-2xl border p-5 backdrop-blur-xl space-y-4 ${themeTokens.card}`}>
            <div className="flex items-center gap-2 pb-2 border-b border-white/10">
              <Shield className="w-4 h-4 text-cyan-400" />
              <h4 className={`text-xs font-extrabold uppercase tracking-wider ${themeTokens.text}`}>
                {t('securityShortcuts', 'Security Center Shortcuts')}
              </h4>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('twoFactor')}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left cursor-pointer ${
                  isDark ? 'bg-white/[0.02] border-white/10 hover:border-cyan-500/40 hover:bg-cyan-500/5' : 'bg-slate-50 border-slate-200 hover:border-cyan-500/40 hover:bg-cyan-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Fingerprint className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <p className={`text-xs font-bold ${themeTokens.text}`}>{t('twoFactor', 'Two-Factor Auth')}</p>
                    <p className={`text-[10px] ${themeTokens.textMuted}`}>Authenticator app security</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate && onNavigate('withdrawalAddresses')}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left cursor-pointer ${
                  isDark ? 'bg-white/[0.02] border-white/10 hover:border-cyan-500/40 hover:bg-cyan-500/5' : 'bg-slate-50 border-slate-200 hover:border-cyan-500/40 hover:bg-cyan-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Wallet className="w-4 h-4 text-purple-400 shrink-0" />
                  <div>
                    <p className={`text-xs font-bold ${themeTokens.text}`}>{t('withdrawalAddresses', 'Withdrawal Addresses')}</p>
                    <p className={`text-[10px] ${themeTokens.textMuted}`}>Whitelist & verify wallets</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate && onNavigate('security')}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left cursor-pointer ${
                  isDark ? 'bg-white/[0.02] border-white/10 hover:border-cyan-500/40 hover:bg-cyan-500/5' : 'bg-slate-50 border-slate-200 hover:border-cyan-500/40 hover:bg-cyan-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <p className={`text-xs font-bold ${themeTokens.text}`}>{t('security', 'Change Password')}</p>
                    <p className={`text-[10px] ${themeTokens.textMuted}`}>Manage account credentials</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Account Snapshot */}
          <div className={`rounded-2xl border p-5 backdrop-blur-xl space-y-3.5 ${themeTokens.card}`}>
            <div className="flex items-center gap-2 pb-2 border-b border-white/10">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h4 className={`text-xs font-extrabold uppercase tracking-wider ${themeTokens.text}`}>
                {t('accountOverview', 'Account Profile Overview')}
              </h4>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className={themeTokens.textSub}>User ID:</span>
                <span className="font-mono font-bold">{user?.userId || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className={themeTokens.textSub}>Email:</span>
                <span className="font-semibold truncate max-w-[150px]">{user?.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className={themeTokens.textSub}>VIP Tier:</span>
                <span className="font-bold text-amber-400">{user?.vipTier || 'VIP1'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className={themeTokens.textSub}>Status:</span>
                <span className="font-semibold text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Active & Verified
                </span>
              </div>
            </div>
          </div>

          {/* Cache & Local State Controls */}
          <div className={`rounded-2xl border p-5 backdrop-blur-xl space-y-3 ${themeTokens.card}`}>
            <div className="flex items-center gap-2 text-slate-400">
              <RotateCcw className="w-4 h-4" />
              <h4 className={`text-xs font-extrabold uppercase tracking-wider ${themeTokens.text}`}>
                {t('resetDiagnostics', 'Reset & Diagnostics')}
              </h4>
            </div>
            <p className={`text-[11px] leading-relaxed ${themeTokens.textSub}`}>
              Clear cached view preferences and reload the latest platform interface assets.
            </p>
            <button
              type="button"
              onClick={handleClearCache}
              className={`w-full py-2 px-3 rounded-xl border text-xs font-semibold transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                isDark
                  ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                  : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t('clearCache', 'Clear Local Cache')}</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};

export default SettingsView;
