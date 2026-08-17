/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import logoImg from '../../../assets/images/branding/logo.png';
import { useAuth } from '../../hooks/useAuth.ts';
import { LayoutDashboard, LogOut, ArrowRight, Menu, X, Globe, Briefcase } from 'lucide-react';

interface VenturesNavbarProps {
  onNavigateToDashboard: () => void;
  onLogout: () => void;
}

export const VenturesNavbar: React.FC<VenturesNavbarProps> = ({
  onNavigateToDashboard,
  onLogout,
}) => {
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 venture-glass border-b border-[rgba(99,135,255,0.12)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Single Logo */}
        <button
          type="button"
          onClick={onNavigateToDashboard}
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-85 transition-opacity bg-transparent border-0 p-0 text-left focus:outline-none"
          title="Go to Dashboard"
        >
          <img
            src={logoImg}
            alt="MetaFirm"
            referrerPolicy="no-referrer"
            className="h-7 sm:h-8 w-auto object-contain"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
          <span className="hidden sm:inline-block text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
            Ventures
          </span>
        </button>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={onNavigateToDashboard}
            className="text-sm font-medium text-slate-400 hover:text-cyan-300 transition-colors duration-200 cursor-pointer flex items-center gap-1.5"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>
          <span className="text-sm font-semibold text-violet-300 border-b border-violet-400/60 pb-0.5">
            Ventures
          </span>
          <a
            href="#ecosystem-section"
            className="text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors duration-200"
          >
            Portfolio
          </a>
          <a
            href="#why-metafirm-section"
            className="text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors duration-200"
          >
            Ecosystem
          </a>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 venture-glass rounded-full px-3 py-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-slate-300 font-medium font-display-outfit">Live Platform</span>
          </div>

          <button
            onClick={onNavigateToDashboard}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-violet-600/30 hover:bg-violet-600/50 text-violet-200 hover:text-white border border-violet-500/30 text-xs font-semibold font-display-outfit transition-all cursor-pointer"
          >
            <span>Go to Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Hamburger Menu Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-9 h-9 rounded-xl venture-glass hover:bg-white/10 border border-violet-500/30 flex items-center justify-center text-slate-200 hover:text-white transition-all cursor-pointer shadow-md focus:outline-none"
              aria-label="Toggle navigation menu"
              title="Menu"
            >
              {showMenu ? (
                <X className="w-5 h-5 text-cyan-300 transition-transform rotate-90 duration-200" />
              ) : (
                <Menu className="w-5 h-5 text-slate-200 hover:text-cyan-300 transition-colors" />
              )}
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-transparent"
                  onClick={() => setShowMenu(false)}
                />
                <div
                  className="absolute right-0 mt-2 w-52 rounded-2xl bg-[#090e24] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.9)] border border-indigo-500/35 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onClick={() => setShowMenu(false)}
                >
                  {user && (
                    <div className="px-2.5 py-2 border-b border-white/10 mb-1.5 bg-white/[0.04] rounded-xl">
                      <p className="text-xs font-semibold text-white truncate font-display-outfit">{user?.name || 'MetaFirm Member'}</p>
                      <p className="text-[11px] text-slate-300 truncate">{user?.email}</p>
                    </div>
                  )}

                  <div className="space-y-0.5">
                    <button
                      onClick={onNavigateToDashboard}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold font-display-outfit text-white hover:bg-violet-600/30 hover:text-cyan-300 transition-all text-left cursor-pointer"
                    >
                      <LayoutDashboard className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>User Dashboard</span>
                    </button>

                    <a
                      href="#ecosystem-section"
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-white/10 hover:text-white transition-colors text-left"
                    >
                      <Briefcase className="w-4 h-4 text-violet-400 shrink-0" />
                      <span>Explore Portfolio</span>
                    </a>

                    <a
                      href="#why-metafirm-section"
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-white/10 hover:text-white transition-colors text-left"
                    >
                      <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Ecosystem Pillars</span>
                    </a>

                    <div className="my-1 border-t border-white/10" />

                    <button
                      onClick={onLogout}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/20 transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
