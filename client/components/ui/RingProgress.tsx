/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface RingProgressProps {
  percent: number;
  size?: number;
  stroke?: number;
  color?: string;
  trackColor?: string;
}

/**
 * Circular progress ring — pure presentation, all values via props.
 * Pixel-matched to the figma reference (`RingProgress` in App.tsx).
 */
export const RingProgress: React.FC<RingProgressProps> = ({
  percent,
  size = 100,
  stroke = 7,
  color = '#10b981',
  trackColor = 'rgba(128,128,128,0.15)',
}) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s ease' }}
      />
    </svg>
  );
};

export default RingProgress;
