/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GPU_IMG } from './constants.ts';
import { Cpu, Server, Activity, ArrowRight } from 'lucide-react';

export const FeaturedProject: React.FC = () => {
  return (
    <section className="relative py-20 sm:py-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-px h-6 bg-gradient-to-b from-transparent via-violet-400 to-transparent" />
          <span className="text-xs font-semibold tracking-widest text-violet-400 uppercase font-display-outfit">
            Featured Project
          </span>
        </div>
        <h2 className="font-display-outfit text-3xl sm:text-4xl font-bold text-white mb-10">
          Spotlight Initiative
        </h2>

        <div className="venture-glass-card venture-card-featured-glow rounded-3xl overflow-hidden border border-violet-500/20">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Image & Telemetry */}
            <div className="relative aspect-[4/3] md:aspect-auto min-h-72 bg-slate-900 overflow-hidden">
              <img
                src={GPU_IMG}
                alt="GPU Computing infrastructure"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover opacity-85"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(to right, transparent 20%, rgba(12,20,50,0.92) 100%)',
                }}
              />
              <div
                className="absolute inset-0 md:hidden"
                style={{
                  background:
                    'linear-gradient(to bottom, transparent 20%, rgba(12,20,50,0.95) 100%)',
                }}
              />

              {/* Tech overlay lines */}
              <div className="absolute top-4 left-4 right-4 flex justify-between opacity-75">
                {['NODE_01', 'NODE_02', 'NODE_03'].map((label) => (
                  <div
                    key={label}
                    className="venture-glass rounded-lg px-2.5 py-1 flex items-center gap-1.5"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-[11px] font-mono text-cyan-300">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Content Details */}
            <div className="p-8 sm:p-12 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 venture-status-coming-soon rounded-full px-3 py-1 mb-6 self-start">
                <div
                  className="w-1.5 h-1.5 rounded-full bg-indigo-400"
                  style={{ animation: 'pulse-glow 2s ease-in-out infinite' }}
                />
                <span className="text-xs font-semibold tracking-wider uppercase font-display-outfit">
                  Coming Soon
                </span>
              </div>

              <h3 className="font-display-outfit text-3xl sm:text-4xl font-extrabold text-white mb-4">
                GPU Computing{' '}
                <span className="block venture-gradient-text-cyan">Farms</span>
              </h3>

              <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-8">
                Building scalable computing infrastructure for AI and high-performance workloads.
                MetaFirm is developing dedicated GPU farm capacity to serve the growing demand for
                compute-intensive applications.
              </p>

              <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
                {[
                  { label: 'Architecture', value: 'Multi-Node' },
                  { label: 'Focus', value: 'AI / HPC' },
                  { label: 'Status', value: 'In Build' },
                ].map(({ label, value }) => (
                  <div key={label} className="venture-glass rounded-xl p-3 text-center border border-white/5">
                    <p className="text-[10px] text-slate-500 mb-1 font-display-outfit uppercase tracking-wider">
                      {label}
                    </p>
                    <p className="text-xs sm:text-sm font-semibold text-slate-200 font-display-outfit">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="inline-flex items-center gap-2 text-xs font-semibold text-violet-300 font-display-outfit">
                <span>Infrastructure in development</span>
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                <span className="text-slate-500">Tier 4 Datacenter Spec</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
