import React from 'react';
import { useTheme } from '../../../hooks/useTheme.ts';
import { SkeletonBlock } from './DashboardSkeleton.tsx';

export const VIPSkeleton: React.FC = () => {
  const { t } = useTheme();

  return (
    <div className="space-y-8 animate-fade-in" id="vip-skeleton">
      {/* 1. Page Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <SkeletonBlock className="h-8 w-8 rounded-xl" />
            <SkeletonBlock className="h-8 w-60 sm:h-9" />
          </div>
          <SkeletonBlock className="h-4 w-3/4 max-w-xl" />
        </div>
      </div>

      {/* 2. Progress Card Skeleton */}
      <div className={`p-5 sm:p-6 rounded-2xl sm:rounded-3xl border ${t.card} ${t.sep} space-y-6 relative overflow-hidden`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <SkeletonBlock className="h-5 w-40" />
            <SkeletonBlock className="h-4 w-32" />
          </div>
          <div className="flex items-center space-x-3">
            <SkeletonBlock className="h-10 w-28 rounded-xl" />
            <SkeletonBlock className="h-10 w-32 rounded-xl" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <SkeletonBlock className="h-3 w-20" />
            <SkeletonBlock className="h-3 w-16" />
          </div>
          <SkeletonBlock className="h-3.5 w-full rounded-full" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-1.5">
              <SkeletonBlock className="h-2.5 w-16" />
              <SkeletonBlock className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>

      {/* 3. Grid and Details Cards Skeleton */}
      <div className="space-y-4">
        <SkeletonBlock className="h-5 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className={`p-4 rounded-2xl border ${t.cardInner} border-white/5 space-y-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <SkeletonBlock className="h-6 w-6" circle />
                  <SkeletonBlock className="h-4.5 w-14" />
                </div>
                <SkeletonBlock className="h-5 w-16 rounded-full" />
              </div>
              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="flex justify-between">
                  <SkeletonBlock className="h-2.5 w-16" />
                  <SkeletonBlock className="h-2.5 w-12" />
                </div>
                <div className="flex justify-between">
                  <SkeletonBlock className="h-2.5 w-20" />
                  <SkeletonBlock className="h-2.5 w-8" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
