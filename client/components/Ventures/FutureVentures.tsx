/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export const FutureVentures: React.FC = () => {
  return (
    <section className="py-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="venture-glass-card rounded-3xl p-8 sm:p-14 relative overflow-hidden border border-violet-500/20">
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(99,80,255,0.2) 0%, transparent 70%)',
            }}
          />

          {/* Decorative dots */}
          <div className="absolute top-8 right-8 grid grid-cols-5 gap-2 opacity-20 hidden sm:grid">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-violet-400" />
            ))}
          </div>

          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 venture-glass rounded-full px-4 py-1.5 mb-6">
              <div
                className="w-1.5 h-1.5 rounded-full bg-violet-400"
                style={{ animation: 'pulse-glow 2s ease-in-out infinite' }}
              />
              <span className="text-xs font-semibold tracking-widest text-violet-400 uppercase font-display-outfit">
                Future Ventures
              </span>
            </div>

            <h2 className="font-display-outfit text-3xl sm:text-4xl font-bold text-white mb-4">
              More Ventures{' '}
              <span className="block sm:inline venture-gradient-text">Coming Soon</span>
            </h2>

            <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-8">
              The MetaFirm ecosystem is designed to grow. As new opportunities emerge,
              additional verticals and initiatives will expand the platform's reach and
              capabilities. This is only the beginning.
            </p>

            {/* Future vertical placeholders */}
            <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3 mb-8">
              {['Vertical 05', 'Vertical 06', 'Vertical 07', '+ More'].map((label) => (
                <div
                  key={label}
                  className="venture-glass rounded-full px-4 py-2"
                  style={{ border: '1px dashed rgba(99,135,255,0.25)' }}
                >
                  <span className="text-xs text-slate-400 font-display-outfit font-medium tracking-wide">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-500 font-display-outfit tracking-widest uppercase">
              Expansion roadmap in development
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
