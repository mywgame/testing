/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const TextSkeleton: React.FC<SkeletonProps & { lines?: number }> = ({ className = '', lines = 1 }) => {
  return (
    <div className={`space-y-2.5 animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, i) => {
        // Varying widths for more organic-looking loading text lines
        const widthClass = i === lines - 1 && lines > 1 ? 'w-2/3' : 'w-full';
        return (
          <div
            key={i}
            className={`h-3 bg-gray-200/80 rounded-lg ${widthClass}`}
          />
        );
      })}
    </div>
  );
};

export const CardSkeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div className={`bg-white rounded-3xl p-6 border border-gray-100/80 shadow-sm animate-pulse space-y-5 ${className}`}>
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gray-200" />
        <div className="space-y-1.5 flex-grow">
          <div className="h-4 bg-gray-200 rounded-md w-1/3" />
          <div className="h-3 bg-gray-100 rounded-md w-1/4" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200/80 rounded-md w-full" />
        <div className="h-3 bg-gray-200/80 rounded-md w-5/6" />
        <div className="h-3 bg-gray-100/60 rounded-md w-2/3" />
      </div>
      <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
        <div className="h-3 bg-gray-200 rounded-md w-1/4" />
        <div className="h-4 bg-gray-200 rounded-md w-1/6" />
      </div>
    </div>
  );
};

export const StatSkeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div className={`flex flex-col items-center space-y-4 animate-pulse p-6 ${className}`}>
      <div className="w-10 h-10 rounded-xl bg-gray-200" />
      <div className="space-y-2 text-center w-full flex flex-col items-center">
        <div className="h-8 bg-gray-200 rounded-lg w-24" />
        <div className="h-3 bg-gray-100 rounded-md w-16" />
      </div>
      <div className="w-2 h-2 rounded-full bg-gray-200" />
    </div>
  );
};

export const ButtonSkeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div className={`h-11 bg-gray-200 rounded-xl animate-pulse ${className}`} />
  );
};

export default {
  Text: TextSkeleton,
  Card: CardSkeleton,
  Stat: StatSkeleton,
  Button: ButtonSkeleton,
};
