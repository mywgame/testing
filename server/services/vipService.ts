/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { vipRepository } from '../repositories/vipRepository.ts';
import { walletRepository } from '../repositories/walletRepository.ts';
import { referralService } from './referralService.ts';
import { referralRepository } from '../repositories/referralRepository.ts';
import { notificationService } from './notificationService.ts';
import { auditRepository } from '../repositories/auditRepository.ts';

export class VipService {
  /**
   * Helper to fetch a list of VIP thresholds and info
   */
  getVipMatrix() {
    return [
      { tier: 'VIP1', minBalance: 10, levelA: 0, levelBCD: 0, teamTotal: 0, dpy: 0.0060 },
      { tier: 'VIP2', minBalance: 50, levelA: 2, levelBCD: 0, teamTotal: 2, dpy: 0.0080 },
      { tier: 'VIP3', minBalance: 100, levelA: 3, levelBCD: 6, teamTotal: 9, dpy: 0.0100 },
      { tier: 'VIP4', minBalance: 500, levelA: 6, levelBCD: 20, teamTotal: 26, dpy: 0.0120 },
      { tier: 'VIP5', minBalance: 1000, levelA: 7, levelBCD: 35, teamTotal: 42, dpy: 0.0130 },
      { tier: 'VIP6', minBalance: 3000, levelA: 8, levelBCD: 50, teamTotal: 58, dpy: 0.0150 },
      { tier: 'VIP7', minBalance: 5000, levelA: 15, levelBCD: 70, teamTotal: 85, dpy: 0.0200 },
      { tier: 'VIP8', minBalance: 10000, levelA: 30, levelBCD: 200, teamTotal: 230, dpy: 0.0250 },
    ];
  }

  /**
   * Calculate valid team counts for levels 1 to 4 under a user
   */
  async calculateTeamCounts(userId: string) {
    const descendants = await referralService.getDownlineDescendants(userId);
    
    let levelAValidCount = 0;
    let levelBcdValidCount = 0;

    const childWallets = await Promise.all(
      descendants.map(async (d) => {
        const wallet = await walletRepository.findByUserId(d.childId);
        return {
          referralLevel: d.referralLevel,
          wallet,
        };
      })
    );

    for (const cw of childWallets) {
      if (!cw.wallet) continue;
      const totalBalance = parseFloat(cw.wallet.availableBalance) + parseFloat(cw.wallet.lockedBalance);
      if (totalBalance >= 50.0) {
        if (cw.referralLevel === 1) {
          levelAValidCount++;
        } else if (cw.referralLevel >= 2 && cw.referralLevel <= 4) {
          levelBcdValidCount++;
        }
      }
    }

    return {
      levelAValidCount,
      levelBcdValidCount,
      teamTotalCount: levelAValidCount + levelBcdValidCount,
    };
  }

  /**
   * Recalculates and updates a user's active VIP tier based on wallet balances and team qualification
   */
  async recalculateVip(userId: string) {
    const vip = await vipRepository.findByUserId(userId);
    if (!vip) return null;

    const wallet = await walletRepository.findByUserId(userId);
    if (!wallet) return null;

    const walletBalance = parseFloat(wallet.availableBalance) + parseFloat(wallet.lockedBalance);
    const { levelAValidCount, levelBcdValidCount, teamTotalCount } = await this.calculateTeamCounts(userId);

    const calculatedTier = this.determineEligibleVip(walletBalance, levelAValidCount, levelBcdValidCount);
    const previousTier = vip.tier;
    const currentPoints = parseFloat(wallet.totalDeposited);

    const updatedVip = await vipRepository.updateVipStatus(vip.id, {
      tier: calculatedTier,
      points: currentPoints.toFixed(8),
      levelAValidCount,
      levelBcdValidCount,
      teamTotalCount,
    });

    if (calculatedTier !== previousTier) {
      await vipRepository.createVipHistoryEntry({
        userId,
        previousTier,
        newTier: calculatedTier,
        reason: `Auto VIP recalculation based on wallet balance (${walletBalance.toFixed(2)} USDT) and team qualification (A:${levelAValidCount}, BCD:${levelBcdValidCount}).`,
      });

      const prevNum = parseInt(previousTier.replace('VIP', '') || '1', 10);
      const currNum = parseInt(calculatedTier.replace('VIP', '') || '1', 10);
      const isUpgrade = currNum > prevNum;

      await notificationService.createStructuredNotification(userId, {
        title: isUpgrade ? 'VIP Level Upgraded!' : 'VIP Level Adjusted',
        description: isUpgrade 
          ? `Congratulations! Your VIP membership has been upgraded from ${previousTier} to ${calculatedTier}.`
          : `Your VIP membership has been adjusted from ${previousTier} to ${calculatedTier}.`,
        icon: isUpgrade ? 'Sparkles' : 'ShieldAlert',
        type: 'vip',
        priority: 'HIGH',
      });

      // Audit Log — Business Logic Spec Section 14 requires every VIP Change to be audited.
      await auditRepository.createAuditLog({
        actorUid: 'SYSTEM',
        userId,
        action: 'VIP_TIER_CHANGE',
        resource: `vip_status/${vip.id}`,
        oldValue: previousTier,
        newValue: calculatedTier,
      });

      // Propagate recalculation up to direct parent
      const parentRel = await referralRepository.findRelationshipByChildId(userId);
      if (parentRel && parentRel.referralLevel === 1) {
        await this.recalculateVip(parentRel.parentId);
      }
    }

    return updatedVip;
  }

  private determineEligibleVip(walletBalance: number, levelA: number, levelBCD: number): string {
    const teamTotal = levelA + levelBCD;

    if (walletBalance >= 10000 && levelA >= 30 && levelBCD >= 200 && teamTotal >= 230) {
      return 'VIP8';
    }
    if (walletBalance >= 5000 && levelA >= 15 && levelBCD >= 70 && teamTotal >= 85) {
      return 'VIP7';
    }
    if (walletBalance >= 3000 && levelA >= 8 && levelBCD >= 50 && teamTotal >= 58) {
      return 'VIP6';
    }
    if (walletBalance >= 1000 && levelA >= 7 && levelBCD >= 35 && teamTotal >= 42) {
      return 'VIP5';
    }
    if (walletBalance >= 500 && levelA >= 6 && levelBCD >= 20 && teamTotal >= 26) {
      return 'VIP4';
    }
    if (walletBalance >= 100 && levelA >= 3 && levelBCD >= 6 && teamTotal >= 9) {
      return 'VIP3';
    }
    if (walletBalance >= 50 && levelA >= 2 && teamTotal >= 2) {
      return 'VIP2';
    }
    return 'VIP1';
  }
}

export const vipService = new VipService();
export default vipService;
