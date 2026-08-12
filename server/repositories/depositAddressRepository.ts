/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { eq, and, or, sql, desc } from 'drizzle-orm';
import { db } from '../../src/db/index.ts';
import { depositAddresses } from '../../src/db/schema.ts';

export class DepositAddressRepository {
  /**
   * Find all ACTIVE generated deposit addresses for a user (one per network at most).
   * Archived/rotated-out addresses are intentionally excluded — this is what should be
   * shown to the user and used for "which address is currently in use" checks.
   */
  async findByUserId(userId: string) {
    try {
      const result = await db
        .select()
        .from(depositAddresses)
        .where(and(eq(depositAddresses.userId, userId), eq(depositAddresses.isActive, true)));
      return result;
    } catch (error) {
      console.error('Database query (findByUserId) failed:', error);
      throw new Error('Failed to retrieve deposit addresses.');
    }
  }

  /**
   * Find the single ACTIVE deposit address for a user on a given blockchain network.
   * Archived addresses are excluded — callers that need full history should use
   * findHistoryByUserAndNetwork() instead.
   */
  async findByUserAndNetwork(userId: string, network: string) {
    try {
      const result = await db
        .select()
        .from(depositAddresses)
        .where(
          and(
            eq(depositAddresses.userId, userId),
            eq(depositAddresses.network, network),
            eq(depositAddresses.isActive, true)
          )
        );
      return result[0] || null;
    } catch (error) {
      console.error('Database query (findByUserAndNetwork) failed:', error);
      throw new Error('Failed to retrieve network deposit address.');
    }
  }

  /**
   * Find EVERY deposit address (active + archived) ever issued to a user on a network,
   * newest first. Used for the admin "View Address History" modal. Rotated-out rows are
   * never deleted, so this is always the complete, permanent record.
   */
  async findHistoryByUserAndNetwork(userId: string, network: string) {
    try {
      const result = await db
        .select()
        .from(depositAddresses)
        .where(and(eq(depositAddresses.userId, userId), eq(depositAddresses.network, network)))
        .orderBy(desc(depositAddresses.createdAt));
      return result;
    } catch (error) {
      console.error('Database query (findHistoryByUserAndNetwork) failed:', error);
      throw new Error('Failed to retrieve deposit address history.');
    }
  }

  /**
   * Find a deposit address by the generated public crypto address — intentionally NOT
   * filtered by isActive. Blockchain deposit monitoring/verification/crediting must
   * continue to recognize archived (rotated-out) addresses as belonging to their user;
   * "inactive" only means "not shown to the user anymore", never "invalid".
   */
  async findByAddress(address: string) {
    if (!address) return null;
    try {
      const lowerAddr = address.toLowerCase();
      const result = await db
        .select()
        .from(depositAddresses)
        .where(
          or(
            eq(depositAddresses.address, address),
            eq(sql`lower(${depositAddresses.address})`, lowerAddr)
          )
        );
      return result[0] || null;
    } catch (error) {
      console.error('Database query (findByAddress) failed:', error);
      throw new Error('Failed to retrieve deposit address from database.');
    }
  }

  /**
   * Create and record a new permanent deposit address for a user. Accepts an optional
   * transactional executor (`executor`) so callers (e.g. rotation) can run this as part
   * of a single atomic transaction alongside the archival of the previous address.
   */
  async createDepositAddress(
    data: {
      userId: string;
      network: string;
      address: string;
      derivationIndex?: number;
      qrPath?: string;
    },
    executor: any = db
  ) {
    try {
      const result = await executor
        .insert(depositAddresses)
        .values({
          userId: data.userId,
          network: data.network,
          address: data.address,
          derivationIndex: data.derivationIndex,
          qrPath: data.qrPath,
        })
        .returning();
      return result[0];
    } catch (error) {
      console.error('Database insertion (createDepositAddress) failed:', error);
      throw new Error('Failed to store generated deposit address.');
    }
  }

  /**
   * Archive a previously-active deposit address (mark it inactive and record rotation
   * metadata). The row is NEVER deleted and its address/derivationIndex/balances are left
   * completely untouched — archived rows must keep working for deposit monitoring/sweep.
   * Accepts an optional transactional executor so this can run atomically alongside
   * createDepositAddress() within the same rotation transaction.
   */
  async archiveDepositAddress(
    id: string,
    data: { rotatedBy: string; rotationReason: string; replacedByAddressId: string },
    executor: any = db
  ) {
    try {
      const result = await executor
        .update(depositAddresses)
        .set({
          isActive: false,
          rotatedAt: new Date(),
          rotatedBy: data.rotatedBy,
          rotationReason: data.rotationReason,
          replacedByAddressId: data.replacedByAddressId,
          updatedAt: new Date(),
        })
        .where(eq(depositAddresses.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error('Database update (archiveDepositAddress) failed:', error);
      throw new Error('Failed to archive previous deposit address.');
    }
  }

  /**
   * Delete a deposit address by ID (used for rollback if subscription setup fails
   * immediately after initial creation — never used on an address that could already
   * have received a real deposit).
   */
  async deleteDepositAddress(id: string) {
    try {
      await db.delete(depositAddresses).where(eq(depositAddresses.id, id));
    } catch (error) {
      console.error('Database deletion (deleteDepositAddress) failed:', error);
    }
  }

  /**
   * Find all generated deposit addresses across all users (active + archived) —
   * used by Treasury admin views which must account for balances on every address
   * ever issued, not just currently-active ones.
   */
  async findAll() {
    try {
      return await db.select().from(depositAddresses);
    } catch (error) {
      console.error('Database query (findAll deposit addresses) failed:', error);
      return [];
    }
  }
}

export const depositAddressRepository = new DepositAddressRepository();
export default depositAddressRepository;
