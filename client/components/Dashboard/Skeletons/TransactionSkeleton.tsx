import React from 'react';
import { useTheme } from '../../../hooks/useTheme.ts';
import { SkeletonBlock } from './DashboardSkeleton.tsx';

export const TransactionSkeleton: React.FC = () => {
  const { t } = useTheme();

  return (
    <div className="space-y-6 text-left animate-fade-in" id="transaction-skeleton">
      {/* 1. Page Header Skeleton */}
      <div className="space-y-2">
        <SkeletonBlock className="h-8 w-60 sm:h-9" />
        <SkeletonBlock className="h-4 w-3/4 max-w-xl" />
      </div>

      {/* 2. Sliding Category Tabs & Search input */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2">
        <div className="flex flex-wrap gap-1 p-1 rounded-2xl bg-white/3 border border-white/5">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonBlock key={i} className="h-9 w-28 rounded-xl" />
          ))}
        </div>
        <SkeletonBlock className="h-10 w-full lg:max-w-xs rounded-xl" />
      </div>

      {/* 3. Responsive Transaction Ledger Skeleton */}
      {/* Desktop/Tablet (hidden on mobile) */}
      <div className="hidden sm:block w-full overflow-hidden rounded-2xl border border-white/5 bg-white/3">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/3">
              {[1, 2, 3, 4, 5].map((i) => (
                <th key={i} className="py-4 px-4">
                  <SkeletonBlock className="h-3 w-16" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {[1, 2, 3, 4, 5, 6].map((row) => (
              <tr key={row}>
                <td className="py-4 px-4">
                  <SkeletonBlock className="h-3.5 w-24" />
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-2">
                    <SkeletonBlock className="h-6 w-6" circle />
                    <SkeletonBlock className="h-3.5 w-20" />
                  </div>
                </td>
                <td className="py-4 px-4">
                  <SkeletonBlock className="h-3.5 w-16" />
                </td>
                <td className="py-4 px-4">
                  <SkeletonBlock className="h-3.5 w-32" />
                </td>
                <td className="py-4 px-4">
                  <SkeletonBlock className="h-5 w-20 rounded-full" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile-Friendly Stacked Rows Skeleton (hidden on desktop/tablet) */}
      <div className="block sm:hidden w-full rounded-2xl border border-white/5 bg-white/3 overflow-hidden divide-y divide-white/5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-start space-x-3 py-3.5 px-3">
            {/* Left Column: Icon circle */}
            <SkeletonBlock className="h-8 w-8 mt-0.5" circle />

            {/* Right Column: 3-line details structured row */}
            <div className="flex-1 space-y-2">
              {/* Line 1: Type and Amount */}
              <div className="flex justify-between items-center">
                <SkeletonBlock className="h-4 w-24" />
                <SkeletonBlock className="h-4 w-16" />
              </div>
              {/* Line 2: ID and Status */}
              <div className="flex justify-between items-center">
                <SkeletonBlock className="h-3.5 w-20" />
                <SkeletonBlock className="h-5 w-16 rounded-full" />
              </div>
              {/* Line 3: Date */}
              <SkeletonBlock className="h-3 w-28" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
