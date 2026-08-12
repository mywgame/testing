/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { salaryRepository } from '../repositories/salaryRepository.ts';
import { walletRepository } from '../repositories/walletRepository.ts';
import { vipRepository } from '../repositories/vipRepository.ts';
import { referralService } from './referralService.ts';
import { transactionRepository } from '../repositories/transactionRepository.ts';
import { incomeRepository } from '../repositories/incomeRepository.ts';
import { notificationService } from './notificationService.ts';
import { auditRepository } from '../repositories/auditRepository.ts';

export class SalaryService {
  /**
   * Helper to map VIP2 counts to Star titles and reward amounts
   */
  getIncentiveTier(vip2Count: number) {
    if (vip2Count >= 100) {
      return { starTitle: 'Diamond Star', reward: 250.00 };
    }
    if (vip2Count >= 50) {
      return { starTitle: 'Platinum Star', reward: 100.00 };
    }
    if (vip2Count >= 25) {
      return { starTitle: 'Gold Star', reward: 50.00 };
    }
    if (vip2Count >= 10) {
      return { starTitle: 'Silver Star', reward: 20.00 };
    }
    if (vip2Count >= 5) {
      return { starTitle: 'Bronze Star', reward: 10.00 };
    }
    return { starTitle: null, reward: 0.00 };
  }

  /**
   * Calculate and execute the Weekly Leadership Incentive payout for a specific user.
   * This is run weekly or triggered on demand by an administrator.
   */
  async processWeeklySalaryForUser(userId: string, payPeriodStart: Date, payPeriodEnd: Date) {
    const wallet = await walletRepository.findByUserId(userId);
    if (!wallet) {
      throw new Error(`Wallet not found for user ${userId}`);
    }

    // BUSINESS RULE: Prevent double-payout — if an admin (accidentally or deliberately)
    // triggers the weekly batch job more than once for an overlapping window, a user
    // must never be paid twice for the same Weekly Leadership Incentive period.
    const overlapping = await salaryRepository.findOverlappingPayout(userId, payPeriodStart, payPeriodEnd);
    if (overlapping) {
      return {
        userId,
        qualifiedVip2Count: overlapping.qualifiedVip2Count,
        starTitle: overlapping.starTitle || 'Unqualified',
        reward: 0,
        paid: false,
        skipped: true,
        reason: `Already paid for an overlapping period on ${new Date(overlapping.paidAt).toISOString()}.`,
      };
    }

    // 1. Fetch all Level A to D descendants
    const descendants = await referralService.getDownlineDescendants(userId);

    // 2. Count active VIP2+ members
    let qualifiedVip2Count = 0;
    const vipStatuses = await Promise.all(
      descendants.map(async (d) => {
        const vip = await vipRepository.findByUserId(d.childId);
        return vip ? vip.tier : 'VIP1';
      })
    );

    for (const tier of vipStatuses) {
      // "qualified VIP2 members" -> VIP2 tier or higher
      if (tier !== 'VIP1') {
        qualifiedVip2Count++;
      }
    }

    // 3. Determine reward eligibility
    const { starTitle, reward } = this.getIncentiveTier(qualifiedVip2Count);

    if (reward <= 0 || !starTitle) {
      return {
        userId,
        qualifiedVip2Count,
        starTitle: 'Unqualified',
        reward: 0,
        paid: false,
      };
    }

    const rewardStr = reward.toFixed(8);
    const balanceBefore = parseFloat(wallet.availableBalance);
    const balanceAfter = balanceBefore + reward;

    // 4. Update parent's wallet balances atomically
    // Awarded as Incentive Income per Section 12 rules
    await walletRepository.incrementBalances(wallet.id, {
      availableBalance: rewardStr,
      incentiveIncome: rewardStr,
      totalEarned: rewardStr,
    });

    // 5. Write to transaction ledger
    const txn = await transactionRepository.createTransaction({
      userId,
      walletId: wallet.id,
      type: 'SALARY',
      referenceId: wallet.id, // reference wallet
      status: 'COMPLETED',
      description: `Weekly Leadership Incentive: ${starTitle} reward based on ${qualifiedVip2Count} qualified VIP2+ downline members.`,
      amount: rewardStr,
      balanceBefore: balanceBefore.toFixed(8),
      balanceAfter: balanceAfter.toFixed(8),
      createdBy: 'SYSTEM',
    });

    // 6. Record inside income history
    await incomeRepository.createIncome({
      userId,
      walletId: wallet.id,
      type: 'SALARY',
      amount: rewardStr,
      description: `Weekly Leadership Incentive - ${starTitle}`,
      transactionId: txn.id,
    });

    // 7. Write to salary history ledger
    const salaryRecord = await salaryRepository.createSalary({
      userId,
      walletId: wallet.id,
      amount: rewardStr,
      starTitle,
      qualifiedVip2Count,
      payPeriodStart,
      payPeriodEnd,
      status: 'PAID',
      transactionId: txn.id,
    });

    // 8. Dispatch notification
    await notificationService.createStructuredNotification(userId, {
      title: 'Weekly Reward Received',
      description: `Congratulations! You have received a weekly reward of ${rewardStr} USDT as a ${starTitle} with ${qualifiedVip2Count} qualified VIP2+ members in your team.`,
      icon: 'Award',
      type: 'referral',
      priority: 'HIGH',
    });

    // 9. Audit Log — Business Logic Spec Section 14 requires every Weekly Leadership
    // Incentive payout to be audited.
    await auditRepository.createAuditLog({
      actorUid: 'SYSTEM',
      userId,
      action: 'WEEKLY_INCENTIVE_CREDITED',
      resource: `salary/${salaryRecord.id}`,
      newValue: JSON.stringify({ starTitle, reward: rewardStr, qualifiedVip2Count }),
    });

    return {
      userId,
      qualifiedVip2Count,
      starTitle,
      reward,
      paid: true,
      salaryRecord,
    };
  }

  /**
   * Get paginated salary payouts list for a user
   */
  async getUserSalaryHistory(userId: string, options?: { limit?: number; offset?: number }) {
    return salaryRepository.findByUserId(userId, options);
  }
}

export const salaryService = new SalaryService();
export default salaryService;
