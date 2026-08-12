/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TeamMember {
  username: string;
  vipRank: 'VIP1' | 'VIP2' | 'VIP3' | 'VIP4' | 'VIP5' | 'VIP6' | 'VIP7' | 'VIP8';
  todaysIncome: string;
}

export type ReferralLevel = 'Level A' | 'Level B' | 'Level C' | 'Level D';
