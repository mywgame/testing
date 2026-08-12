import React from 'react';
import { motion } from 'motion/react';
import { RibbonBackground } from './RibbonBackground.tsx';
import { ArrowRight } from 'lucide-react';

const EASE = [0.16, 1, 0.3, 1] as const;

const STATS = [
  { num: '$420M', label: 'Capital deployed' },
  { num: '38', label: 'Operators funded' },
  { num: '2', label: 'Verticals, one thesis' },
  { num: '24%', label: 'Avg. gross IRR' },
];

const headingContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.13, delayChildren: 0.15 },
  },
};

const headingChild = {
  hidden: { opacity: 0, y: 26, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.8, ease: EASE },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE, delay },
  }),
};

interface HeroProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
  onNavigateToSection: (sectionId: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenAuth, onNavigateToSection }) => {
  return (
    <section className="relative overflow-hidden pt-44 pb-24 sm:pt-48 sm:pb-32 bg-navy-950 text-white min-h-[90vh] flex flex-col justify-center">
      {/* Dynamic background lighting */}
      <div
        className="absolute -right-40 -top-32 z-0 h-[640px] w-[640px] rounded-full blur-3xl pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(233,30,140,0.12), transparent 65%)',
        }}
        aria-hidden="true"
      />
      <div
        className="absolute -left-40 bottom-10 z-0 h-[500px] w-[500px] rounded-full blur-3xl pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(21,101,240,0.1), transparent 65%)',
        }}
        aria-hidden="true"
      />

      <RibbonBackground variant="hero" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-4xl">
          {/* Tagline / Indicator */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1 font-mono text-[11px] uppercase tracking-widest text-brand-cyan"
          >
            <span className="h-2 w-2 rounded-full bg-brand-gradient animate-pulse" />
            MetaFirm Capital • Secure Yield Ledger
          </motion.div>

          {/* Title */}
          <motion.h1
            initial="hidden"
            animate="visible"
            variants={headingContainer}
            className="font-display text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl text-left"
          >
            <motion.span variants={headingChild} className="block sm:inline">
              We fund the&nbsp;
            </motion.span>
            <motion.span
              variants={headingChild}
              className="block sm:inline bg-brand-gradient bg-clip-text text-transparent"
            >
              infrastructure
            </motion.span>
            <motion.span variants={headingChild} className="block sm:inline">
              &nbsp;the next decade runs on.
            </motion.span>
          </motion.h1>

          {/* Paragraph description */}
          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0.55}
            className="mt-6 max-w-2xl text-base sm:text-lg text-ink-300 font-sans leading-relaxed text-left"
          >
            MetaFirm deploys growth capital into virtual GPU farms, solar energy platforms, and funded prop trading firms — three currents feeding the same ecosystem — turning founder-built infrastructure and quantitative desks into compounding returns for our partners. Securely deposit capital, audit real-time reserve balances, and access passive reward structures.
          </motion.p>

          {/* Action Button CTAs */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0.68}
            className="mt-10 flex flex-wrap gap-4 justify-start"
          >
            <button
              onClick={() => onOpenAuth('login')}
              className="inline-flex items-center justify-center rounded-xl bg-brand-gradient px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-[0_12px_30px_-10px_rgba(233,30,140,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.04] active:scale-[0.96] hover:shadow-[0_15px_35px_-8px_rgba(233,30,140,0.55)] cursor-pointer"
            >
              Start Investing
            </button>
            <button
              onClick={() => onOpenAuth('login')}
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-xs sm:text-sm font-bold text-ink-5 transition-all duration-300 hover:bg-white/10 hover:border-white/25 hover:scale-[1.04] active:scale-[0.96] cursor-pointer"
            >
              Access Security Vault
            </button>
            <button
              onClick={() => onNavigateToSection('about')}
              className="inline-flex items-center justify-center rounded-xl border border-transparent px-4 py-3.5 text-xs sm:text-sm font-semibold text-brand-cyan hover:text-brand-cyan/80 transition-all duration-300 hover:scale-[1.04] active:scale-[0.96] cursor-pointer group"
            >
              <span>See what we fund</span>
              <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>

          {/* Interactive Statistics Grid */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0.8}
            className="mt-16 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-white/10 pt-8 sm:grid-cols-4 sm:gap-x-0"
          >
            {STATS.map((stat, i) => (
              <div
                key={stat.label}
                className={
                  i < STATS.length - 1
                    ? 'sm:border-r sm:border-white/10 sm:pr-6 text-left'
                    : 'text-left'
                }
              >
                <div className="font-mono text-2xl font-bold sm:text-3xl bg-brand-gradient bg-clip-text text-transparent">
                  {stat.num}
                </div>
                <div className="mt-1.5 text-xs font-semibold uppercase tracking-wider text-ink-500 font-sans">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>


        </div>
      </div>
    </section>
  );
};

export default Hero;
