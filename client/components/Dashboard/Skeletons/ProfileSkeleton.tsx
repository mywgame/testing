import React from 'react';
import { useTheme } from '../../../hooks/useTheme.ts';
import { SkeletonBlock } from './DashboardSkeleton.tsx';

export const ProfileSkeleton: React.FC = () => {
  const { t } = useTheme();

  return (
    <div className="space-y-6 text-left animate-fade-in" id="profile-skeleton">
      {/* 1. Identity Banner Skeleton */}
      <div className={`relative rounded-3xl border p-6 flex flex-col sm:flex-row sm:items-center gap-5 ${t.card}`}>
        <SkeletonBlock className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl shrink-0" />
        <div className="flex-1 space-y-2 text-center sm:text-left">
          <SkeletonBlock className="h-6 w-48 mx-auto sm:mx-0" />
          <SkeletonBlock className="h-4 w-32 mx-auto sm:mx-0" />
        </div>
        <SkeletonBlock className="h-10 w-24 rounded-xl self-center sm:self-auto" />
      </div>

      {/* 2. Personal Information Fields Grid */}
      <div className={`p-5 sm:p-6 rounded-3xl border ${t.card} space-y-4`}>
        <SkeletonBlock className="h-4 w-36" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <SkeletonBlock className="h-3.5 w-24" />
              <SkeletonBlock className="h-11 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>

      {/* 3. Referral Commission Program card */}
      <div className={`p-5 sm:p-6 rounded-3xl border ${t.card} space-y-4`}>
        <SkeletonBlock className="h-4 w-40" />
        <div className="flex flex-col sm:flex-row gap-2">
          <SkeletonBlock className="h-11 flex-1 rounded-xl" />
          <SkeletonBlock className="h-11 w-32 rounded-xl" />
        </div>
      </div>
    </div>
  );
};
