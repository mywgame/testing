import React from 'react';
import { motion } from 'motion/react';

const EASE = [0.16, 1, 0.3, 1] as const;

export const Stats: React.FC = () => {
  return (
    <section id="stats" className="py-24 sm:py-32 bg-navy-950 text-white border-b border-white/5 relative overflow-hidden">
      {/* Visual background accents */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0 h-[500px] w-[500px] rounded-full blur-[140px] opacity-15 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(233,30,140,0.15) 0%, rgba(21,101,240,0.15) 50%, transparent 100%)',
        }}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8 relative z-10">
        
        <motion.blockquote
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: EASE }}
          className="font-display text-2xl sm:text-4xl font-extrabold leading-snug tracking-tight text-white"
        >
          We don&apos;t fund ideas. We fund{' '}
          <span className="bg-brand-gradient bg-clip-text text-transparent">
            utilization curves
          </span>{' '}
          and{' '}
          <span className="bg-brand-gradient bg-clip-text text-transparent">
            interconnection queues
          </span>
          .
        </motion.blockquote>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
          className="mt-8 flex flex-col items-center"
        >
          <div className="h-0.5 w-12 bg-brand-gradient mb-4" />
          <p className="font-mono text-xs sm:text-sm uppercase tracking-widest text-ink-500 font-bold">
            — Investment Committee, MetaFirm
          </p>
        </motion.div>

      </div>
    </section>
  );
};

export default Stats;
