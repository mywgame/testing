/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NETWORK_IMG, GPU_IMG, SOLAR_IMG, TRADING_IMG } from './constants.ts';
import { ArrowUpRight } from 'lucide-react';

interface EcosystemSectionProps {
  onNavigateToDashboard: () => void;
}

export const EcosystemSection: React.FC<EcosystemSectionProps> = ({ onNavigateToDashboard }) => {
  const projects = [
    {
      id: 'investment',
      name: 'MetaFirm User Investment',
      short: 'User Investment',
      desc: 'Digital financial ecosystem designed for MetaFirm users. A native investment layer built into the MetaFirm platform.',
      status: 'Active Ecosystem',
      statusType: 'dev',
      isInteractive: true,
      icon: (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <circle cx="14" cy="14" r="10" stroke="#60a5fa" strokeWidth="1.5" fill="none" />
          <path d="M9 14l3 3 7-7" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="14" cy="14" r="3" fill="rgba(99,135,255,0.3)" />
        </svg>
      ),
      accentFrom: '#3b82f6',
      accentTo: '#8b5cf6',
      img: NETWORK_IMG,
    },
    {
      id: 'gpu',
      name: 'GPU Computing Farms',
      short: 'GPU Computing',
      desc: 'Scalable computing infrastructure for the growing AI economy. High-performance nodes for enterprise and research workloads.',
      status: 'Coming Soon',
      statusType: 'soon',
      isInteractive: false,
      icon: (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <rect x="5" y="8" width="18" height="12" rx="2" stroke="#22d3ee" strokeWidth="1.5" fill="none" />
          <rect x="9" y="12" width="3" height="4" fill="rgba(34,211,238,0.4)" />
          <rect x="13" y="12" width="3" height="4" fill="rgba(34,211,238,0.4)" />
          <path d="M8 8V6M20 8V6M8 20v2M20 20v2" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
      accentFrom: '#06b6d4',
      accentTo: '#3b82f6',
      img: GPU_IMG,
    },
    {
      id: 'solar',
      name: 'Solar Energy Farms',
      short: 'Solar Energy',
      desc: 'Renewable energy infrastructure focused on sustainable power generation. Long-horizon energy assets for the digital age.',
      status: 'Coming Soon',
      statusType: 'soon',
      isInteractive: false,
      icon: (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <circle cx="14" cy="14" r="5" stroke="#fbbf24" strokeWidth="1.5" fill="rgba(251,191,36,0.2)" />
          <path d="M14 4v2M14 22v2M4 14H2M24 14h2M6.34 6.34l1.42 1.42M20.24 20.24l1.42 1.42M6.34 21.66l1.42-1.42M20.24 7.76l1.42-1.42" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
      accentFrom: '#f59e0b',
      accentTo: '#10b981',
      img: SOLAR_IMG,
    },
    {
      id: 'funded',
      name: 'MetaFirm Funded Firm',
      short: 'Funded Trading',
      desc: 'A future proprietary trading and funded capital ecosystem. Providing trading capital to qualified traders within MetaFirm.',
      status: 'Coming Soon',
      statusType: 'soon',
      isInteractive: false,
      icon: (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <polyline points="4,18 10,12 14,16 24,8" stroke="#e879f9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <circle cx="10" cy="12" r="2" fill="rgba(232,121,249,0.4)" />
          <circle cx="14" cy="16" r="2" fill="rgba(232,121,249,0.4)" />
          <circle cx="24" cy="8" r="2" fill="rgba(232,121,249,0.6)" />
        </svg>
      ),
      accentFrom: '#a855f7',
      accentTo: '#ec4899',
      img: TRADING_IMG,
    },
  ];

  return (
    <section id="ecosystem-section" className="py-24 px-4 sm:px-6 relative">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 venture-glass rounded-full px-4 py-1.5 mb-6">
            <span className="text-xs font-semibold tracking-widest text-violet-400 uppercase font-display-outfit">
              The Ecosystem
            </span>
          </div>
          <h2 className="font-display-outfit text-3xl sm:text-5xl font-extrabold text-white mb-4">
            Explore the MetaFirm{' '}
            <span className="block sm:inline venture-gradient-text">Ecosystem</span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto">
            Four strategic verticals building the infrastructure of tomorrow.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="venture-glass-card rounded-3xl overflow-hidden group border border-white/5 flex flex-col justify-between"
            >
              {/* Image Banner */}
              <div className="relative h-48 sm:h-52 overflow-hidden bg-slate-900">
                <img
                  src={project.img}
                  alt={project.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover opacity-75 transition-transform duration-700 group-hover:scale-105"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(12,20,50,0.6) 0%, rgba(12,20,50,0.15) 100%)',
                  }}
                />
                <div
                  className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-500"
                  style={{
                    background: `linear-gradient(135deg, ${project.accentFrom}22, ${project.accentTo}22)`,
                  }}
                />

                {/* Top Floating Badge & Icon */}
                <div
                  className="absolute top-4 left-4 p-2.5 rounded-2xl"
                  style={{
                    background: 'rgba(12,20,50,0.75)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.12)',
                  }}
                >
                  {project.icon}
                </div>

                <div
                  className={`absolute top-4 right-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 ${
                    project.statusType === 'dev'
                      ? 'venture-status-in-dev'
                      : 'venture-status-coming-soon'
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      project.statusType === 'dev' ? 'bg-emerald-400' : 'bg-indigo-400'
                    }`}
                  />
                  <span className="text-xs font-semibold tracking-wider font-display-outfit">
                    {project.status}
                  </span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-display-outfit text-xl sm:text-2xl font-bold text-white mb-2">
                    {project.name}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6">
                    {project.desc}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  {project.isInteractive ? (
                    <button
                      onClick={onNavigateToDashboard}
                      className="text-sm font-semibold font-display-outfit transition-colors duration-200 flex items-center gap-1 hover:underline cursor-pointer"
                      style={{ color: project.accentFrom }}
                    >
                      <span>Open Dashboard View</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <span
                      className="text-xs font-semibold font-display-outfit tracking-wider uppercase text-slate-500"
                    >
                      In Infrastructure Build
                    </span>
                  )}

                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    style={{
                      background: `linear-gradient(135deg, ${project.accentFrom}22, ${project.accentTo}22)`,
                      border: `1px solid ${project.accentFrom}44`,
                    }}
                  >
                    <ArrowUpRight
                      className="w-4 h-4"
                      style={{ color: project.accentFrom }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
