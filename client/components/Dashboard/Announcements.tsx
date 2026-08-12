/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Megaphone, Calendar, ChevronRight } from 'lucide-react';
import { Card } from '../ui/Cards/index.tsx';
import { useTheme } from '../../hooks/useTheme.ts';

interface AnnouncementItem {
  id: number;
  category: 'Audit' | 'Security' | 'Governance';
  title: string;
  excerpt: string;
  date: string;
}

/**
 * Announcements feed. Preserves the original 3-item feature set (category
 * badge, title, excerpt, date, "View all") — only the visual layer was
 * reskinned: dark/light theme-aware, and the section is labeled plainly
 * as "Announcements" instead of internal jargon.
 */
export const Announcements: React.FC = () => {
  const { t } = useTheme();

  const announcements: AnnouncementItem[] = [
    {
      id: 1,
      category: 'Audit',
      title: 'Q2 Sovereign Reserve Verification Seal Issued',
      excerpt: 'Sovereign tier compliance sweeps successfully completed with a 135% active collateral buffer fully certified by lead external node partners.',
      date: 'June 27, 2025',
    },
    {
      id: 2,
      category: 'Security',
      title: 'Mandatory Ledger Shield Upgrade Sequence Complete',
      excerpt: 'All guardian ledgers upgraded across global nodes. Multisig threshold recalibration (88%) successfully applied.',
      date: 'June 24, 2025',
    },
    {
      id: 3,
      category: 'Governance',
      title: 'Institutional Governance Snapshot Finalized',
      excerpt: 'Voting snapshot for network treasury reallocation and validator incentive model concluded. New epoch cycle initiated.',
      date: 'June 21, 2025',
    },
  ];

  const getCatBadge = (category: 'Audit' | 'Security' | 'Governance') => {
    switch (category) {
      case 'Audit':
        return (
          <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold uppercase tracking-wider text-cyan-500 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
            <span>Audit</span>
          </span>
        );
      case 'Security':
        return (
          <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold uppercase tracking-wider text-rose-500 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>Security</span>
          </span>
        );
      case 'Governance':
        return (
          <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold uppercase tracking-wider text-violet-500 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
            <span>Governance</span>
          </span>
        );
    }
  };

  return (
    <Card id="announcements-card" className={`backdrop-blur-lg border text-left p-5 sm:p-6 w-full rounded-2xl transition-all duration-300 ${t.card}`}>

      {/* Top Header Row with Title Block on Left and Badge + Button on Right */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-500">
              <Megaphone className="w-4 h-4" />
            </div>
            <h3 className={`text-sm font-sans font-extrabold tracking-wider uppercase ${t.text}`}>
              Announcements
            </h3>
          </div>
          <p className={`text-xs font-medium ${t.textMuted}`}>
            Keep track of corporate actions, network protocol developments, and structural smart contract sweeps.
          </p>
        </div>

        {/* Right side controls */}
        <div className="flex items-center space-x-3 shrink-0">
          <span className={`text-[10px] font-mono font-bold uppercase tracking-widest border px-2.5 py-1 rounded-full ${t.cardInner} ${t.sep} ${t.textMuted}`}>
            Live Feed
          </span>
          <button className={`px-3.5 py-1 text-[10px] font-sans font-bold rounded-full transition-all cursor-pointer border ${t.sep} ${t.textSub} hover:text-cyan-500`}>
            View all
          </button>
        </div>
      </div>

      {/* Main content split: 3-column Grid + Scroll Trigger arrow */}
      <div className="flex items-center gap-5 w-full">
        {/* The 3 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 flex-grow">
          {announcements.map((item) => (
            <article
              key={item.id}
              className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between min-h-[145px] ${t.cardInner} ${t.sep} hover:border-cyan-500/30`}
            >
              <div className="space-y-3">
                {/* Tag & Date row */}
                <div className="flex items-center justify-between">
                  {getCatBadge(item.category)}
                  <span className={`text-[10px] font-mono font-bold flex items-center ${t.textMuted}`}>
                    <Calendar className="w-3.5 h-3.5 mr-1" /> {item.date}
                  </span>
                </div>

                {/* Announcement Title */}
                <h4 className={`font-sans font-extrabold text-xs leading-snug hover:text-cyan-500 transition-colors ${t.text}`}>
                  {item.title}
                </h4>

                {/* Excerpt */}
                <p className={`text-xs leading-relaxed font-medium ${t.textMuted}`}>
                  {item.excerpt}
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* Right Chevron next/scroll button */}
        <button className={`hidden md:flex items-center justify-center w-10 h-10 rounded-full border transition-all shrink-0 cursor-pointer ${t.sep} ${t.textMuted} hover:text-cyan-500 hover:border-cyan-500/30`}>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

    </Card>
  );
};

export default Announcements;
