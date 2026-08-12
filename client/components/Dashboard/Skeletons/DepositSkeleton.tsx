import React from 'react';
import { useTheme } from '../../../hooks/useTheme.ts';
import { SkeletonBlock } from './DashboardSkeleton.tsx';

export const DepositSkeleton: React.FC = () => {
  const { t } = useTheme();

  return (
    <div className="space-y-6 max-w-xl text-left animate-fade-in" id="deposit-skeleton">
      {/* 1. Header Skeleton */}
      <div className="space-y-2">
        <SkeletonBlock className="h-8 w-56 sm:h-9" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-5/6" />
      </div>

      {/* 2. Network Selection */}
      <div className="space-y-2 pt-2">
        <SkeletonBlock className="h-3 w-36" />
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {[1, 2, 3].map((i) => (
            <SkeletonBlock key={i} className="h-9 rounded-2xl" />
          ))}
        </div>
      </div>

      {/* 3. QR Code Box Section */}
      <div className="p-6 rounded-2xl bg-black/25 border border-white/5 space-y-3 max-w-xs mx-auto sm:mx-0 flex flex-col items-center">
        <SkeletonBlock className="w-32 h-32 rounded-lg" />
        <SkeletonBlock className="h-3 w-28" />
      </div>

      {/* 4. Deposit Address Box */}
      <div className="space-y-2">
        <SkeletonBlock className="h-3 w-44" />
        <div className="flex flex-col sm:flex-row gap-2">
          <SkeletonBlock className="h-11 flex-1 rounded-2xl" />
          <SkeletonBlock className="h-11 w-36 rounded-2xl" />
        </div>
      </div>

      {/* 5. Deposit History */}
      <div className="pt-6 border-t border-white/5 space-y-3">
        <div className="flex items-center space-x-2">
          <SkeletonBlock className="h-4 w-4" circle />
          <SkeletonBlock className="h-3.5 w-24" />
        </div>
        <div className="space-y-2.5">
          {[1, 2].map((i) => (
            <div key={i} className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-2">
              <div className="flex justify-between">
                <SkeletonBlock className="h-4 w-20" />
                <SkeletonBlock className="h-4 w-16" />
              </div>
              <div className="flex justify-between">
                <SkeletonBlock className="h-3 w-28" />
                <SkeletonBlock className="h-4 w-14 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
