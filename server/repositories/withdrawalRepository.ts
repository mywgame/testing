/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { eq, and, desc } from 'drizzle-orm';
import { db } from '../../src/db/index.ts';
import { withdrawals } from '../../src/db/schema.ts';

export class WithdrawalRepository {
  /**
   * Find a withdrawal by its unique sequential database ID
   */
  async findById(id: string) {
    try {
      const result = await db.select().from(withdrawals).where(eq(withdrawals.id, id));
      return result[0] || null;
    } catch (error) {
      console.error('Database query (findById) failed:', error);
      throw new Error('Failed to retrieve withdrawal from database.');
    }
  }

  /**
   * Find a withdrawal by its unique human-readable reference trace code
   */
  async findByReference(reference: string) {
    try {
      const result = await db
        .select()
        .from(withdrawals)
        .where(eq(withdrawals.reference, reference));
      return result[0] || null;
    } catch (error) {
      console.error('Database query (findByReference) failed:', error);
      throw new Error('Failed to retrieve withdrawal from database.');
    }
  }

  /**
   * Get withdrawals for a specific user with pagination and optional status filter
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

      let query = db.select().from(withdrawals).$dynamic();
      const conditions = [eq(withdrawals.userId, userId)];

      if (status) {
        conditions.push(eq(withdrawals.status, status));
      }

      const result = await query
        .where(and(...conditions))
        .orderBy(desc(withdrawals.createdAt))
        .limit(limit)
        .offset(offset);

      return result;
    } catch (error) {
      console.error('Database query (findByUserId) failed:', error);
      throw new Error('Failed to query user withdrawals.');
    }
  }

  /**
   * Create a new withdrawal record
   */
  async createWithdrawal(data: {
    userId: string;
    walletId: string;
    amount: string;
    fee: string;
    netAmount: string;
    walletAddress: string;
    network: string;
    reference: string;
    status?: string;
    adminApprovalStatus?: string;
    adminNotes?: string | null;
  }) {
    try {
      const result = await db
        .insert(withdrawals)
        .values({
          userId: data.userId,
          walletId: data.walletId,
          amount: data.amount,
          fee: data.fee,
          netAmount: data.netAmount,
          walletAddress: data.walletAddress,
          network: data.network,
          reference: data.reference,
          status: data.status || 'PENDING',
          adminApprovalStatus: data.adminApprovalStatus || 'PENDING',
          adminNotes: data.adminNotes || null,
        })
        .returning();
      return result[0];
    } catch (error) {
      console.error('Database insertion (createWithdrawal) failed:', error);
      throw new Error('Failed to record withdrawal in database.');
    }
  }

  /**
   * Update withdrawal status, admin approvals, or transaction hashes
   */
  async updateStatus(
    id: string,
    status: string,
    updates?: Partial<{
      txHash: string;
      adminApprovalStatus: string;
      adminNotes: string;
    }>
  ) {
    try {
      const result = await db
        .update(withdrawals)
        .set({
          status,
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(withdrawals.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error('Database update (updateStatus) failed:', error);
      throw new Error('Failed to update withdrawal status.');
    }
  }

  /**
   * Find all withdrawals (with filters and pagination) for administrative dashboard
   */
  async findAll(options?: {
    status?: string;
    adminApprovalStatus?: string;
    limit?: number;
    offset?: number;
  }) {
    try {
      const limit = options?.limit ?? 50;
      const offset = options?.offset ?? 0;
      const status = options?.status;
      const adminApprovalStatus = options?.adminApprovalStatus;

      let query = db.select().from(withdrawals).$dynamic();
      const conditions = [];

      if (status) {
        conditions.push(eq(withdrawals.status, status));
      }
      if (adminApprovalStatus) {
        conditions.push(eq(withdrawals.adminApprovalStatus, adminApprovalStatus));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      const result = await query
        .orderBy(desc(withdrawals.createdAt))
        .limit(limit)
        .offset(offset);

      return result;
    } catch (error) {
      console.error('Database query (findAll) failed:', error);
      throw new Error('Failed to retrieve withdrawals ledger.');
    }
  }
}

export const withdrawalRepository = new WithdrawalRepository();
export default withdrawalRepository;
