import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { faqItems } from '../utils/landingData.ts';
import { ChevronDown, HelpCircle } from 'lucide-react';

const EASE = [0.16, 1, 0.3, 1] as const;

export const Faq: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="py-24 sm:py-32 bg-navy-950 text-white border-b border-white/5 relative overflow-hidden">
      {/* Background flare */}
      <div
        className="absolute left-1/3 bottom-0 z-0 h-[350px] w-[350px] rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(21,101,240,0.15), transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-left max-w-2xl mb-16"
        >
          <span className="text-xs font-mono uppercase tracking-widest text-brand-cyan font-bold block mb-3">
            Frequently Asked Inquiries
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight leading-tight">
            Platform Operations & Answers
          </h2>
          <p className="mt-3 text-sm sm:text-base text-ink-300 font-sans leading-relaxed">
            Have questions about ledger architecture, investment minimums, or yields? Read our comprehensive guidelines.
          </p>
        </motion.div>

        {/* Accordion List */}
        <div className="space-y-4" id="faq-accordion-list">
          {faqItems.map((item, idx) => {
            const isOpen = openId === item.id;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: EASE, delay: idx * 0.04 }}
                className={`glass-panel bg-white/[0.01] border transition-all duration-300 overflow-hidden ${
                  isOpen ? 'border-brand-cyan/30 bg-white/[0.03]' : 'border-white/5 hover:border-white/10'
                }`}
              >
                <button
                  onClick={() => toggleItem(item.id)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none cursor-pointer group"
                >
                  <div className="flex items-center space-x-3.5 pr-4">
                    <HelpCircle className={`w-4 h-4 flex-shrink-0 transition-colors ${isOpen ? 'text-brand-cyan' : 'text-ink-500 group-hover:text-brand-cyan'}`} />
                    <span className="text-sm sm:text-base font-bold text-white group-hover:text-brand-cyan transition-colors">
                      {item.question}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-ink-500 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180 text-brand-cyan' : ''}`} />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: EASE }}
                    >
                      <div className="px-6 pb-6 pt-1 text-xs sm:text-sm text-ink-300 font-sans leading-relaxed border-t border-white/5">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default Faq;
