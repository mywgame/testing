import React from 'react';
import { useTheme } from '../../../hooks/useTheme.ts';
import { SkeletonBlock } from './DashboardSkeleton.tsx';

export const SupportSkeleton: React.FC = () => {
  const { t } = useTheme();

  return (
    <div className="space-y-6 text-left animate-fade-in" id="support-skeleton">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Support Request left */}
        <div className={`lg:col-span-7 p-6 rounded-3xl border ${t.card} border-white/5 space-y-6`}>
          <div className="space-y-2 pb-4 border-b border-white/5">
            <SkeletonBlock className="h-4 w-40" />
            <SkeletonBlock className="h-3 w-72" />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <SkeletonBlock className="h-3 w-20" />
              <SkeletonBlock className="h-10 w-full rounded-xl" />
            </div>
            <div className="space-y-2">
              <SkeletonBlock className="h-3 w-28" />
              <SkeletonBlock className="h-28 w-full rounded-xl" />
            </div>
            <SkeletonBlock className="h-10 w-44 rounded-xl" />
          </div>
        </div>

        {/* Tickets and Knowledge base right */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Tickets List */}
          <div className={`p-6 rounded-3xl border ${t.card} border-white/5 space-y-4`}>
            <SkeletonBlock className="h-4 w-36" />
            <div className="border border-white/5 rounded-xl overflow-hidden">
              <div className="bg-white/3 p-3 flex justify-between border-b border-white/5">
                <SkeletonBlock className="h-3 w-10" />
                <SkeletonBlock className="h-3 w-20" />
                <SkeletonBlock className="h-3 w-12" />
              </div>
              <div className="divide-y divide-white/5">
                {[1, 2].map((i) => (
                  <div key={i} className="p-3 flex justify-between items-center">
                    <SkeletonBlock className="h-3.5 w-16" />
                    <div className="flex-1 px-4 space-y-1.5">
                      <SkeletonBlock className="h-3.5 w-32" />
                      <SkeletonBlock className="h-2.5 w-16" />
                    </div>
                    <SkeletonBlock className="h-5 w-12 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Guides Box */}
          <div className={`p-6 rounded-3xl border ${t.card} border-white/5 space-y-4`}>
            <SkeletonBlock className="h-4 w-40" />
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                  <div className="space-y-1.5">
                    <SkeletonBlock className="h-3.5 w-44" />
                    <SkeletonBlock className="h-2.5 w-28" />
                  </div>
                  <SkeletonBlock className="h-6 w-6" circle />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
