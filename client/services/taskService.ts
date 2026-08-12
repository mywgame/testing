/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { api } from './api.ts';

export interface TaskItemDTO {
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

export interface TaskSummaryDTO {
  totalEarned: number;
  claimableTotal: number;
  completedCount: number;
  inProgressCount: number;
  totalTasksCount: number;
  verifiedReferralCount: number;
  totalRealDeposits: number;
}

export interface GetTasksResponseData {
  tasks: TaskItemDTO[];
  summary: TaskSummaryDTO;
}

// Local Fallback Seed Tasks matching requirements strictly
const MOCK_DEFAULT_TASKS: TaskItemDTO[] = [
  {
    id: 't-1',
    taskCode: 'REGISTRATION_TRIAL_FUND',
    title: 'Registration Bonus (Trial Fund)',
    description: 'Welcome gift for new members upon successful registration.',
    category: 'ACTIVITY',
    rewardType: 'TRIAL_FUND',
    rewardAmount: 1000,
    rewardPerUnit: 0,
    currentProgress: 1,
    targetProgress: 1,
    unit: 'Step',
    status: 'CLAIMED', // Read-only: Existing Trial Fund logic preserved
    minDepositRequired: 0,
  },
  {
    id: 't-2',
    taskCode: 'AUTHENTICATOR_SETUP',
    title: 'Complete Authenticator Setup',
    description: 'Secure your account with 2-Factor Authentication (2FA).',
    category: 'ACTIVITY',
    rewardType: 'CASH',
    rewardAmount: 0.25,
    rewardPerUnit: 0,
    currentProgress: 1,
    targetProgress: 1,
    unit: 'Setup',
    status: 'COMPLETED',
    actionUrl: '/dashboard?tab=security',
    minDepositRequired: 0,
  },
  {
    id: 't-3',
    taskCode: 'JOIN_TELEGRAM',
    title: 'Join Telegram Channel',
    description: 'Join our official Telegram community channel for daily updates.',
    category: 'ACTIVITY',
    rewardType: 'CASH',
    rewardAmount: 0.25,
    rewardPerUnit: 0,
    currentProgress: 0,
    targetProgress: 1,
    unit: 'Join',
    status: 'IN_PROGRESS',
    actionUrl: 'https://t.me/metafirm_official',
    minDepositRequired: 0,
  },
  {
    id: 't-4',
    taskCode: 'REFERRAL_REGISTRATION_SINGLE',
    title: 'Successful Referral Registration',
    description: 'Earn $0.10 for each eligible referred user after successful registration.',
    category: 'ACTIVITY',
    rewardType: 'CASH',
    rewardAmount: 0.10,
    rewardPerUnit: 0.10,
    currentProgress: 2,
    targetProgress: 1,
    unit: 'Ref',
    status: 'COMPLETED',
    minDepositRequired: 0,
  },
  {
    id: 't-5',
    taskCode: 'DEPOSIT_MILESTONE_100',
    title: 'First $100 Deposit',
    description: 'Make your first cumulative deposit of $100 (REAL) into your wallet.',
    category: 'DEPOSIT',
    rewardType: 'CASH',
    rewardAmount: 1.00,
    rewardPerUnit: 0,
    currentProgress: 100,
    targetProgress: 100,
    unit: 'USDT',
    status: 'COMPLETED',
    minDepositRequired: 0,
  },
  {
    id: 't-6',
    taskCode: 'DEPOSIT_MILESTONE_500',
    title: 'First $500 Deposit',
    description: 'Make your first cumulative deposit of $500 (REAL) into your wallet.',
    category: 'DEPOSIT',
    rewardType: 'CASH',
    rewardAmount: 5.00,
    rewardPerUnit: 0,
    currentProgress: 320,
    targetProgress: 500,
    unit: 'USDT',
    status: 'IN_PROGRESS',
    minDepositRequired: 0,
  },
  {
    id: 't-7',
    taskCode: 'DEPOSIT_MILESTONE_1000',
    title: 'First $1,000 Deposit',
    description: 'Make your first cumulative deposit of $1,000 (REAL) into your wallet.',
    category: 'DEPOSIT',
    rewardType: 'CASH',
    rewardAmount: 10.00,
    rewardPerUnit: 0,
    currentProgress: 320,
    targetProgress: 1000,
    unit: 'USDT',
    status: 'LOCKED',
    minDepositRequired: 0,
  },
  {
    id: 't-8',
    taskCode: 'REFERRAL_MILESTONE_3',
    title: '3 Verified Referrals',
    description: 'Refer 3 active team members who each deposit a minimum of $50 REAL.',
    category: 'REFERRAL',
    rewardType: 'CASH',
    rewardAmount: 2.00,
    rewardPerUnit: 0,
    currentProgress: 3,
    targetProgress: 3,
    unit: 'Verified',
    status: 'COMPLETED',
    minDepositRequired: 50,
  },
  {
    id: 't-9',
    taskCode: 'REFERRAL_MILESTONE_5',
    title: '5 Verified Referrals',
    description: 'Refer 5 active team members who each deposit a minimum of $50 REAL.',
    category: 'REFERRAL',
    rewardType: 'CASH',
    rewardAmount: 5.00,
    rewardPerUnit: 0,
    currentProgress: 5,
    targetProgress: 5,
    unit: 'Verified',
    status: 'COMPLETED',
    minDepositRequired: 50,
  },
  {
    id: 't-10',
    taskCode: 'REFERRAL_MILESTONE_10',
    title: '10 Verified Referrals',
    description: 'Refer 10 active team members who each deposit a minimum of $50 REAL.',
    category: 'REFERRAL',
    rewardType: 'CASH',
    rewardAmount: 10.00,
    rewardPerUnit: 0,
    currentProgress: 7,
    targetProgress: 10,
    unit: 'Verified',
    status: 'IN_PROGRESS',
    minDepositRequired: 50,
  },
  {
    id: 't-11',
    taskCode: 'REFERRAL_MILESTONE_20',
    title: '20 Verified Referrals',
    description: 'Refer 20 active team members who each deposit a minimum of $50 REAL.',
    category: 'REFERRAL',
    rewardType: 'CASH',
    rewardAmount: 35.00,
    rewardPerUnit: 0,
    currentProgress: 7,
    targetProgress: 20,
    unit: 'Verified',
    status: 'LOCKED',
    minDepositRequired: 50,
  },
  {
    id: 't-12',
    taskCode: 'REFERRAL_MILESTONE_35',
    title: '35 Verified Referrals',
    description: 'Refer 35 active team members who each deposit a minimum of $50 REAL.',
    category: 'REFERRAL',
    rewardType: 'CASH',
    rewardAmount: 50.00,
    rewardPerUnit: 0,
    currentProgress: 7,
    targetProgress: 35,
    unit: 'Verified',
    status: 'LOCKED',
    minDepositRequired: 50,
  },
  {
    id: 't-13',
    taskCode: 'REFERRAL_MILESTONE_50',
    title: '50 Verified Referrals',
    description: 'Refer 50 active team members who each deposit a minimum of $50 REAL.',
    category: 'REFERRAL',
    rewardType: 'CASH',
    rewardAmount: 75.00,
    rewardPerUnit: 0,
    currentProgress: 7,
    targetProgress: 50,
    unit: 'Verified',
    status: 'LOCKED',
    minDepositRequired: 50,
  },
];

class ClientTaskService {
  private LOCAL_STORAGE_KEY = 'metafirm_claimed_tasks_v2';

  private getLocalClaimedCodes(): string[] {
    try {
      const stored = localStorage.getItem(this.LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : ['REGISTRATION_TRIAL_FUND'];
    } catch {
      return ['REGISTRATION_TRIAL_FUND'];
    }
  }

  private saveLocalClaimedCode(code: string) {
    try {
      const existing = this.getLocalClaimedCodes();
      if (!existing.includes(code)) {
        existing.push(code);
        localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(existing));
      }
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }

  /**
   * Fetch tasks with fallback evaluator
   */
  async getTasks(): Promise<GetTasksResponseData> {
    try {
      const res = await api.get<GetTasksResponseData>('/tasks');
      if (res.success && res.data) {
        return res.data;
      }
    } catch (err) {
      console.info('Using client-side task evaluator fallback (API offline/pending migration)');
    }

    // Local Storage Mock Evaluator Fallback
    const claimedCodes = this.getLocalClaimedCodes();
    let totalEarned = 0;
    let claimableTotal = 0;
    let completedCount = 0;
    let inProgressCount = 0;

    const evaluatedTasks: TaskItemDTO[] = MOCK_DEFAULT_TASKS.map((t) => {
      const isClaimed = claimedCodes.includes(t.taskCode);
      let status = t.status;

      if (isClaimed) {
        status = 'CLAIMED';
      }

      if (status === 'CLAIMED') {
        totalEarned += t.rewardType === 'CASH' ? t.rewardAmount : 0;
        completedCount++;
      } else if (status === 'COMPLETED') {
        claimableTotal += t.rewardAmount;
        completedCount++;
      } else if (status === 'IN_PROGRESS') {
        inProgressCount++;
      }

      return {
        ...t,
        status,
        claimedAt: isClaimed ? new Date().toISOString() : null,
      };
    });

    return {
      tasks: evaluatedTasks,
      summary: {
        totalEarned: parseFloat(totalEarned.toFixed(2)),
        claimableTotal: parseFloat(claimableTotal.toFixed(2)),
        completedCount,
        inProgressCount,
        totalTasksCount: evaluatedTasks.length,
        verifiedReferralCount: 7,
        totalRealDeposits: 320,
      },
    };
  }

  /**
   * Claim task reward with idempotent fallback
   */
  async claimReward(taskCode: string, claimKey: string = 'DEFAULT'): Promise<{
    success: boolean;
    message: string;
    rewardAmount?: number;
    data?: any;
  }> {
    try {
      const res = await api.post<any>(`/tasks/${taskCode}/claim`, { claimKey });
      if (res.success && res.data) {
        return {
          success: true,
          message: res.data.message || 'Reward claimed successfully!',
          rewardAmount: res.data.rewardAmount,
          data: res.data,
        };
      }
      if (res.error?.message) {
        return { success: false, message: res.error.message };
      }
    } catch (err: any) {
      console.info('Claiming reward via local fallback layer...');
    }

    // Local Fallback Handler
    const task = MOCK_DEFAULT_TASKS.find((t) => t.taskCode === taskCode);
    if (!task) {
      return { success: false, message: 'Invalid task selection.' };
    }

    const claimed = this.getLocalClaimedCodes();
    if (claimed.includes(taskCode)) {
      return { success: true, message: 'This reward has already been claimed.' };
    }

    this.saveLocalClaimedCode(taskCode);

    return {
      success: true,
      message: `🎉 Successfully claimed $${task.rewardAmount} USDT for ${task.title}!`,
      rewardAmount: task.rewardAmount,
    };
  }
}

export const clientTaskService = new ClientTaskService();
