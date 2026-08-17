/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { NETWORK_IMG, GPU_IMG, SOLAR_IMG, TRADING_IMG } from './constants.ts';
import { Play } from 'lucide-react';

export const PromoVideoSection: React.FC = () => {
  const [activeSlide, setActiveSlide] = useState(1);

  const PROMO_IMAGES = [NETWORK_IMG, GPU_IMG, SOLAR_IMG, TRADING_IMG];
  const activeImg = PROMO_IMAGES[activeSlide] || GPU_IMG;

  return (
    <section className="py-24 px-4 sm:px-6 relative overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 70% at 50% 50%, rgba(30,15,80,0.3) 0%, transparent 70%)',
        }}
      />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 venture-glass rounded-full px-4 py-1.5 mb-4">
              <span className="text-xs font-semibold tracking-widest text-cyan-400 uppercase font-display-outfit">
                Inside MetaFirm
              </span>
            </div>
            <h2 className="font-display-outfit text-3xl sm:text-5xl font-bold text-white">
              Inside the
              <span className="block venture-gradient-text">MetaFirm Vision</span>
            </h2>
          </div>
          <p className="text-slate-400 max-w-sm text-sm sm:text-base">
            A look into the infrastructure, technology, and strategy driving MetaFirm's next chapter.
          </p>
        </div>

        <div
          className="relative rounded-3xl overflow-hidden"
          style={{
            border: '1px solid rgba(99,135,255,0.2)',
            boxShadow:
              '0 0 80px rgba(99,80,255,0.1), 0 30px 80px rgba(0,0,0,0.5)',
          }}
        >
          <div className="aspect-[21/9] bg-slate-900 relative min-h-64 sm:min-h-80">
            <img
              src={activeImg}
              alt="MetaFirm vision"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover opacity-70 transition-all duration-700"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(135deg, rgba(4,9,26,0.4) 0%, rgba(60,30,120,0.2) 100%)',
              }}
            />

            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="group flex flex-col items-center gap-3 cursor-pointer">
                <div
                  className="rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-2xl"
                  style={{
                    width: '76px',
                    height: '76px',
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 0 50px rgba(139,92,246,0.5)',
                  }}
                >
                  <Play className="w-8 h-8 text-white fill-white ml-1" />
                </div>
                <span className="text-white/80 text-xs font-display-outfit tracking-widest uppercase font-semibold">
                  MetaFirm Vision Reel
                </span>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div className="venture-glass rounded-xl px-4 py-2.5 max-w-sm">
                <p className="text-[10px] text-slate-400 font-display-outfit tracking-wider uppercase mb-0.5">
                  MetaFirm — 2025 Vision
                </p>
                <p className="text-xs sm:text-sm font-semibold text-white">
                  Infrastructure for the Next Economy
                </p>
              </div>

              <div className="flex gap-2 items-center self-end sm:self-auto">
                {[0, 1, 2, 3].map((i) => (
                  <button
                    key={i}
                    onClick={() => setActiveSlide(i)}
                    className="transition-all duration-300 rounded-full cursor-pointer"
                    style={{
                      height: '4px',
                      width: activeSlide === i ? '28px' : '8px',
                      background: activeSlide === i ? '#22d3ee' : 'rgba(255,255,255,0.25)',
                    }}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
