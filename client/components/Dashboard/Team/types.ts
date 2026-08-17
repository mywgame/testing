/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TeamMember {
  id?: string;
  username: string;
  userId: string;
  vipRank: 'VIP1' | 'VIP2' | 'VIP3' | 'VIP4' | 'VIP5' | 'VIP6' | 'VIP7' | 'VIP8';
  todaysIncome: string;
  totalContribution?: string;
  contributionStatus: 'Qualified' | 'Missed';
  isEligible?: boolean;
  contributionAmount?: number;
  totalContributionAmount?: number;
  claimedDpy?: string;
}

export type ReferralLevel = 'Level A' | 'Level B' | 'Level C' | 'Level D';
