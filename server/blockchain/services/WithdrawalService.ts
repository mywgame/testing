/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { withdrawalRepository } from '../../repositories/withdrawalRepository.ts';
import { walletRepository } from '../../repositories/walletRepository.ts';
import { transactionRepository } from '../../repositories/transactionRepository.ts';
import { notificationService } from '../../services/notificationService.ts';
import { settingsRepository } from '../../repositories/settingsRepository.ts';
import { auditRepository } from '../../repositories/auditRepository.ts';
import { vipService } from '../../services/vipService.ts';
import { BlockchainProvider } from '../interfaces/BlockchainProvider.ts';
import { activeBlockchainProvider } from '../providers/index.ts';

export class WithdrawalService {
  constructor(private readonly provider: BlockchainProvider = activeBlockchainProvider) {}

  /**
   * Request / Initiate a new pending withdrawal
   */
  async createWithdrawal(
    userId: string,
    amountStr: string,
    walletAddress: string,
    network: string
  ) {
    const wallet = await walletRepository.findByUserId(userId);
    if (!wallet) {
      throw new Error(`Wallet not found for user: ${userId}`);
    }

    const amount = parseFloat(amountStr);
    if (amount <= 0) {
      throw new Error('Withdrawal amount must be strictly positive.');
    }

    // Load MIN_WITHDRAWAL_LIMIT from system settings
    const minConfig = await settingsRepository.findSystemSettingByKey('MIN_WITHDRAWAL_LIMIT');
    const minLimit = minConfig ? parseFloat(minConfig.value) : 10.0; // Default: 10 USDT
    if (amount < minLimit) {
      throw new Error(`Minimum withdrawal limit is ${minLimit} USDT.`);
    }

    // Check balance
    const availableBalance = parseFloat(wallet.availableBalance);
    if (availableBalance < amount) {
      throw new Error(`Insufficient funds. Available: ${wallet.availableBalance} USDT, Requested: ${amountStr} USDT.`);
    }

    // Calculate withdrawal fee (e.g. 10%)
    const feeConfig = await settingsRepository.findSystemSettingByKey('WITHDRAWAL_FEE_PERCENTAGE');
    const feeRate = feeConfig ? parseFloat(feeConfig.value) : 0.10; // Default: 10%
    const fee = amount * feeRate;
    const netAmount = amount - fee;

    // Generate reference code
    const randomDigits = Math.floor(10000000 + Math.random() * 90000000).toString();
    const reference = `WTH${randomDigits}`;

    // Safely debit available balance, and transfer it to locked_balance while pending approval
    await walletRepository.incrementBalances(wallet.id, {
      availableBalance: (-amount).toFixed(8),
      lockedBalance: amount.toFixed(8),
    });

    const withdrawal = await withdrawalRepository.createWithdrawal({
      userId,
      walletId: wallet.id,
      amount: amount.toFixed(8),
      fee: fee.toFixed(8),
      netAmount: netAmount.toFixed(8),
      walletAddress,
      network,
      reference,
      status: 'PENDING',
      adminApprovalStatus: 'PENDING',
    });

    // Audit Log
    await auditRepository.createAuditLog({
      actorUid: userId,
      userId,
      action: 'WITHDRAWAL_REQUESTED',
      resource: `withdrawals/${withdrawal.id}`,
      newValue: JSON.stringify({ amount: amount.toFixed(8), fee: fee.toFixed(8), netAmount: netAmount.toFixed(8), network }),
    });

    // Notify user of submission
    await notificationService.createStructuredNotification(userId, {
      title: 'Withdrawal Request Submitted',
      description: `Your withdrawal request of ${amount.toFixed(8)} USDT has been submitted and is pending review.`,
      icon: 'ArrowUpCircle',
      type: 'withdrawal',
      priority: 'MEDIUM',
    });

    // Notify admins of request
    await notificationService.notifyAdmins({
      title: 'New Withdrawal Request',
      description: `A user has requested a withdrawal of ${amount.toFixed(8)} USDT.`,
      icon: 'ArrowUpCircle',
      type: 'withdrawal',
      priority: 'HIGH',
    });

    return withdrawal;
  }

  /**
   * Broadcast and execute direct on-chain token payout for approved withdrawal
   */
  async executeOnChainPayout(withdrawalId: string): Promise<string> {
    const withdrawal = await withdrawalRepository.findById(withdrawalId);
    if (!withdrawal) {
      throw new Error(`Withdrawal not found: ${withdrawalId}`);
    }
    // Broadcast withdrawal via active blockchain provider
    return this.provider.broadcastTransaction(
      withdrawal.network,
      withdrawal.walletAddress,
      withdrawal.netAmount
    );
  }

  /**
   * Approve a pending withdrawal request and broadcast payout on-chain.
   * Updates status to 'PROCESSING' with real txHash returned from blockchain.
   */
  async processWithdrawalApproval(
    withdrawalId: string,
    adminUid: string,
    notes?: string,
    manualTxHash?: string
  ) {
    const withdrawal = await withdrawalRepository.findById(withdrawalId);
    if (!withdrawal) {
      throw new Error(`Withdrawal not found for ID: ${withdrawalId}`);
    }

    if (withdrawal.status !== 'PENDING') {
      throw new Error(`Withdrawal is not pending approval (current status: ${withdrawal.status})`);
    }

    const userId = withdrawal.userId;
    const wallet = await walletRepository.findByUserId(userId);
    if (!wallet) {
      throw new Error(`Wallet not found for user ID: ${userId}`);
    }

    // Sanitize manual txHash input (ignore placeholder strings like INTERNAL_MANUAL or mock)
    let realTxHash = manualTxHash?.trim();
    if (
      realTxHash === 'INTERNAL_MANUAL' ||
      realTxHash === 'mock' ||
      realTxHash?.toLowerCase().includes('mock') ||
      realTxHash?.toLowerCase().includes('internal')
    ) {
      realTxHash = undefined;
    }

    // Execute real on-chain payout if no valid manual txHash provided
    if (!realTxHash) {
      realTxHash = await this.executeOnChainPayout(withdrawalId);
    }

    if (!realTxHash || typeof realTxHash !== 'string' || !realTxHash.trim()) {
      throw new Error('On-chain payout failed: Blockchain provider did not return a valid transaction hash.');
    }

    // 1. Mark status as PROCESSING (sending funds on-chain)
    const updatedWithdrawal = await withdrawalRepository.updateStatus(withdrawalId, 'PROCESSING', {
      txHash: realTxHash,
      adminApprovalStatus: 'APPROVED',
      adminNotes: notes ? `Approved by ${adminUid}: ${notes}` : `Approved by administrator ${adminUid}. Broadcast on-chain txHash: ${realTxHash}`,
    });

    // 2. Notify user that withdrawal is processing on-chain
    await notificationService.createStructuredNotification(userId, {
      title: 'Withdrawal Processing',
      description: `Your withdrawal request of ${withdrawal.amount} USDT has been approved and broadcast on-chain. TxHash: ${realTxHash}`,
      icon: 'Clock',
      type: 'withdrawal',
      priority: 'HIGH',
    });

    return updatedWithdrawal;
  }

  /**
   * Backward-compatible helper for approving withdrawals
   */
  async approveWithdrawal(withdrawalId: string, txHash?: string, adminUid: string = 'SYSTEM') {
    return this.processWithdrawalApproval(withdrawalId, adminUid, undefined, txHash);
  }

  /**
   * Finalize a processing withdrawal once on-chain confirmations are verified
   */
  async finalizeSuccessfulWithdrawal(withdrawalId: string) {
    const withdrawal = await withdrawalRepository.findById(withdrawalId);
    if (!withdrawal) {
      throw new Error(`Withdrawal not found for ID: ${withdrawalId}`);
    }

    if (withdrawal.status === 'COMPLETED') {
      return withdrawal;
    }

    if (withdrawal.status !== 'PROCESSING' && withdrawal.status !== 'PENDING') {
      throw new Error(`Cannot finalize withdrawal in state: ${withdrawal.status}`);
    }

    const userId = withdrawal.userId;
    const wallet = await walletRepository.findByUserId(userId);
    if (!wallet) {
      throw new Error(`Wallet not found for user ID: ${userId}`);
    }

    // 1. Mark status as COMPLETED
    const updatedWithdrawal = await withdrawalRepository.updateStatus(withdrawalId, 'COMPLETED', {
      adminApprovalStatus: 'APPROVED',
      adminNotes: 'Confirmed on-chain by transaction monitor.',
    });

    const amount = parseFloat(withdrawal.amount);

    // 2. Clear locked balance and record cumulative totalWithdrawn
    await walletRepository.incrementBalances(wallet.id, {
      lockedBalance: (-amount).toFixed(8),
      totalWithdrawn: amount.toFixed(8),
    });

    // 3. Record immutable ledger transaction
    const balanceBefore = parseFloat(wallet.availableBalance) + amount;
    const balanceAfter = parseFloat(wallet.availableBalance);

    await transactionRepository.createTransaction({
      userId,
      walletId: wallet.id,
      type: 'WITHDRAWAL',
      referenceId: withdrawal.reference || withdrawal.id,
      status: 'COMPLETED',
      description: `Completed withdrawal of ${withdrawal.amount} USDT (Fee: ${withdrawal.fee} USDT, Net: ${withdrawal.netAmount} USDT) to ${withdrawal.walletAddress}. TxHash: ${withdrawal.txHash}`,
      amount: withdrawal.amount,
      balanceBefore: balanceBefore.toFixed(8),
      balanceAfter: balanceAfter.toFixed(8),
      createdBy: 'SYSTEM',
    });

    // 4. Create Success notification
    await notificationService.createStructuredNotification(userId, {
      title: 'Withdrawal Successful',
      description: `Your withdrawal request of ${withdrawal.amount} USDT has been confirmed on the blockchain.`,
      icon: 'ArrowUpCircle',
      type: 'withdrawal',
      priority: 'HIGH',
    });

    // 5. Recalculate VIP tier for user and affected uplines (Business Logic Spec Section 6: VIP recalculates after Approved Withdrawal)
    await vipService.recalculateUserAndUplines(userId);

    return updatedWithdrawal;
  }

  /**
   * Finalize a processing or pending withdrawal as FAILED (reverts and refunds funds)
   */
  async finalizeFailedWithdrawal(withdrawalId: string, reason: string) {
    const withdrawal = await withdrawalRepository.findById(withdrawalId);
    if (!withdrawal) {
      throw new Error(`Withdrawal not found for ID: ${withdrawalId}`);
    }

    if (withdrawal.status === 'FAILED') {
      return withdrawal;
    }

    const userId = withdrawal.userId;
    const wallet = await walletRepository.findByUserId(userId);
    if (!wallet) {
      throw new Error(`Wallet not found for user ID: ${userId}`);
    }

    // 1. Mark status as FAILED
    const updatedWithdrawal = await withdrawalRepository.updateStatus(withdrawalId, 'FAILED', {
      adminApprovalStatus: 'REJECTED',
      adminNotes: `Withdrawal failed: ${reason}`,
    });

    const amount = parseFloat(withdrawal.amount);

    // 2. Refund locked balance back to available balance
    await walletRepository.incrementBalances(wallet.id, {
      lockedBalance: (-amount).toFixed(8),
      availableBalance: amount.toFixed(8),
    });

    // 3. Create failure notification
    await notificationService.createStructuredNotification(userId, {
      title: 'Withdrawal Failed',
      description: `Your withdrawal request of ${withdrawal.amount} USDT failed: ${reason}. Funds have been refunded to your available balance.`,
      icon: 'ShieldAlert',
      type: 'withdrawal',
      priority: 'HIGH',
    });

    return updatedWithdrawal;
  }

  /**
   * Reject and refund a pending withdrawal
   */
  async rejectWithdrawal(withdrawalId: string, reason: string, adminUid: string) {
    const withdrawal = await withdrawalRepository.findById(withdrawalId);
    if (!withdrawal) {
      throw new Error(`Withdrawal not found for ID: ${withdrawalId}`);
    }

    if (withdrawal.status !== 'PENDING') {
      throw new Error(`Withdrawal has already been processed with status: ${withdrawal.status}`);
    }

    const userId = withdrawal.userId;
    const wallet = await walletRepository.findByUserId(userId);
    if (!wallet) {
      throw new Error(`Wallet not found for user ID: ${userId}`);
    }

    // 1. Mark status as REJECTED
    const updatedWithdrawal = await withdrawalRepository.updateStatus(withdrawalId, 'REJECTED', {
      adminApprovalStatus: 'REJECTED',
      adminNotes: `Rejected by administrator ${adminUid}. Reason: ${reason}`,
    });

    const amount = parseFloat(withdrawal.amount);

    // 2. Refund the locked balance back to available balance
    await walletRepository.incrementBalances(wallet.id, {
      lockedBalance: (-amount).toFixed(8),
      availableBalance: amount.toFixed(8),
    });

    // 3. Create rejection notification
    await notificationService.createStructuredNotification(userId, {
      title: 'Withdrawal Rejected',
      description: `Your withdrawal request of ${withdrawal.amount} USDT was rejected. Reason: ${reason}. Funds have been refunded to your available balance.`,
      icon: 'ShieldAlert',
      type: 'withdrawal',
      priority: 'HIGH',
    });

    return updatedWithdrawal;
  }
}

export const withdrawalService = new WithdrawalService();
export default withdrawalService;
