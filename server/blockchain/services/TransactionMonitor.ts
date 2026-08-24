/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { depositRepository } from '../../repositories/depositRepository.ts';
import { withdrawalRepository } from '../../repositories/withdrawalRepository.ts';
import { depositService } from './DepositService.ts';
import { withdrawalService } from './WithdrawalService.ts';
import { notificationService } from '../../services/notificationService.ts';
import { logger } from '../../utils/logger.ts';
import { BlockchainProvider } from '../interfaces/BlockchainProvider.ts';
import { activeBlockchainProvider } from '../providers/index.ts';
import { blockchainConfig } from '../config/blockchainConfig.ts';

export class TransactionMonitor {
  private timer: NodeJS.Timeout | null = null;
  private isChecking = false;
  
  // Track consecutive non-existence of transaction hash on-chain to save API credits
  private queryAttempts: Record<string, number> = {};
  
  // Max times we poll for a txHash before assuming it's an invalid or fake hash
  private readonly MAX_ATTEMPTS = 30;

  constructor(private readonly provider: BlockchainProvider = activeBlockchainProvider) {}

  /**
   * Start background transaction monitor loop
   */
  start(intervalMs: number = blockchainConfig.monitoringIntervalMs) {
    if (this.timer) {
      logger.info('Transaction monitor is already running.');
      return;
    }
    
    logger.info(`Starting background transaction monitoring loop (Interval: ${intervalMs}ms)...`);
    this.timer = setInterval(() => {
      this.checkPendingDeposits().catch((err) => logger.error('Error in deposit monitor tick:', err));
      this.checkProcessingWithdrawals().catch((err) => logger.error('Error in withdrawal monitor tick:', err));
    }, intervalMs);
    
    // Execute first check immediately on boot
    this.checkPendingDeposits().catch((err) => {
      logger.error('Error in initial deposit monitoring check:', err);
    });
    this.checkProcessingWithdrawals().catch((err) => {
      logger.error('Error in initial withdrawal monitoring check:', err);
    });
  }

  /**
   * Stop background transaction monitor loop
   */
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      logger.info('Transaction monitor loop stopped.');
    }
  }

  /**
   * Scan database for processing withdrawals with txHash and verify on-chain confirmations
   */
  async checkProcessingWithdrawals() {
    try {
      const processingWithdrawals = await withdrawalRepository.findAll({ status: 'PROCESSING' });
      const withTxHash = processingWithdrawals.filter((w) => !!w.txHash);

      if (withTxHash.length === 0) {
        return;
      }

      logger.debug(`Polling on-chain status for ${withTxHash.length} processing withdrawals...`);

      for (const withdrawal of withTxHash) {
        const txHash = withdrawal.txHash!;
        const withdrawalId = withdrawal.id;
        const key = `w_${withdrawalId}`;

        try {
          const blockchainTx = await this.provider.getTransaction(withdrawal.network, txHash);

          if (!blockchainTx) {
            const attempts = (this.queryAttempts[key] || 0) + 1;
            this.queryAttempts[key] = attempts;

            if (attempts >= this.MAX_ATTEMPTS) {
              logger.warn(`Withdrawal ${withdrawalId} (hash ${txHash}) timed out on-chain after ${attempts} attempts. Marking as FAILED.`);
              await withdrawalService.finalizeFailedWithdrawal(
                withdrawalId,
                `On-chain monitoring timeout: Transaction hash was not detected within ${this.MAX_ATTEMPTS} poll intervals.`
              );
              delete this.queryAttempts[key];
            } else {
              logger.debug(`Withdrawal tx ${txHash} not yet found on-chain. Attempt ${attempts}/${this.MAX_ATTEMPTS}`);
            }
            continue;
          }

          this.queryAttempts[key] = 0;

          if (!blockchainTx.isSuccessful) {
            logger.warn(`Withdrawal transaction hash ${txHash} failed on-chain. Reverting withdrawal ${withdrawalId}.`);
            await withdrawalService.finalizeFailedWithdrawal(
              withdrawalId,
              'Transaction was marked as FAILED by on-chain network explorers.'
            );
            delete this.queryAttempts[key];
            continue;
          }

          const requiredConfirmations =
            blockchainConfig.networks[withdrawal.network]?.confirmationsRequired ??
            (blockchainConfig.isTestnet ? 1 : 6);
          const confirmations = blockchainTx.confirmations;

          if (confirmations >= requiredConfirmations) {
            logger.info(`Withdrawal ${withdrawalId} (hash: ${txHash}) reached ${confirmations}/${requiredConfirmations} confirmations. Finalizing withdrawal as COMPLETED.`);
            await withdrawalService.finalizeSuccessfulWithdrawal(withdrawalId);
            delete this.queryAttempts[key];
          } else {
            logger.info(`Withdrawal ${withdrawalId} (hash: ${txHash}) found on-chain with ${confirmations}/${requiredConfirmations} confirmations. Awaiting additional blocks...`);
          }
        } catch (error) {
          logger.error(`Error processing transaction check for withdrawal ID ${withdrawalId} (hash: ${txHash}):`, error);
        }
      }
    } catch (err) {
      logger.error('Error in checkProcessingWithdrawals workflow:', err);
    }
  }

  /**
   * Scan database for pending deposits with txHash and verify on-chain
   */
  async checkPendingDeposits() {
    if (this.isChecking) {
      logger.debug('Previous transaction check is still executing. Skipping this tick.');
      return;
    }

    this.isChecking = true;
    try {
      // Find all deposits that are PENDING
      const pendingDeposits = await depositRepository.findAll({ status: 'PENDING' });
      
      // Filter those with txHash
      const withTxHash = pendingDeposits.filter((d) => !!d.txHash);

      // Prune queryAttempts keys for deposit IDs that are no longer pending
      const activeDepositIds = new Set(withTxHash.map((d) => d.id));
      for (const id of Object.keys(this.queryAttempts)) {
        if (!activeDepositIds.has(id)) {
          delete this.queryAttempts[id];
        }
      }

      if (withTxHash.length === 0) {
        return;
      }

      logger.debug(`Polling on-chain status for ${withTxHash.length} pending deposits...`);

      for (const deposit of withTxHash) {
        const txHash = deposit.txHash!;
        const depositId = deposit.id;

        try {
          const blockchainTx = await this.provider.getTransaction(deposit.network, txHash);

          if (!blockchainTx) {
            // Transaction hash not found on-chain yet
            const attempts = (this.queryAttempts[depositId] || 0) + 1;
            this.queryAttempts[depositId] = attempts;

            if (attempts >= this.MAX_ATTEMPTS) {
              logger.warn(`Deposit ${depositId} with hash ${txHash} has timed out on-chain after ${attempts} attempts. Marking as FAILED.`);
              
              await depositRepository.updateStatus(depositId, 'FAILED', {
                adminNotes: `On-chain monitoring timeout: Transaction hash was not detected within ${this.MAX_ATTEMPTS} poll intervals.`,
              });

              await notificationService.createStructuredNotification(deposit.userId, {
                title: 'Deposit Verification Failed',
                description: `Verification for your deposit of ${deposit.amount} USDT timed out. Please verify your transaction hash or submit a support ticket.`,
                icon: 'XCircle',
                type: 'deposit',
                priority: 'HIGH',
              });

              delete this.queryAttempts[depositId];
            } else {
              logger.debug(`Tx ${txHash} not yet found on-chain. Attempt ${attempts}/${this.MAX_ATTEMPTS}`);
            }
            continue;
          }

          // Transaction found on-chain! Reset attempts counter
          this.queryAttempts[depositId] = 0;

          if (!blockchainTx.isSuccessful) {
            logger.warn(`Transaction hash ${txHash} is marked as FAILED on-chain. Updating deposit record.`);
            
            await depositRepository.updateStatus(depositId, 'FAILED', {
              adminNotes: 'Transaction was marked as FAILED by the on-chain network explorers.',
            });

            await notificationService.createStructuredNotification(deposit.userId, {
              title: 'Deposit Failed on Blockchain',
              description: `Your transaction of ${deposit.amount} USDT on ${deposit.network} was marked as failed on-chain.`,
              icon: 'XCircle',
              type: 'deposit',
              priority: 'HIGH',
            });

            delete this.queryAttempts[depositId];
            continue;
          }

          // Verify receiver address matches deposit address (ignoring case)
          if (deposit.depositAddress && blockchainTx.receiver) {
            const expectedAddr = deposit.depositAddress.toLowerCase();
            const actualAddr = blockchainTx.receiver.toLowerCase();
            if (expectedAddr !== actualAddr) {
              logger.warn(`Deposit ${depositId} hash ${txHash} receiver mismatch (${actualAddr} vs expected ${expectedAddr}). Marking as FAILED.`);
              await depositRepository.updateStatus(depositId, 'FAILED', {
                adminNotes: `On-chain transaction receiver (${blockchainTx.receiver}) does not match assigned deposit address (${deposit.depositAddress}).`,
              });
              delete this.queryAttempts[depositId];
              continue;
            }
          }

          // Fetch network-specific required confirmations from blockchainConfig
          const requiredConfirmations = blockchainConfig.networks[deposit.network]?.confirmationsRequired ?? (blockchainConfig.isTestnet ? 1 : 6);
          const confirmations = blockchainTx.confirmations;

          if (confirmations >= requiredConfirmations) {
            logger.info(`Deposit ${depositId} (hash: ${txHash}) reached ${confirmations}/${requiredConfirmations} confirmations. Crediting user account.`);
            await depositService.processSuccessfulDeposit(depositId, txHash, 'SYSTEM');
            delete this.queryAttempts[depositId];
          } else {
            logger.info(`Deposit ${depositId} (hash: ${txHash}) found on-chain with ${confirmations}/${requiredConfirmations} confirmations. Awaiting additional blocks...`);
          }

        } catch (error) {
          logger.error(`Error processing transaction monitoring check for deposit ID ${depositId} (hash: ${txHash}):`, error);
        }
      }

    } catch (err) {
      logger.error('Fatal error encountered in background transaction monitoring workflow:', err);
    } finally {
      this.isChecking = false;
    }
  }

  /**
   * Immediately trigger a check on demand (e.g. when user submits a new deposit or withdrawal)
   */
  public triggerImmediateCheck() {
    this.checkPendingDeposits().catch((err) => logger.error('Error in on-demand deposit check:', err));
    this.checkProcessingWithdrawals().catch((err) => logger.error('Error in on-demand withdrawal check:', err));
  }
}

export const transactionMonitor = new TransactionMonitor();
export default transactionMonitor;
