/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useTheme } from '../../hooks/useTheme.ts';

/**
 * Decorative blurred gradient-orb background used behind the Dashboard shell,
 * matching the premium crypto-app reference design. Purely visual, rendered
 * once at the shell root — never duplicated per-page.
 */
export const GradientOrbs: React.FC = () => {
  const { t } = useTheme();

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className={`absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[120px] transform-gpu ${t.gradOrbs.a}`} />
      <div className={`absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[120px] transform-gpu ${t.gradOrbs.b}`} />
      <div className={`absolute top-1/2 left-0 w-[400px] h-[400px] rounded-full blur-[100px] transform-gpu ${t.gradOrbs.c}`} />

      {/* Frosted noise texture — pixel-matched to the figma reference */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
};

export default GradientOrbs;
