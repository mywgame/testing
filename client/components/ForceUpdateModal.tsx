/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Download, ShieldAlert, Sparkles, RefreshCw, Smartphone } from 'lucide-react';
import { App } from '@capacitor/app';
import { AppVersionStatus } from '../utils/versionCheck.ts';
import logoImg from '../../assets/images/branding/logo.png';

interface ForceUpdateModalProps {
  versionStatus: AppVersionStatus;
}

export const ForceUpdateModal: React.FC<ForceUpdateModalProps> = ({ versionStatus }) => {
  // Prevent Android hardware back button from closing the modal/app without updating
  useEffect(() => {
    let backListener: any = null;

    const setupBackListener = async () => {
      try {
        backListener = await App.addListener('backButton', () => {
          // Keep modal active; optionally exit the app if user refuses update
          // App.exitApp();
        });
      } catch (err) {
        // Ignore on web
      }
    };

    setupBackListener();

    return () => {
      if (backListener && typeof backListener.remove === 'function') {
        backListener.remove();
      }
    };
  }, []);

  const handleDownload = () => {
    const url = versionStatus.downloadUrl || 'https://metafirm.app';
    try {
      // In native Capacitor context, open system browser for external APK package download
      if (typeof window !== 'undefined') {
        window.open(url, '_system');
      }
    } catch (e) {
      window.location.href = url;
    }
  };

  return (
    <div
      id="force-update-overlay"
      className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none font-sans overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-md bg-white dark:bg-[#0f172a] rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 dark:border-slate-800 relative overflow-hidden text-center"
      >
        {/* Background gradient decorative glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-blue-500/15 dark:bg-blue-500/25 rounded-full blur-3xl pointer-events-none" />

        {/* Top Logo & Pulse Badge */}
        <div className="relative z-10 flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-3xl p-0.5 shadow-lg shadow-blue-500/25 flex items-center justify-center">
              <div className="w-full h-full bg-white dark:bg-[#0f172a] rounded-[22px] flex items-center justify-center overflow-hidden p-2.5">
                <img
                  src={logoImg}
                  alt="MetaFirm Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white rounded-full p-1.5 shadow-md">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Mandatory App Update</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Update Required
            </h2>
            <p className="text-xs text-gray-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
              A critical update is required to ensure secure connection to MetaFirm high-speed nodes.
            </p>
          </div>

          {/* Version Comparison Pill */}
          <div className="w-full bg-gray-50 dark:bg-slate-900/80 border border-gray-200/80 dark:border-slate-800 rounded-2xl p-3.5 grid grid-cols-2 gap-2 text-xs">
            <div className="text-left space-y-0.5 border-r border-gray-200 dark:border-slate-800 pr-2">
              <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500">
                Installed
              </span>
              <div className="font-mono font-bold text-gray-700 dark:text-slate-300 flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-gray-400" />
                v{versionStatus.currentVersion}
              </div>
            </div>
            <div className="text-left space-y-0.5 pl-2">
              <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">
                Required Version
              </span>
              <div className="font-mono font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5" />
                v{versionStatus.minRequiredVersion}
              </div>
            </div>
          </div>

          {/* Release Notes / Highlights */}
          <div className="w-full text-left bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-2xl p-3.5 space-y-1.5 text-xs">
            <span className="font-bold text-[11px] text-blue-700 dark:text-blue-300 uppercase tracking-wide flex items-center gap-1.5">
              <span>Update Highlights</span>
            </span>
            <p className="text-[11px] text-gray-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {versionStatus.releaseNotes}
            </p>
          </div>

          {/* Action CTA Button */}
          <div className="w-full pt-2 space-y-2">
            <button
              id="force-update-download-btn"
              onClick={handleDownload}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download & Update Now</span>
            </button>
            <p className="text-[10px] text-gray-400 dark:text-slate-500">
              Download will start directly in your mobile browser.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
