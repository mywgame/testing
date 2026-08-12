import React from 'react';
import { useTheme } from '../../../hooks/useTheme.ts';

// Reusable shimmer block component
export const SkeletonBlock: React.FC<{
  className?: string;
  circle?: boolean;
}> = ({ className = '', circle = false }) => {
  return (
    <div
      className={`relative overflow-hidden bg-white/5 dark:bg-white/5 border border-white/5 ${
        circle ? 'rounded-full' : 'rounded-xl'
      } ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
};

export const DashboardSkeleton: React.FC = () => {
  const { t } = useTheme();

  return (
    <div className="space-y-6 w-full text-left animate-fade-in" id="dashboard-skeleton">
      {/* 1. Total Balance Hero Card Skeleton */}
      <div className={`p-6 rounded-2xl sm:rounded-3xl border ${t.card} ${t.sep} relative overflow-hidden backdrop-blur-xl space-y-6`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <SkeletonBlock className="h-4 w-28" />
            <SkeletonBlock className="h-8 w-48 sm:h-10" />
          </div>
          <div className="flex items-center space-x-2">
            <SkeletonBlock className="h-10 w-24 rounded-xl" />
            <SkeletonBlock className="h-10 w-10" circle />
          </div>
        </div>
        <div className={`grid grid-cols-2 gap-4 pt-6 border-t ${t.sep}`}>
          <div className="space-y-1.5">
            <SkeletonBlock className="h-3 w-20" />
            <SkeletonBlock className="h-5 w-28" />
          </div>
          <div className="space-y-1.5">
            <SkeletonBlock className="h-3 w-24" />
            <SkeletonBlock className="h-5 w-32" />
          </div>
        </div>
      </div>

      {/* 2. Quick Action Buttons Skeleton */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-3">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonBlock key={i} className="h-11 sm:h-14 rounded-xl sm:rounded-2xl" />
        ))}
      </div>

      {/* 3. Income Cards Skeleton (4 grid columns) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`p-4 rounded-2xl border ${t.cardInner} border-white/5 space-y-3`}>
            <div className="flex items-center justify-between">
              <SkeletonBlock className="h-3 w-20" />
              <SkeletonBlock className="h-7 w-7" circle />
            </div>
            <div className="space-y-1.5">
              <SkeletonBlock className="h-5 w-24" />
              <SkeletonBlock className="h-3.5 w-16" />
            </div>
          </div>
        ))}
      </div>

      {/* 4. Daily Claim + Monthly Earnings Chart Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Claim Box */}
        <div className={`p-5 rounded-2xl border ${t.card} ${t.sep} space-y-4 lg:col-span-1`}>
          <div className="flex items-center justify-between">
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="h-4 w-12" />
          </div>
          <div className="flex justify-center py-4">
            <SkeletonBlock className="h-28 w-28" circle />
          </div>
          <div className="space-y-2">
            <SkeletonBlock className="h-10 w-full rounded-xl" />
            <SkeletonBlock className="h-3 w-32 mx-auto" />
          </div>
        </div>

        {/* Chart Box */}
        <div className={`p-5 rounded-2xl border ${t.card} ${t.sep} space-y-4 lg:col-span-2`}>
          <div className="flex items-center justify-between">
            <SkeletonBlock className="h-4 w-36" />
            <SkeletonBlock className="h-6 w-24" />
          </div>
          <SkeletonBlock className="h-44 w-full" />
        </div>
      </div>

      {/* 5. Network Levels + Recent Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Network Box */}
        <div className={`p-5 rounded-2xl border ${t.card} ${t.sep} space-y-4 lg:col-span-2`}>
          <div className="flex items-center justify-between">
            <SkeletonBlock className="h-4 w-32" />
            <SkeletonBlock className="h-4 w-16" />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`p-3 rounded-xl bg-white/3 space-y-2 border border-white/5`}>
                <SkeletonBlock className="h-3 w-8 mx-auto" />
                <SkeletonBlock className="h-4 w-12 mx-auto" />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Box */}
        <div className={`p-5 rounded-2xl border ${t.card} ${t.sep} space-y-4 lg:col-span-1`}>
          <div className="flex items-center justify-between">
            <SkeletonBlock className="h-4 w-28" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3">
                <SkeletonBlock className="h-8 w-8" circle />
                <div className="flex-1 space-y-1.5">
                  <SkeletonBlock className="h-3.5 w-3/4" />
                  <SkeletonBlock className="h-2.5 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
