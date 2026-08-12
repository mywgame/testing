import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import logoMarkImg from '../../assets/images/branding/logo-mark.png';

export const LoadingScreen: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Smoothly accelerate and decelerate progress
        const diff = Math.max(1, Math.floor((100 - prev) * 0.15));
        return prev + diff;
      });
    }, 80);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ 
        opacity: 0,
        filter: 'blur(10px)',
        transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
      }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-navy-950 text-white select-none overflow-hidden"
    >
      {/* Premium ambient radial background glow */}
      <div 
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(233,30,140,0.12)_0%,rgba(21,101,240,0.08)_40%,transparent_75%)] pointer-events-none"
        aria-hidden="true"
      />

      {/* Floating subtle geometric particles */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-[30%] left-[25%] w-72 h-72 rounded-full bg-brand-magenta/5 blur-3xl animate-pulse" />
        <div className="absolute bottom-[25%] right-[20%] w-96 h-96 rounded-full bg-brand-cyan/5 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Main loading container */}
      <div className="relative z-10 flex flex-col items-center space-y-8 max-w-sm w-full px-6">
        {/* Glow behind the logo */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 -m-8 rounded-full bg-brand-gradient opacity-20 blur-2xl animate-pulse scale-110" />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative p-6 rounded-3xl bg-white/[0.01] border border-white/5 shadow-2xl backdrop-blur-md"
          >
            <img
              src={logoMarkImg}
              alt="MetaFirm Logo Mark"
              referrerPolicy="no-referrer"
              className="h-16 w-16 object-contain"
            />
          </motion.div>
        </div>

        {/* Shimmering Text & Details */}
        <div className="text-center space-y-2 w-full">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-[10px] font-mono tracking-widest uppercase font-bold text-brand-cyan"
          >
            Securing Connection
          </motion.p>
          
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-sm font-sans font-medium text-ink-300 flex items-center justify-center gap-1.5"
          >
            <span>Decrypting Vault Keys</span>
            <span className="inline-flex gap-0.5">
              <span className="w-1 h-1 rounded-full bg-white animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1 h-1 rounded-full bg-white animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1 h-1 rounded-full bg-white animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
          </motion.h3>
        </div>

        {/* Premium Progress Bar Wrapper */}
        <div className="w-full space-y-2">
          <div className="h-[3px] w-full bg-white/5 rounded-full overflow-hidden relative border border-white/[0.02]">
            {/* Real Progress indicator */}
            <motion.div 
              className="absolute top-0 bottom-0 left-0 bg-brand-gradient rounded-full shadow-[0_0_8px_rgba(233,30,140,0.6)]"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut', duration: 0.1 }}
            />
            {/* Gliding shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
          </div>
          
          <div className="flex justify-between items-center text-[9px] font-mono text-ink-500 font-semibold tracking-wider uppercase">
            <span>TLS 1.3 Handshake</span>
            <span>{progress}%</span>
          </div>
        </div>
      </div>

      {/* Bottom Secure Certification */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center space-x-2 text-[10px] font-mono font-bold uppercase tracking-widest text-ink-500">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>Hardware Enclave Secured</span>
      </div>
    </motion.div>
  );
};

export default LoadingScreen;
