/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ethers } from 'ethers';
import { normalizeEvmAddress } from '../utils/blockchainUtils.ts';
import { eq } from 'drizzle-orm';
import { db } from '../../../src/db/index.ts';
import { systemSettings } from '../../../src/db/schema.ts';
import { depositAddressRepository } from '../../repositories/depositAddressRepository.ts';
import { depositRepository } from '../../repositories/depositRepository.ts';
import { depositService } from './DepositService.ts';
import { logger } from '../../utils/logger.ts';
import { blockchainConfig } from '../config/blockchainConfig.ts';
import { rpcManager } from '../rpc/RpcManager.ts';
import { normalizeAmount } from '../utils/amountUtils.ts';

const TRANSFER_EVENT_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

/**
 * Promise wrapper to enforce RPC operation timeouts
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, operationName: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Operation '${operationName}' timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

export class RpcDepositScanner {
  private timer: NodeJS.Timeout | null = null;
  private isScanning = false;

  /**
   * Start background block/event scanner loop
   */
  start(intervalMs: number = blockchainConfig.monitoringIntervalMs) {
    // TODO: Automatic deposit scanning is temporarily disabled to prevent continuous background RPC polling.
    // Re-enable automatic deposit scanning in a future release.
    logger.info('RpcDepositScanner background polling is temporarily disabled.');
    return;

    /*
    if (this.timer) {
      logger.info('RpcDepositScanner is already running.');
      return;
    }

    logger.info(`Starting RpcDepositScanner event loop (Interval: ${intervalMs}ms)...`);
    this.timer = setInterval(() => this.scanAllNetworks(), intervalMs);

    // Run initial scan tick on startup
    this.scanAllNetworks().catch((err) => {
      logger.error('Error in initial RpcDepositScanner execution:', err);
    });
    */
  }

  /**
   * Stop background block scanner loop
   */
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      logger.info('RpcDepositScanner loop stopped.');
    }
  }

  /**
   * Execute scanning tick across all active networks concurrently
   */
  async scanAllNetworks() {
    if (this.isScanning) {
      logger.debug('[RpcDepositScanner] Previous scan tick is still processing. Skipping iteration.');
      return;
    }

    this.isScanning = true;
    try {
      // Execute network scans in parallel using Promise.allSettled to ensure independent failure boundaries
      await Promise.allSettled([
        this.scanEvmNetwork('USDT_BEP20'),
        this.scanEvmNetwork('USDT_POLYGON'),
        this.scanTronNetwork(),
      ]);
    } catch (err: any) {
      logger.error('[RpcDepositScanner] Unexpected error during scanner tick:', err);
    } finally {
      this.isScanning = false;
    }
  }

  /**
   * Scan EVM contract Transfer logs using eth_getLogs with incremental block persistence and metrics
   */
  private async scanEvmNetwork(network: string) {
    const startTime = Date.now();
    const netConfig = blockchainConfig.networks[network];
    if (!netConfig || !netConfig.contractAddress) return;

    let logsFound = 0;
    let matchingAddresses = 0;
    let depositsCreated = 0;
    let fromBlock = 0;
    let toBlock = 0;

    try {
      await rpcManager.executeRpc(network, async (rpcUrl) => {
        const provider = rpcManager.getProvider(network, rpcUrl);

        // Fetch current block with 10s RPC timeout protection
        const currentBlock = await withTimeout(
          provider.getBlockNumber(),
          10000,
          `getBlockNumber(${network})`
        );

        let lastScannedBlock = await this.getLastScannedBlock(network);
        if (lastScannedBlock === null) {
          // Initialize lastScannedBlock using configurable initialReplayBlocks window
          const replayBlocks = blockchainConfig.initialReplayBlocks;
          lastScannedBlock = Math.max(0, currentBlock - replayBlocks);
          await this.setLastScannedBlock(network, lastScannedBlock);
        }

        fromBlock = lastScannedBlock + 1;
        const chunkSize = blockchainConfig.blockChunkSize;
        toBlock = Math.min(currentBlock, fromBlock + chunkSize - 1);

        if (fromBlock > toBlock) {
          return;
        }

        // Query eth_getLogs with 10s RPC timeout protection
        const logs = await withTimeout(
          provider.getLogs({
            address: netConfig.contractAddress,
            topics: [TRANSFER_EVENT_TOPIC],
            fromBlock,
            toBlock,
          }),
          10000,
          `getLogs(${network})`
        );

        logsFound = logs.length;

        for (const log of logs) {
          if (!log.topics || log.topics.length < 3) continue;

          try {
            // Topic 2 contains the recipient address in EVM Transfer topic
            const rawTo = log.topics[2];
            const toAddress = normalizeEvmAddress('0x' + rawTo.slice(26));

            // Check indexed deposit_addresses database table
            const addrRecord = await depositAddressRepository.findByAddress(toAddress);
            if (!addrRecord) continue;

            matchingAddresses++;

            const txHash = log.transactionHash;
            const amountStr = normalizeAmount(log.data, netConfig.decimals);

            // Duplicate safety check
            const existing = await depositRepository.findByTxHash(txHash);
            if (!existing) {
              try {
                logger.info(
                  `[RpcDepositScanner] Auto-discovered ${network} transfer of ${amountStr} USDT for user ${addrRecord.userId} at address ${toAddress} (txHash: ${txHash})`
                );

                await depositService.createDeposit(
                  addrRecord.userId,
                  amountStr,
                  network,
                  toAddress,
                  txHash
                );
                depositsCreated++;
              } catch (createErr: any) {
                // Database-safe unique constraint handling
                if (
                  createErr.message?.includes('unique constraint') ||
                  createErr.message?.includes('duplicate key')
                ) {
                  logger.debug(
                    `[RpcDepositScanner] [${network}] Skipped duplicate deposit creation for txHash ${txHash} (caught unique constraint)`
                  );
                } else {
                  throw createErr;
                }
              }
            }
          } catch (logErr: any) {
            logger.error(
              `[RpcDepositScanner] Error processing log in ${network} block ${log.blockNumber}:`,
              logErr.message
            );
            throw logErr;
          }
        }

        // Persist updated last scanned block
        await this.setLastScannedBlock(network, toBlock);
      });

      const durationMs = Date.now() - startTime;
      if (fromBlock <= toBlock && fromBlock > 0) {
        logger.info(
          `[RpcDepositScanner Metrics] [${network}] Scanned blocks ${fromBlock}->${toBlock} in ${durationMs}ms | Logs: ${logsFound} | Matches: ${matchingAddresses} | Created: ${depositsCreated}`
        );
      }
    } catch (err: any) {
      logger.error(`[RpcDepositScanner] Failed scanning ${network}:`, err.message);
    }
  }

  /**
   * Scan TRON contract Transfer events with incremental block tracking and metrics
   */
  private async scanTronNetwork() {
    const startTime = Date.now();
    const network = 'USDT_TRC20';
    const netConfig = blockchainConfig.networks[network];
    if (!netConfig || !netConfig.contractAddress) return;

    let logsFound = 0;
    let matchingAddresses = 0;
    let depositsCreated = 0;
    let fromBlock = 0;
    let toBlock = 0;

    try {
      await rpcManager.executeRpc(network, async (rpcUrl) => {
        const cleanUrl = rpcUrl.replace(/\/$/, '');

        // Fetch current TRON block height with timeout
        const nowBlockRes = await withTimeout(
          fetch(`${cleanUrl}/wallet/getnowblock`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          }).then((r) => r.json()),
          10000,
          `TRON getnowblock`
        ).catch(() => null);

        const currentBlock = nowBlockRes?.block_header?.raw_data?.number;
        if (!currentBlock || typeof currentBlock !== 'number') {
          return;
        }

        let lastScannedBlock = await this.getLastScannedBlock(network);
        if (lastScannedBlock === null) {
          const replayBlocks = blockchainConfig.initialReplayBlocks;
          lastScannedBlock = Math.max(0, currentBlock - replayBlocks);
          await this.setLastScannedBlock(network, lastScannedBlock);
        }

        fromBlock = lastScannedBlock + 1;
        const chunkSize = blockchainConfig.blockChunkSize;
        toBlock = Math.min(currentBlock, fromBlock + chunkSize - 1);

        if (fromBlock > toBlock) {
          return;
        }

        // Fetch TRON Transfer contract events for the block range
        const eventEndpoint = `${cleanUrl}/v1/contracts/${netConfig.contractAddress}/events?event_name=Transfer&only_confirmed=true&limit=50&min_block_number=${fromBlock}`;

        const response = await withTimeout(
          fetch(eventEndpoint, { headers: { Accept: 'application/json' } }),
          10000,
          `TRON getEvents`
        ).catch(() => null);

        if (!response || !response.ok) return;

        const data = await response.json();
        const events: any[] = data?.data || [];
        logsFound = events.length;

        for (const evt of events) {
          try {
            // Check block number filtering
            const evtBlock = evt.block_number || evt.blockNumber;
            if (evtBlock && (evtBlock < fromBlock || evtBlock > toBlock)) {
              continue;
            }

            const result = evt.result || {};
            const toAddress = result.to;
            const txHash = evt.transaction_id;
            const rawValue = result.value;

            if (!toAddress || !txHash || !rawValue) continue;

            // Query indexed deposit addresses table
            const addrRecord = await depositAddressRepository.findByAddress(toAddress);
            if (!addrRecord) continue;

            matchingAddresses++;

            const existing = await depositRepository.findByTxHash(txHash);
            if (!existing) {
              const amountStr = normalizeAmount(rawValue, netConfig.decimals);
              try {
                logger.info(
                  `[RpcDepositScanner] Auto-discovered USDT_TRC20 transfer of ${amountStr} USDT for user ${addrRecord.userId} at address ${toAddress} (txHash: ${txHash})`
                );

                await depositService.createDeposit(
                  addrRecord.userId,
                  amountStr,
                  network,
                  toAddress,
                  txHash
                );
                depositsCreated++;
              } catch (createErr: any) {
                if (
                  createErr.message?.includes('unique constraint') ||
                  createErr.message?.includes('duplicate key')
                ) {
                  logger.debug(
                    `[RpcDepositScanner] [USDT_TRC20] Skipped duplicate deposit creation for txHash ${txHash} (caught unique constraint)`
                  );
                } else {
                  throw createErr;
                }
              }
            }
          } catch (evtErr: any) {
            logger.error(`[RpcDepositScanner] Error processing TRON event:`, evtErr.message);
            throw evtErr;
          }
        }

        // Persist updated TRON last scanned block
        await this.setLastScannedBlock(network, toBlock);
      });

      const durationMs = Date.now() - startTime;
      if (fromBlock <= toBlock && fromBlock > 0) {
        logger.info(
          `[RpcDepositScanner Metrics] [USDT_TRC20] Scanned blocks ${fromBlock}->${toBlock} in ${durationMs}ms | Logs: ${logsFound} | Matches: ${matchingAddresses} | Created: ${depositsCreated}`
        );
      }
    } catch (err: any) {
      logger.error(`[RpcDepositScanner] Failed scanning USDT_TRC20:`, err.message);
    }
  }

  /**
   * Read last scanned block height from database system_settings
   */
  private async getLastScannedBlock(network: string): Promise<number | null> {
    try {
      const key = `LAST_SCANNED_BLOCK_${network}`;
      const rows = await db.select().from(systemSettings).where(eq(systemSettings.key, key));
      if (rows.length > 0 && rows[0].value) {
        const parsed = parseInt(rows[0].value, 10);
        return isNaN(parsed) ? null : parsed;
      }
      return null;
    } catch (err: any) {
      logger.error(`[RpcDepositScanner] Error fetching last scanned block for ${network}:`, err.message);
      return null;
    }
  }

  /**
   * Write last scanned block height to database system_settings
   */
  private async setLastScannedBlock(network: string, blockNumber: number): Promise<void> {
    try {
      const key = `LAST_SCANNED_BLOCK_${network}`;
      const existing = await db.select().from(systemSettings).where(eq(systemSettings.key, key));

      if (existing.length > 0) {
        await db
          .update(systemSettings)
          .set({
            value: blockNumber.toString(),
            updatedAt: new Date(),
          })
          .where(eq(systemSettings.key, key));
      } else {
        await db.insert(systemSettings).values({
          id: Math.floor(100000 + Math.random() * 899999),
          key,
          value: blockNumber.toString(),
          description: `Last scanned block for network ${network}`,
          updatedBy: 'SYSTEM',
        });
      }
    } catch (err: any) {
      logger.error(`[RpcDepositScanner] Error updating last scanned block for ${network}:`, err.message);
    }
  }
}

export const rpcDepositScanner = new RpcDepositScanner();
export default rpcDepositScanner;
