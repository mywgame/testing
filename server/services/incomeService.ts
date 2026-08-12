/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { incomeRepository } from '../repositories/incomeRepository.ts';
import { walletRepository } from '../repositories/walletRepository.ts';

export class IncomeService {
  /**
   * Helper to write a new income log entry for auditing and analytics grouping
   */
  async recordIncome(data: {
    userId: string;
    walletId: string;
    type: string; // e.g., 'REFERRAL', 'DAILY_YIELD', 'TEAM_INCOME', 'INCENTIVE'
    amount: string;
    description: string;
    transactionId: string;
  }) {
    return incomeRepository.createIncome(data);
  }

  /**
   * Get paginated income history logs for a user
   */
  async getUserIncomeHistory(
    userId: string,
    options?: { limit?: number; offset?: number; type?: string }
  ) {
    return incomeRepository.findByUserId(userId, options);
  }

  /**
   * Retrieve structured total summary metrics for user dashboard display card
   * Categorizes aggregate earnings exactly as defined in Section 10:
   * - Referral Income (REFERRAL)
   * - Daily Yield (DAILY_YIELD)
   * - Team Income (TEAM_INCOME)
   * - Incentive Income (INCENTIVE, SALARY, Weekly Salary, Rewards, etc.)
   */
  async getUserIncomeSummary(userId: string) {
    const wallet = await walletRepository.findByUserId(userId);
    const summaryList = await incomeRepository.getIncomeSummaryByUserId(userId);
    
    let referralIncome = 0;
    let dailyYield = 0;
    let teamIncome = 0;
    let incentiveIncome = 0;

    for (const item of summaryList) {
      const amount = parseFloat(item.totalAmount || '0.0');
      switch (item.type) {
        case 'REFERRAL':
          referralIncome += amount;
          break;
        case 'DAILY_YIELD':
          dailyYield += amount;
          break;
        case 'TEAM_INCOME':
          teamIncome += amount;
          break;
        default:
          // Any other income type (SALARY, INCENTIVE, AIRDROP, REWARD, manual adjustments, etc.)
          // is grouped under Incentive Income as per Section 10 rules.
          incentiveIncome += amount;
          break;
      }
    }

    if (wallet) {
      referralIncome = Math.max(referralIncome, parseFloat(wallet.referralIncome || '0'));
      dailyYield = Math.max(dailyYield, parseFloat(wallet.dailyYield || '0'));
      teamIncome = Math.max(teamIncome, parseFloat(wallet.teamIncome || '0'));
      incentiveIncome = Math.max(incentiveIncome, parseFloat(wallet.incentiveIncome || '0'));
    }

    return {
      referralIncome: referralIncome.toFixed(8),
      dailyYield: dailyYield.toFixed(8),
      teamIncome: teamIncome.toFixed(8),
      incentiveIncome: incentiveIncome.toFixed(8),
      totalEarned: (referralIncome + dailyYield + teamIncome + incentiveIncome).toFixed(8),
    };
  }

  /**
   * Retrieve today's summary metrics for user dashboard display card
   */
  async getTodayUserIncomeSummary(userId: string, startOfDay: Date) {
    const summaryList = await incomeRepository.getTodayIncomeSummaryByUserId(userId, startOfDay);

    let referralIncome = 0;
    let dailyYield = 0;
    let teamIncome = 0;
    let incentiveIncome = 0;

    for (const item of summaryList) {
      const amount = parseFloat(item.totalAmount || '0.0');
      switch (item.type) {
        case 'REFERRAL':
        case 'REFERRAL_INCOME':
          referralIncome += amount;
          break;
        case 'DAILY_YIELD':
          dailyYield += amount;
          break;
        case 'TEAM_INCOME':
          teamIncome += amount;
          break;
        default:
          incentiveIncome += amount;
          break;
      }
    }

    return {
      todayReferralIncome: referralIncome.toFixed(8),
      todayDailyYield: dailyYield.toFixed(8),
      todayTeamIncome: teamIncome.toFixed(8),
      todayIncentiveIncome: incentiveIncome.toFixed(8),
    };
  }
}

export const incomeService = new IncomeService();
export default incomeService;
