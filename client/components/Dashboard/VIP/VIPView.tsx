/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Crown, AlertCircle, Sparkles, RefreshCw, ArrowLeft } from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme.ts';
import { api } from '../../../services/api.ts';
import { VIPProgress } from './VIPProgress.tsx';
import { VIPCardGrid } from './VIPCardGrid.tsx';
import { VipMatrixTier } from './types.ts';
import { VIPSkeleton } from '../Skeletons/VIPSkeleton.tsx';

interface VIPViewProps {
  dashboardData: any;
}

const DEFAULT_VIP_MATRIX: VipMatrixTier[] = [
  { tier: 'VIP1', minBalance: 10, levelA: 0, levelBCD: 0, teamTotal: 0, dpy: 0.0060 },
  { tier: 'VIP2', minBalance: 50, levelA: 2, levelBCD: 0, teamTotal: 2, dpy: 0.0080 },
  { tier: 'VIP3', minBalance: 100, levelA: 3, levelBCD: 6, teamTotal: 9, dpy: 0.0100 },
  { tier: 'VIP4', minBalance: 500, levelA: 6, levelBCD: 20, teamTotal: 26, dpy: 0.0120 },
  { tier: 'VIP5', minBalance: 1000, levelA: 7, levelBCD: 35, teamTotal: 42, dpy: 0.0130 },
  { tier: 'VIP6', minBalance: 3000, levelA: 8, levelBCD: 50, teamTotal: 58, dpy: 0.0150 },
  { tier: 'VIP7', minBalance: 5000, levelA: 15, levelBCD: 70, teamTotal: 85, dpy: 0.0200 },
  { tier: 'VIP8', minBalance: 10000, levelA: 30, levelBCD: 200, teamTotal: 230, dpy: 0.0250 },
];

export const VIPView: React.FC<VIPViewProps> = ({ dashboardData }) => {
  const { t } = useTheme();
  const [vipMatrix, setVipMatrix] = useState<VipMatrixTier[]>(DEFAULT_VIP_MATRIX);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatrix = async () => {
      try {
        setIsLoading(true);
        const response = await api.getVipMatrix();
        if (response && response.success && Array.isArray(response.data)) {
          setVipMatrix(response.data);
        } else {
          // Keep defaults
          console.warn('Failed to retrieve server matrix, falling back to client defaults.');
        }
      } catch (err) {
        console.error('Error fetching VIP matrix specs:', err);
        setError('Unable to fetch live specification data. Using client matrix cached configuration.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatrix();
  }, []);

  const currentVipTier = dashboardData?.vip?.tier || 'VIP1';
  const walletBalance = dashboardData?.wallet ? parseFloat(dashboardData.wallet.totalAssets) : 0;
  const vipStatus = dashboardData?.vip || null;

  return (
    <div className="space-y-8" id="vip-club-view">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
              <Crown className="w-5 h-5 animate-pulse" />
            </div>
            <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${t.text}`}>
              MetaFirm VIP Club
            </h1>
          </div>
          <p className={`text-xs sm:text-sm mt-1.5 ${t.textMuted}`}>
            Monitor your qualification parameters, audit levels, and elevate your daily smart yield rewards.
          </p>
        </div>
      </div>

      {/* 2. Feedback State (Non-blocking warning if using fallback) */}
      {error && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/15 text-amber-500 flex items-center space-x-2 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <VIPSkeleton />
      ) : (
        <div className="space-y-8">
          {/* 3. Progress Card */}
          <VIPProgress
            currentVipTier={currentVipTier}
            vipStatus={vipStatus}
            walletBalance={walletBalance}
            vipMatrix={vipMatrix}
            t={t}
          />

          {/* 4. Grid and Details */}
          <VIPCardGrid
            currentVipTier={currentVipTier}
            vipStatus={vipStatus}
            walletBalance={walletBalance}
            vipMatrix={vipMatrix}
            t={t}
          />
        </div>
      )}
    </div>
  );
};

export default VIPView;
