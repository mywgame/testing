/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { api } from './api.ts';

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
  referralDetails?: ReferralChildDetailDTO[];
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

class ClientTaskService {
  /**
   * Fetch user's real task definitions and progress from backend API
   */
  async getTasks(): Promise<GetTasksResponseData> {
    const res = await api.get<GetTasksResponseData>('/tasks');
    if (res.success && res.data) {
      return res.data;
    }
    if (res.error?.message) {
      throw new Error(res.error.message);
    }
    throw new Error('Failed to load tasks and rewards from server.');
  }

  /**
   * Claim task reward through authoritative backend API
   */
  async claimReward(taskCode: string, claimKey: string = 'DEFAULT'): Promise<{
    success: boolean;
    message: string;
    rewardAmount?: number;
    data?: any;
  }> {
    const res = await api.post<any>(`/tasks/${taskCode}/claim`, { claimKey });
    if (res.success && res.data) {
      return {
        success: true,
        message: res.data.message || 'Reward claimed successfully!',
        rewardAmount: res.data.rewardAmount,
        data: res.data,
      };
    }
    return {
      success: false,
      message: res.error?.message || 'Failed to claim task reward.',
    };
  }
}

export const clientTaskService = new ClientTaskService();

