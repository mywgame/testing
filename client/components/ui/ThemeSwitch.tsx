/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme.ts';

interface ThemeSwitchProps {
  className?: string;
}

/**
 * Dark/Light pill toggle, shared across TopNav (desktop) and the mobile
 * header. Purely a presentation-layer control — flips ThemeContext only.
 */
export const ThemeSwitch: React.FC<ThemeSwitchProps> = ({ className = '' }) => {
  const { isDark, toggleTheme, t } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className={`relative flex items-center w-14 h-8 rounded-full border backdrop-blur-xl transition-colors duration-300 cursor-pointer shrink-0 ${t.pill} ${t.switchBorder} ${className}`}
    >
      <span
        className={`absolute top-0.5 flex items-center justify-center w-6.5 h-6.5 rounded-full shadow-md transition-all duration-300 ${
          isDark
            ? 'left-[calc(100%-1.75rem-2px)] bg-gradient-to-br from-indigo-500 to-violet-600'
            : 'left-0.5 bg-gradient-to-br from-amber-400 to-orange-500'
        }`}
      >
        {isDark ? <Moon className="w-3.5 h-3.5 text-white" /> : <Sun className="w-3.5 h-3.5 text-white" />}
      </span>
    </button>
  );
};

export default ThemeSwitch;
