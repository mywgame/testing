/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { eq, and, asc, desc, sql } from 'drizzle-orm';
import { db } from '../../src/db/index.ts';
import { taskDefinitions, userTaskClaims, users } from '../../src/db/schema.ts';

export const DEFAULT_TASK_DEFINITIONS = [
  {
    taskCode: 'REGISTRATION_TRIAL_FUND',
    title: 'Registration Bonus (Trial Fund)',
    description: 'Welcome gift for new members upon successful registration.',
    category: 'ACTIVITY',
    rewardType: 'TRIAL_FUND',
    rewardAmount: '100.00000000',
    rewardPerUnit: '0.00000000',
    triggerType: 'REGISTRATION',
    targetProgress: '1.00000000',
    unit: 'Step',
    minDepositRequired: '0.00000000',
    ruleConfig: JSON.stringify({ action: 'READ_ONLY_TRIAL_FUND' }),
    maxClaimsPerUser: 1,
    isActive: true,
    displayOrder: 1,
  },
  {
    taskCode: 'AUTHENTICATOR_SETUP',
    title: 'Complete Authenticator Setup',
    description: 'Secure your account with 2-Factor Authentication (2FA).',
    category: 'ACTIVITY',
    rewardType: 'CASH',
    rewardAmount: '0.25000000',
    rewardPerUnit: '0.00000000',
    triggerType: 'AUTHENTICATOR',
    targetProgress: '1.00000000',
    unit: 'Setup',
    minDepositRequired: '0.00000000',
    ruleConfig: JSON.stringify({ actionUrl: '/dashboard?tab=security' }),
    maxClaimsPerUser: 1,
    isActive: true,
    displayOrder: 2,
  },
  {
    taskCode: 'JOIN_TELEGRAM',
    title: 'Join Telegram Channel',
    description: 'Join our official Telegram community channel for news and updates.',
    category: 'ACTIVITY',
    rewardType: 'CASH',
    rewardAmount: '0.25000000',
    rewardPerUnit: '0.00000000',
    triggerType: 'TELEGRAM',
    targetProgress: '1.00000000',
    unit: 'Join',
    minDepositRequired: '0.00000000',
    ruleConfig: JSON.stringify({ actionUrl: '' }),
    maxClaimsPerUser: 1,
    isActive: false,
    displayOrder: 3,
  },
  {
    taskCode: 'REFERRAL_REGISTRATION_SINGLE',
    title: 'Successful Referral Registration',
    description: 'Earn $0.10 for each eligible referred user after successful registration.',
    category: 'ACTIVITY',
    rewardType: 'CASH',
    rewardAmount: '0.10000000',
    rewardPerUnit: '0.10000000',
    triggerType: 'REFERRAL_SINGLE',
    targetProgress: '1.00000000',
    unit: 'Ref',
    minDepositRequired: '0.00000000',
    ruleConfig: JSON.stringify({ minRefDeposit: 0 }),
    maxClaimsPerUser: 9999,
    isActive: true,
    displayOrder: 4,
  },
  {
    taskCode: 'DEPOSIT_MILESTONE_100',
    title: 'First $100 Deposit',
    description: 'Make your first cumulative deposit of $100 into your wallet.',
    category: 'DEPOSIT',
    rewardType: 'CASH',
    rewardAmount: '1.00000000',
    rewardPerUnit: '0.00000000',
    triggerType: 'DEPOSIT_TOTAL',
    targetProgress: '100.00000000',
    unit: 'USDT',
    minDepositRequired: '0.00000000',
    ruleConfig: JSON.stringify({ targetDeposit: 100 }),
    maxClaimsPerUser: 1,
    isActive: true,
    displayOrder: 5,
  },
  {
    taskCode: 'DEPOSIT_MILESTONE_500',
    title: 'First $500 Deposit',
    description: 'Make your first cumulative deposit of $500 into your wallet.',
    category: 'DEPOSIT',
    rewardType: 'CASH',
    rewardAmount: '5.00000000',
    rewardPerUnit: '0.00000000',
    triggerType: 'DEPOSIT_TOTAL',
    targetProgress: '500.00000000',
    unit: 'USDT',
    minDepositRequired: '0.00000000',
    ruleConfig: JSON.stringify({ targetDeposit: 500 }),
    maxClaimsPerUser: 1,
    isActive: true,
    displayOrder: 6,
  },
  {
    taskCode: 'DEPOSIT_MILESTONE_1000',
    title: 'First $1,000 Deposit',
    description: 'Make your first cumulative deposit of $1,000 into your wallet.',
    category: 'DEPOSIT',
    rewardType: 'CASH',
    rewardAmount: '10.00000000',
    rewardPerUnit: '0.00000000',
    triggerType: 'DEPOSIT_TOTAL',
    targetProgress: '1000.00000000',
    unit: 'USDT',
    minDepositRequired: '0.00000000',
    ruleConfig: JSON.stringify({ targetDeposit: 1000 }),
    maxClaimsPerUser: 1,
    isActive: true,
    displayOrder: 7,
  },
  {
    taskCode: 'REFERRAL_MILESTONE_3',
    title: '3 Verified Referrals',
    description: 'Refer 3 active team members who each deposit a minimum of $50 REAL.',
    category: 'REFERRAL',
    rewardType: 'CASH',
    rewardAmount: '2.00000000',
    rewardPerUnit: '0.00000000',
    triggerType: 'REFERRAL_COUNT',
    targetProgress: '3.00000000',
    unit: 'Verified',
    minDepositRequired: '50.00000000',
    ruleConfig: JSON.stringify({ minRefDeposit: 50, countTarget: 3 }),
    maxClaimsPerUser: 1,
    isActive: true,
    displayOrder: 8,
  },
  {
    taskCode: 'REFERRAL_MILESTONE_5',
    title: '5 Verified Referrals',
    description: 'Refer 5 active team members who each deposit a minimum of $50 REAL.',
    category: 'REFERRAL',
    rewardType: 'CASH',
    rewardAmount: '5.00000000',
    rewardPerUnit: '0.00000000',
    triggerType: 'REFERRAL_COUNT',
    targetProgress: '5.00000000',
    unit: 'Verified',
    minDepositRequired: '50.00000000',
    ruleConfig: JSON.stringify({ minRefDeposit: 50, countTarget: 5 }),
    maxClaimsPerUser: 1,
    isActive: true,
    displayOrder: 9,
  },
  {
    taskCode: 'REFERRAL_MILESTONE_10',
    title: '10 Verified Referrals',
    description: 'Refer 10 active team members who each deposit a minimum of $50 REAL.',
    category: 'REFERRAL',
    rewardType: 'CASH',
    rewardAmount: '10.00000000',
    rewardPerUnit: '0.00000000',
    triggerType: 'REFERRAL_COUNT',
    targetProgress: '10.00000000',
    unit: 'Verified',
    minDepositRequired: '50.00000000',
    ruleConfig: JSON.stringify({ minRefDeposit: 50, countTarget: 10 }),
    maxClaimsPerUser: 1,
    isActive: true,
    displayOrder: 10,
  },
  {
    taskCode: 'REFERRAL_MILESTONE_20',
    title: '20 Verified Referrals',
    description: 'Refer 20 active team members who each deposit a minimum of $50 REAL.',
    category: 'REFERRAL',
    rewardType: 'CASH',
    rewardAmount: '35.00000000',
    rewardPerUnit: '0.00000000',
    triggerType: 'REFERRAL_COUNT',
    targetProgress: '20.00000000',
    unit: 'Verified',
    minDepositRequired: '50.00000000',
    ruleConfig: JSON.stringify({ minRefDeposit: 50, countTarget: 20 }),
    maxClaimsPerUser: 1,
    isActive: true,
    displayOrder: 11,
  },
  {
    taskCode: 'REFERRAL_MILESTONE_35',
    title: '35 Verified Referrals',
    description: 'Refer 35 active team members who each deposit a minimum of $50 REAL.',
    category: 'REFERRAL',
    rewardType: 'CASH',
    rewardAmount: '50.00000000',
    rewardPerUnit: '0.00000000',
    triggerType: 'REFERRAL_COUNT',
    targetProgress: '35.00000000',
    unit: 'Verified',
    minDepositRequired: '50.00000000',
    ruleConfig: JSON.stringify({ minRefDeposit: 50, countTarget: 35 }),
    maxClaimsPerUser: 1,
    isActive: true,
    displayOrder: 12,
  },
  {
    taskCode: 'REFERRAL_MILESTONE_50',
    title: '50 Verified Referrals',
    description: 'Refer 50 active team members who each deposit a minimum of $50 REAL.',
    category: 'REFERRAL',
    rewardType: 'CASH',
    rewardAmount: '75.00000000',
    rewardPerUnit: '0.00000000',
    triggerType: 'REFERRAL_COUNT',
    targetProgress: '50.00000000',
    unit: 'Verified',
    minDepositRequired: '50.00000000',
    ruleConfig: JSON.stringify({ minRefDeposit: 50, countTarget: 50 }),
    maxClaimsPerUser: 1,
    isActive: true,
    displayOrder: 13,
  },
];

export class TaskRepository {
  /**
   * Ensure default tasks exist in DB only if the table is genuinely empty.
   * NEVER overwrite admin-configured changes or descriptions.
   */
  async seedDefaultTasksIfEmpty() {
    try {
      const existing = await db.select({ id: taskDefinitions.id }).from(taskDefinitions).limit(1);
      if (existing.length === 0) {
        for (const def of DEFAULT_TASK_DEFINITIONS) {
          await db.insert(taskDefinitions).values(def).onConflictDoNothing();
        }
      } else {
        // Explicitly ensure suspended tasks (like JOIN_TELEGRAM) are set inactive in existing deployments
        await db
          .update(taskDefinitions)
          .set({ isActive: false })
          .where(eq(taskDefinitions.taskCode, 'JOIN_TELEGRAM'));
      }
    } catch (error) {
      console.error('Task seed error (database might be initializing or pending migration):', error);
      throw new Error('Database unavailable. Failed to check or seed task definitions.');
    }
  }

  /**
   * Get all active task definitions ordered by display order
   */
  async findAllActiveTaskDefinitions() {
    try {
      await this.seedDefaultTasksIfEmpty();
      const result = await db
        .select()
        .from(taskDefinitions)
        .where(eq(taskDefinitions.isActive, true))
        .orderBy(asc(taskDefinitions.displayOrder));

      return result;
    } catch (error) {
      console.error('findAllActiveTaskDefinitions error:', error);
      throw new Error('Database unavailable. Failed to fetch active task definitions.');
    }
  }

  /**
   * Find a specific task definition by code
   */
  async findTaskDefinitionByCode(taskCode: string) {
    try {
      const result = await db
        .select()
        .from(taskDefinitions)
        .where(eq(taskDefinitions.taskCode, taskCode));
      return result[0] || null;
    } catch (error) {
      console.error('findTaskDefinitionByCode error:', error);
      throw new Error(`Database unavailable. Failed to find task definition for code: ${taskCode}`);
    }
  }

  /**
   * Find a specific task definition by ID
   */
  async findTaskDefinitionById(id: string) {
    try {
      const result = await db
        .select()
        .from(taskDefinitions)
        .where(eq(taskDefinitions.id, id));
      return result[0] || null;
    } catch (error) {
      console.error('findTaskDefinitionById error:', error);
      throw new Error(`Database unavailable. Failed to find task definition for id: ${id}`);
    }
  }

  /**
   * Count how many claims a user has already made for a specific task code
   */
  async countUserClaimsByTask(userId: string, taskCode: string): Promise<number> {
    try {
      const result = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(userTaskClaims)
        .where(
          and(
            eq(userTaskClaims.userId, userId),
            eq(userTaskClaims.taskCode, taskCode)
          )
        );
      return result[0]?.count || 0;
    } catch (error) {
      console.error('countUserClaimsByTask error:', error);
      throw new Error(`Database unavailable. Failed to count task claims for user ${userId}.`);
    }
  }

  /**
   * Find user task claims history
   */
  async findUserTaskClaims(userId: string) {
    try {
      const result = await db
        .select()
        .from(userTaskClaims)
        .where(eq(userTaskClaims.userId, userId));
      return result;
    } catch (error) {
      return [];
    }
  }

  /**
   * Find a specific user claim for idempotency check
   */
  async findUserClaimByTaskAndKey(userId: string, taskCode: string, claimKey: string = 'DEFAULT') {
    try {
      const result = await db
        .select()
        .from(userTaskClaims)
        .where(
          and(
            eq(userTaskClaims.userId, userId),
            eq(userTaskClaims.taskCode, taskCode),
            eq(userTaskClaims.claimKey, claimKey)
          )
        );
      return result[0] || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Create a claim record in DB
   */
  async createTaskClaim(data: {
    userId: string;
    taskId: string;
    taskCode: string;
    claimKey?: string;
    rewardAmount: string;
    rewardType?: string;
    claimMetadata?: string;
    transactionId?: string | null;
  }) {
    try {
      const result = await db
        .insert(userTaskClaims)
        .values({
          userId: data.userId,
          taskId: data.taskId,
          taskCode: data.taskCode,
          claimKey: data.claimKey || 'DEFAULT',
          rewardAmount: data.rewardAmount,
          rewardType: data.rewardType || 'CASH',
          claimMetadata: data.claimMetadata || null,
          transactionId: data.transactionId || null,
        })
        .returning();
      return result[0];
    } catch (error) {
      console.error('createTaskClaim error:', error);
      throw new Error('Failed to record task claim in database.');
    }
  }

  /**
   * Get all task definitions for admin panel with claims count
   */
  async findAllTaskDefinitionsForAdmin() {
    try {
      await this.seedDefaultTasksIfEmpty();
      const defs = await db
        .select()
        .from(taskDefinitions)
        .orderBy(asc(taskDefinitions.displayOrder));

      const claimsCounts = await db
        .select({
          taskId: userTaskClaims.taskId,
          taskCode: userTaskClaims.taskCode,
          count: sql<number>`count(*)::int`,
          totalPaidOut: sql<string>`coalesce(sum(${userTaskClaims.rewardAmount}), 0)::text`,
        })
        .from(userTaskClaims)
        .groupBy(userTaskClaims.taskId, userTaskClaims.taskCode);

      const claimsMap: Record<string, { count: number; totalPaidOut: string }> = {};
      for (const row of claimsCounts) {
        if (row.taskId) {
          claimsMap[row.taskId] = { count: row.count, totalPaidOut: row.totalPaidOut };
        }
        if (row.taskCode) {
          claimsMap[row.taskCode] = { count: row.count, totalPaidOut: row.totalPaidOut };
        }
      }

      return defs.map((def) => {
        const stats = claimsMap[def.id] || claimsMap[def.taskCode] || { count: 0, totalPaidOut: '0' };
        return {
          ...def,
          claimsCount: stats.count,
          totalPaidOut: stats.totalPaidOut,
        };
      });
    } catch (error) {
      console.error('findAllTaskDefinitionsForAdmin error:', error);
      throw new Error('Database unavailable. Failed to fetch task definitions for admin.');
    }
  }

  /**
   * Update task definition by ID
   */
  async updateTaskDefinition(id: string, updates: Record<string, any>) {
    try {
      const allowedFields: Record<string, any> = {};
      if (updates.title !== undefined) allowedFields.title = updates.title;
      if (updates.description !== undefined) allowedFields.description = updates.description;
      if (updates.rewardAmount !== undefined) allowedFields.rewardAmount = String(updates.rewardAmount);
      if (updates.rewardType !== undefined) allowedFields.rewardType = updates.rewardType;
      if (updates.targetProgress !== undefined) allowedFields.targetProgress = String(updates.targetProgress);
      if (updates.minDepositRequired !== undefined) allowedFields.minDepositRequired = String(updates.minDepositRequired);
      if (updates.isActive !== undefined) allowedFields.isActive = Boolean(updates.isActive);
      if (updates.displayOrder !== undefined) allowedFields.displayOrder = Number(updates.displayOrder);
      if (updates.ruleConfig !== undefined) allowedFields.ruleConfig = typeof updates.ruleConfig === 'string' ? updates.ruleConfig : JSON.stringify(updates.ruleConfig);

      allowedFields.updatedAt = new Date();

      const result = await db
        .update(taskDefinitions)
        .set(allowedFields)
        .where(eq(taskDefinitions.id, id))
        .returning();

      return result[0] || null;
    } catch (error) {
      console.error('updateTaskDefinition error:', error);
      throw new Error('Failed to update task definition in database.');
    }
  }

  /**
   * Create new task definition
   */
  async createTaskDefinition(data: Record<string, any>) {
    try {
      const result = await db
        .insert(taskDefinitions)
        .values({
          taskCode: data.taskCode,
          title: data.title,
          description: data.description,
          category: data.category || 'ACTIVITY',
          rewardType: data.rewardType || 'CASH',
          rewardAmount: String(data.rewardAmount || '0'),
          rewardPerUnit: String(data.rewardPerUnit || '0'),
          triggerType: data.triggerType || 'ACTIVITY',
          targetProgress: String(data.targetProgress || '1'),
          unit: data.unit || 'Step',
          minDepositRequired: String(data.minDepositRequired || '0'),
          ruleConfig: typeof data.ruleConfig === 'string' ? data.ruleConfig : JSON.stringify(data.ruleConfig || {}),
          maxClaimsPerUser: Number(data.maxClaimsPerUser || 1),
          isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
          displayOrder: Number(data.displayOrder || 0),
        })
        .returning();
      return result[0];
    } catch (error) {
      console.error('createTaskDefinition error:', error);
      throw new Error('Failed to create new task definition in database.');
    }
  }

  /**
   * Get rewards pool metrics overview
   */
  async getRewardsPoolMetrics() {
    try {
      const defs = await this.findAllActiveTaskDefinitions();
      const allClaims = await db.select().from(userTaskClaims);

      let totalCashPaidOut = 0;
      let totalTrialFundPaidOut = 0;

      for (const claim of allClaims) {
        const amt = parseFloat(claim.rewardAmount || '0');
        if (claim.rewardType === 'TRIAL_FUND') {
          totalTrialFundPaidOut += amt;
        } else {
          totalCashPaidOut += amt;
        }
      }

      return {
        totalTasks: defs.length,
        activeTasks: defs.filter((d) => d.isActive).length,
        totalClaimsProcessed: allClaims.length,
        totalRewardsPaidOutUsdt: totalCashPaidOut.toFixed(2),
        totalTrialFundDistributed: totalTrialFundPaidOut.toFixed(2),
      };
    } catch (error) {
      return {
        totalTasks: 0,
        activeTasks: 0,
        totalClaimsProcessed: 0,
        totalRewardsPaidOutUsdt: '0.00',
        totalTrialFundDistributed: '0.00',
      };
    }
  }

  /**
   * Get recent task claim history with user details
   */
  async getRecentTaskClaims(limit = 100) {
    try {
      const claims = await db
        .select({
          id: userTaskClaims.id,
          userId: userTaskClaims.userId,
          taskCode: userTaskClaims.taskCode,
          claimKey: userTaskClaims.claimKey,
          rewardAmount: userTaskClaims.rewardAmount,
          rewardType: userTaskClaims.rewardType,
          claimedAt: userTaskClaims.claimedAt,
          userName: users.name,
          userEmail: users.email,
        })
        .from(userTaskClaims)
        .leftJoin(users, eq(userTaskClaims.userId, users.id))
        .orderBy(desc(userTaskClaims.claimedAt))
        .limit(limit);

      return claims.map((c) => ({
        ...c,
        userName: c.userName || 'User',
        userEmail: c.userEmail || '',
      }));
    } catch (error) {
      console.error('getRecentTaskClaims error:', error);
      return [];
    }
  }
}

export const taskRepository = new TaskRepository();
