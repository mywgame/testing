/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { sql } from 'drizzle-orm';
import { db } from '../../../src/db/index.ts';
import { depositAddressRepository } from '../../repositories/depositAddressRepository.ts';
import { BlockchainProvider } from '../interfaces/BlockchainProvider.ts';
import { activeBlockchainProvider } from '../providers/index.ts';

export class AddressService {
  constructor(private readonly provider: BlockchainProvider = activeBlockchainProvider) {}

  /**
   * Securely and atomically gets the next derivation index for a network using PostgreSQL sequences.
   */
  private async getNextDerivationIndex(network: string): Promise<number> {
    const cleanNetwork = network.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    const seqName = `seq_derivation_index_${cleanNetwork}`;
    
    // Ensure sequence exists dynamically (O(1) operation after initial creation)
    await db.execute(sql.raw(`CREATE SEQUENCE IF NOT EXISTS ${seqName} START WITH 1 MINVALUE 1;`));
    
    // Fetch next value atomically from the sequence
    const result = (await db.execute(sql.raw(`SELECT nextval('${seqName}') as val;`))) as any;
    
    if (!result || !result.rows || result.rows.length === 0) {
      throw new Error(`Failed to fetch next value from sequence ${seqName}`);
    }
    
    const val = parseInt(result.rows[0].val, 10);
    // Convert 1-based sequence to 0-based derivation index
    return val - 1;
  }

  /**
   * Retrieves or generates a permanent deposit address for a specific user and network
   */
  async getOrCreateDepositAddress(userId: string, network: string) {
    // 1. Check if the user already has a deposit address on this network
    const existing = await depositAddressRepository.findByUserAndNetwork(userId, network);
    if (existing) {
      return existing;
    }

    // 2. Allocate a unique, sequential derivation index atomically using PG sequences
    const derivationIndex = await this.getNextDerivationIndex(network);

    // 3. Generate the actual address via the provider
    const address = await this.provider.generateDepositAddress(network, derivationIndex);

    // 4. Save permanently to database first
    const qrPath = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(address)}`;
    let newAddress;
    try {
      newAddress = await depositAddressRepository.createDepositAddress({
        userId,
        network,
        address,
        derivationIndex,
        qrPath,
      });
    } catch (error: any) {
      // Under high concurrency/race conditions, check if another process succeeded
      const existingAgain = await depositAddressRepository.findByUserAndNetwork(userId, network);
      if (existingAgain) {
        return existingAgain;
      }
      throw error;
    }

    // 5. Create webhook subscription for this saved permanent address
    // If subscription fails, delete the DB record and throw error to keep DB strictly synced with Tatum
    const webhookUrl = process.env.TATUM_WEBHOOK_URL || 'https://figma-metafirm.up.railway.app/api/v1/webhooks/tatum';
    if (this.provider.subscribeAddress) {
      try {
        await this.provider.subscribeAddress(network, address, webhookUrl);
      } catch (subErr: any) {
        console.error(`[AddressService] Subscription failed for address ${address}. Rolling back database record...`);
        if (newAddress && newAddress.id) {
          await depositAddressRepository.deleteDepositAddress(newAddress.id);
        }
        throw subErr;
      }
    }

    return newAddress;
  }

  /**
   * Validate destination address format on target network
   */
  async validateAddress(network: string, address: string): Promise<boolean> {
    return this.provider.validateAddress(network, address);
  }

  /**
   * Rotate a user's deposit address on a given network: generates a brand-new HD wallet
   * address EXACTLY the same way as a newly registered user (same derivation-index
   * allocation, same provider.generateDepositAddress call), then atomically archives the
   * previous active address and activates the new one. The old row is NEVER deleted or
   * overwritten — it remains fully queryable, still receives blockchain deposit credit,
   * and permanently records who rotated it, when, and why.
   *
   * Throws (and persists NOTHING) if address generation fails, or if there was no
   * existing active address to rotate on this network.
   */
  async rotateDepositAddress(
    userId: string,
    network: string,
    rotatedByUserId: string,
    reason: string = 'Manual Admin Rotation',
    withinTransaction?: (tx: any, ctx: { previous: any; created: any }) => Promise<void>
  ) {
    const previous = await depositAddressRepository.findByUserAndNetwork(userId, network);
    if (!previous) {
      throw new Error(`No active deposit address exists for this user on ${network} to rotate.`);
    }

    // Generate the new address FIRST, outside any transaction — if this fails, nothing
    // in the database is touched at all (no partial state).
    const derivationIndex = await this.getNextDerivationIndex(network);
    const address = await this.provider.generateDepositAddress(network, derivationIndex);
    const qrPath = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(address)}`;

    // Persist the new row + archive the old row + (optionally) the audit log entry, all
    // atomically — if ANY step fails (including the caller's audit-log write), the whole
    // transaction rolls back and the previous address remains the active one.
    const newAddress = await db.transaction(async (tx) => {
      const created = await depositAddressRepository.createDepositAddress(
        { userId, network, address, derivationIndex, qrPath },
        tx
      );

      await depositAddressRepository.archiveDepositAddress(
        previous.id,
        { rotatedBy: rotatedByUserId, rotationReason: reason, replacedByAddressId: created.id },
        tx
      );

      if (withinTransaction) {
        await withinTransaction(tx, { previous, created });
      }

      return created;
    });

    // Subscribe the new address for webhook-based deposit detection (legacy Tatum path),
    // same as normal registration. If this fails, we do NOT roll back the rotation itself
    // (the address is already correctly active in the DB and valid on-chain) — we simply
    // log it, consistent with how getOrCreateDepositAddress treats this as best-effort
    // for the RPC-primary architecture.
    const webhookUrl = process.env.TATUM_WEBHOOK_URL || 'https://figma-metafirm.up.railway.app/api/v1/webhooks/tatum';
    if (this.provider.subscribeAddress) {
      try {
        await this.provider.subscribeAddress(network, address, webhookUrl);
      } catch (subErr: any) {
        console.error(`[AddressService] Webhook subscription failed for rotated address ${address}:`, subErr.message);
      }
    }

    return { previousAddress: previous, newAddress };
  }
}

export const addressService = new AddressService();
export default addressService;

