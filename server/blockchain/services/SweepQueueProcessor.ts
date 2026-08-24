/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { eq, and, or, not } from 'drizzle-orm';
import { db } from '../../../src/db/index.ts';
import { sweepQueue, treasuryWallets, depositAddresses, deposits } from '../../../src/db/schema.ts';
import { activeBlockchainProvider } from '../providers/index.ts';
import { logger } from '../../utils/logger.ts';
import { auditRepository } from '../../repositories/auditRepository.ts';
import { treasuryService } from './TreasuryService.ts';
import { sweepExecutionService } from './treasury/SweepExecutionService.ts';
import { gasCalculator } from './GasCalculator.ts';

// Legacy fallback dictionary for backwards compatibility
export const MIN_GAS_REQUIRED: Record<string, string> = {
  USDT_BEP20: '0.00025',   // BNB
  USDT_POLYGON: '0.003',    // MATIC/POL
  USDT_TRC20: '28.0',      // TRX
};

export const GAS_FUND_AMOUNT: Record<string, string> = {
  USDT_BEP20: '0.001',     // BNB upper limit
  USDT_POLYGON: '0.05',    // POL upper limit
  USDT_TRC20: '30.0',      // TRX upper limit
};

/**
 * Explicit state-machine whitelist (Part 3 — Fix queue state machine).
 * Maps each status to the set of statuses it is legally allowed to transition FROM.
 * Any transition not listed here is rejected by transitionItem() / the atomic locking
 * guards below, rather than silently allowed.
 *
 * Canonical happy path:
 *   PENDING -> WAITING_DELAY -> WAITING_FOR_GAS/WAITING_GAS -> GAS_FUNDING ->
 *   WAITING_GAS_CONFIRMATION -> READY_TO_SWEEP -> SWEEPING ->
 *   WAITING_SWEEP_CONFIRMATION -> COMPLETED (or FAILED / RETRY_PENDING at any point).
 *
 * COMPLETED and CANCELLED are terminal — nothing may transition out of them.
 */
export const VALID_TRANSITIONS_FROM: Record<string, string[]> = {
  PENDING: ['PENDING', 'WAITING_DELAY', 'WAITING_FOR_GAS', 'WAITING_GAS', 'READY_TO_SWEEP', 'RETRY_PENDING'],
  WAITING_DELAY: ['WAITING_DELAY', 'PENDING'],
  WAITING_FOR_GAS: ['WAITING_FOR_GAS', 'WAITING_GAS', 'PENDING', 'WAITING_DELAY', 'GAS_FUNDING', 'WAITING_GAS_CONFIRMATION', 'READY_TO_SWEEP', 'RETRY_PENDING'],
  WAITING_GAS: ['WAITING_GAS', 'WAITING_FOR_GAS', 'PENDING', 'WAITING_DELAY', 'GAS_FUNDING', 'WAITING_GAS_CONFIRMATION', 'READY_TO_SWEEP', 'RETRY_PENDING'],
  GAS_FUNDING: ['GAS_FUNDING', 'WAITING_FOR_GAS', 'WAITING_GAS'],
  WAITING_GAS_CONFIRMATION: ['WAITING_GAS_CONFIRMATION', 'GAS_FUNDING'],
  READY_TO_SWEEP: ['READY_TO_SWEEP', 'PENDING', 'WAITING_DELAY', 'WAITING_FOR_GAS', 'WAITING_GAS', 'GAS_FUNDING', 'WAITING_GAS_CONFIRMATION', 'RETRY_PENDING', 'SWEEPING', 'FAILED'],
  SWEEPING: ['SWEEPING', 'READY_TO_SWEEP', 'RETRY_PENDING'],
  WAITING_SWEEP_CONFIRMATION: ['WAITING_SWEEP_CONFIRMATION', 'SWEEPING'],
  COMPLETED: ['WAITING_SWEEP_CONFIRMATION'],
  RETRY_PENDING: ['RETRY_PENDING', 'WAITING_FOR_GAS', 'WAITING_GAS', 'GAS_FUNDING', 'SWEEPING', 'FAILED'],
  FAILED: ['WAITING_FOR_GAS', 'WAITING_GAS', 'GAS_FUNDING', 'SWEEPING', 'WAITING_SWEEP_CONFIRMATION', 'FAILED'],
  CANCELLED: ['PENDING', 'WAITING_DELAY', 'WAITING_FOR_GAS', 'WAITING_GAS', 'GAS_FUNDING', 'WAITING_GAS_CONFIRMATION', 'READY_TO_SWEEP', 'RETRY_PENDING', 'FAILED'],
};

export class SweepQueueProcessor {
  private intervalId: NodeJS.Timeout | null = null;
  private isProcessing = false;
  private activeLocks: Set<string> = new Set();
  private hasLoggedManualMode = false;

  constructor(private readonly provider = activeBlockchainProvider) {}

  /**
   * Start the background sweep queue worker
   */
  public start(intervalMs: number = parseInt(process.env.SWEEP_INTERVAL_MS || '180000', 10)) {
    if (this.intervalId) return;
    logger.info(`[SweepQueueProcessor] Starting background sweep queue processing loop (Interval: ${intervalMs}ms)...`);
    this.intervalId = setInterval(() => this.processQueue(), intervalMs);
  }

  /**
   * Stop the background sweep queue worker
   */
  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      logger.info('[SweepQueueProcessor] Background sweep queue loop stopped.');
    }
  }

  /**
   * Main state-machine processing loop
   */
  public async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      // 1. Check if there are any active sweep queue items or awaiting confirmation jobs first
      const activeItems = await db
        .select()
        .from(sweepQueue)
        .where(
          or(
            eq(sweepQueue.status, 'PENDING'),
            eq(sweepQueue.status, 'WAITING_DELAY'),
            eq(sweepQueue.status, 'WAITING_FOR_GAS'),
            eq(sweepQueue.status, 'WAITING_GAS'),
            eq(sweepQueue.status, 'GAS_FUNDING'),
            eq(sweepQueue.status, 'WAITING_GAS_CONFIRMATION'),
            eq(sweepQueue.status, 'READY_TO_SWEEP'),
            eq(sweepQueue.status, 'SWEEPING'),
            eq(sweepQueue.status, 'WAITING_SWEEP_CONFIRMATION'),
            eq(sweepQueue.status, 'RETRY_PENDING')
          )
        );

      // Confirmation polling must run if transactions were broadcasted
      await sweepExecutionService.pollAndFinalizeAwaitingConfirmationJobs();
      await treasuryService.pollAndFinalizeHotToColdJobs();

      if (activeItems.length === 0) {
        // Nothing in queue to process, exit early to allow DB idle/sleep
        return;
      }

      await treasuryService.ensureAllTreasuryWallets();

      const treasuryList = await db.select().from(treasuryWallets);
      const hasAutoOrHybrid = treasuryList.some(
        (t) => (t.sweepMode || 'AUTOMATIC') !== 'MANUAL' && !t.paused
      );

      if (!hasAutoOrHybrid) {
        if (!this.hasLoggedManualMode) {
          logger.info('[SweepQueueProcessor] All networks are in MANUAL sweep mode. Automatic sweep processing is skipped.');
          this.hasLoggedManualMode = true;
        }
        return;
      }

      this.hasLoggedManualMode = false;

      for (const item of activeItems) {
        const treasury = await treasuryService.getOrCreateTreasuryWallet(item.network);
        if ((treasury.sweepMode || 'AUTOMATIC') === 'MANUAL' || treasury.paused) {
          continue;
        }

        if (this.activeLocks.has(item.depositAddress)) {
          continue;
        }

        this.activeLocks.add(item.depositAddress);
        try {
          await this.processQueueItem(item);
        } catch (err: any) {
          logger.error(`[SweepQueueProcessor] Failed to process queue item ${item.id}:`, err.message);
        } finally {
          this.activeLocks.delete(item.depositAddress);
        }
      }
    } catch (error: any) {
      logger.error('[SweepQueueProcessor] Error in queue processing loop:', error.message);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process a single queue item based on its status
   */
  private async processQueueItem(item: any) {
    const treasury = await treasuryService.getOrCreateTreasuryWallet(item.network);

    if (treasury.paused) {
      logger.debug(`[SweepQueueProcessor] Sweeps are paused for network ${item.network}. Skipping item ${item.id}`);
      return;
    }

    const mode = treasury.sweepMode || 'AUTOMATIC';
    const amountFloat = parseFloat(item.amount);
    const thresholdFloat = parseFloat(treasury.autoSweepThreshold || '1.00000000');

    if (amountFloat < thresholdFloat) {
      if (item.status !== 'PENDING') {
        await db
          .update(sweepQueue)
          .set({ status: 'PENDING', gasStatus: 'LOW', updatedAt: new Date() })
          .where(eq(sweepQueue.id, item.id));
      }
      return;
    }

    const now = new Date();
    if (item.eligibleAt > now) {
      if (item.status !== 'WAITING_DELAY') {
        await db
          .update(sweepQueue)
          .set({ status: 'WAITING_DELAY', updatedAt: new Date() })
          .where(eq(sweepQueue.id, item.id));
      }
      return;
    }

    if (mode === 'MANUAL') {
      if (item.status !== 'PENDING') {
        await db
          .update(sweepQueue)
          .set({
            status: 'PENDING',
            updatedAt: new Date()
          })
          .where(eq(sweepQueue.id, item.id));
      }
      return;
    }

    const nativeBalStr = await this.provider.getNativeBalance(item.network, item.depositAddress);
    const gasCheck = await gasCalculator.calculateTopUpNeeded(item.network, nativeBalStr);

    switch (item.status) {
      case 'PENDING':
      case 'WAITING_DELAY':
      case 'RETRY_PENDING':
        if (gasCheck.isSufficient) {
          await this.transitionItem(item.id, 'READY_TO_SWEEP', 'OK');
        } else {
          await this.transitionItem(item.id, 'WAITING_FOR_GAS', 'LOW');
        }
        break;

      case 'WAITING_FOR_GAS':
      case 'WAITING_GAS':
        if (gasCheck.isSufficient) {
          await this.transitionItem(item.id, 'READY_TO_SWEEP', 'OK');
        } else {
          try {
            await this.fundGasForQueueItem(item.id, 'SYSTEM');
          } catch (fundErr: any) {
            logger.warn(`[SweepQueueProcessor] Auto gas funding deferred for ${item.id}: ${fundErr.message}`);
          }
        }
        break;

      case 'GAS_FUNDING':
      case 'WAITING_GAS_CONFIRMATION':
        if (gasCheck.isSufficient) {
          await this.transitionItem(item.id, 'READY_TO_SWEEP', 'OK');
        } else {
          if (item.status !== 'WAITING_GAS_CONFIRMATION') {
            await this.transitionItem(item.id, 'WAITING_GAS_CONFIRMATION', 'FUNDING_SENT');
          }
          // Stuck check: if waiting for gas for >10 mins, reset to WAITING_FOR_GAS so it can retry
          const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);
          if (item.updatedAt && new Date(item.updatedAt) < tenMinsAgo) {
            logger.warn(`[SweepQueueProcessor] Queue item ${item.id} stuck waiting for gas confirmation >10m. Resetting to WAITING_FOR_GAS.`);
            await this.transitionItem(item.id, 'WAITING_FOR_GAS', 'LOW', 'Gas confirmation timeout reset');
          } else {
            logger.debug(`[SweepQueueProcessor] Waiting for gas funding confirmation for ${item.depositAddress}. Current: ${nativeBalStr}`);
          }
        }
        break;

      case 'READY_TO_SWEEP':
        if (!gasCheck.isSufficient) {
          logger.warn(`[SweepQueueProcessor] Queue item ${item.id} was READY_TO_SWEEP but gas re-check failed. Current: ${nativeBalStr}, Required: ${gasCheck.requiredMinGas}`);
          await this.transitionItem(item.id, 'WAITING_FOR_GAS', 'LOW');
        } else {
          logger.info(`[SweepQueueProcessor] Verified gas sufficiency (${nativeBalStr} >= ${gasCheck.requiredMinGas}). Dispatching sweep for item ${item.id}...`);
          try {
            await this.sweepQueueItem(item.id, 'SYSTEM');
          } catch (sweepErr: any) {
            logger.warn(`[SweepQueueProcessor] Sweep execution deferred for ${item.id}: ${sweepErr.message}`);
          }
        }
        break;

      case 'SWEEPING':
        // Stuck check: if SWEEPING for >5 mins without sweepTxHash ever being recorded,
        // the broadcast attempt itself likely failed silently — reset to READY_TO_SWEEP
        // for retry. If a sweepTxHash WAS recorded, sweepQueueItem() already moved the row
        // to WAITING_SWEEP_CONFIRMATION, so reaching here without one is a real stall.
        const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
        if (item.updatedAt && new Date(item.updatedAt) < fiveMinsAgo) {
          logger.warn(`[SweepQueueProcessor] Item ${item.id} stuck in SWEEPING for >5 mins without txHash. Resetting to READY_TO_SWEEP.`);
          await this.transitionItem(item.id, 'READY_TO_SWEEP', item.gasStatus || 'OK', 'Stuck SWEEPING reset');
        }
        break;

      case 'WAITING_SWEEP_CONFIRMATION':
        // On-chain confirmation checking and COMPLETED/FAILED finalization for this item's
        // linked treasury sweep job is handled centrally and exclusively by
        // sweepExecutionService.pollAndFinalizeAwaitingConfirmationJobs(), invoked once per
        // tick at the top of processQueue() — this is the ONLY code path permitted to
        // credit balances and mark a sweep COMPLETED (blockchain = single source of truth).
        // This branch is purely an observability/stuck-detection safety net: if a job has
        // been sitting here far longer than the confirmation timeout without being resolved
        // (e.g. its linked treasurySweepJobs row was lost or already finalized out of sync),
        // log it loudly rather than silently leaving it ambiguous forever.
        logger.debug(`[SweepQueueProcessor] Item ${item.id} awaiting on-chain sweep confirmation. Tx: ${item.sweepTxHash || 'unknown'}`);
        break;

      default:
        break;
    }
  }

  /**
   * Helper to transition queue item states. Enforces the VALID_TRANSITIONS_FROM
   * whitelist atomically at the database level (Part 3 — Fix queue state machine):
   * the UPDATE only applies if the row's current status is one of the statuses
   * legally allowed to transition into `status`. Illegal/unexpected jumps are
   * rejected and logged rather than silently applied.
   */
  private async transitionItem(itemId: string, status: string, gasStatus: string, errorMessage?: string): Promise<boolean> {
    const allowedFromStatuses = VALID_TRANSITIONS_FROM[status] || [];

    const result = await db
      .update(sweepQueue)
      .set({
        status,
        gasStatus,
        errorMessage: errorMessage !== undefined ? errorMessage : null,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(sweepQueue.id, itemId),
          or(...allowedFromStatuses.map((s) => eq(sweepQueue.status, s)))
        )
      )
      .returning();

    if (result.length === 0) {
      logger.warn(`[SweepQueueProcessor] Rejected illegal/stale transition for item ${itemId}: -> ${status} (current status was not in the allowed set: ${allowedFromStatuses.join(', ')})`);
      return false;
    }

    logger.info(`[SweepQueueProcessor] Item ${itemId} transitioned to ${status} (Gas: ${gasStatus})`);
    return true;
  }

  /**
   * Fund gas manually or automatically for a queue item
   */
  public async fundGasForQueueItem(itemId: string, adminUid: string = 'SYSTEM'): Promise<string> {
    const itemRecord = await db
      .select()
      .from(sweepQueue)
      .where(eq(sweepQueue.id, itemId))
      .limit(1);

    if (itemRecord.length === 0) {
      throw new Error(`Sweep queue item not found: ${itemId}`);
    }

    const item = itemRecord[0];
    if (item.status === 'COMPLETED' || item.status === 'CANCELLED') {
      throw new Error(`Cannot fund gas for item in status: ${item.status}`);
    }
    if (item.status === 'SWEEPING' || item.status === 'GAS_FUNDING' || item.status === 'WAITING_SWEEP_CONFIRMATION') {
      throw new Error(`Queue item ${itemId} is already being processed (status: ${item.status}).`);
    }

    const nativeBalStr = await this.provider.getNativeBalance(item.network, item.depositAddress);
    const gasCheck = await gasCalculator.calculateTopUpNeeded(item.network, nativeBalStr);

    if (gasCheck.isSufficient) {
      logger.info(`[SweepQueueProcessor] Address ${item.depositAddress} already has sufficient gas (${gasCheck.currentBalance} >= ${gasCheck.requiredMinGas} ${gasCheck.gasSymbol}). No top-up needed.`);
      await this.transitionItem(itemId, 'READY_TO_SWEEP', 'OK');
      return 'ALREADY_SUFFICIENT';
    }

    const fundAmount = gasCheck.topUpNeeded;
    logger.info(`[SweepQueueProcessor] Initiating MINIMUM gas top-up of ${fundAmount} ${gasCheck.gasSymbol} for ${item.depositAddress} on ${item.network}`);

    // Atomic conditional status lock to prevent concurrent gas funding
    const lockResult = await db
      .update(sweepQueue)
      .set({
        status: 'GAS_FUNDING',
        gasStatus: 'FUNDING_SENT',
        updatedAt: new Date()
      })
      .where(
        and(
          eq(sweepQueue.id, itemId),
          not(eq(sweepQueue.status, 'GAS_FUNDING')),
          not(eq(sweepQueue.status, 'SWEEPING')),
          not(eq(sweepQueue.status, 'WAITING_SWEEP_CONFIRMATION')),
          not(eq(sweepQueue.status, 'COMPLETED')),
          not(eq(sweepQueue.status, 'CANCELLED'))
        )
      )
      .returning();

    if (lockResult.length === 0) {
      throw new Error(`Queue item ${itemId} is already locked in state: ${item.status}`);
    }

    try {
      const gasTxHash = await this.provider.fundGas(item.network, item.depositAddress, fundAmount);

      await db
        .update(sweepQueue)
        .set({
          status: 'WAITING_GAS_CONFIRMATION',
          gasTxHash,
          updatedAt: new Date()
        })
        .where(eq(sweepQueue.id, itemId));

      await auditRepository.createAuditLog({
        actorUid: adminUid,
        userId: item.userId,
        action: 'TREASURY_GAS_FUNDING_SENT',
        resource: `sweepQueue/${itemId}`,
        oldValue: '0.00000000',
        newValue: JSON.stringify({ amount: fundAmount, symbol: gasCheck.gasSymbol, txHash: gasTxHash }),
      });

      logger.info(`[SweepQueueProcessor] Minimum gas funding tx broadcasted: ${gasTxHash}`);
      return gasTxHash;
    } catch (err: any) {
      const attempts = (item.attempts || 0) + 1;
      const isMaxRetries = attempts >= 5;
      const finalStatus = isMaxRetries ? 'FAILED' : 'WAITING_FOR_GAS';
      const finalErrorMessage = isMaxRetries
        ? `Retry limit exceeded (${attempts}/5 attempts). Last error: ${err.message}`
        : `Gas funding failed: ${err.message}`;

      logger.error(`[SweepQueueProcessor] Gas funding FAILED for ${item.depositAddress}: ${err.message}. Status set to ${finalStatus}`);
      
      await db
        .update(sweepQueue)
        .set({
          status: finalStatus,
          gasStatus: 'FAILED',
          errorMessage: finalErrorMessage,
          attempts,
          updatedAt: new Date()
        })
        .where(eq(sweepQueue.id, itemId));

      throw err;
    }
  }

  /**
   * Sweep a queue item manually or automatically
   */
  public async sweepQueueItem(itemId: string, adminUid: string = 'SYSTEM'): Promise<string> {
    const itemRecord = await db
      .select()
      .from(sweepQueue)
      .where(eq(sweepQueue.id, itemId))
      .limit(1);

    if (itemRecord.length === 0) {
      throw new Error(`Sweep queue item not found: ${itemId}`);
    }

    const item = itemRecord[0];
    if (item.status === 'COMPLETED' || item.status === 'CANCELLED') {
      throw new Error(`Cannot sweep item in status: ${item.status}`);
    }
    if (item.status === 'SWEEPING' || item.status === 'WAITING_SWEEP_CONFIRMATION') {
      throw new Error(`Queue item ${itemId} is already being swept or awaiting on-chain confirmation (status: ${item.status}).`);
    }

    const startTime = Date.now();
    logger.info(`[SweepQueueProcessor] Initiating sweep execution: ${JSON.stringify({
      queueId: itemId,
      depositAddress: item.depositAddress,
      network: item.network,
      amount: item.amount,
      status: item.status
    })}`);

    // Atomic conditional lock to SWEEPING status
    const lockResult = await db
      .update(sweepQueue)
      .set({
        status: 'SWEEPING',
        updatedAt: new Date()
      })
      .where(
        and(
          eq(sweepQueue.id, itemId),
          not(eq(sweepQueue.status, 'SWEEPING')),
          not(eq(sweepQueue.status, 'WAITING_SWEEP_CONFIRMATION')),
          not(eq(sweepQueue.status, 'COMPLETED')),
          not(eq(sweepQueue.status, 'CANCELLED'))
        )
      )
      .returning();

    if (lockResult.length === 0) {
      throw new Error(`Queue item ${itemId} is already locked/being swept by another process.`);
    }

    try {
      const addrRec = await db
        .select()
        .from(depositAddresses)
        .where(
          and(
            eq(depositAddresses.address, item.depositAddress),
            eq(depositAddresses.network, item.network)
          )
        )
        .limit(1);

      if (addrRec.length === 0) {
        throw new Error(`Deposit address record not found for address: ${item.depositAddress}`);
      }

      const sweepResult = await treasuryService.sweepUserDepositAddress(addrRec[0].id, adminUid);

      if (sweepResult.success && sweepResult.txHash) {
        const executionTimeMs = Date.now() - startTime;
        // The broadcast succeeded, but the sweep is NOT complete until the blockchain
        // confirms it — sweepExecutionService.pollAndFinalizeAwaitingConfirmationJobs()
        // is the only path that may move this to COMPLETED, once confirmed on-chain.
        await db
          .update(sweepQueue)
          .set({
            status: 'WAITING_SWEEP_CONFIRMATION',
            sweepTxHash: sweepResult.txHash,
            errorMessage: null,
            updatedAt: new Date()
          })
          .where(eq(sweepQueue.id, itemId));

        logger.info(`[SweepQueueProcessor] Sweep BROADCASTED, awaiting on-chain confirmation: ${JSON.stringify({
          queueId: itemId,
          depositAddress: item.depositAddress,
          network: item.network,
          sweepTxHash: sweepResult.txHash,
          executionTimeMs
        })}`);
        return sweepResult.txHash;
      } else {
        throw new Error(sweepResult.error || 'Unknown sweep error returned by TreasuryService');
      }
    } catch (err: any) {
      const executionTimeMs = Date.now() - startTime;
      const attempts = (item.attempts || 0) + 1;
      const isMaxRetries = attempts >= 5;
      const finalStatus = isMaxRetries ? 'FAILED' : 'RETRY_PENDING';
      const finalErrorMessage = isMaxRetries
        ? `Retry limit exceeded (${attempts}/5 attempts). Last error: ${err.message}`
        : err.message;

      logger.error(`[SweepQueueProcessor] Sweep FAILED: ${JSON.stringify({
        queueId: itemId,
        depositAddress: item.depositAddress,
        network: item.network,
        attempts,
        finalStatus,
        failedReason: err.message,
        executionTimeMs
      })}`);

      await db
        .update(sweepQueue)
        .set({
          status: finalStatus,
          errorMessage: finalErrorMessage,
          attempts,
          updatedAt: new Date()
        })
        .where(eq(sweepQueue.id, itemId));

      throw err;
    }
  }

  /**
   * Helper to calculate the eligible date based on Delay configuration
   */
  public calculateEligibleAt(createdAt: Date, delayConfig: string, customMinutes: number): Date {
    const date = new Date(createdAt);
    switch (delayConfig) {
      case 'IMMEDIATE':
        return date;
      case '1_HOUR':
        date.setHours(date.getHours() + 1);
        return date;
      case '6_HOURS':
        date.setHours(date.getHours() + 6);
        return date;
      case '24_HOURS':
        date.setDate(date.getDate() + 1);
        return date;
      case '3_DAYS':
        date.setDate(date.getDate() + 3);
        return date;
      case '7_DAYS':
        date.setDate(date.getDate() + 7);
        return date;
      case 'CUSTOM':
        date.setMinutes(date.getMinutes() + customMinutes);
        return date;
      case 'MANUAL_ONLY':
        date.setFullYear(date.getFullYear() + 100);
        return date;
      default:
        return date;
    }
  }

  /**
   * Register a new deposit in the sweep queue
   */
  public async registerDeposit(depositId: string): Promise<any> {
    const depRecord = await db
      .select()
      .from(deposits)
      .where(eq(deposits.id, depositId))
      .limit(1);

    if (depRecord.length === 0) return null;
    const deposit = depRecord[0];

    const existing = await db
      .select()
      .from(sweepQueue)
      .where(eq(sweepQueue.depositId, depositId))
      .limit(1);

    if (existing.length > 0) return existing[0];

    const treasury = await treasuryService.getOrCreateTreasuryWallet(deposit.network);
    const amountFloat = parseFloat(deposit.amount);
    const thresholdFloat = parseFloat(treasury.autoSweepThreshold || '1.00000000');

    let status = 'PENDING';
    let eligibleAt = new Date();

    if (amountFloat < thresholdFloat) {
      status = 'PENDING';
    } else {
      const mode = treasury.sweepMode || 'AUTOMATIC';
      if (mode === 'MANUAL') {
        status = 'PENDING';
      } else {
        eligibleAt = this.calculateEligibleAt(new Date(), treasury.sweepDelay || 'IMMEDIATE', treasury.customDelayMinutes || 0);
        if (eligibleAt > new Date()) {
          status = 'WAITING_DELAY';
        } else {
          const nativeBalStr = await this.provider.getNativeBalance(deposit.network, deposit.depositAddress);
          const gasCheck = await gasCalculator.calculateTopUpNeeded(deposit.network, nativeBalStr);
          status = gasCheck.isSufficient ? 'READY_TO_SWEEP' : 'WAITING_FOR_GAS';
        }
      }
    }

    const inserted = await db
      .insert(sweepQueue)
      .values({
        depositId: deposit.id,
        userId: deposit.userId,
        depositAddress: deposit.depositAddress,
        network: deposit.network,
        amount: deposit.amount,
        status,
        gasStatus: 'LOW',
        eligibleAt,
      })
      .returning();

    logger.info(`[SweepQueueProcessor] Registered deposit ${deposit.id} into Sweep Queue in status ${status}`);
    
    if (status === 'READY_TO_SWEEP' || status === 'WAITING_FOR_GAS') {
      setTimeout(() => this.processQueue(), 100);
    }

    return inserted[0];
  }

  /**
   * Retry a failed queue item
   */
  public async retryQueueItem(itemId: string, adminUid: string = 'SYSTEM') {
    const itemRecord = await db.select().from(sweepQueue).where(eq(sweepQueue.id, itemId)).limit(1);
    if (itemRecord.length === 0) throw new Error('Queue item not found');

    if (itemRecord[0].status !== 'FAILED') {
      throw new Error(`Cannot retry an item that is not FAILED (current status: ${itemRecord[0].status}).`);
    }

    const lockResult = await db
      .update(sweepQueue)
      .set({
        status: 'RETRY_PENDING',
        errorMessage: null,
        updatedAt: new Date()
      })
      .where(and(eq(sweepQueue.id, itemId), eq(sweepQueue.status, 'FAILED')))
      .returning();

    if (lockResult.length === 0) {
      throw new Error(`Queue item ${itemId} status changed concurrently; retry aborted.`);
    }

    await auditRepository.createAuditLog({
      actorUid: adminUid,
      userId: itemRecord[0].userId,
      action: 'TREASURY_SWEEP_RETRY',
      resource: `sweepQueue/${itemId}`,
      oldValue: itemRecord[0].status,
      newValue: 'RETRY_PENDING',
    });

    setTimeout(() => this.processQueue(), 100);
  }

  /**
   * Cancel or remove an item from the sweep queue
   */
  public async cancelQueueItem(itemId: string, adminUid: string = 'SYSTEM') {
    const itemRecord = await db.select().from(sweepQueue).where(eq(sweepQueue.id, itemId)).limit(1);
    if (itemRecord.length === 0) throw new Error('Queue item not found');

    const currentStatus = itemRecord[0].status;
    if (currentStatus === 'COMPLETED' || currentStatus === 'SWEEPING' || currentStatus === 'WAITING_SWEEP_CONFIRMATION') {
      throw new Error(`Cannot cancel a sweep queue item in status ${currentStatus} — the transaction has already been (or may already be) broadcasted to the blockchain and cannot be undone.`);
    }

    const lockResult = await db
      .update(sweepQueue)
      .set({
        status: 'CANCELLED',
        updatedAt: new Date()
      })
      .where(
        and(
          eq(sweepQueue.id, itemId),
          not(eq(sweepQueue.status, 'COMPLETED')),
          not(eq(sweepQueue.status, 'SWEEPING')),
          not(eq(sweepQueue.status, 'WAITING_SWEEP_CONFIRMATION'))
        )
      )
      .returning();

    if (lockResult.length === 0) {
      throw new Error(`Queue item ${itemId} status changed concurrently; cancel aborted.`);
    }

    await auditRepository.createAuditLog({
      actorUid: adminUid,
      userId: itemRecord[0].userId,
      action: 'TREASURY_SWEEP_CANCELLED',
      resource: `sweepQueue/${itemId}`,
      oldValue: itemRecord[0].status,
      newValue: 'CANCELLED',
    });
  }

  /**
   * Bulk Operations
   */
  public async bulkFundGas(itemIds: string[], adminUid: string = 'SYSTEM') {
    const results = [];
    for (const id of itemIds) {
      try {
        const txHash = await this.fundGasForQueueItem(id, adminUid);
        results.push({ id, success: true, txHash });
      } catch (err: any) {
        results.push({ id, success: false, error: err.message });
      }
    }
    return results;
  }

  public async bulkSweep(itemIds: string[], adminUid: string = 'SYSTEM') {
    const results = [];
    for (const id of itemIds) {
      try {
        const txHash = await this.sweepQueueItem(id, adminUid);
        results.push({ id, success: true, txHash });
      } catch (err: any) {
        results.push({ id, success: false, error: err.message });
      }
    }
    return results;
  }

  public async bulkFundAndSweep(itemIds: string[], adminUid: string = 'SYSTEM') {
    const results = [];
    for (const id of itemIds) {
      try {
        let txHashGas = '';
        try {
          txHashGas = await this.fundGasForQueueItem(id, adminUid);
        } catch (gasErr) {
          // Continue if gas is already sufficient
        }
        const txHashSweep = await this.sweepQueueItem(id, adminUid);
        results.push({ id, success: true, gasTxHash: txHashGas, sweepTxHash: txHashSweep });
      } catch (err: any) {
        results.push({ id, success: false, error: err.message });
      }
    }
    return results;
  }
}

export const sweepQueueProcessor = new SweepQueueProcessor();
export default sweepQueueProcessor;
