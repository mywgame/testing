import React from 'react';
import { motion } from 'motion/react';
import gpuIllustrationImg from '../../assets/images/illustrations/gpu-farm-illustration.svg';
import solarIllustrationImg from '../../assets/images/illustrations/solar-farm-illustration.svg';
import propIllustrationImg from '../../assets/images/illustrations/crypto-prop-firm-illustration.svg';

const EASE = [0.16, 1, 0.3, 1] as const;

interface VerticalCardProps {
  variant: 'compute' | 'solar' | 'firm';
  title: string;
  description: string;
  bullets: string[];
  statNum: string;
  statLabel: string;
  illustration: React.ReactNode;
  icon: React.ReactNode;
  delay?: number;
}

function VerticalCard({
  variant,
  title,
  description,
  bullets,
  statNum,
  statLabel,
  illustration,
  icon,
  delay = 0,
}: VerticalCardProps) {
  const accentText =
    variant === 'compute'
      ? 'text-brand-magenta-light'
      : variant === 'solar'
      ? 'text-brand-cyan'
      : 'text-purple-400';

  const barGradient =
    variant === 'compute'
      ? 'from-brand-magenta to-brand-magenta-light'
      : variant === 'solar'
      ? 'from-brand-blue to-brand-cyan'
      : 'from-purple-600 via-brand-magenta to-brand-blue';

  const iconBg =
    variant === 'compute'
      ? 'bg-brand-magenta/15'
      : variant === 'solar'
      ? 'bg-brand-blue/15'
      : 'bg-purple-500/15';

  const iconColor =
    variant === 'compute'
      ? 'text-brand-magenta-light'
      : variant === 'solar'
      ? 'text-brand-cyan'
      : 'text-purple-400';

  const dotColor =
    variant === 'compute'
      ? 'bg-brand-magenta-light'
      : variant === 'solar'
      ? 'bg-brand-cyan'
      : 'bg-purple-400';

  const iconRing =
    variant === 'compute'
      ? 'ring-brand-magenta/30'
      : variant === 'solar'
      ? 'ring-brand-blue/30'
      : 'ring-purple-500/30';

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease: EASE, delay }}
      className="group relative rounded-[20px] border border-white/10 bg-navy-900 transition-all duration-300 hover:-translate-y-1.5 hover:border-white/20 hover:shadow-[0_30px_60px_-25px_rgba(0,0,0,0.6)] text-left"
    >
      <div className={`absolute inset-x-0 top-0 z-10 h-[3px] rounded-t-[20px] bg-gradient-to-r ${barGradient}`} />
      
      {/* Illustration banner */}
      <div className="relative h-44 sm:h-48 w-full overflow-hidden rounded-t-[20px] bg-navy-950/80 flex items-center justify-center">
        <div className="w-full h-full p-2 transition-transform duration-500 ease-out group-hover:scale-105">
          {illustration}
        </div>
        {/* Subtle bottom blend fade */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-navy-900 to-transparent opacity-80" />
      </div>

      {/* Floating Icon Badge (positioned outside overflow-hidden so it is never cropped) */}
      <div className="relative z-20 -mt-6 ml-7 flex">
        <div
          className={`flex h-[48px] w-[48px] sm:h-[52px] sm:w-[52px] items-center justify-center rounded-2xl border border-white/10 ${iconBg} ${iconColor} ring-4 ${iconRing} ring-offset-2 ring-offset-navy-900 backdrop-blur-md shadow-lg`}
        >
          {icon}
        </div>
      </div>

      <div className="p-7 pt-4 text-left">
        <h3 className="font-display text-xl font-bold text-white sm:text-2xl">{title}</h3>
        <p className="mt-3 text-[14px] text-ink-300 font-sans leading-relaxed">{description}</p>
        <ul className="mt-5 flex flex-col gap-2.5">
          {bullets.map((bullet) => (
            <li key={bullet} className="relative pl-5 text-xs sm:text-sm text-ink-300 font-sans">
              <span className={`absolute left-0 top-2 h-1.5 w-1.5 rounded-sm ${dotColor}`} />
              {bullet}
            </li>
          ))}
        </ul>
        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
          <span className={`font-mono text-lg font-bold ${accentText}`}>{statNum}</span>
          <span className="text-[11px] uppercase tracking-wider font-bold text-ink-500 font-mono">{statLabel}</span>
        </div>
      </div>
    </motion.div>
  );
}

const ComputeIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor">
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <rect x="9" y="9" width="6" height="6" />
    <path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2" />
  </svg>
);

const SolarIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
  </svg>
);

const FirmIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor">
    <path d="M3 3v18h18" />
    <path d="M18 9l-5 5-4-4-5 5" />
    <path d="M18 9h-4" />
    <path d="M18 9v4" />
  </svg>
);

export const About: React.FC = () => {
  return (
    <section id="about" className="py-24 sm:py-32 bg-navy-950 text-white border-b border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Thesis Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE }}
          className="mb-16 max-w-2xl text-left"
        >
          <span className="mb-4 block font-mono text-xs uppercase tracking-widest text-brand-cyan font-bold">
            What We Fund / Investment Thesis
          </span>
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl text-white tracking-tight">
            Three currents. One thesis.
          </h2>
          <p className="mt-4 text-[15px] sm:text-[16.5px] text-ink-300 font-sans leading-relaxed">
            Compute, energy, and capital are converging into the same infrastructure
            stack. We back the operators building all three sides of it — the
            machines that think, the power that runs them, and the prop firms that capitalize market liquidity.
          </p>
        </motion.div>

        {/* Verticals Cards Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <VerticalCard
            variant="compute"
            title="Virtual GPU Farms"
            description="We fund operators who convert capital into compute capacity — colocated GPU clusters leased to AI labs, render studios, and inference platforms hungry for cycles."
            bullets={[
              'Underwritten on actual utilization, not AI hype',
              'Hardware-secured institutional lending structures',
              'Optimized revenue-share and equity blends',
            ]}
            statNum="21 Nodes"
            statLabel="compute operators funded"
            illustration={
              <img
                src={gpuIllustrationImg}
                alt="Virtual GPU Farms"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            }
            icon={ComputeIcon}
          />
          <VerticalCard
            variant="solar"
            title="Solar Energy Farms"
            description="We fund early and growth-stage solar developers building utility-scale and behind-the-meter farms — the power layer every compute farm eventually competes for."
            bullets={[
              'PPA-backed robust structuring',
              'Land, interconnection & permitting meticulous diligence',
              'Blended debt and equity capital stacks',
            ]}
            statNum="17 Farms"
            statLabel="energy operators funded"
            illustration={
              <img
                src={solarIllustrationImg}
                alt="Solar Energy Farms"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            }
            icon={SolarIcon}
            delay={0.1}
          />
          <VerticalCard
            variant="firm"
            title="Funded Firms (Crypto Prop Firm)"
            description="We capitalize high-frequency, algorithmic, and quantitative crypto prop trading firms — backing elite trading desks and market makers with institutional risk management and capital allocation."
            bullets={[
              'Institutional risk-managed capital allocation',
              'Performance-based profit splits & high-water mark audits',
              'Advanced order routing & liquidity connectivity',
            ]}
            statNum="14 Firms"
            statLabel="crypto prop firms funded"
            illustration={
              <img
                src={propIllustrationImg}
                alt="Funded Firms (Crypto Prop Firm)"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            }
            icon={FirmIcon}
            delay={0.2}
          />
        </div>
      </div>
    </section>
  );
};

export default About;
