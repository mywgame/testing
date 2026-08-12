import React from 'react';
import { motion } from 'motion/react';

const EASE = [0.16, 1, 0.3, 1] as const;

const STEPS = [
  {
    idx: '01',
    title: 'Submit your model',
    body: 'A two-page memo: unit economics, utilization or capacity factor, and the ask. No 40-slide deck required.',
  },
  {
    idx: '02',
    title: 'Diligence sprint',
    body: 'Site visits, hardware or interconnection audits, and customer reference calls — completed in under three weeks.',
  },
  {
    idx: '03',
    title: 'Term sheet',
    body: 'Structured as senior debt, revenue share, or equity — whichever fits the asset and your stage.',
  },
  {
    idx: '04',
    title: 'Capital deployed',
    body: 'Funds released against milestones — hardware delivery, interconnection approval, or COD — not just a signature.',
  },
];

export const WhyChooseUs: React.FC = () => {
  return (
    <section id="benefits" className="border-y border-white/5 bg-navy-950 py-24 sm:py-32 text-white relative overflow-hidden">
      {/* 1. Ambient Radial Lighting Layers */}
      <div
        className="absolute -top-24 -left-24 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.35), transparent 70%)' }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full blur-[140px] opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.3), transparent 70%)' }}
        aria-hidden="true"
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full blur-[150px] opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.25), transparent 70%)' }}
        aria-hidden="true"
      />

      {/* 2. Cyber Tech Grid Background Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20 [mask-image:radial-gradient(ellipse_80%_70%_at_50%_50%,#000_60%,transparent_100%)]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.07) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.07) 1px, transparent 1px)
          `,
          backgroundSize: '3.5rem 3.5rem',
        }}
        aria-hidden="true"
      />

      {/* 3. Futuristic Pipeline Arc Flow & Dotted Network Mesh */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.15] overflow-hidden" aria-hidden="true">
        <svg
          className="w-full h-full max-w-7xl object-cover scale-105 sm:scale-100"
          viewBox="0 0 1000 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="pipelineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#a855f7" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {/* Connected Stage Arcs */}
          <path
            d="M 120 200 Q 250 100 380 200 T 640 200 T 900 200"
            stroke="url(#pipelineGrad)"
            strokeWidth="1.5"
            strokeDasharray="6 4"
            fill="none"
          />

          {/* Floating Data Pulses */}
          <g stroke="url(#pipelineGrad)" strokeWidth="1" opacity="0.6">
            <line x1="120" y1="50" x2="120" y2="350" strokeDasharray="3 3" />
            <line x1="380" y1="50" x2="380" y2="350" strokeDasharray="3 3" />
            <line x1="640" y1="50" x2="640" y2="350" strokeDasharray="3 3" />
            <line x1="900" y1="50" x2="900" y2="350" strokeDasharray="3 3" />
          </g>

          {/* Node Rings for Stage Milestone Points */}
          <circle cx="120" cy="200" r="8" fill="#38bdf8" className="animate-ping" opacity="0.5" />
          <circle cx="120" cy="200" r="4" fill="#ffffff" />
          <circle cx="380" cy="200" r="8" fill="#a855f7" className="animate-ping" opacity="0.5" />
          <circle cx="380" cy="200" r="4" fill="#ffffff" />
          <circle cx="640" cy="200" r="8" fill="#3b82f6" className="animate-ping" opacity="0.5" />
          <circle cx="640" cy="200" r="4" fill="#ffffff" />
          <circle cx="900" cy="200" r="8" fill="#10b981" className="animate-ping" opacity="0.5" />
          <circle cx="900" cy="200" r="4" fill="#ffffff" />
        </svg>
      </div>

      {/* 4. Peripheral HUD Corner Accents */}
      <div className="absolute top-4 left-4 sm:top-8 sm:left-8 w-6 h-6 border-l-2 border-t-2 border-brand-cyan/30 pointer-events-none" aria-hidden="true" />
      <div className="absolute top-4 right-4 sm:top-8 sm:right-8 w-6 h-6 border-r-2 border-t-2 border-brand-cyan/30 pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-4 left-4 sm:bottom-8 sm:left-8 w-6 h-6 border-l-2 border-b-2 border-brand-cyan/30 pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 w-6 h-6 border-r-2 border-b-2 border-brand-cyan/30 pointer-events-none" aria-hidden="true" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE }}
          className="mb-16 max-w-2xl text-left"
        >
          <span className="mb-4 block font-mono text-xs uppercase tracking-widest text-brand-cyan font-bold">
            Onboarding Pipeline
          </span>
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl text-white tracking-tight">
            From memo to money, in weeks.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-ink-300 font-sans leading-relaxed">
            Skip the endless venture pitching cycles. We operate on asset economics, utilizing swift audit sprints to deploy capital to qualified developers.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, ease: EASE, delay: i * 0.08 }}
              className="relative group rounded-[22px] p-6 sm:p-8 bg-navy-900/50 backdrop-blur-xl border border-white/10 hover:border-brand-cyan/40 hover:shadow-[0_8px_30px_rgba(56,189,248,0.12)] transition-all duration-300 flex flex-col justify-between overflow-hidden"
            >
              {/* Subtle top gradient glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-b from-brand-cyan/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-[22px]" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-lg font-bold text-brand-cyan group-hover:text-brand-cyan-light transition-colors">
                    {step.idx}
                  </span>
                </div>
                <div className="mb-6 h-[2px] w-12 bg-gradient-to-r from-brand-cyan via-purple-500 to-blue-600 group-hover:w-20 transition-all duration-300" />
                <h4 className="mb-3 text-lg font-bold text-white font-display">{step.title}</h4>
                <p className="text-xs sm:text-sm text-ink-300 font-sans leading-relaxed">{step.body}</p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-ink-500 font-bold uppercase tracking-wider relative z-10">
                <span>Pipeline Stage</span>
                <span className="text-brand-cyan font-mono">{step.idx} / 04</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;

