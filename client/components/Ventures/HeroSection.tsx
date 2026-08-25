/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { HERO_SLIDES } from './constants.ts';
import { ArrowRight, LayoutDashboard, Sparkles, Gift } from 'lucide-react';
import { DashboardTab } from '../Dashboard/Sidebar.tsx';

interface HeroSectionProps {
  onNavigateToDashboard: (tab?: DashboardTab) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigateToDashboard }) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [prevSlide, setPrevSlide] = useState<number | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  const goToSlide = (idx: number) => {
    if (idx === activeSlide || transitioning) return;
    setPrevSlide(activeSlide);
    setTransitioning(true);
    setActiveSlide(idx);
    setTimeout(() => {
      setPrevSlide(null);
      setTransitioning(false);
    }, 700);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((cur) => {
        const next = (cur + 1) % HERO_SLIDES.length;
        setPrevSlide(cur);
        setTransitioning(true);
        setTimeout(() => {
          setPrevSlide(null);
          setTransitioning(false);
        }, 700);
        return next;
      });
    }, 4800);
    return () => clearInterval(timer);
  }, []);

  const current = HERO_SLIDES[activeSlide];
  const previous = prevSlide !== null ? HERO_SLIDES[prevSlide] : null;

  const handleSlideAction = () => {
    if (current.actionTab) {
      onNavigateToDashboard(current.actionTab);
    } else {
      onNavigateToDashboard('dashboard');
    }
  };

  return (
    <section className="relative min-h-[92vh] flex flex-col items-center justify-center overflow-hidden pt-20 pb-16">
      {/* Background radial effects */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 100% 80% at 50% -10%, rgba(99,80,255,0.18) 0%, rgba(30,15,80,0.12) 40%, transparent 70%), radial-gradient(ellipse 60% 50% at 80% 60%, rgba(34,211,238,0.07) 0%, transparent 60%), #04091a',
        }}
      />
      <div className="absolute inset-0 venture-hero-grid" />
      <div className="absolute inset-0 venture-noise-overlay" />

      {/* Glow Orbs */}
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(99,80,255,0.6) 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full opacity-15 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.5) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="flex flex-col items-center text-center mb-10 sm:mb-12">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 venture-glass rounded-full px-4 py-1.5 mb-6">
            <div
              className="w-1.5 h-1.5 rounded-full bg-cyan-400"
              style={{
                boxShadow: '0 0 6px rgba(34,211,238,0.8)',
                animation: 'pulse-glow 2s ease-in-out infinite',
              }}
            />
            <span className="text-xs font-semibold tracking-widest text-cyan-300 uppercase font-display-outfit">
              MetaFirm Ventures
            </span>
          </div>

          {/* Heading */}
          <h1 className="font-display-outfit text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight max-w-4xl leading-[1.1] mb-6">
            Building the{' '}
            <span className="block venture-gradient-text">Infrastructure</span>
            of Tomorrow
          </h1>

          {/* Subtitle */}
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto mb-8 sm:mb-10 font-sans leading-relaxed">
            Exploring next-generation ventures across computing, energy, and digital economies.
            Discover the high-conviction ecosystem powering MetaFirm&apos;s expansion.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <a
              href="#ecosystem-section"
              className="w-full sm:w-auto venture-btn-primary px-8 py-3.5 rounded-xl text-sm font-semibold text-white font-display-outfit flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              <span className="relative z-10">Explore Ventures</span>
              <ArrowRight className="w-4 h-4 relative z-10" />
            </a>
            <button
              onClick={() => onNavigateToDashboard('dashboard')}
              className="w-full sm:w-auto venture-btn-outline px-8 py-3.5 rounded-xl text-sm font-semibold text-slate-200 hover:text-white font-display-outfit flex items-center justify-center gap-2 cursor-pointer"
            >
              <LayoutDashboard className="w-4 h-4 text-violet-400" />
              <span>Go to User Dashboard</span>
            </button>
          </div>
        </div>

        {/* Carousel Showcase */}
        <div className="relative max-w-4xl mx-auto w-full">
          <div
            className="relative rounded-3xl overflow-hidden venture-glass-card shadow-2xl border border-indigo-500/25 flex flex-col"
            style={{
              boxShadow:
                '0 0 80px rgba(99,80,255,0.18), 0 20px 60px rgba(0,0,0,0.7)',
            }}
          >
            {/* Visual Media Frame (Clean & Clickable, No Overlapping Badges) */}
            <div 
              onClick={handleSlideAction}
              className="relative aspect-[16/9] sm:aspect-[21/9] max-h-[380px] w-full overflow-hidden bg-slate-950 cursor-pointer group"
            >
              {previous && (
                <div
                  className="absolute inset-0 transition-opacity duration-700 opacity-0"
                  style={{
                    backgroundImage: `url(${previous.img})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090e24]/80 via-transparent to-transparent" />
                </div>
              )}
              <div
                className="absolute inset-0 transition-opacity duration-700 opacity-100 group-hover:scale-105 transition-transform duration-500"
                style={{
                  backgroundImage: `url(${current.img})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[#090e24]/80 via-transparent to-transparent" />
              </div>
            </div>

            {/* Content Details (Positioned Below Media Frame) */}
            <div className="p-5 sm:p-7 bg-[#080d24] border-t border-indigo-500/20 text-left">
              {/* Top Row: Category Badge & Slide Counter */}
              <div className="flex justify-between items-center mb-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-display-outfit tracking-wider uppercase border ${
                  current.badgeColor 
                    ? current.badgeColor
                    : 'bg-cyan-500/25 text-cyan-200 border-cyan-400/50'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${current.dotColor || 'bg-cyan-400'}`} />
                  {current.label}
                </span>
                <span className="text-slate-400 text-xs font-mono font-semibold tracking-wider">
                  0{activeSlide + 1} / 0{HERO_SLIDES.length}
                </span>
              </div>

              {/* Main Heading & Subtitle Row */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
                <div>
                  <h3 className="font-display-outfit text-xl sm:text-2xl font-bold text-white mb-2 tracking-tight">
                    {current.title}
                  </h3>
                  <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed font-sans">
                    {current.subtitle || 'High-capacity decentralized operations advancing our core technological capabilities.'}
                  </p>
                </div>

                {current.actionText && (
                  <button
                    onClick={handleSlideAction}
                    className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold font-display-outfit uppercase tracking-wider text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all shadow-md shadow-cyan-500/20 active:scale-95 cursor-pointer"
                  >
                    <span>{current.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Progress Indicators & Navigation Dots */}
              <div className="flex gap-2 items-center pt-2 border-t border-white/5">
                {HERO_SLIDES.map((slide, i) => (
                  <button
                    key={i}
                    onClick={() => goToSlide(i)}
                    className="transition-all duration-300 rounded-full cursor-pointer hover:opacity-100"
                    style={{
                      height: '4.5px',
                      width: activeSlide === i ? '36px' : '10px',
                      background: activeSlide === i ? '#22d3ee' : 'rgba(255,255,255,0.2)',
                      boxShadow: activeSlide === i ? '0 0 8px rgba(34,211,238,0.7)' : 'none',
                    }}
                    aria-label={`Go to slide ${i + 1}: ${slide.label}`}
                    title={slide.label}
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

