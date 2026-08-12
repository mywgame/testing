/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { walletRepository } from '../repositories/walletRepository.ts';
import { transactionRepository } from '../repositories/transactionRepository.ts';
import { notificationService } from './notificationService.ts';
import { auditRepository } from '../repositories/auditRepository.ts';

/**
 * BUSINESS RULE — Single Source of Truth (Business Logic Spec Section 4 — Trial Fund):
 * "Trial Fund expires after the configured duration. Trial Principal expires.
 *  Trial Earnings remain in the Main Wallet."
 *
 * TrialFundService is the ONLY place that expires a user's Trial Principal. It never
 * touches availableBalance/dailyYield — those earnings (already claimed via ClaimService)
 * permanently remain in the Main Wallet even after the trial principal itself expires.
 */
export class TrialFundService {
  /**
   * Lazily checks whether a user's Trial Fund has passed its configured expiry window.
   * If expired, zeroes out only the Trial Principal (trialBalance) — Main Wallet balances
   * (availableBalance, dailyYield, totalEarned, etc.) are never modified by this method.
   *
   * Idempotent & safe to call on every dashboard load / claim generation — it is a no-op
   * once trialBalance has already reached 0.
   */
  async checkAndExpireTrialFund(userId: string) {
    const wallet = await walletRepository.findByUserId(userId);
    if (!wallet) return null;

    const trialBalance = parseFloat(wallet.trialBalance);
    if (trialBalance <= 0) return null; // Nothing to expire

    if (!wallet.trialExpiresAt) return null; // No expiry configured (e.g. trial disabled at signup)

    const now = new Date();
    if (new Date(wallet.trialExpiresAt) > now) return null; // Not yet expired

    const expiredAmountStr = trialBalance.toFixed(8);

    // Check if an expiry transaction has already been recorded for this user/wallet
    const existingExpiries = await transactionRepository.findByUserId(userId, { limit: 50 });
    const hasExpiryTx = existingExpiries.some((tx) => tx.type === 'TRIAL_EXPIRY');

    // 1. Zero out ONLY the Trial Principal. Main Wallet balances are untouched —
    //    any DPY already claimed from the trial balance stays in availableBalance forever.
    const updatedWallet = await walletRepository.updateBalances(wallet.id, {
      trialBalance: '0.00000000',
    });

    if (hasExpiryTx) {
      // Expiry transaction already recorded in ledger; return updated wallet without duplicate transaction
      return updatedWallet;
    }

    // 2. Immutable transaction ledger entry for transparency
    await transactionRepository.createTransaction({
      userId,
      walletId: wallet.id,
      type: 'TRIAL_EXPIRY',
      referenceId: `EXPIRY-${wallet.id}`,
      status: 'COMPLETED',
      description: `Trial Fund principal of ${expiredAmountStr} USDT expired and was forfeited. Any earnings generated from it remain in your Main Wallet.`,
      amount: expiredAmountStr,
      balanceBefore: wallet.availableBalance,
      balanceAfter: wallet.availableBalance, // Main Wallet balance is unaffected by trial expiry
      createdBy: 'SYSTEM',
    });

    // 3. Notify user
    await notificationService.createStructuredNotification(userId, {
      title: 'Trial Fund Expired',
      description: `Your Trial Fund principal of ${expiredAmountStr} USDT has expired. Any Daily DPY you already earned from it remains safely in your wallet.`,
      icon: 'Clock',
      type: 'wallet',
      priority: 'MEDIUM',
    });

    // 4. Audit Log — Business Logic Spec Section 14 requires every wallet-affecting event to be audited.
    await auditRepository.createAuditLog({
      actorUid: 'SYSTEM',
      userId,
      action: 'TRIAL_FUND_EXPIRED',
      resource: `wallets/${wallet.id}`,
      oldValue: expiredAmountStr,
      newValue: '0.00000000',
    });

    return updatedWallet;
  }
}

export const trialFundService = new TrialFundService();
export default trialFundService;
