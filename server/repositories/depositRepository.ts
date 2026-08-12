/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '../../src/db/index.ts';
import { deposits } from '../../src/db/schema.ts';

export class DepositRepository {
  /**
   * Find a deposit by its unique sequential database ID
   */
  async findById(id: string) {
    try {
      const result = await db.select().from(deposits).where(eq(deposits.id, id));
      return result[0] || null;
    } catch (error) {
      console.error('Database query (findById) failed:', error);
      throw new Error('Failed to retrieve deposit from database.');
    }
  }

  /**
   * Find a deposit by its unique human-readable reference number
   */
  async findByReference(referenceNumber: string) {
    try {
      const result = await db
        .select()
        .from(deposits)
        .where(eq(deposits.referenceNumber, referenceNumber));
      return result[0] || null;
    } catch (error) {
      console.error('Database query (findByReference) failed:', error);
      throw new Error('Failed to retrieve deposit from database.');
    }
  }

  /**
   * Find a deposit by its unique blockchain transaction hash to prevent double credits
   */
  async findByTxHash(txHash: string) {
    try {
      const result = await db.select().from(deposits).where(eq(deposits.txHash, txHash));
      return result[0] || null;
    } catch (error) {
      console.error('Database query (findByTxHash) failed:', error);
      throw new Error('Failed to retrieve deposit from database.');
    }
  }

  /**
   * Get deposits for a specific user with pagination and optional status filter
   */
  async findByUserId(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
      status?: string;
    }
  ) {
    try {
      const limit = options?.limit ?? 20;
      const offset = options?.offset ?? 0;
      const status = options?.status;

      let query = db.select().from(deposits).$dynamic();
      const conditions = [eq(deposits.userId, userId)];

      if (status) {
        conditions.push(eq(deposits.status, status));
      }

      const result = await query
        .where(and(...conditions))
        .orderBy(desc(deposits.createdAt))
        .limit(limit)
        .offset(offset);

      return result;
    } catch (error) {
      console.error('Database query (findByUserId) failed:', error);
      throw new Error('Failed to query user deposits.');
    }
  }

  /**
   * Create a new deposit record
   */
  async createDeposit(data: {
    userId: string;
    walletId: string;
    referenceNumber: string;
    amount: string;
    status?: string;
    txHash?: string | null;
    network: string;
    depositAddress: string;
    adminNotes?: string | null;
  }) {
    try {
      const result = await db
        .insert(deposits)
        .values({
          userId: data.userId,
          walletId: data.walletId,
          referenceNumber: data.referenceNumber,
          amount: data.amount,
          status: data.status || 'PENDING',
          txHash: data.txHash || null,
          network: data.network,
          depositAddress: data.depositAddress,
          adminNotes: data.adminNotes || null,
        })
        .returning();
      return result[0];
    } catch (error) {
      console.error('Database insertion (createDeposit) failed:', error);
      throw new Error('Failed to record deposit in database.');
    }
  }

  /**
   * Update deposit status
   */
  async updateStatus(
    id: string,
    status: string,
    updates?: Partial<{
      adminNotes: string;
      txHash: string;
    }>
  ) {
    try {
      const result = await db
        .update(deposits)
        .set({
          status,
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(deposits.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error('Database update (updateStatus) failed:', error);
      throw new Error('Failed to update deposit status.');
    }
  }

  /**
   * Get all deposits (with filters and pagination) for administrative panel
   */
  async findAll(options?: {
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    try {
      const limit = options?.limit ?? 50;
      const offset = options?.offset ?? 0;
      const status = options?.status;

      let query = db.select().from(deposits).$dynamic();
      
      if (status) {
        query = query.where(eq(deposits.status, status));
      }

      const result = await query
        .orderBy(desc(deposits.createdAt))
        .limit(limit)
        .offset(offset);

      return result;
    } catch (error) {
      console.error('Database query (findAll) failed:', error);
      throw new Error('Failed to retrieve deposits ledger.');
    }
  }
}

export const depositRepository = new DepositRepository();
export default depositRepository;
