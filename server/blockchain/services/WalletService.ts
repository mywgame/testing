/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { walletRepository } from '../../repositories/walletRepository.ts';
import { transactionRepository } from '../../repositories/transactionRepository.ts';
import { userRepository } from '../../repositories/userRepository.ts';
import { SecurityLogger } from '../../utils/securityLogger.ts';
import { BlockchainProvider } from '../interfaces/BlockchainProvider.ts';
import { activeBlockchainProvider } from '../providers/index.ts';

export class WalletService {
  constructor(private readonly provider: BlockchainProvider = activeBlockchainProvider) {}

  /**
   * Retrieve wallet details by database User ID
   */
  async getWalletByUserId(userId: string) {
    const wallet = await walletRepository.findByUserId(userId);
    if (!wallet) {
      throw new Error(`Wallet not found for user ID: ${userId}`);
    }
    return wallet;
  }

  /**
   * Retrieve wallet details by Firebase Auth UID
   */
  async getWalletByUid(uid: string) {
    const user = await userRepository.findByUid(uid);
    if (!user) {
      throw new Error(`User profile not found for UID: ${uid}`);
    }
    return this.getWalletByUserId(user.id);
  }

  /**
   * Fetch live on-chain balance for hot-wallet monitoring or specific deposits
   */
  async getOnChainBalance(network: string, address: string): Promise<string> {
    return this.provider.getBalance(network, address);
  }

  /**
   * Perform administrative balance adjustments
   */
  async adjustBalances(
    adminUid: string,
    targetUserId: string,
    adjustments: {
      availableBalance?: string;
      lockedBalance?: string;
      principalBalance?: string;
      trialBalance?: string;
      referralIncome?: string;
      dailyYield?: string;
      teamIncome?: string;
      incentiveIncome?: string;
    },
    reason: string
  ) {
    const wallet = await this.getWalletByUserId(targetUserId);
    const targetUser = await userRepository.findById(targetUserId);
    if (!targetUser) {
      throw new Error(`Target user not found for ID: ${targetUserId}`);
    }

    // Capture old values for audit
    const oldValueString = JSON.stringify({
      availableBalance: wallet.availableBalance,
      lockedBalance: wallet.lockedBalance,
      principalBalance: wallet.principalBalance,
      trialBalance: wallet.trialBalance,
    });

    // We can use incrementBalances for atomic or updateBalances for direct overwrite
    const updatedWallet = await walletRepository.updateBalances(wallet.id, adjustments);

    // Record audit logs
    await SecurityLogger.logAudit({
      actorUid: adminUid,
      action: 'ADMIN_WALLET_ADJUSTMENT',
      resource: `wallets/${wallet.id}`,
      oldValue: oldValueString,
      newValue: JSON.stringify(adjustments),
    });

    // Create a transaction ledger entry for the major change if availableBalance changed
    if (adjustments.availableBalance !== undefined) {
      const difference = parseFloat(adjustments.availableBalance) - parseFloat(wallet.availableBalance);
      await transactionRepository.createTransaction({
        userId: targetUserId,
        walletId: wallet.id,
        type: 'ADMIN_ADJUSTMENT',
        referenceId: wallet.id,
        status: 'COMPLETED',
        description: `Admin balance adjustment: ${reason} (Adjustment: ${difference >= 0 ? '+' : ''}${difference})`,
        amount: Math.abs(difference).toFixed(8),
        balanceBefore: wallet.availableBalance,
        balanceAfter: adjustments.availableBalance,
        createdBy: adminUid,
      });
    }

    return updatedWallet;
  }
}

export const walletService = new WalletService();
export default walletService;
