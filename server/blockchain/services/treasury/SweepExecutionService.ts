/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { eq, and } from 'drizzle-orm';
import { db } from '../../../../src/db/index.ts';
import { treasuryWallets, treasurySweepJobs, depositAddresses, sweepQueue } from '../../../../src/db/schema.ts';
import { activeBlockchainProvider } from '../../providers/index.ts';
import { logger } from '../../../utils/logger.ts';
import { auditRepository } from '../../../repositories/auditRepository.ts';
import { keyManager } from '../../keys/KeyManager.ts';
import { gasCalculator } from '../GasCalculator.ts';
import { blockchainConfig } from '../../config/blockchainConfig.ts';

// A broadcast that never gets confirmed on-chain within this window is treated as
// stuck/lost and is surfaced as FAILED so it can be retried, rather than being left
// in AWAITING_CONFIRMATION forever.
const CONFIRMATION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export class SweepExecutionService {
  constructor(private readonly provider = activeBlockchainProvider) {}

  /**
   * Sweep funds from a specific user deposit address to the Hot Wallet
   *
   * BUSINESS RULE (Blockchain = single source of truth): broadcasting a transaction only
   * proves it was SUBMITTED, not that it succeeded. This method never marks the job
   * COMPLETED and never credits/debits any balance at broadcast time. It only records the
   * txHash and moves the job to AWAITING_CONFIRMATION. Balances are only mutated by
   * pollAndFinalizeAwaitingConfirmationJobs() once the transaction is actually confirmed
   * on-chain with the required number of confirmations.
   */
  async sweepUserDepositAddress(
    addressId: string,
    activeHotAddress: string,
    adminUid: string = 'SYSTEM'
  ) {
    const addressRecord = await db
      .select()
      .from(depositAddresses)
      .where(eq(depositAddresses.id, addressId))
      .limit(1);

    if (addressRecord.length === 0) {
      throw new Error(`User deposit address record not found: ${addressId}`);
    }

    const addr = addressRecord[0];
    const amountFloat = parseFloat(addr.onChainBalance);
    if (amountFloat <= 0) {
      throw new Error(`Deposit address ${addr.address} has no positive balance to sweep.`);
    }

    const amountStr = addr.onChainBalance;

    logger.info(
      `[SweepExecutionService] Commencing sweep for address ${addr.address} (${amountStr} USDT) to Hot Wallet ${activeHotAddress}`
    );

    const job = await db
      .insert(treasurySweepJobs)
      .values({
        network: addr.network,
        sourceAddress: addr.address,
        destinationAddress: activeHotAddress,
        sweepType: 'USER_TO_HOT',
        amount: amountStr,
        status: 'PENDING',
        attempts: 1,
      })
      .returning();

    const jobId = job[0].id;
    let txHash: string | null = null;

    try {
      await db
        .update(treasurySweepJobs)
        .set({ status: 'IN_PROGRESS', updatedAt: new Date() })
        .where(eq(treasurySweepJobs.id, jobId));

      if (addr.derivationIndex === null || addr.derivationIndex === undefined) {
        throw new Error(`Deposit address ${addr.address} does not have a derivation index assigned.`);
      }

      const childPrivateKey = await keyManager.derivePrivateKey(addr.network, addr.derivationIndex);

      // Verify native gas balance and fund gas if required
      const nativeBal = await this.provider.getNativeBalance(addr.network, addr.address);
      const gasCheck = await gasCalculator.calculateTopUpNeeded(addr.network, nativeBal);
      if (!gasCheck.isSufficient) {
        logger.info(
          `[SweepExecutionService] Funding gas top-up of ${gasCheck.topUpNeeded} ${gasCheck.gasSymbol} to ${addr.address} before sweeping`
        );
        await this.provider.fundGas(addr.network, addr.address, gasCheck.topUpNeeded);
      }

      txHash = await this.provider.broadcastTransaction(
        addr.network,
        activeHotAddress,
        amountStr,
        childPrivateKey
      );

      // Broadcast succeeded — the transaction is now submitted to the mempool, but NOT yet
      // confirmed. Do not credit any balance and do not mark COMPLETED here.
      await db
        .update(treasurySweepJobs)
        .set({
          status: 'AWAITING_CONFIRMATION',
          txHash,
          errorMessage: null,
          updatedAt: new Date(),
        })
        .where(eq(treasurySweepJobs.id, jobId));

      logger.info(
        `[SweepExecutionService] Sweep BROADCASTED for address ${addr.address}. TxHash: ${txHash}. Awaiting on-chain confirmation.`
      );

      await auditRepository.createAuditLog({
        actorUid: adminUid,
        userId: addr.userId,
        action: 'TREASURY_SWEEP_BROADCASTED',
        resource: `treasury/jobs/${jobId}`,
        oldValue: amountStr,
        newValue: txHash,
      });

      return { success: true, jobId, txHash, awaitingConfirmation: true };
    } catch (err: any) {
      logger.error(`[SweepExecutionService] Sweep FAILED for address ${addr.address}: ${err.message}`);

      if (txHash) {
        // The broadcast itself succeeded (we have a real txHash) but something after it
        // threw (e.g. an audit-log write). We still cannot claim COMPLETED — blockchain
        // confirmation is the only source of truth — so this stays AWAITING_CONFIRMATION
        // and the poller will resolve it once the chain confirms or times out.
        await db
          .update(treasurySweepJobs)
          .set({
            status: 'AWAITING_CONFIRMATION',
            txHash,
            errorMessage: err.message,
            updatedAt: new Date(),
          })
          .where(eq(treasurySweepJobs.id, jobId));

        return { success: true, jobId, txHash, awaitingConfirmation: true };
      }

      // No txHash at all — the broadcast never went out. This is a real, unambiguous failure.
      await db
        .update(treasurySweepJobs)
        .set({
          status: 'FAILED',
          errorMessage: err.message,
          updatedAt: new Date(),
        })
        .where(eq(treasurySweepJobs.id, jobId));

      return { success: false, jobId, error: err.message };
    }
  }

  /**
   * Poll every sweep job currently AWAITING_CONFIRMATION and finalize it against real
   * on-chain state. This is the ONLY place a USER_TO_HOT sweep job (and its linked sweep
   * queue row) is ever moved to COMPLETED, and it only does so once the blockchain itself
   * reports the transaction as successful with the network's required confirmation count.
   */
  async pollAndFinalizeAwaitingConfirmationJobs(): Promise<void> {
    const pendingJobs = await db
      .select()
      .from(treasurySweepJobs)
      .where(and(eq(treasurySweepJobs.status, 'AWAITING_CONFIRMATION'), eq(treasurySweepJobs.sweepType, 'USER_TO_HOT')));

    for (const job of pendingJobs) {
      if (!job.txHash) continue; // Defensive — should never happen given how this status is set

      try {
        const txInfo = await this.provider.getTransaction(job.network, job.txHash);

        if (!txInfo) {
          // Not yet indexed by the RPC endpoint. If it has been too long, treat as lost.
          const isStuck = new Date(job.updatedAt).getTime() < Date.now() - CONFIRMATION_TIMEOUT_MS;
          if (isStuck) {
            await this.finalizeJobFailure(job, 'On-chain confirmation timeout: transaction hash was never indexed by the RPC endpoint.');
          } else {
            logger.debug(`[SweepExecutionService] Sweep job ${job.id} (tx ${job.txHash}) not yet visible on-chain. Still waiting.`);
          }
          continue;
        }

        if (!txInfo.isSuccessful) {
          await this.finalizeJobFailure(job, 'Transaction was reverted/failed on-chain.');
          continue;
        }

        const requiredConfirmations =
          blockchainConfig.networks[job.network]?.confirmationsRequired ?? (blockchainConfig.isTestnet ? 1 : 6);

        if ((txInfo.confirmations || 0) < requiredConfirmations) {
          logger.info(
            `[SweepExecutionService] Sweep job ${job.id} (tx ${job.txHash}) has ${txInfo.confirmations}/${requiredConfirmations} confirmations. Awaiting additional blocks...`
          );
          continue;
        }

        await this.finalizeJobSuccess(job);
      } catch (err: any) {
        logger.error(`[SweepExecutionService] Error polling confirmation for sweep job ${job.id}:`, err.message);
      }
    }
  }

  /**
   * Finalize a confirmed sweep job: credit the hot wallet, zero the source deposit
   * address balance, mark the job COMPLETED, and cascade the same result to any linked
   * sweep queue row. This is the ONLY method in the codebase permitted to mark a
   * USER_TO_HOT sweep job COMPLETED.
   */
  private async finalizeJobSuccess(job: typeof treasurySweepJobs.$inferSelect): Promise<void> {
    const amountFloat = parseFloat(job.amount);

    await db.transaction(async (tx) => {
      await tx
        .update(treasurySweepJobs)
        .set({ status: 'COMPLETED', errorMessage: null, updatedAt: new Date() })
        .where(and(eq(treasurySweepJobs.id, job.id), eq(treasurySweepJobs.status, 'AWAITING_CONFIRMATION')));

      await tx
        .update(depositAddresses)
        .set({ onChainBalance: '0.00000000', updatedAt: new Date() })
        .where(and(eq(depositAddresses.address, job.sourceAddress), eq(depositAddresses.network, job.network)));

      const twRecord = await tx
        .select()
        .from(treasuryWallets)
        .where(eq(treasuryWallets.network, job.network))
        .limit(1);

      if (twRecord.length > 0) {
        const currentHotFloat = parseFloat(twRecord[0].hotBalance || '0');
        const newHotStr = (currentHotFloat + amountFloat).toFixed(8);
        await tx
          .update(treasuryWallets)
          .set({ hotBalance: newHotStr, updatedAt: new Date() })
          .where(eq(treasuryWallets.network, job.network));
      }

      // Cascade to the linked sweep queue row, if one exists, so the admin UI reflects
      // the real confirmed state.
      await tx
        .update(sweepQueue)
        .set({ status: 'COMPLETED', sweepTxHash: job.txHash, errorMessage: null, updatedAt: new Date() })
        .where(
          and(
            eq(sweepQueue.depositAddress, job.sourceAddress),
            eq(sweepQueue.network, job.network),
            eq(sweepQueue.status, 'WAITING_SWEEP_CONFIRMATION')
          )
        );
    });

    logger.info(`[SweepExecutionService] Sweep job ${job.id} CONFIRMED on-chain and COMPLETED. TxHash: ${job.txHash}`);

    await auditRepository.createAuditLog({
      actorUid: 'SYSTEM',
      userId: null as any,
      action: 'TREASURY_SWEEP_CONFIRMED_COMPLETED',
      resource: `treasury/jobs/${job.id}`,
      oldValue: job.amount,
      newValue: job.txHash || '',
    });
  }

  /**
   * Finalize a sweep job that failed or was reverted on-chain. Never credits any balance.
   */
  private async finalizeJobFailure(job: typeof treasurySweepJobs.$inferSelect, reason: string): Promise<void> {
    await db
      .update(treasurySweepJobs)
      .set({ status: 'FAILED', errorMessage: reason, updatedAt: new Date() })
      .where(and(eq(treasurySweepJobs.id, job.id), eq(treasurySweepJobs.status, 'AWAITING_CONFIRMATION')));

    await db
      .update(sweepQueue)
      .set({ status: 'RETRY_PENDING', errorMessage: reason, updatedAt: new Date() })
      .where(
        and(
          eq(sweepQueue.depositAddress, job.sourceAddress),
          eq(sweepQueue.network, job.network),
          eq(sweepQueue.status, 'WAITING_SWEEP_CONFIRMATION')
        )
      );

    logger.error(`[SweepExecutionService] Sweep job ${job.id} FAILED on-chain confirmation: ${reason}`);

    await auditRepository.createAuditLog({
      actorUid: 'SYSTEM',
      userId: null as any,
      action: 'TREASURY_SWEEP_CONFIRMATION_FAILED',
      resource: `treasury/jobs/${job.id}`,
      oldValue: job.txHash || '',
      newValue: reason,
    });
  }
}

export const sweepExecutionService = new SweepExecutionService();
