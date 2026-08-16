/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export const WhyMetaFirm: React.FC = () => {
  const pillars = [
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
            stroke="#60a5fa"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      title: 'Technology',
      desc: 'Purpose-built infrastructure powering every layer of the MetaFirm platform.',
      accent: '#60a5fa',
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="3" stroke="#a78bfa" strokeWidth="1.5" />
          <path
            d="M12 2v2M12 20v2M2 12H4M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
            stroke="#a78bfa"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      ),
      title: 'Infrastructure',
      desc: 'Scalable real-world assets from compute farms to renewable energy installations.',
      accent: '#a78bfa',
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
            stroke="#e879f9"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      title: 'Innovation',
      desc: 'A forward-looking approach to capital, technology, and value creation.',
      accent: '#e879f9',
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="#34d399" strokeWidth="1.5" />
          <path
            d="M9 12l2 2 4-4"
            stroke="#34d399"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      title: 'Ecosystem',
      desc: 'Four interconnected verticals building a self-reinforcing MetaFirm economy.',
      accent: '#34d399',
    },
  ];

  return (
    <section id="why-metafirm-section" className="py-24 px-4 sm:px-6 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display-outfit text-3xl sm:text-5xl font-extrabold text-white mb-4">
            Why <span className="venture-gradient-text">MetaFirm</span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg max-w-lg mx-auto">
            Built differently. Designed for permanence.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {pillars.map((pillar) => (
            <div
              key={pillar.title}
              className="venture-glass-card rounded-2xl p-7 flex flex-col gap-5 border border-white/5"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                  background: `${pillar.accent}15`,
                  border: `1px solid ${pillar.accent}30`,
                }}
              >
                {pillar.icon}
              </div>
              <div>
                <h3 className="font-display-outfit text-lg font-bold text-white mb-2">
                  {pillar.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
