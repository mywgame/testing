/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { walletRepository } from '../repositories/walletRepository.ts';
import { vipRepository } from '../repositories/vipRepository.ts';
import { transactionRepository } from '../repositories/transactionRepository.ts';
import { activityRepository } from '../repositories/activityRepository.ts';
import { referralService } from './referralService.ts';
import { incomeService } from './incomeService.ts';
import { settingsRepository } from '../repositories/settingsRepository.ts';
import { claimRepository } from '../repositories/claimRepository.ts';
import { depositAddressRepository } from '../repositories/depositAddressRepository.ts';
import { claimService } from './claimService.ts';
import { userRepository } from '../repositories/userRepository.ts';
import { incomeRepository } from '../repositories/incomeRepository.ts';
import { trialFundService } from './trialFundService.ts';
import { depositRepository } from '../repositories/depositRepository.ts';
import { withdrawalRepository } from '../repositories/withdrawalRepository.ts';

export class DashboardService {
  /**
   * Aggregate all metrics and states to compile the comprehensive user dashboard payload
   */
  async getDashboardData(userId: string) {
    // 0. Lazily expire the Trial Principal if its configured duration has passed
    // (Business Logic Spec Section 4). Safe no-op if already expired/inactive.
    await trialFundService.checkAndExpireTrialFund(userId);

    // 1. Fetch wallet balances and calculations
    const wallet = await walletRepository.findByUserId(userId);
    if (!wallet) {
      throw new Error(`Wallet not found for user ${userId}`);
    }

    const availableBalance = parseFloat(wallet.availableBalance);
    const lockedBalance = parseFloat(wallet.lockedBalance);
    const trialBalance = parseFloat(wallet.trialBalance);
    const isTrialActive = trialBalance > 0 && wallet.trialExpiresAt !== null && new Date(wallet.trialExpiresAt) > new Date();
    // Business Logic Spec Section 4: Trial Fund is "Displayed together with the Main Wallet in the UI."
    const totalAssets = availableBalance + lockedBalance + (isTrialActive ? trialBalance : 0);

    // 2. Fetch categorized earnings totals (lifetime & today)
    const lifetimeEarnings = await incomeService.getUserIncomeSummary(userId);
    const nowForToday = new Date();
    const startOfToday = new Date(Date.UTC(nowForToday.getUTCFullYear(), nowForToday.getUTCMonth(), nowForToday.getUTCDate(), 0, 0, 0, 0));
    const todayEarnings = await incomeService.getTodayUserIncomeSummary(userId, startOfToday);

    const earnings = {
      ...lifetimeEarnings,
      ...todayEarnings,
    };

    // 3. Fetch VIP status and matrix eligibility
    let vip = await vipRepository.findByUserId(userId);
    if (!vip) {
      // Lazy init fallback if status was missing
      vip = await vipRepository.createVipStatus({
        userId,
        tier: 'VIP1',
      });
    }

    // 4. Fetch team members statistics
    const descendants = await referralService.getDownlineDescendants(userId);
    
    let levelACount = 0;
    let levelBCount = 0;
    let levelCCount = 0;
    let levelDCount = 0;

    let levelAValidCount = 0;
    let levelBcdValidCount = 0;

    // Resolve descendant wallets to check valid user count
    const descendantWallets = await Promise.all(
      descendants.map(async (d) => {
        const dWallet = await walletRepository.findByUserId(d.childId);
        return {
          referralLevel: d.referralLevel,
          wallet: dWallet,
        };
      })
    );

    for (const dw of descendantWallets) {
      const level = dw.referralLevel;
      if (level === 1) levelACount++;
      else if (level === 2) levelBCount++;
      else if (level === 3) levelCCount++;
      else if (level === 4) levelDCount++;

      if (dw.wallet) {
        const dBalance = parseFloat(dw.wallet.availableBalance) + parseFloat(dw.wallet.lockedBalance);
        if (dBalance >= 50.0) {
          if (level === 1) {
            levelAValidCount++;
          } else if (level >= 2 && level <= 4) {
            levelBcdValidCount++;
          }
        }
      }
    }

    // 5. Fetch recent transactions ledger (Limit 5)
    const rawRecentTransactions = await transactionRepository.findByUserId(userId, { limit: 5 });
    const recentTransactions = await Promise.all(
      rawRecentTransactions.map(async (tx) => {
        let refId = tx.referenceId;
        if (tx.type === 'DEPOSIT' && refId && !refId.startsWith('DEP')) {
          const dep = await depositRepository.findById(refId);
          if (dep?.referenceNumber) {
            refId = dep.referenceNumber;
          }
        } else if (tx.type === 'WITHDRAWAL' && refId && !refId.startsWith('WTH')) {
          const wth = await withdrawalRepository.findById(refId);
          if (wth?.reference) {
            refId = wth.reference;
          }
        }
        return {
          ...tx,
          referenceId: refId,
        };
      })
    );

    // 6. Fetch recent activity security logs (Limit 5)
    const recentActivities = await activityRepository.findByUserId(userId, { limit: 5 });

    // 7. Check if there's any active DPY yield claim open today, lazy-generating if none exists
    const now = new Date();
    let activeClaims = await claimRepository.findActiveClaimsInWindow(userId, now);
    if (activeClaims.length === 0) {
      const generated = await claimService.generateClaimForUser(userId, now);
      if (generated) {
        activeClaims = [generated];
      }
    }
    const dailyClaimAvailable = activeClaims.length > 0;
    const pendingClaim = dailyClaimAvailable ? activeClaims[0] : null;

    // 8. Load settings for debug trial fund representation
    const trialAmountSetting = await settingsRepository.findSystemSettingByKey('TRIAL_FUND_AMOUNT');
    const trialDurationSetting = await settingsRepository.findSystemSettingByKey('TRIAL_FUND_DURATION_DAYS');

    // 9. Fetch permanent deposit addresses
    const depositAddressesList = await depositAddressRepository.findByUserId(userId);

    // 10. Fetch real daily earnings history for monthly chart (last 14 days)
    const rawDailyEarnings = await incomeRepository.getDailyEarningsHistory(userId, 14);
    const earningsMap = new Map<string, number>();
    rawDailyEarnings.forEach(row => {
      if (row.dateStr) {
        earningsMap.set(row.dateStr, parseFloat(row.totalAmount || '0'));
      }
    });

    const earningsHistory: Array<{ date: string; earnings: number }> = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i));
      const yearStr = d.getUTCFullYear();
      const monthStr = String(d.getUTCMonth() + 1).padStart(2, '0');
      const dayStr = String(d.getUTCDate()).padStart(2, '0');
      const isoDate = `${yearStr}-${monthStr}-${dayStr}`;
      
      const label = `${d.getUTCDate()} ${monthNames[d.getUTCMonth()]}`;
      const earningsValue = earningsMap.get(isoDate) || 0;
      earningsHistory.push({
        date: label,
        earnings: Math.round(earningsValue * 100) / 100,
      });
    }

    // 11. Calculate real 7-day claim history & streak
    const userRecord = await userRepository.findById(userId);
    const userCreatedAt = userRecord ? new Date(userRecord.createdAt) : new Date(0);

    const sevenDaysAgo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 6, 0, 0, 0, 0));
    const endOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
    const rangeClaims = await claimRepository.findClaimsInDateRange(userId, sevenDaysAgo, endOfToday);

    const history7Days: Array<{ date: string; status: 'CLAIMED' | 'MISSED' | 'PENDING' | 'NONE' }> = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i));
      const dayOpen = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
      const dayClose = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999));

      const matchingClaim = rangeClaims.find(c => {
        const claimOpen = new Date(c.claimWindowOpenTime).getTime();
        return claimOpen >= dayOpen.getTime() && claimOpen <= dayClose.getTime();
      });

      let dayStatus: 'CLAIMED' | 'MISSED' | 'PENDING' | 'NONE' = 'NONE';
      const label = `${d.getUTCDate()} ${monthNames[d.getUTCMonth()]}`;

      if (matchingClaim) {
        if (matchingClaim.claimStatus === 'CLAIMED') {
          dayStatus = 'CLAIMED';
        } else if (matchingClaim.claimStatus === 'EXPIRED' || matchingClaim.claimStatus === 'FORFEITED') {
          dayStatus = 'MISSED';
        } else {
          if (i === 0) {
            dayStatus = 'PENDING';
          } else {
            dayStatus = 'MISSED';
          }
        }
      } else {
        if (i === 0) {
          dayStatus = 'PENDING';
        } else {
          if (dayClose.getTime() >= userCreatedAt.getTime()) {
            dayStatus = 'MISSED';
          } else {
            dayStatus = 'NONE';
          }
        }
      }

      history7Days.push({ date: label, status: dayStatus });
    }

    let streakDays = 0;
    for (let i = history7Days.length - 1; i >= 0; i--) {
      const item = history7Days[i];
      if (item.status === 'CLAIMED') {
        streakDays++;
      } else if (item.status === 'PENDING' && i === history7Days.length - 1) {
        continue;
      } else {
        break;
      }
    }

    // 12. Fetch active referral system configuration and current month referral earnings
    const refModeSetting = await settingsRepository.findSystemSettingByKey('REFERRAL_REWARD_MODE');
    const refPctSetting = await settingsRepository.findSystemSettingByKey('REFERRAL_REWARD_PERCENTAGE');
    const refFixedSetting = await settingsRepository.findSystemSettingByKey('REFERRAL_REWARD_FIXED_AMOUNT');

    const rewardMode = (refModeSetting?.value || 'PERCENTAGE').toUpperCase() as 'PERCENTAGE' | 'FIXED';
    const rewardPercentage = refPctSetting?.value || '10';
    const rewardFixedAmount = refFixedSetting?.value || '20';

    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
    const thisMonthReferralEarnings = await incomeRepository.getMonthlyReferralEarnings(userId, startOfMonth);

    return {
      wallet: {
        id: wallet.id,
        availableBalance: wallet.availableBalance,
        lockedBalance: wallet.lockedBalance,
        principalBalance: wallet.principalBalance,
        trialBalance: wallet.trialBalance,
        totalAssets: totalAssets.toFixed(8),
        totalDeposited: wallet.totalDeposited,
        totalWithdrawn: wallet.totalWithdrawn,
      },
      depositAddresses: depositAddressesList.map(da => ({
        network: da.network,
        address: da.address,
      })),
      earnings,
      earningsHistory,
      vip: {
        tier: vip.tier,
        points: vip.points,
        levelAValidCount: vip.levelAValidCount,
        levelBcdValidCount: vip.levelBcdValidCount,
        teamTotalCount: vip.teamTotalCount,
        assignedAt: vip.assignedAt,
      },
      team: {
        levelACount,
        levelBCount,
        levelCCount,
        levelDCount,
        totalReferralCount: levelACount + levelBCount + levelCCount + levelDCount,
        levelAValidCount,
        levelBcdValidCount,
        teamTotalValidCount: levelAValidCount + levelBcdValidCount,
      },
      dailyClaim: {
        available: dailyClaimAvailable && (pendingClaim ? pendingClaim.claimStatus === 'PENDING' : false),
        claimId: pendingClaim ? pendingClaim.id : null,
        amount: pendingClaim ? pendingClaim.rewardAmount : '0.00000000',
        windowClose: pendingClaim ? pendingClaim.claimWindowCloseTime : null,
        status: pendingClaim ? pendingClaim.claimStatus : 'PENDING',
        streakDays,
        history7Days,
      },
      recentTransactions,
      recentActivities,
      trialFundInfo: {
        amount: trialAmountSetting ? trialAmountSetting.value : '100.00000000',
        durationDays: trialDurationSetting ? parseInt(trialDurationSetting.value) : 3,
        activeTrialBalance: wallet.trialBalance,
        trialExpiresAt: wallet.trialExpiresAt,
        isActive: isTrialActive,
      },
      referralConfig: {
        mode: rewardMode,
        percentage: rewardPercentage,
        fixedAmount: rewardFixedAmount,
        thisMonthReferralEarnings: thisMonthReferralEarnings.toFixed(2),
      },
    };
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;
