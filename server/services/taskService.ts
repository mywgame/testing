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
import { incomeService } from './incomeService.ts';
import { settingsRepository } from '../repositories/settingsRepository.ts';

export const TASK_REWARDS_LAUNCH_DATE = process.env.TASK_REWARDS_LAUNCH_DATE
  ? new Date(process.env.TASK_REWARDS_LAUNCH_DATE)
  : new Date('2026-08-12T00:00:00.000Z');

export interface ReferralChildDetailDTO {
  childId: string;
  userId: string;
  username: string;
  name?: string | null;
  registeredAt: string;
  rewardAmount: number;
  isClaimed: boolean;
  claimedAt?: string | null;
}

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
  referralDetails?: ReferralChildDetailDTO[];
}

export class TaskService {
  /**
   * Helper to robustly resolve user record whether passed as primary id (UUID) or auth uid (usr_...)
   */
  private async resolveUser(userIdOrUid: string) {
    let user = await userRepository.findById(userIdOrUid);
    if (!user) {
      user = await userRepository.findByUid(userIdOrUid);
    }
    return user;
  }

  /**
   * Get total real approved deposit amount for a user (excluding trial funds)
   * Optionally filtered by sinceDate for launch cutoff
   */
  async getUserRealTotalDeposits(userId: string, sinceDate?: Date): Promise<number> {
    try {
      const userDeposits = await depositRepository.findByUserId(userId, { limit: 500 });
      let totalReal = 0;
      for (const dep of userDeposits) {
        if ((dep.status === 'APPROVED' || dep.status === 'COMPLETED') && !dep.adminNotes?.includes('TRIAL_FUND')) {
          if (!sinceDate || new Date(dep.createdAt) >= sinceDate) {
            totalReal += parseFloat(dep.amount || '0');
          }
        }
      }
      return totalReal;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get verified referrals count for a parent user (Level-1 direct referrals with >= $50 REAL deposit)
   * Optionally filtered by sinceDate for launch cutoff
   */
  async getVerifiedReferralsDetails(parentId: string, sinceDate?: Date): Promise<{
    totalDirectCount: number;
    verifiedCount: number;
    verifiedRefUserIds: string[];
  }> {
    try {
      const relationships = await referralRepository.findRelationshipsByParentId(parentId, { referralLevel: 1, limit: 500 });
      let verifiedCount = 0;
      const verifiedRefUserIds: string[] = [];

      for (const rel of relationships) {
        // Qualifying achievement (>= $50 REAL deposit) must occur on or after TASK_REWARDS_LAUNCH_DATE
        const childTotalDeposit = await this.getUserRealTotalDeposits(rel.childId, sinceDate);
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
  async getUserTasks(userIdOrUid: string): Promise<{
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
    const user = await this.resolveUser(userIdOrUid);
    const userId = user ? user.id : userIdOrUid;

    const definitions = await taskRepository.findAllActiveTaskDefinitions();
    const claims = await taskRepository.findUserTaskClaims(userId);
    const userSettings = await settingsRepository.findUserSettingsByUserId(userId);
    const wallet = await walletRepository.findByUserId(userId);

    // Apply TASK_REWARDS_LAUNCH_DATE cutoff for deposit and referral milestone progress
    const realTotalDeposits = await this.getUserRealTotalDeposits(userId, TASK_REWARDS_LAUNCH_DATE);
    const directReferrals = await referralRepository.findRelationshipsByParentId(userId, { referralLevel: 1, limit: 500 });
    // Filter post-launch Level-1 direct referrals for referral registration reward
    const postLaunchDirectReferrals = directReferrals.filter((r) => new Date(r.createdAt) >= TASK_REWARDS_LAUNCH_DATE);
    const { verifiedCount: verifiedRefUsersCount } = await this.getVerifiedReferralsDetails(userId, TASK_REWARDS_LAUNCH_DATE);
    const totalDirectCount = postLaunchDirectReferrals.length;

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

    const taskDTOs: UserTaskStatusDTO[] = [];

    for (const def of definitions) {
      const taskCode = def.taskCode;
      const userClaimsForTask = claimMap.get(taskCode) || [];
      const hasDefaultClaim = userClaimsForTask.some((c) => c.claimKey === 'DEFAULT');

      let currentProgress = 0;
      const targetProgress = parseFloat(def.targetProgress || '1');
      let rewardAmount = parseFloat(def.rewardAmount || '0');
      const minDepRequired = parseFloat(def.minDepositRequired || '0');
      let status: 'LOCKED' | 'IN_PROGRESS' | 'COMPLETED' | 'CLAIMED' = 'IN_PROGRESS';
      let ruleConfigObj: any = {};
      let referralDetails: ReferralChildDetailDTO[] | undefined = undefined;

      try {
        if (def.ruleConfig) ruleConfigObj = JSON.parse(def.ruleConfig);
      } catch (e) {
        ruleConfigObj = {};
      }

      // Calculate logic per task type
      if (taskCode === 'REGISTRATION_TRIAL_FUND') {
        const isTrialClaimed = hasDefaultClaim || userClaimsForTask.length > 0 || wallet?.trialExpiresAt !== null;
        currentProgress = 1;
        if (isTrialClaimed) {
          status = 'CLAIMED';
        } else if (parseFloat(wallet?.trialBalance || '0') > 0) {
          status = 'COMPLETED';
        } else {
          status = 'LOCKED';
        }
      } else if (taskCode === 'AUTHENTICATOR_SETUP') {
        const isClaimed = hasDefaultClaim || userClaimsForTask.length > 0;
        const is2FA = !!userSettings?.mfaEnabled || !!(user as any)?.twoFactorEnabled;
        currentProgress = isClaimed || is2FA ? 1 : 0;
        if (isClaimed) {
          status = 'CLAIMED';
        } else if (is2FA) {
          status = 'COMPLETED';
        } else {
          status = 'IN_PROGRESS';
        }
      } else if (taskCode === 'JOIN_TELEGRAM') {
        const isClaimed = hasDefaultClaim || userClaimsForTask.length > 0;
        currentProgress = isClaimed ? 1 : 0;
        status = isClaimed ? 'CLAIMED' : 'LOCKED';
      } else if (taskCode === 'REFERRAL_REGISTRATION_SINGLE') {
        currentProgress = totalDirectCount;
        const claimMapByChildId = new Map<string, any>();
        for (const c of userClaimsForTask) {
          claimMapByChildId.set(c.claimKey, c);
        }
        const unclaimedRefs = postLaunchDirectReferrals.filter((r) => !claimMapByChildId.has(r.childId));
        const unclaimedCount = unclaimedRefs.length;
        const unitReward = parseFloat(def.rewardPerUnit || def.rewardAmount || '0.10');

        if (unclaimedCount > 0) {
          status = 'COMPLETED';
          rewardAmount = unclaimedCount * unitReward;
        } else if (totalDirectCount > 0) {
          status = 'CLAIMED';
        } else {
          status = 'IN_PROGRESS';
        }

        // Hydrate details for each aggregated child referral
        referralDetails = [];
        for (const ref of postLaunchDirectReferrals) {
          const childUser = await userRepository.findById(ref.childId);
          const claimRecord = claimMapByChildId.get(ref.childId);
          referralDetails.push({
            childId: ref.childId,
            userId: childUser?.userId || 'DS------',
            username: childUser?.username || childUser?.name || 'Anonymous User',
            name: childUser?.name || null,
            registeredAt: ref.createdAt.toISOString(),
            rewardAmount: unitReward,
            isClaimed: !!claimRecord,
            claimedAt: claimRecord?.claimedAt ? new Date(claimRecord.claimedAt).toISOString() : null,
          });
        }
      } else if (def.category === 'DEPOSIT' || def.triggerType === 'DEPOSIT_TOTAL') {
        currentProgress = Math.min(targetProgress, realTotalDeposits);
        const isClaimed = hasDefaultClaim || userClaimsForTask.length > 0;
        if (isClaimed) {
          status = 'CLAIMED';
        } else if (realTotalDeposits >= targetProgress) {
          status = 'COMPLETED';
        } else if (realTotalDeposits > 0) {
          status = 'IN_PROGRESS';
        } else {
          status = 'LOCKED';
        }
      } else if (def.category === 'REFERRAL' || def.triggerType === 'REFERRAL_COUNT') {
        currentProgress = Math.min(targetProgress, verifiedRefUsersCount);
        const isClaimed = hasDefaultClaim || userClaimsForTask.length > 0;
        if (isClaimed) {
          status = 'CLAIMED';
        } else if (verifiedRefUsersCount >= targetProgress) {
          status = 'COMPLETED';
        } else if (verifiedRefUsersCount > 0) {
          status = 'IN_PROGRESS';
        } else {
          status = 'LOCKED';
        }
      }

      // Metrics calculation
      if (status === 'CLAIMED') {
        const totalClaimedForThis = userClaimsForTask.reduce(
          (sum, c) => sum + parseFloat(c.rewardAmount || '0'),
          0
        );
        if (def.rewardType === 'CASH') {
          totalEarned += totalClaimedForThis > 0 ? totalClaimedForThis : rewardAmount;
        }
        completedCount++;
      } else if (status === 'COMPLETED') {
        if (def.rewardType === 'CASH') {
          claimableTotal += rewardAmount;
        }
        if (taskCode === 'REFERRAL_REGISTRATION_SINGLE') {
          const totalClaimedForThis = userClaimsForTask.reduce(
            (sum, c) => sum + parseFloat(c.rewardAmount || '0'),
            0
          );
          totalEarned += totalClaimedForThis;
        }
        completedCount++;
      } else if (status === 'IN_PROGRESS') {
        inProgressCount++;
      }

      taskDTOs.push({
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
        claimedAt: (hasDefaultClaim || userClaimsForTask.length > 0) ? userClaimsForTask[0]?.claimedAt : (taskCode === 'REGISTRATION_TRIAL_FUND' && wallet?.trialExpiresAt ? wallet.trialExpiresAt : null),
        ruleConfig: ruleConfigObj,
        referralDetails,
      });
    }

    return {
      tasks: taskDTOs,
      summary: {
        totalEarned: parseFloat(totalEarned.toFixed(2)),
        claimableTotal: parseFloat(claimableTotal.toFixed(2)),
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
  async claimTaskReward(userIdOrUid: string, taskCode: string, claimKey: string = 'DEFAULT') {
    const user = await this.resolveUser(userIdOrUid);
    if (!user) {
      throw new Error('User record not found.');
    }
    const userId = user.id;

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

    // Enforce maxClaimsPerUser for standard tasks
    const maxAllowedClaims = typeof taskDef.maxClaimsPerUser === 'number' ? taskDef.maxClaimsPerUser : 1;
    if (taskCode !== 'REFERRAL_REGISTRATION_SINGLE') {
      const existingClaimsCount = await taskRepository.countUserClaimsByTask(userId, taskCode);
      if (existingClaimsCount >= maxAllowedClaims) {
        return {
          alreadyClaimed: true,
          message: 'You have reached the maximum allowed claims for this task.',
          claim: null,
        };
      }
    }

    const wallet = await walletRepository.findByUserId(userId);
    if (!wallet) {
      throw new Error('Wallet record not found.');
    }

    const rewardAmountNum = parseFloat(taskDef.rewardAmount || '0');
    const rewardType = taskDef.rewardType;

    // Validate Qualification Rules
    if (taskCode === 'REGISTRATION_TRIAL_FUND') {
      if (wallet.trialExpiresAt !== null) {
        return {
          alreadyClaimed: true,
          message: 'Registration Trial Fund has already been claimed.',
          claim: null,
        };
      }

      const trialBal = parseFloat(wallet.trialBalance || '0');
      if (trialBal <= 0) {
        throw new Error('No eligible Trial Fund balance available to claim.');
      }

      const durationSetting = await settingsRepository.findSystemSettingByKey('TRIAL_FUND_DURATION_DAYS');
      const trialDurationDays = durationSetting ? parseInt(durationSetting.value, 10) : 3;
      const validDays = !isNaN(trialDurationDays) && trialDurationDays > 0 ? trialDurationDays : 3;
      const trialExpiresAt = new Date(Date.now() + validDays * 24 * 60 * 60 * 1000);

      await walletRepository.updateBalances(wallet.id, {
        trialExpiresAt,
      });

      const claim = await taskRepository.createTaskClaim({
        userId,
        taskId: taskDef.id,
        taskCode,
        claimKey,
        rewardAmount: '0.00000000',
        rewardType: 'TRIAL_FUND',
        claimMetadata: JSON.stringify({ note: 'Welcome Trial Fund verified', claimedAt: new Date() }),
      });
      return {
        alreadyClaimed: false,
        message: 'Trial Fund registration reward acknowledged and trial expiration countdown started!',
        claim,
      };
    }

    if (taskCode === 'JOIN_TELEGRAM') {
      throw new Error('Official Telegram verification is currently pending. This task is currently locked.');
    }

    if (taskCode === 'AUTHENTICATOR_SETUP') {
      const userSettings = await settingsRepository.findUserSettingsByUserId(userId);
      const is2FA = !!userSettings?.mfaEnabled || !!(user as any)?.twoFactorEnabled;
      if (!is2FA) {
        throw new Error('Please complete 2FA Authenticator setup in Security Settings first.');
      }
    } else if (taskCode === 'REFERRAL_REGISTRATION_SINGLE') {
      const directReferrals = await referralRepository.findRelationshipsByParentId(userId, { referralLevel: 1, limit: 500 });
      const postLaunchDirectReferrals = directReferrals.filter((r) => new Date(r.createdAt) >= TASK_REWARDS_LAUNCH_DATE);
      const userClaimsForTask = await taskRepository.findUserTaskClaims(userId);
      const referralClaims = userClaimsForTask.filter((c) => c.taskCode === 'REFERRAL_REGISTRATION_SINGLE');
      const claimedChildIds = new Set(referralClaims.map((c) => c.claimKey));

      const unclaimedRefs = postLaunchDirectReferrals.filter((r) => !claimedChildIds.has(r.childId));
      if (unclaimedRefs.length === 0) {
        throw new Error('No unclaimed referral registration rewards available. Invite new registered referrals to earn $0.10 per registration.');
      }

      const unitReward = parseFloat(taskDef.rewardPerUnit || taskDef.rewardAmount || '0.10');
      const totalPayout = unclaimedRefs.length * unitReward;

      // Atomic Balance Credit for aggregated USDT reward
      const currentAvailable = parseFloat(wallet.availableBalance);
      const updatedAvailable = (currentAvailable + totalPayout).toFixed(8);
      const currentIncentive = parseFloat(wallet.incentiveIncome || '0');
      const updatedIncentive = (currentIncentive + totalPayout).toFixed(8);

      await walletRepository.updateBalances(wallet.id, {
        availableBalance: updatedAvailable,
        incentiveIncome: updatedIncentive,
      });

      // Single Ledger Transaction Record
      const txRecord = await transactionRepository.createTransaction({
        userId,
        walletId: wallet.id,
        type: 'TASK_REWARD',
        referenceId: `TASK_CLAIM_REF_REG_${Date.now()}`,
        amount: totalPayout.toFixed(8),
        balanceBefore: currentAvailable.toFixed(8),
        balanceAfter: updatedAvailable,
        status: 'COMPLETED',
        description: `Task Reward: Successful Referral Registration (${unclaimedRefs.length} referral${unclaimedRefs.length > 1 ? 's' : ''}: +$${totalPayout.toFixed(2)} USDT)`,
      });

      // Record in Income History so it populates Incentive Income and Analytics
      try {
        await incomeService.recordIncome({
          userId,
          walletId: wallet.id,
          type: 'INCENTIVE',
          amount: totalPayout.toFixed(8),
          description: `Task Reward: Successful Referral Registration (${unclaimedRefs.length} referral${unclaimedRefs.length > 1 ? 's' : ''})`,
          transactionId: txRecord.id,
        });
      } catch (incomeErr) {
        console.error('Failed to log income history for referral task reward:', incomeErr);
      }

      // Record individual claim records for each childId for eligibility tracking & idempotency
      const claimRecords = [];
      for (const ref of unclaimedRefs) {
        const claimRec = await taskRepository.createTaskClaim({
          userId,
          taskId: taskDef.id,
          taskCode,
          claimKey: ref.childId, // Per-referral childId as claimKey
          rewardAmount: unitReward.toFixed(8),
          rewardType: 'CASH',
          transactionId: txRecord.id,
          claimMetadata: JSON.stringify({
            childId: ref.childId,
            batchClaimCount: unclaimedRefs.length,
            batchTotalPayout: totalPayout.toFixed(8),
          }),
        });
        claimRecords.push(claimRec);
      }

      await auditRepository.createAuditLog({
        actorUid: userId,
        userId,
        action: 'TASK_REWARD_CLAIMED',
        resource: `tasks/${taskDef.id}`,
        newValue: JSON.stringify({
          taskCode,
          claimedReferralCount: unclaimedRefs.length,
          totalPayout,
          claimedChildIds: unclaimedRefs.map((r) => r.childId),
        }),
      });

      return {
        alreadyClaimed: false,
        message: `🎉 Successfully claimed $${totalPayout.toFixed(2)} USDT for ${unclaimedRefs.length} referral registration${unclaimedRefs.length > 1 ? 's' : ''}!`,
        rewardAmount: totalPayout,
        newAvailableBalance: updatedAvailable,
        claim: claimRecords[0],
      };
    } else if (taskDef.category === 'DEPOSIT' || taskDef.triggerType === 'DEPOSIT_TOTAL') {
      const realDeposits = await this.getUserRealTotalDeposits(userId, TASK_REWARDS_LAUNCH_DATE);
      const target = parseFloat(taskDef.targetProgress || '0');
      if (realDeposits < target) {
        throw new Error(`Deposit milestone requirement not met. Required: $${target} REAL deposit after launch.`);
      }
    } else if (taskDef.category === 'REFERRAL' || taskDef.triggerType === 'REFERRAL_COUNT') {
      const { verifiedCount } = await this.getVerifiedReferralsDetails(userId, TASK_REWARDS_LAUNCH_DATE);
      const target = parseFloat(taskDef.targetProgress || '0');
      if (verifiedCount < target) {
        throw new Error(`Referral milestone requirement not met. Required: ${target} verified referrals with min $50 REAL deposit after launch.`);
      }
    }

    // Atomic Balance Credit for CASH rewards
    let newBalanceStr = wallet.availableBalance;
    let txRecord = null;

    if (rewardType === 'CASH' && rewardAmountNum > 0) {
      const currentAvailable = parseFloat(wallet.availableBalance);
      const updatedAvailable = (currentAvailable + rewardAmountNum).toFixed(8);
      const currentIncentive = parseFloat(wallet.incentiveIncome || '0');
      const updatedIncentive = (currentIncentive + rewardAmountNum).toFixed(8);

      await walletRepository.updateBalances(wallet.id, {
        availableBalance: updatedAvailable,
        incentiveIncome: updatedIncentive,
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

      // Record in Income History so it populates Incentive Income and Analytics
      try {
        await incomeService.recordIncome({
          userId,
          walletId: wallet.id,
          type: 'INCENTIVE',
          amount: rewardAmountNum.toFixed(8),
          description: `Task Reward: ${taskDef.title}`,
          transactionId: txRecord.id,
        });
      } catch (incomeErr) {
        console.error('Failed to log income history for task reward:', incomeErr);
      }
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
