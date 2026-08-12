/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { eq, and, desc } from 'drizzle-orm';
import { db } from '../../src/db/index.ts';
import { transactions } from '../../src/db/schema.ts';

export class TransactionRepository {
  /**
   * Find a transaction by its sequential database ID
   */
  async findById(id: string) {
    try {
      const result = await db.select().from(transactions).where(eq(transactions.id, id));
      return result[0] || null;
    } catch (error) {
      console.error('Database query (findById) failed:', error);
      throw new Error('Failed to retrieve transaction from ledger.');
    }
  }

  /**
   * Find all transactions linking to a specific source entity or reference code
   */
  async findByReferenceId(referenceId: string) {
    try {
      const result = await db
        .select()
        .from(transactions)
        .where(eq(transactions.referenceId, referenceId));
      return result;
    } catch (error) {
      console.error('Database query (findByReferenceId) failed:', error);
      throw new Error('Failed to retrieve transactions by reference ID.');
    }
  }

  /**
   * Get transactions for a user with pagination and optional filters (type, status)
   */
  async findByUserId(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
      type?: string;
      status?: string;
    }
  ) {
    try {
      const limit = options?.limit ?? 20;
      const offset = options?.offset ?? 0;
      const type = options?.type;
      const status = options?.status;

      let query = db.select().from(transactions).$dynamic();
      const conditions = [eq(transactions.userId, userId)];

      if (type) {
        conditions.push(eq(transactions.type, type));
      }
      if (status) {
        conditions.push(eq(transactions.status, status));
      }

      const result = await query
        .where(and(...conditions))
        .orderBy(desc(transactions.createdAt))
        .limit(limit)
        .offset(offset);

      return result;
    } catch (error) {
      console.error('Database query (findByUserId) failed:', error);
      throw new Error('Failed to query user transactions ledger.');
    }
  }

  /**
   * Write a new immutable transaction entry into the financial ledger
   */
  async createTransaction(data: {
    userId: string;
    walletId: string;
    type: string;
    referenceId: string;
    status?: string;
    description: string;
    amount: string;
    balanceBefore: string;
    balanceAfter: string;
    createdBy?: string;
  }) {
    try {
      const result = await db
        .insert(transactions)
        .values({
          userId: data.userId,
          walletId: data.walletId,
          type: data.type,
          referenceId: data.referenceId,
          status: data.status || 'COMPLETED',
          description: data.description,
          amount: data.amount,
          balanceBefore: data.balanceBefore,
          balanceAfter: data.balanceAfter,
          createdBy: data.createdBy || 'SYSTEM',
        })
        .returning();
      return result[0];
    } catch (error) {
      console.error('Database insertion (createTransaction) failed:', error);
      throw new Error('Failed to record immutable transaction ledger entry.');
    }
  }

  /**
   * Get system-wide transaction logs with pagination and optional filters (audit panel)
   */
  async findAll(options?: {
    limit?: number;
    offset?: number;
    type?: string;
    status?: string;
  }) {
    try {
      const limit = options?.limit ?? 50;
      const offset = options?.offset ?? 0;
      const type = options?.type;
      const status = options?.status;

      let query = db.select().from(transactions).$dynamic();
      const conditions = [];

      if (type) {
        conditions.push(eq(transactions.type, type));
      }
      if (status) {
        conditions.push(eq(transactions.status, status));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      const result = await query
        .orderBy(desc(transactions.createdAt))
        .limit(limit)
        .offset(offset);

      return result;
    } catch (error) {
      console.error('Database query (findAll) failed:', error);
      throw new Error('Failed to retrieve system transactions ledger.');
    }
  }
}

export const transactionRepository = new TransactionRepository();
export default transactionRepository;
