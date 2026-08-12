import React from 'react';
import { motion } from 'motion/react';
import { Fingerprint, Server, Activity, Eye, ShieldAlert, Award, Shield, CheckCircle2 } from 'lucide-react';
import { securityHighlights } from '../utils/landingData.ts';

const EASE = [0.16, 1, 0.3, 1] as const;

const getSecurityIcon = (name: string) => {
  switch (name) {
    case 'Fingerprint':
      return Fingerprint;
    case 'ServerCrash':
      return Server;
    case 'Activity':
      return Activity;
    case 'Eye':
      return Eye;
    case 'ShieldAlert':
      return ShieldAlert;
    default:
      return Shield;
  }
};

export const Security: React.FC = () => {
  return (
    <section id="security" className="py-24 sm:py-32 bg-navy-950 text-white border-b border-white/5 relative overflow-hidden">
      {/* 1. Ambient Radial Lighting Layers */}
      <div
        className="absolute -top-24 -left-24 w-[500px] h-[500px] rounded-full blur-[120px] opacity-25 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.4), transparent 70%)' }}
        aria-hidden="true"
      />
      <div
        className="absolute top-1/3 right-0 w-[600px] h-[600px] rounded-full blur-[140px] opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.35), transparent 70%)' }}
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-20 left-1/3 w-[500px] h-[500px] rounded-full blur-[130px] opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.3), transparent 70%)' }}
        aria-hidden="true"
      />

      {/* 2. Cyber Tech Grid Background Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20 [mask-image:radial-gradient(ellipse_75%_65%_at_50%_50%,#000_60%,transparent_100%)]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.07) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.07) 1px, transparent 1px)
          `,
          backgroundSize: '3.5rem 3.5rem',
        }}
        aria-hidden="true"
      />

      {/* 3. Futuristic Dotted Cyber World Map & Network Mesh Overlay */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.14] overflow-hidden" aria-hidden="true">
        <svg
          className="w-full h-full max-w-7xl object-cover scale-110 sm:scale-100"
          viewBox="0 0 1000 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#a855f7" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
            </linearGradient>
            <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="1" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Stylized Node Network / World Grid Lines */}
          <g stroke="url(#mapGradient)" strokeWidth="0.75" strokeDasharray="3 3">
            {/* Latitude & Longitude curves */}
            <path d="M 50 100 Q 500 130 950 100" />
            <path d="M 50 200 Q 500 230 950 200" />
            <path d="M 50 300 Q 500 330 950 300" />
            <path d="M 50 400 Q 500 430 950 400" />
            
            <path d="M 200 50 Q 230 250 200 450" />
            <path d="M 400 50 Q 430 250 400 450" />
            <path d="M 600 50 Q 630 250 600 450" />
            <path d="M 800 50 Q 830 250 800 450" />
          </g>

          {/* Dotted Continents / High-density Node Clusters */}
          <g fill="url(#mapGradient)">
            {/* North America cluster */}
            <circle cx="200" cy="150" r="2" /><circle cx="220" cy="140" r="1.5" /><circle cx="240" cy="160" r="2.5" />
            <circle cx="210" cy="180" r="2" /><circle cx="250" cy="170" r="1.5" /><circle cx="230" cy="200" r="2" />
            <circle cx="180" cy="160" r="1.5" /><circle cx="260" cy="145" r="2" />
            {/* South America cluster */}
            <circle cx="310" cy="290" r="2" /><circle cx="330" cy="320" r="2.5" /><circle cx="320" cy="350" r="1.5" />
            <circle cx="340" cy="380" r="2" /><circle cx="300" cy="310" r="1.5" />
            {/* Europe cluster */}
            <circle cx="510" cy="140" r="2.5" /><circle cx="530" cy="130" r="2" /><circle cx="545" cy="150" r="2" />
            <circle cx="525" cy="165" r="1.5" /><circle cx="560" cy="140" r="2" />
            {/* Africa cluster */}
            <circle cx="520" cy="240" r="2" /><circle cx="540" cy="270" r="2.5" /><circle cx="550" cy="300" r="2" />
            <circle cx="530" cy="320" r="1.5" /><circle cx="570" cy="280" r="2" />
            {/* Asia cluster */}
            <circle cx="680" cy="150" r="2.5" /><circle cx="720" cy="140" r="2" /><circle cx="750" cy="160" r="2.5" />
            <circle cx="710" cy="180" r="2" /><circle cx="770" cy="190" r="2" /><circle cx="800" cy="170" r="1.5" />
            <circle cx="660" cy="180" r="2" /><circle cx="730" cy="210" r="2.5" />
            {/* Australia cluster */}
            <circle cx="810" cy="340" r="2" /><circle cx="830" cy="350" r="2.5" /><circle cx="850" cy="330" r="1.5" />
          </g>

          {/* Active Encrypted Data Arc Vectors */}
          <g stroke="#38bdf8" strokeWidth="1.2" opacity="0.7">
            <path d="M 240 160 Q 380 90 510 140" strokeDasharray="4 4" className="animate-pulse" />
            <path d="M 530 130 Q 610 80 720 140" strokeDasharray="5 3" />
            <path d="M 750 160 Q 600 280 330 320" strokeDasharray="6 4" />
          </g>

          {/* Glowing Security Nodes */}
          <circle cx="240" cy="160" r="5" fill="#38bdf8" className="animate-ping" opacity="0.6" />
          <circle cx="240" cy="160" r="3" fill="#ffffff" />
          <circle cx="510" cy="140" r="5" fill="#a855f7" className="animate-ping" opacity="0.6" />
          <circle cx="510" cy="140" r="3" fill="#ffffff" />
          <circle cx="750" cy="160" r="5" fill="#38bdf8" className="animate-ping" opacity="0.6" />
          <circle cx="750" cy="160" r="3" fill="#ffffff" />
        </svg>
      </div>

      {/* 4. Peripheral HUD Corner Accents */}
      <div className="absolute top-4 left-4 sm:top-8 sm:left-8 w-6 h-6 border-l-2 border-t-2 border-brand-cyan/30 pointer-events-none" aria-hidden="true" />
      <div className="absolute top-4 right-4 sm:top-8 sm:right-8 w-6 h-6 border-r-2 border-t-2 border-brand-cyan/30 pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-4 left-4 sm:bottom-8 sm:left-8 w-6 h-6 border-l-2 border-b-2 border-brand-cyan/30 pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 w-6 h-6 border-r-2 border-b-2 border-brand-cyan/30 pointer-events-none" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section title & Audit Block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
          <div className="lg:col-span-6 space-y-4 text-left">
            <span className="text-xs font-mono uppercase tracking-widest text-brand-cyan font-bold block mb-2">
              Cryptographic Safeguards
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight leading-tight">
              Zero-Trust Security Engine
            </h2>
            <p className="text-sm sm:text-base text-ink-300 leading-relaxed font-sans max-w-xl">
              Our financial platform is engineered with defensive security layers at every level of the protocol stack. 
              We protect both client sessions and core systems from extraction and vector attacks.
            </p>
          </div>

          {/* Secure Audit Certificate visual representation */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end w-full">
            <div className="relative group w-full max-w-md">
              <div className="absolute -inset-0.5 rounded-[24px] bg-gradient-to-r from-brand-cyan via-purple-500 to-blue-600 opacity-30 blur-lg transition-all duration-300 group-hover:opacity-55" />
              <div className="relative bg-navy-900/80 backdrop-blur-xl border border-white/15 text-white rounded-[24px] p-6 sm:p-8 overflow-hidden text-left shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
                {/* Ambient Card Inner Glow */}
                <div className="absolute -top-16 -right-16 w-32 h-32 bg-brand-cyan/20 rounded-full blur-2xl pointer-events-none" />
                
                {/* Overlay art */}
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <Shield className="w-40 h-40 text-brand-cyan" />
                </div>
                <div className="space-y-4 relative z-10">
                  <div className="flex items-center space-x-2">
                    <Award className="w-5 h-5 text-brand-cyan" />
                    <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-brand-cyan-light">Audit Status: A+ Rated</span>
                  </div>
                  <h4 className="text-lg sm:text-xl font-display font-bold leading-snug">Continuous Real-time Ledger Verification</h4>
                  <p className="text-xs sm:text-sm text-ink-300 leading-relaxed font-sans">
                    Third-party cybersecurity leaders perform weekly automated penetration sweeps and constant integrity monitoring of our secure database clusters.
                  </p>
                  <div className="pt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/10 text-[10px] font-mono text-ink-500 font-bold uppercase tracking-wider">
                    <div className="flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-white">SSL/TLS 1.3 Active</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-white">AES-256 Storage</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3-Column layout grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left" id="security-pillar-grid" role="list">
          {securityHighlights.map((pillar, idx) => {
            const Icon = getSecurityIcon(pillar.iconName);
            return (
              <motion.div
                key={pillar.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: EASE, delay: idx * 0.05 }}
                role="listitem"
                className="relative group rounded-[22px] p-6 sm:p-7 bg-navy-900/50 backdrop-blur-xl border border-white/10 hover:border-brand-cyan/40 hover:shadow-[0_8px_30px_rgba(56,189,248,0.12)] transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Subtle top subtle gradient glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-b from-brand-cyan/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-[22px]" />
                
                <div className="relative z-10">
                  <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 text-brand-cyan w-fit mb-5 group-hover:scale-105 group-hover:bg-brand-cyan/10 transition-all duration-300">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-bold text-white text-base sm:text-lg mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-ink-300 leading-relaxed font-sans">
                    {pillar.description}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-ink-500 font-bold uppercase tracking-wider relative z-10">
                  <span>Cryptographic Shield</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default Security;
