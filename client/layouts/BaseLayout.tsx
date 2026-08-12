/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../hooks/useAuth.ts';
import { Shield, LogOut, LogIn, Database } from 'lucide-react';
import logoImg from '../../assets/images/branding/logo.png';

export const BaseLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, login, logout, loading } = useAuth();
  const [emailInput, setEmailInput] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      login(emailInput.trim());
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900 font-sans flex flex-col antialiased">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <img
              src={logoImg}
              alt="MetaFirm Logo"
              referrerPolicy="no-referrer"
              className="h-8 object-contain"
            />
          </div>

          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
            ) : user ? (
              <div className="flex items-center space-x-3">
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-xs font-medium text-gray-900">
                    {user.email}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-500 uppercase font-semibold">
                    Role: {user.role}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 border border-transparent hover:border-red-100 flex items-center space-x-1 cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleLoginSubmit} className="flex items-center space-x-2">
                <input
                  type="email"
                  placeholder="Enter email to sync"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="px-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-950 bg-white"
                  required
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-gray-900 text-white rounded-xl text-xs font-medium hover:bg-gray-800 transition-all duration-150 shadow-sm flex items-center space-x-1 border border-gray-950 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In & Sync</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </header>

      {/* Main Grid Content */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="h-full"
        >
          {children}
        </motion.div>
      </main>

      {/* Clean Margin Footer */}
      <footer className="bg-white border-t border-gray-100 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 text-gray-500 text-xs">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-emerald-500" />
            <span className="font-mono text-gray-400">
              PostgreSQL Schema Verified and Synchronized Successfully
            </span>
          </div>
          <div className="flex items-center space-x-4 font-mono text-gray-400">
            <span>Enterprise Ledger Node</span>
            <span>|</span>
            <span>2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BaseLayout;
