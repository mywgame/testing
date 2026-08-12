import React from 'react';
import { useTheme } from '../../../hooks/useTheme.ts';
import { SkeletonBlock } from './DashboardSkeleton.tsx';

export const TeamSkeleton: React.FC = () => {
  const { t } = useTheme();

  return (
    <div className="space-y-6 text-left animate-fade-in" id="team-skeleton">
      {/* 1. Header Skeleton */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <SkeletonBlock className="h-8 w-8 rounded-xl" />
          <SkeletonBlock className="h-8 w-56 sm:h-9" />
        </div>
        <SkeletonBlock className="h-4 w-3/4 max-w-xl" />
      </div>

      {/* 2. Team Stats Section Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`p-5 rounded-2xl border ${t.card} ${t.sep} flex items-center justify-between`}>
            <div className="space-y-2">
              <SkeletonBlock className="h-3 w-28" />
              <SkeletonBlock className="h-7 w-20" />
              <SkeletonBlock className="h-2.5 w-32" />
            </div>
            <SkeletonBlock className="h-10 w-10" circle />
          </div>
        ))}
      </div>

      {/* 3. Level Switching Tabs & Search Row Skeleton */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-4">
        <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-white/3 border border-white/5">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonBlock key={i} className="h-9 w-24 rounded-xl" />
          ))}
        </div>
        <SkeletonBlock className="h-10 w-full lg:max-w-xs rounded-xl" />
      </div>

      {/* 4. Team Members Table Skeleton */}
      <div className={`rounded-2xl border border-white/5 bg-white/3 overflow-hidden`}>
        <div className="border-b border-white/5 bg-white/3 p-4 flex justify-between">
          <SkeletonBlock className="h-4 w-24" />
          <SkeletonBlock className="h-4 w-16" />
        </div>
        <div className="divide-y divide-white/5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <SkeletonBlock className="h-8 w-8" circle />
                <div className="space-y-1.5">
                  <SkeletonBlock className="h-4 w-32" />
                  <SkeletonBlock className="h-2.5 w-16" />
                </div>
              </div>
              <SkeletonBlock className="h-5 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
