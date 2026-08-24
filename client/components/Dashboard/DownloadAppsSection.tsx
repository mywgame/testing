/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Download, Check, ExternalLink, ShieldCheck, Info } from 'lucide-react';
import { Modal } from '../ui/index.ts';
import { useTheme } from '../../hooks/useTheme.ts';
import { api } from '../../services/api.ts';

const DEFAULT_APK_URL = 'https://pub-9c62303890854a49a9eda8efb728c7ff.r2.dev/android/metafirm-v2.0.1.apk';
const DEFAULT_APK_VERSION = 'v2.0.1';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const AndroidIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997 0-.551.4482-.9993.9993-.9993.5511 0 .9993.4483.9993.9993 0 .5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997 0-.551.4482-.9993.9993-.9993.5511 0 .9993.4483.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592c.1502-.2603.061-.5931-.1993-.7433-.2602-.1503-.5931-.061-.7433.1993l-2.0233 3.5042C15.3678 8.1632 13.7317 7.747 12 7.747c-1.7317 0-3.3678.4162-4.9127 1.0754L5.064 5.3182c-.1502-.2603-.4831-.3496-.7433-.1993-.2603.1502-.3495.483-.1993.7433l1.9973 3.4592C2.686 11.2312.3428 15.0215.3428 19.3333h23.3144c0-4.3118-2.3432-8.1021-5.7767-9.0119" />
  </svg>
);

const AppleIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.32c.62-.75 1.04-1.8 0.93-2.85-.9.04-2 .6-2.65 1.36-.58.68-1.09 1.77-.95 2.81 1.01.08 2.05-.57 2.67-1.32z" />
  </svg>
);

const ChromeIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path fill="#EA4335" d="M12 3a9 9 0 0 0-7.79 4.5l3.89 6.74A4.5 4.5 0 0 1 12 7.5h7.79A9 9 0 0 0 12 3z" />
    <path fill="#4285F4" d="M12 16.5a4.5 4.5 0 0 1-3.89-2.25L4.22 7.5A9 9 0 0 0 12 21a9 9 0 0 0 7.79-4.5H12z" />
    <path fill="#FBBC05" d="M19.79 7.5H12a4.5 4.5 0 0 1 3.89 2.25l3.89 6.74A9 9 0 0 0 19.79 7.5z" />
    <circle cx="12" cy="12" r="3.5" fill="#FFFFFF" />
    <circle cx="12" cy="12" r="2.8" fill="#1A73E8" />
  </svg>
);

export const DownloadAppsSection: React.FC = () => {
  const { t } = useTheme();
  const [downloadMsg, setDownloadMsg] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [showInstallGuide, setShowInstallGuide] = useState<boolean>(false);
  const [apkUrl, setApkUrl] = useState<string>(DEFAULT_APK_URL);
  const [apkVersion, setApkVersion] = useState<string>(DEFAULT_APK_VERSION);

  useEffect(() => {
    // Fetch dynamic APK configuration from admin settings
    const loadApkConfig = async () => {
      try {
        const res = await api.getAppVersionConfig();
        if (res.success && res.data) {
          if (res.data.downloadUrl) {
            setApkUrl(res.data.downloadUrl);
          }
          if (res.data.latestVersion) {
            const rawVer = res.data.latestVersion.trim();
            const formattedVer = rawVer.startsWith('v') || rawVer.startsWith('V') ? rawVer : `v${rawVer}`;
            setApkVersion(formattedVer);
          }
        }
      } catch (err) {
        // Fallback to default v2.0.1
      }
    };
    loadApkConfig();

    const checkInstalled = () => {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (navigator as { standalone?: boolean }).standalone === true;
      if (isStandalone) {
        setIsInstalled(true);
      }
    };
    checkInstalled();

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setDownloadMsg('MetaFirm Web App installed successfully!');
      setTimeout(() => setDownloadMsg(null), 4000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleDownloadApk = () => {
    window.open(apkUrl, '_blank', 'noopener,noreferrer');
    setDownloadMsg(`Downloading MetaFirm Android APK (${apkVersion})...`);
    setTimeout(() => setDownloadMsg(null), 4000);
  };

  const handlePwaClick = async () => {
    if (isInstalled) {
      setDownloadMsg('MetaFirm Web App is already installed on your device.');
      setTimeout(() => setDownloadMsg(null), 4000);
      return;
    }

    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setDownloadMsg('MetaFirm Web App installation started!');
        }
        setDeferredPrompt(null);
      } catch (err) {
        setShowInstallGuide(true);
      }
    } else {
      setShowInstallGuide(true);
    }
  };

  return (
    <>
      <div className={`w-full backdrop-blur-lg rounded-2xl p-4 sm:p-5 border transition-all duration-300 ${t.card}`} id="download-apps-section">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Left: Clean Label slightly pulled to the right */}
          <div className="shrink-0 space-y-1 pl-1.5 sm:pl-2">
            <h4 className={`text-sm sm:text-base font-bold font-sans tracking-tight ${t.text}`}>
              Get MetaFirm App
            </h4>
            <p className={`text-xs ${t.textSub} flex items-center gap-1.5`}>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 inline shrink-0" />
              <span>Available for Android, iOS & Chrome Web</span>
            </p>
          </div>

          {/* Right: 3 Compact App Buttons with Official Brand Icons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto pt-1 sm:pt-0">
            {/* Android Button */}
            <div>
              <button
                onClick={handleDownloadApk}
                className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border text-xs font-medium transition-all group cursor-pointer ${
                  t.isDark
                    ? 'bg-white/4 hover:bg-emerald-500/10 text-white border-white/10 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/5'
                    : 'bg-white hover:bg-emerald-50/70 text-gray-900 border-gray-200 hover:border-emerald-500/40 hover:shadow-sm'
                }`}
                title={`Download Android APK (${apkVersion})`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center transition-colors shrink-0">
                    <AndroidIcon className="w-4 h-4 fill-current" />
                  </div>
                  <div className="text-left leading-tight">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-bold ${t.text}`}>Android APK</span>
                      <span className="px-1.5 py-0.2 text-[9px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded">
                        {apkVersion}
                      </span>
                    </div>
                    <div className={`text-[10px] ${t.textMuted} mt-0.5`}>Direct Download</div>
                  </div>
                </div>
                <Download className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform shrink-0" />
              </button>
            </div>

            {/* iOS Button (Disabled / Coming Soon) */}
            <button
              disabled
              className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border text-xs font-medium cursor-not-allowed opacity-70 ${
                t.isDark
                  ? 'bg-white/2 text-gray-400 border-white/5'
                  : 'bg-gray-50/80 text-gray-500 border-gray-200/60'
              }`}
              title="iOS App - Coming Soon"
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${t.isDark ? 'bg-white/5 text-gray-400' : 'bg-gray-200/60 text-gray-500'}`}>
                  <AppleIcon className="w-4 h-4 fill-current" />
                </div>
                <div className="text-left leading-tight">
                  <div className={`text-xs font-bold ${t.textSub}`}>iOS (iPhone)</div>
                  <div className="text-[10px] text-amber-500 font-medium">Coming Soon</div>
                </div>
              </div>
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/25 rounded-md">
                Soon
              </span>
            </button>

            {/* Chrome WebApp Button */}
            <button
              onClick={handlePwaClick}
              className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border text-xs font-medium transition-all group cursor-pointer ${
                t.isDark
                  ? 'bg-white/4 hover:bg-blue-500/10 text-white border-white/10 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/5'
                  : 'bg-white hover:bg-blue-50/70 text-gray-900 border-gray-200 hover:border-blue-500/40 hover:shadow-sm'
              }`}
              title="Install Chrome Web App"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center transition-colors">
                  <ChromeIcon className="w-4 h-4" />
                </div>
                <div className="text-left leading-tight">
                  <div className={`text-xs font-bold ${t.text}`}>Chrome App</div>
                  <div className={`text-[10px] ${t.textMuted}`}>
                    {isInstalled ? 'App Installed' : 'Install Web App'}
                  </div>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform shrink-0" />
            </button>
          </div>
        </div>

        {downloadMsg && (
          <div className={`mt-3 p-2.5 border rounded-xl flex items-center gap-2 text-xs transition-all ${
            t.isDark
              ? 'bg-blue-500/10 border-blue-500/20 text-blue-300'
              : 'bg-blue-50 border-blue-200 text-blue-700'
          }`}>
            <Check className="w-4 h-4 shrink-0 text-blue-500" />
            <span>{downloadMsg}</span>
          </div>
        )}
      </div>

      {/* Helper Modal when browser doesn't trigger automated prompt */}
      <Modal
        isOpen={showInstallGuide}
        onClose={() => setShowInstallGuide(false)}
        title="Install MetaFirm Web App"
        size="sm"
      >
        <div className={`space-y-4 py-1 ${t.isDark ? 'text-gray-200' : 'text-slate-800'}`}>
          <div className={`p-3 border rounded-xl flex items-start gap-3 ${
            t.isDark ? 'bg-blue-950/40 border-blue-800/40 text-blue-200' : 'bg-blue-50 border-blue-200 text-blue-900'
          }`}>
            <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm leading-relaxed">
              Open your browser menu and select <strong>"Add to Home Screen"</strong> or <strong>"Install App"</strong>.
            </p>
          </div>

          <div className={`space-y-2 text-xs ${t.isDark ? 'text-gray-300' : 'text-slate-600'}`}>
            <p className={`font-bold ${t.text}`}>How to install manually:</p>
            <ol className="list-decimal list-inside space-y-1.5 pl-1 leading-relaxed">
              <li>
                Tap your browser options menu (the <strong>3 dots ⋮</strong> in Chrome or <strong>Share icon</strong> in Safari).
              </li>
              <li>
                Scroll and tap <strong>"Add to Home Screen"</strong> or <strong>"Install MetaFirm"</strong>.
              </li>
              <li>Confirm the prompt to install MetaFirm on your device home screen for 1-click access.</li>
            </ol>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setShowInstallGuide(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-500 transition-colors cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};


