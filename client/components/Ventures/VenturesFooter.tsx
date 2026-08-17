/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import logoMarkImg from '../../../assets/images/branding/logo-mark.png';

export const VenturesFooter: React.FC = () => {
  return (
    <footer className="py-10 px-4 sm:px-6 border-t border-[rgba(99,135,255,0.1)]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src={logoMarkImg}
            alt="MetaFirm mark"
            referrerPolicy="no-referrer"
            className="h-6 sm:h-7 w-auto object-contain"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
          <span className="text-slate-600 text-xs">·</span>
          <span className="text-slate-400 text-xs font-display-outfit tracking-wider uppercase font-semibold">
            Ventures Division
          </span>
        </div>

        <p className="text-slate-500 text-xs text-center max-w-xl leading-relaxed">
          All ventures are in development. No financial returns or investment outcomes are guaranteed
          or implied. MetaFirm Ventures showcases infrastructure initiatives only.
        </p>

        <p className="text-slate-500 text-xs font-mono">© {new Date().getFullYear()} MetaFirm</p>
      </div>
    </footer>
  );
};
