/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Re-export common backend shared types to keep import signatures clean on the frontend
export * from '../../shared/types/index.ts';

// Add any client-only UI types here
export interface UIState {
  isSidebarOpen: boolean;
  activeTab: string;
}

export interface DashboardData {
  wallet: {
    id: string;
    availableBalance: string;
    lockedBalance: string;
    principalBalance: string;
    trialBalance: string;
    totalAssets: string;
    totalDeposited: string;
    totalWithdrawn: string;
  };
  depositAddresses: Array<{ network: string; address: string }>;
  earnings: {
    referralIncome: string;
    dailyYield: string;
    teamIncome: string;
    incentiveIncome: string;
    todayReferralIncome?: string;
    todayDailyYield?: string;
    todayTeamIncome?: string;
    todayIncentiveIncome?: string;
  };
  vip: {
    tier: string;
    points: string;
    levelAValidCount: number;
    levelBcdValidCount: number;
    teamTotalCount: number;
    assignedAt: string | null;
  };
  team: {
    levelACount: number;
    levelBCount: number;
    levelCCount: number;
    levelDCount: number;
    totalReferralCount: number;
    levelAValidCount: number;
    levelBcdValidCount: number;
    teamTotalValidCount: number;
  };
  dailyClaim: {
    available: boolean;
    claimId: string | null;
    amount: string;
    windowClose: string | null;
    status: string;
    streakDays?: number;
    history7Days?: Array<{
      date: string;
      status: 'CLAIMED' | 'MISSED' | 'PENDING' | 'NONE';
    }>;
  };
  earningsHistory?: Array<{
    date: string;
    earnings: number;
  }>;
  recentTransactions: any[];
  recentActivities: any[];
  trialFundInfo: {
    amount: string;
    durationDays: number;
    activeTrialBalance: string;
    trialExpiresAt: string | null;
    isActive: boolean;
  };
  referralConfig?: {
    mode: 'PERCENTAGE' | 'FIXED';
    percentage: string;
    fixedAmount: string;
    thisMonthReferralEarnings: string;
  };
}

export type IncomeAccent = 'emerald' | 'cyan' | 'purple' | 'amber';

export interface MockIdentity {
  name: string;
  id: string;
  rankLabel: string;
  rankColor: string;
  rankBg: string;
  rankIcon: string;
  streakDays: number;
  online: boolean;
}

export interface MockDailyClaim {
  available: boolean;
  rewardUsdt: number;
  streakDays: number;
  streakBonusPercent: number;
  timerSecondsRemaining: number;
  nextResetUtcIso: string;
  history7Days: Array<{
    dateLabel: string;
    dayName: string;
    status: 'claimed' | 'today-ready' | 'upcoming' | 'missed';
    rewardUsdt: number;
  }>;
}

export interface MockTransaction {
  id: string;
  type: string;
  displayType?: string;
  title?: string;
  subtitle?: string;
  amountUsdt?: number;
  amount?: number;
  token?: string;
  time?: string;
  timestampIso?: string;
  createdAt?: string | Date;
  status?: string;
  hash?: string;
  network?: string;
}

export interface MockNetworkSummary {
  inviteCode: string;
  referralLink: string;
  totalTeamMembers: number;
  activeDirects: number;
  teamVolumeUsdt: number;
  levels: {
    l1: { count: number; validCount: number; commissionPercent: number; earnedUsdt: number };
    l2: { count: number; validCount: number; commissionPercent: number; earnedUsdt: number };
    l3: { count: number; validCount: number; commissionPercent: number; earnedUsdt: number };
    l4: { count: number; validCount: number; commissionPercent: number; earnedUsdt: number };
  };
}

