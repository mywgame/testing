import React, { useEffect, useRef } from 'react';

interface RibbonBackgroundProps {
  variant?: 'hero' | 'divider';
}

/**
 * Signature brand motif: two crossing ribbon strands (magenta -> blue -> cyan),
 * echoing the two strokes of the MetaFirm "M" mark. Used as an ambient hero
 * background and as a thin section divider between the two funding verticals.
 */
export const RibbonBackground: React.FC<RibbonBackgroundProps> = ({ variant = 'hero' }) => {
  const path1Ref = useRef<SVGPathElement>(null);
  const path2Ref = useRef<SVGPathElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (prefersReduced) return;

    let frame: number;
    let t = 0;

    const animate = () => {
      t += 0.0025; // Smoother, slower majestical progression
      const dy1 = Math.sin(t) * 16;
      const dy2 = Math.cos(t * 0.7) * 12;
      const dx1 = Math.cos(t * 0.5) * 8;
      const dx2 = Math.sin(t * 0.6) * 6;
      path1Ref.current?.setAttribute('transform', `translate(${dx1}, ${dy1})`);
      path2Ref.current?.setAttribute('transform', `translate(${dx2}, ${dy2})`);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, []);

  if (variant === 'divider') {
    return (
      <div className="h-28 w-full overflow-hidden" aria-hidden="true">
        <svg viewBox="0 0 1400 120" preserveAspectRatio="none" className="h-full w-full">
          <defs>
            <linearGradient id="ribbonDivider" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#E91E8C" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#1565F0" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#29ABE2" stopOpacity="0.5" />
            </linearGradient>
          </defs>
          <path
            d="M 0 60 C 250 10, 450 110, 700 60 S 1150 10, 1400 60"
            fill="none"
            stroke="url(#ribbonDivider)"
            strokeWidth="1.5"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-0 opacity-50" aria-hidden="true">
      <svg viewBox="0 0 1400 700" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
        <defs>
          <linearGradient id="ribbon1" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#E91E8C" />
            <stop offset="100%" stopColor="#1565F0" />
          </linearGradient>
          <linearGradient id="ribbon2" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1565F0" />
            <stop offset="100%" stopColor="#29ABE2" />
          </linearGradient>
        </defs>
        <path
          ref={path1Ref}
          d="M -100 420 C 200 260, 400 560, 700 380 S 1200 200, 1500 380"
          fill="none"
          stroke="url(#ribbon1)"
          strokeWidth="2.5"
          opacity="0.55"
        />
        <path
          ref={path2Ref}
          d="M -100 480 C 220 320, 420 620, 720 440 S 1220 260, 1500 440"
          fill="none"
          stroke="url(#ribbon2)"
          strokeWidth="1.5"
          opacity="0.35"
        />
      </svg>
    </div>
  );
};

export default RibbonBackground;
