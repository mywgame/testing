/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface LoaderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoaderProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-3',
  };

  return (
    <div
      className={`border-gray-200 border-t-blue-600 rounded-full animate-spin ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
};

interface ProgressBarProps {
  value: number; // 0 to 100
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, className = '' }) => {
  return (
    <div className={`w-full bg-gray-100 rounded-full h-2.5 overflow-hidden ${className}`}>
      <div
        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
};

interface CircularProgressProps {
  value: number; // 0 to 100
  size?: number; // width/height in px
  strokeWidth?: number;
  className?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  size = 48,
  strokeWidth = 4,
  className = '',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(Math.max(value, 0), 100) / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track circle */}
        <circle
          className="text-gray-100"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Value circle */}
        <circle
          className="text-blue-600 transition-all duration-300 ease-out"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <span className="absolute text-2xs font-bold font-mono text-gray-700">
        {Math.round(value)}%
      </span>
    </div>
  );
};

// Reusable premium skeleton loaders
export const TextSkeleton: React.FC<{ className?: string; lines?: number }> = ({ className = '', lines = 1 }) => {
  return (
    <div className={`space-y-2.5 animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, i) => {
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

export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`bg-white rounded-[32px] p-6 border border-gray-100/80 shadow-xs animate-pulse space-y-5 ${className}`}>
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-2xl bg-gray-200" />
        <div className="space-y-1.5 flex-grow">
          <div className="h-4 bg-gray-200/80 rounded-md w-1/3" />
          <div className="h-3 bg-gray-100 rounded-md w-1/4" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200/80 rounded-md w-full" />
        <div className="h-3 bg-gray-200/80 rounded-md w-5/6" />
        <div className="h-3 bg-gray-100 rounded-md w-2/3" />
      </div>
      <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
        <div className="h-3 bg-gray-200 rounded-md w-1/4" />
        <div className="h-4 bg-gray-200 rounded-md w-1/6" />
      </div>
    </div>
  );
};

export const StatSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex flex-col items-center space-y-4 animate-pulse p-6 bg-white border border-gray-100/80 rounded-[32px] ${className}`}>
      <div className="w-10 h-10 rounded-2xl bg-gray-200" />
      <div className="space-y-2 text-center w-full flex flex-col items-center">
        <div className="h-8 bg-gray-200 rounded-lg w-24" />
        <div className="h-3 bg-gray-100 rounded-md w-16" />
      </div>
    </div>
  );
};

export const ButtonSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`h-11 bg-gray-200 rounded-2xl animate-pulse ${className}`} />
  );
};

export const Skeleton = {
  Text: TextSkeleton,
  Card: CardSkeleton,
  Stat: StatSkeleton,
  Button: ButtonSkeleton,
};
