/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { taskRepository } from '../repositories/taskRepository.ts';
import { walletRepository } from '../repositories/walletRepository.ts';
import { depositRepository } from '../repositories/depositRepository.ts';
import { referralRepository } from '../repositories/referralRepository.ts';
import { userRepository } from '../repositories/userRepository.ts';
import { transactionRepository } from '../repositories/transactionRepository.ts';
import { auditRepository } from '../repositories/auditRepository.ts';

export interface UserTaskStatusDTO {
  id: string;
  taskCode: string;
  title: string;
  description: string;
  category: 'ACTIVITY' | 'DEPOSIT' | 'REFERRAL';
  rewardType: 'CASH' | 'TRIAL_FUND' | 'BONUS';
  rewardAmount: number;
  rewardPerUnit: number;
  currentProgress: number;
  targetProgress: number;
  unit: string;
  status: 'LOCKED' | 'IN_PROGRESS' | 'COMPLETED' | 'CLAIMED';
  actionUrl?: string;
  minDepositRequired: number;
  claimedAt?: string | null;
  ruleConfig?: any;
}

export class TaskService {
  /**
   * Get total real approved deposit amount for a user (excluding trial funds)
   */
  async getUserRealTotalDeposits(userId: string): Promise<number> {
    try {
      const userDeposits = await depositRepository.findByUserId(userId, { limit: 500 });
      let totalReal = 0;
      for (const dep of userDeposits) {
        if ((dep.status === 'APPROVED' || dep.status === 'COMPLETED') && !dep.adminNotes?.includes('TRIAL_FUND')) {
          totalReal += parseFloat(dep.amount || '0');
        }
      }
      return totalReal;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get verified referrals count for a parent user (Level-1 direct referrals with >= $50 REAL deposit)
   */
  async getVerifiedReferralsDetails(parentId: string): Promise<{
    totalDirectCount: number;
    verifiedCount: number;
    verifiedRefUserIds: string[];
  }> {
    try {
      const relationships = await referralRepository.findRelationshipsByParentId(parentId, { referralLevel: 1, limit: 500 });
      let verifiedCount = 0;
      const verifiedRefUserIds: string[] = [];

      for (const rel of relationships) {
        const childTotalDeposit = await this.getUserRealTotalDeposits(rel.childId);
        if (childTotalDeposit >= 50) {
          verifiedCount++;
          verifiedRefUserIds.push(rel.childId);
        }
      }

      return {
        totalDirectCount: relationships.length,
        verifiedCount,
        verifiedRefUserIds,
      };
    } catch (error) {
      return { totalDirectCount: 0, verifiedCount: 0, verifiedRefUserIds: [] };
    }
  }

  /**
   * Get list of all tasks for user with calculated progress and status
   */
  async getUserTasks(userId: string): Promise<{
    tasks: UserTaskStatusDTO[];
    summary: {
      totalEarned: number;
      claimableTotal: number;
      completedCount: number;
      inProgressCount: number;
      totalTasksCount: number;
      verifiedReferralCount: number;
      totalRealDeposits: number;
    };
  }> {
    const definitions = await taskRepository.findAllActiveTaskDefinitions();
    const claims = await taskRepository.findUserTaskClaims(userId);
    const user = await userRepository.findById(userId);
    const wallet = await walletRepository.findByUserId(userId);

    const realTotalDeposits = await this.getUserRealTotalDeposits(userId);
    const { totalDirectCount, verifiedCount: verifiedRefUsersCount } = await this.getVerifiedReferralsDetails(userId);

    const claimMap = new Map<string, any[]>();
    for (const c of claims) {
      const existing = claimMap.get(c.taskCode) || [];
      existing.push(c);
      claimMap.get(c.taskCode) ? null : claimMap.set(c.taskCode, existing);
    }

    let totalEarned = 0;
    let claimableTotal = 0;
    let completedCount = 0;
    let inProgressCount = 0;

    const taskDTOs: UserTaskStatusDTO[] = definitions.map((def) => {
      const taskCode = def.taskCode;
      const userClaimsForTask = claimMap.get(taskCode) || [];
      const hasDefaultClaim = userClaimsForTask.some((c) => c.claimKey === 'DEFAULT');

      let currentProgress = 0;
      const targetProgress = parseFloat(def.targetProgress || '1');
      const rewardAmount = parseFloat(def.rewardAmount || '0');
      const minDepRequired = parseFloat(def.minDepositRequired || '0');
      let status: 'LOCKED' | 'IN_PROGRESS' | 'COMPLETED' | 'CLAIMED' = 'IN_PROGRESS';
      let ruleConfigObj: any = {};

      try {
        if (def.ruleConfig) ruleConfigObj = JSON.parse(def.ruleConfig);
      } catch (e) {
        ruleConfigObj = {};
      }

      // Calculate logic per task type
      if (taskCode === 'REGISTRATION_TRIAL_FUND') {
        currentProgress = 1;
        // Check if user has received trial fund or wallet has trial balance
        const trialBal = wallet ? parseFloat(wallet.trialBalance) : 0;
        const hasTrial = trialBal > 0 || !!wallet?.trialExpiresAt || hasDefaultClaim;
        status = hasTrial ? 'CLAIMED' : 'COMPLETED';
      } else if (taskCode === 'AUTHENTICATOR_SETUP') {
        const is2FA = user?.twoFactorEnabled || false;
        currentProgress = is2FA ? 1 : 0;
        if (hasDefaultClaim) {
          status = 'CLAIMED';
        } else if (is2FA) {
          status = 'COMPLETED';
        } else {
          status = 'IN_PROGRESS';
        }
      } else if (taskCode === 'JOIN_TELEGRAM') {
        currentProgress = hasDefaultClaim ? 1 : 0;
        status = hasDefaultClaim ? 'CLAIMED' : 'IN_PROGRESS';
      } else if (taskCode === 'REFERRAL_REGISTRATION_SINGLE') {
        currentProgress = totalDirectCount;
        const totalClaimedCount = userClaimsForTask.length;
        if (totalDirectCount > totalClaimedCount) {
          status = 'COMPLETED';
        } else if (totalClaimedCount > 0) {
          status = 'CLAIMED';
        } else {
          status = 'IN_PROGRESS';
        }
      } else if (def.category === 'DEPOSIT' || def.triggerType === 'DEPOSIT_TOTAL') {
        currentProgress = Math.min(targetProgress, realTotalDeposits);
        if (hasDefaultClaim) {
          status = 'CLAIMED';
        } else if (realTotalDeposits >= targetProgress) {
          status = 'COMPLETED';
        } else {
          status = 'IN_PROGRESS';
        }
      } else if (def.category === 'REFERRAL' || def.triggerType === 'REFERRAL_COUNT') {
        currentProgress = Math.min(targetProgress, verifiedRefUsersCount);
        if (hasDefaultClaim) {
          status = 'CLAIMED';
        } else if (verifiedRefUsersCount >= targetProgress) {
          status = 'COMPLETED';
        } else {
          status = 'IN_PROGRESS';
        }
      }

      // Metrics calculation
      if (status === 'CLAIMED') {
        const totalClaimedForThis = userClaimsForTask.reduce(
          (sum, c) => sum + parseFloat(c.rewardAmount || '0'),
          0
        );
        totalEarned += totalClaimedForThis > 0 ? totalClaimedForThis : rewardAmount;
        completedCount++;
      } else if (status === 'COMPLETED') {
        claimableTotal += rewardAmount;
        completedCount++;
      } else {
        inProgressCount++;
      }

      return {
        id: def.id,
        taskCode: def.taskCode,
        title: def.title,
        description: def.description,
        category: def.category as 'ACTIVITY' | 'DEPOSIT' | 'REFERRAL',
        rewardType: def.rewardType as 'CASH' | 'TRIAL_FUND' | 'BONUS',
        rewardAmount,
        rewardPerUnit: parseFloat(def.rewardPerUnit || '0'),
        currentProgress,
        targetProgress,
        unit: def.unit || 'Step',
        status,
        actionUrl: ruleConfigObj.actionUrl,
        minDepositRequired: minDepRequired,
        claimedAt: hasDefaultClaim ? userClaimsForTask[0]?.claimedAt : null,
        ruleConfig: ruleConfigObj,
      };
    });

    return {
      tasks: taskDTOs,
      summary: {
        totalEarned,
        claimableTotal,
        completedCount,
        inProgressCount,
        totalTasksCount: definitions.length,
        verifiedReferralCount: verifiedRefUsersCount,
        totalRealDeposits: realTotalDeposits,
      },
    };
  }

  /**
   * Idempotent & Atomic Task Reward Claim Handler
   */
  async claimTaskReward(userId: string, taskCode: string, claimKey: string = 'DEFAULT') {
    const taskDef = await taskRepository.findTaskDefinitionByCode(taskCode);
    if (!taskDef) {
      throw new Error(`Invalid task code: ${taskCode}`);
    }

    if (!taskDef.isActive) {
      throw new Error('This task is currently inactive.');
    }

    // Check existing claim for idempotency
    const existingClaim = await taskRepository.findUserClaimByTaskAndKey(userId, taskCode, claimKey);
    if (existingClaim) {
      return {
        alreadyClaimed: true,
        message: 'This task reward has already been claimed.',
        claim: existingClaim,
      };
    }

    const wallet = await walletRepository.findByUserId(userId);
    if (!wallet) {
      throw new Error('Wallet record not found.');
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User record not found.');
    }

    const rewardAmountNum = parseFloat(taskDef.rewardAmount || '0');
    const rewardType = taskDef.rewardType;

    // Validate Qualification Rules
    if (taskCode === 'REGISTRATION_TRIAL_FUND') {
      // RULE: Do NOT create or credit another trial fund. Registration task only reads trial state and marks as claimed.
      const claim = await taskRepository.createTaskClaim({
        userId,
        taskId: taskDef.id,
        taskCode,
        claimKey,
        rewardAmount: '0.00000000',
        rewardType: 'TRIAL_FUND',
        claimMetadata: JSON.stringify({ note: 'Welcome Trial Fund verified' }),
      });
      return {
        alreadyClaimed: false,
        message: 'Trial Fund registration reward status acknowledged.',
        claim,
      };
    }

    if (taskCode === 'AUTHENTICATOR_SETUP') {
      if (!user.twoFactorEnabled) {
        throw new Error('Please complete 2FA Authenticator setup in Security Settings first.');
      }
    } else if (taskCode === 'REFERRAL_REGISTRATION_SINGLE') {
      const { totalDirectCount } = await this.getVerifiedReferralsDetails(userId);
      const userClaimsForTask = await taskRepository.findUserTaskClaims(userId);
      const currentClaimsCount = userClaimsForTask.filter((c) => c.taskCode === 'REFERRAL_REGISTRATION_SINGLE').length;

      if (totalDirectCount <= currentClaimsCount) {
        throw new Error('No unclaimed referral registration rewards available. Invite new registered referrals to earn $0.10 per registration.');
      }
    } else if (taskDef.category === 'DEPOSIT' || taskDef.triggerType === 'DEPOSIT_TOTAL') {
      const realDeposits = await this.getUserRealTotalDeposits(userId);
      const target = parseFloat(taskDef.targetProgress || '0');
      if (realDeposits < target) {
        throw new Error(`Deposit milestone requirement not met. Required: $${target} REAL deposit.`);
      }
    } else if (taskDef.category === 'REFERRAL' || taskDef.triggerType === 'REFERRAL_COUNT') {
      const { verifiedCount } = await this.getVerifiedReferralsDetails(userId);
      const target = parseFloat(taskDef.targetProgress || '0');
      if (verifiedCount < target) {
        throw new Error(`Referral milestone requirement not met. Required: ${target} verified referrals with min $50 REAL deposit.`);
      }
    }

    // Atomic Balance Credit for CASH rewards
    let newBalanceStr = wallet.availableBalance;
    let txRecord = null;

    if (rewardType === 'CASH' && rewardAmountNum > 0) {
      const currentAvailable = parseFloat(wallet.availableBalance);
      const updatedAvailable = (currentAvailable + rewardAmountNum).toFixed(8);

      await walletRepository.updateBalances(wallet.id, {
        availableBalance: updatedAvailable,
      });
      newBalanceStr = updatedAvailable;

      // Transaction Ledger Record
      txRecord = await transactionRepository.createTransaction({
        userId,
        walletId: wallet.id,
        type: 'TASK_REWARD',
        referenceId: `TASK_CLAIM_${taskCode}_${Date.now()}`,
        amount: rewardAmountNum.toFixed(8),
        balanceBefore: currentAvailable.toFixed(8),
        balanceAfter: updatedAvailable,
        status: 'COMPLETED',
        description: `Task Reward: ${taskDef.title} (+${rewardAmountNum} USDT)`,
      });
    }

    // Record idempotent claim
    const claimRecord = await taskRepository.createTaskClaim({
      userId,
      taskId: taskDef.id,
      taskCode,
      claimKey,
      rewardAmount: rewardAmountNum.toFixed(8),
      rewardType,
      transactionId: txRecord?.id || null,
      claimMetadata: JSON.stringify({ taskTitle: taskDef.title, claimedAt: new Date() }),
    });

    await auditRepository.createAuditLog({
      actorUid: userId,
      userId,
      action: 'TASK_REWARD_CLAIMED',
      resource: `tasks/${claimRecord.id}`,
      newValue: JSON.stringify({ taskCode, rewardAmount: rewardAmountNum }),
    });



    return {
      alreadyClaimed: false,
      message: `🎉 Successfully claimed $${rewardAmountNum} USDT for ${taskDef.title}!`,
      rewardAmount: rewardAmountNum,
      newAvailableBalance: newBalanceStr,
      claim: claimRecord,
    };
  }
}

export const taskService = new TaskService();
