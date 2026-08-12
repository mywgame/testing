/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface VipMatrixTier {
  tier: string;
  minBalance: number;
  levelA: number;
  levelBCD: number;
  teamTotal: number;
  dpy: number;
}

export interface VipStatusData {
  tier: string;
  points: string;
  levelAValidCount: number;
  levelBcdValidCount: number;
  teamTotalCount: number;
  assignedAt: string | null;
}
