/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LayoutDashboard, ArrowRight } from 'lucide-react';

interface FinalCTAProps {
  onNavigateToDashboard: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onNavigateToDashboard }) => {
  return (
    <section className="py-24 sm:py-28 px-4 sm:px-6 relative overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 80% at 50% 50%, rgba(99,50,200,0.18) 0%, rgba(20,10,60,0.3) 50%, transparent 80%)',
        }}
      />
      <div className="absolute inset-0 venture-hero-grid opacity-40" />

      <div className="max-w-3xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 venture-glass rounded-full px-4 py-1.5 mb-8">
          <div
            className="w-1.5 h-1.5 rounded-full bg-cyan-400"
            style={{ animation: 'pulse-glow 2s ease-in-out infinite' }}
          />
          <span className="text-xs font-semibold tracking-widest text-cyan-300 uppercase font-display-outfit">
            MetaFirm Ventures
          </span>
        </div>

        <h2 className="font-display-outfit text-4xl sm:text-6xl font-extrabold text-white mb-6 leading-tight">
          Explore{' '}
          <span className="block venture-gradient-text">What's Next</span>
        </h2>

        <p className="text-slate-400 text-base sm:text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
          Discover the projects being built across the MetaFirm ecosystem — and manage your assets
          directly in your dashboard.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onNavigateToDashboard}
            className="w-full sm:w-auto venture-btn-primary relative z-10 px-8 py-4 rounded-xl text-base font-semibold text-white font-display-outfit tracking-wide flex items-center justify-center gap-2 shadow-xl cursor-pointer"
          >
            <LayoutDashboard className="w-5 h-5 relative z-10" />
            <span className="relative z-10">Open User Dashboard</span>
          </button>
          <a
            href="#ecosystem-section"
            className="w-full sm:w-auto venture-btn-outline px-8 py-4 rounded-xl text-base font-semibold text-slate-300 hover:text-white font-display-outfit flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Explore All Verticals</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};
