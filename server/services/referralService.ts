/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { referralRepository } from '../repositories/referralRepository.ts';
import { userRepository } from '../repositories/userRepository.ts';
import { vipRepository } from '../repositories/vipRepository.ts';
import { walletRepository } from '../repositories/walletRepository.ts';
import { transactionRepository } from '../repositories/transactionRepository.ts';
import { incomeRepository } from '../repositories/incomeRepository.ts';
import { notificationRepository } from '../repositories/notificationRepository.ts';
import { teamCommissionHistoryRepository } from '../repositories/teamCommissionHistoryRepository.ts';
import { auditRepository } from '../repositories/auditRepository.ts';

/**
 * BUSINESS RULE — Single Source of Truth (Section 17 — Service Ownership Matrix):
 * ReferralService is the ONLY service that calculates, distributes, and records
 * Team Commission. No other service (ClaimService included) may reimplement this logic.
 */

// Business Logic Spec Section 16 — Team Commission/Level.
// Commission % is determined by the RECEIVING upline's CURRENT VIP tier — never the
// downline's tier. Index 0 = Level A, 1 = Level B, 2 = Level C, 3 = Level D.
const TEAM_COMMISSION_MATRIX: Record<string, [number, number, number, number]> = {
  VIP1: [0, 0, 0, 0],
  VIP2: [0.10, 0.05, 0.03, 0.02],
  VIP3: [0.12, 0.06, 0.04, 0.03],
  VIP4: [0.15, 0.08, 0.05, 0.04],
  VIP5: [0.17, 0.09, 0.06, 0.05],
  VIP6: [0.20, 0.10, 0.07, 0.06],
  VIP7: [0.22, 0.11, 0.08, 0.07],
  VIP8: [0.24, 0.12, 0.09, 0.08],
};

export interface DownlineNode {
  childId: string;
  parentId: string;
  referralLevel: number; // 1 = Level A, 2 = Level B, 3 = Level C, 4 = Level D
}

export class ReferralService {
  /**
   * Link a newly registered child to their direct parent
   */
  async linkReferral(childId: string, parentId: string) {
    const parent = await userRepository.findById(parentId);
    if (!parent) {
      throw new Error(`Referrer user not found with ID: ${parentId}`);
    }

    const child = await userRepository.findById(childId);
    if (!child) {
      throw new Error(`Referred child user not found with ID: ${childId}`);
    }

    // Verify no existing relationship for this child to respect 1-parent constraint
    const existing = await referralRepository.findRelationshipByChildId(childId);
    if (existing) {
      throw new Error(`User ${childId} has already been referred or linked.`);
    }

    // Direct parent relationship is level 1
    const relationship = await referralRepository.createRelationship({
      parentId,
      childId,
      referralLevel: 1,
    });

    return relationship;
  }

  /**
   * Traverse the referral tree level-by-level to retrieve all downline descendants
   * of a parent user, capped at maxLevel (defaults to 4: Level A, B, C, D).
   */
  async getDownlineDescendants(parentId: string, maxLevel = 4): Promise<DownlineNode[]> {
    const allDescendants: DownlineNode[] = [];

    const traverse = async (currentParentId: string, currentLevel: number) => {
      if (currentLevel > maxLevel) return;

      // Find direct children of the current parent
      const directChildren = await referralRepository.findRelationshipsByParentId(currentParentId);
      
      for (const rel of directChildren) {
        allDescendants.push({
          childId: rel.childId,
          parentId: currentParentId,
          referralLevel: currentLevel,
        });

        // Recurse for the next Level
        await traverse(rel.childId, currentLevel + 1);
      }
    };

    await traverse(parentId, 1);
    return allDescendants;
  }

  /**
   * Get referral income history logs for a user
   */
  async getReferralIncomeHistory(userId: string, options?: { limit?: number; offset?: number }) {
    return referralRepository.getReferralIncomeByUserId(userId, options);
  }

  /**
   * Distribute Team Commission up to 4 levels (A/B/C/D) of uplines when a downline
   * user successfully claims their Daily DPY.
   *
   * Business Logic Spec Section 16 — Team Commission/Level:
   * - Commission % is based on the RECEIVING upline's CURRENT VIP tier (never the source's).
   * - Commission is distributed instantly on DPY claim.
   * - One Team Commission History record is created for every commission generated.
   *
   * This is the ONLY place in the codebase that calculates or distributes Team
   * Commission (Section 17 — Service Ownership Matrix). ClaimService must never
   * duplicate this logic — it only calls this method after completing a claim.
   */
  async distributeTeamCommission(sourceUserId: string, dpyAmount: number, claimId: string) {
    if (!(dpyAmount > 0)) return;

    try {
      let currentChildId = sourceUserId;

      for (let level = 1; level <= 4; level++) {
        const rel = await referralRepository.findRelationshipByChildId(currentChildId);
        if (!rel) break; // No further upline — end of referral chain

        const receiverUserId = rel.parentId;

        // Commission % is determined by the RECEIVING upline's CURRENT VIP tier.
        const receiverVip = await vipRepository.findByUserId(receiverUserId);
        const receiverTier = receiverVip?.tier || 'VIP1';
        const rates = TEAM_COMMISSION_MATRIX[receiverTier] || TEAM_COMMISSION_MATRIX.VIP1;
        const rate = rates[level - 1];

        if (rate > 0) {
          const receiverWallet = await walletRepository.findByUserId(receiverUserId);

          if (receiverWallet) {
            const commissionAmount = dpyAmount * rate;
            const commissionStr = commissionAmount.toFixed(8);
            const balanceBefore = parseFloat(receiverWallet.availableBalance);
            const balanceAfter = balanceBefore + commissionAmount;

            // 1. Credit receiver's wallet
            await walletRepository.incrementBalances(receiverWallet.id, {
              availableBalance: commissionStr,
              teamIncome: commissionStr,
              totalEarned: commissionStr,
            });

            // 2. Immutable transaction ledger entry
            const txn = await transactionRepository.createTransaction({
              userId: receiverUserId,
              walletId: receiverWallet.id,
              type: 'TEAM_INCOME',
              referenceId: claimId,
              status: 'COMPLETED',
              description: `Team Commission (Level ${level}) from downline DPY claim — ${(rate * 100).toFixed(2)}% of ${dpyAmount.toFixed(8)} USDT.`,
              amount: commissionStr,
              balanceBefore: balanceBefore.toFixed(8),
              balanceAfter: balanceAfter.toFixed(8),
              createdBy: 'SYSTEM',
            });

            // 3. Income history entry
            await incomeRepository.createIncome({
              userId: receiverUserId,
              walletId: receiverWallet.id,
              type: 'TEAM_INCOME',
              amount: commissionStr,
              description: `Team Commission (Level ${level}) — ${receiverTier} rate ${(rate * 100).toFixed(2)}%`,
              transactionId: txn.id,
            });

            // 4. Team Commission History record (Team Commission History module)
            const historyRecord = await teamCommissionHistoryRepository.createRecord({
              receiverUserId,
              sourceUserId,
              claimId,
              level,
              sourceDpyAmount: dpyAmount.toFixed(8),
              commissionAmount: commissionStr,
            });

            // 5. Audit Log — Business Logic Spec Section 14 requires every Team Commission to be audited.
            await auditRepository.createAuditLog({
              actorUid: 'SYSTEM',
              userId: receiverUserId,
              action: 'TEAM_COMMISSION_CREDITED',
              resource: `team_commission_history/${historyRecord.id}`,
              newValue: JSON.stringify({ sourceUserId, level, receiverTier, rate, sourceDpyAmount: dpyAmount.toFixed(8), commissionAmount: commissionStr }),
            });

            // 6. Notification
            await notificationRepository.createNotification({
              userId: receiverUserId,
              message: `You received ${commissionStr} USDT in Team Commission (Level ${level}) from a downline's DPY claim.`,
              priority: 'LOW',
            });
          }
        }

        // Climb up the referral tree for the next level
        currentChildId = receiverUserId;
      }
    } catch (err) {
      console.error(`Failed to distribute Team Commission for source user ${sourceUserId}:`, err);
    }
  }

  /**
   * Retrieve a user's Team Commission History (Time / Username / Level / DPY Claimed /
   * Commission Earned) — required by the Controller Layer for the history UI table.
   */
  async getTeamCommissionHistory(userId: string, options?: { limit?: number; offset?: number }) {
    return teamCommissionHistoryRepository.getHistoryByReceiverId(userId, options);
  }
}

export const referralService = new ReferralService();
export default referralService;
