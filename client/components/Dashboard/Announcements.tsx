/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Megaphone, Calendar, ChevronRight, Pin } from 'lucide-react';
import { Card } from '../ui/Cards/index.tsx';
import { useTheme } from '../../hooks/useTheme.ts';
import { api } from '../../services/api.ts';

interface AnnouncementItem {
  id: string | number;
  category?: string;
  priority?: string;
  title?: string;
  headline?: string;
  message?: string;
  content?: string;
  excerpt?: string;
  date?: string;
  createdAt?: string;
  pinned?: boolean;
}

/**
 * Dynamic Announcements Feed.
 * Displays only live platform announcements published by Admin.
 * If no announcements exist, this component is completely hidden (returns null).
 */
export const Announcements: React.FC = () => {
  const { t } = useTheme();
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchAnnouncements = async () => {
      try {
        const res = await api.getUserAnnouncements();
        if (isMounted && res.success && Array.isArray(res.data)) {
          setAnnouncements(res.data);
        }
      } catch {
        // In case of error or no announcements, keep empty
        if (isMounted) {
          setAnnouncements([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAnnouncements();
    return () => {
      isMounted = false;
    };
  }, []);

  // Completely hide section if loading or no announcements from admin exist
  if (loading || announcements.length === 0) {
    return null;
  }

  const getCatBadge = (category?: string, priority?: string) => {
    const label = category || priority || 'Notice';
    const lower = label.toLowerCase();

    if (lower.includes('audit')) {
      return (
        <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <span>{label}</span>
        </span>
      );
    }

    if (lower.includes('security') || lower.includes('critical') || lower.includes('urgent')) {
      return (
        <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
          <span>{label}</span>
        </span>
      );
    }

    if (lower.includes('governance') || lower.includes('vip')) {
      return (
        <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold uppercase tracking-wider text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
          <span>{label}</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
        <span>{label}</span>
      </span>
    );
  };

  return (
    <Card id="announcements-card" className={`backdrop-blur-lg border text-left p-5 sm:p-6 w-full rounded-2xl transition-all duration-300 ${t.card}`}>
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-500">
              <Megaphone className="w-4 h-4" />
            </div>
            <h3 className={`text-sm font-sans font-extrabold tracking-wider uppercase ${t.text}`}>
              Official Announcements
            </h3>
          </div>
          <p className={`text-xs font-medium ${t.textMuted}`}>
            Official platform broadcasts and notices directly from administration.
          </p>
        </div>

        {/* Right side status badge */}
        <div className="flex items-center space-x-3 shrink-0">
          <span className={`text-[10px] font-mono font-bold uppercase tracking-widest border px-2.5 py-1 rounded-full ${t.cardInner} ${t.sep} ${t.textMuted}`}>
            Live Feed
          </span>
        </div>
      </div>

      {/* Main content grid */}
      <div className="flex items-center gap-5 w-full">
        <div className={`grid grid-cols-1 ${announcements.length === 1 ? 'md:grid-cols-1' : announcements.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-5 flex-grow`}>
          {announcements.map((item) => {
            const title = item.title || item.headline || 'Announcement';
            const body = item.message || item.content || item.excerpt || '';
            const dateStr = item.date || item.createdAt || '';

            return (
              <article
                key={item.id}
                className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between min-h-[145px] ${t.cardInner} ${t.sep} hover:border-cyan-500/30`}
              >
                <div className="space-y-3">
                  {/* Tag, Pin & Date row */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {item.pinned && (
                        <span className="p-1 rounded bg-amber-500/10 text-amber-400" title="Pinned Announcement">
                          <Pin className="w-3 h-3" />
                        </span>
                      )}
                      {getCatBadge(item.category, item.priority)}
                    </div>
                    {dateStr && (
                      <span className={`text-[10px] font-mono font-bold flex items-center ${t.textMuted}`}>
                        <Calendar className="w-3.5 h-3.5 mr-1" /> {dateStr}
                      </span>
                    )}
                  </div>

                  {/* Announcement Title */}
                  <h4 className={`font-sans font-extrabold text-xs leading-snug hover:text-cyan-500 transition-colors ${t.text}`}>
                    {title}
                  </h4>

                  {/* Message Body */}
                  {body && (
                    <p className={`text-xs leading-relaxed font-medium ${t.textMuted}`}>
                      {body}
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {announcements.length > 3 && (
          <button className={`hidden md:flex items-center justify-center w-10 h-10 rounded-full border transition-all shrink-0 cursor-pointer ${t.sep} ${t.textMuted} hover:text-cyan-500 hover:border-cyan-500/30`}>
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </Card>
  );
};

export default Announcements;
