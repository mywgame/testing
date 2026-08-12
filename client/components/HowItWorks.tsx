import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Award, Activity, Milestone } from 'lucide-react';

const EASE = [0.16, 1, 0.3, 1] as const;

const STATS = [
  { num: '$420.5M', label: 'Deployed since 2021', icon: Milestone },
  { num: '38', label: 'Operators fully funded', icon: Award },
  { num: '1.1GW', label: 'Clean solar capacity backed', icon: Activity },
  { num: '24.2%', label: 'Avg. gross IRR to date', icon: TrendingUp },
];

export const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-24 sm:py-32 bg-navy-950 text-white border-b border-white/5 relative overflow-hidden">
      {/* Absolute glow elements */}
      <div
        className="absolute right-10 bottom-10 z-0 h-[450px] w-[450px] rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(41,171,226,0.18), transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE }}
          className="mb-16 max-w-2xl text-left"
        >
          <span className="mb-4 block font-mono text-xs uppercase tracking-widest text-brand-cyan font-bold">
            Verified Performance / Track Record
          </span>
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl text-white tracking-tight">
            Numbers our partners can underwrite to.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-ink-300 font-sans leading-relaxed">
            Every statistic on our platform is backed by hard legal structures, live on-chain ledgers, and physical land or hardware audits. No hypothetical estimates.
          </p>
        </motion.div>

        {/* Stats Grid with dynamic card elements */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4" id="track-record-stats">
          {STATS.map((stat, i) => {
            const StatIcon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.65, ease: EASE, delay: i * 0.06 }}
                className="glass-panel p-8 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-brand-cyan group-hover:text-white group-hover:bg-brand-blue transition-colors duration-300">
                    <StatIcon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono text-ink-500 font-bold uppercase tracking-widest">
                    Verified
                  </span>
                </div>
                <div>
                  <div className="bg-brand-gradient bg-clip-text font-mono text-3xl font-extrabold text-transparent sm:text-4xl tracking-tight">
                    {stat.num}
                  </div>
                  <div className="mt-2 text-xs sm:text-sm font-semibold text-ink-300 font-sans">{stat.label}</div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Mini Trust Ledger Box */}
        <div className="mt-12 p-5 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="text-left">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Independent Audit Hashing Envelope</h4>
            <p className="text-[11px] text-ink-500 font-medium font-sans mt-0.5">The platform reserves are independently audited weekly and attested under a secure zero-knowledge cryptographical envelope.</p>
          </div>
          <span className="text-[10px] font-mono font-bold text-brand-cyan uppercase tracking-widest border border-brand-cyan/20 px-2.5 py-1 rounded-md bg-brand-cyan/5">
            SECURE-ZK-ATTESTATION: ACTIVE
          </span>
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;
