/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { eq, and, desc, gt, lt } from 'drizzle-orm';
import { db } from '../../src/db/index.ts';
import { salaryHistory } from '../../src/db/schema.ts';

export class SalaryRepository {
  /**
   * Find a salary entry by its unique database ID
   */
  async findById(id: string) {
    try {
      const result = await db.select().from(salaryHistory).where(eq(salaryHistory.id, id));
      return result[0] || null;
    } catch (error) {
      console.error('Database query (findById) failed:', error);
      throw new Error('Failed to retrieve salary record.');
    }
  }

  /**
   * Find salary payout logs for a specific user with pagination and optional status filter
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
      const limit = options?.limit ?? 50;
      const offset = options?.offset ?? 0;
      const status = options?.status;

      let query = db.select().from(salaryHistory).$dynamic();
      const conditions = [eq(salaryHistory.userId, userId)];

      if (status) {
        conditions.push(eq(salaryHistory.status, status));
      }

      const result = await query
        .where(and(...conditions))
        .orderBy(desc(salaryHistory.payPeriodStart))
        .limit(limit)
        .offset(offset);

      return result;
    } catch (error) {
      console.error('Database query (findByUserId) failed:', error);
      throw new Error('Failed to query user salary history.');
    }
  }

  /**
   * Check whether a user already has a PAID Weekly Leadership Incentive record whose
   * pay period overlaps the given window. Used to prevent double-processing a user
   * if an admin triggers the batch payout job more than once within the same week.
   */
  async findOverlappingPayout(userId: string, payPeriodStart: Date, payPeriodEnd: Date) {
    try {
      const result = await db
        .select()
        .from(salaryHistory)
        .where(
          and(
            eq(salaryHistory.userId, userId),
            eq(salaryHistory.status, 'PAID'),
            // Overlap condition: existing.start < newEnd AND existing.end > newStart
            lt(salaryHistory.payPeriodStart, payPeriodEnd),
            gt(salaryHistory.payPeriodEnd, payPeriodStart)
          )
        )
        .limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Database query (findOverlappingPayout) failed:', error);
      throw new Error('Failed to check for overlapping salary payout.');
    }
  }

  /**
   * Create a new representative salary payout log entry
   */
  async createSalary(data: {
    userId: string;
    walletId: string;
    amount: string;
    starTitle?: string | null;
    qualifiedVip2Count?: number;
    payPeriodStart: Date;
    payPeriodEnd: Date;
    status?: string;
    transactionId: string;
    paidAt?: Date;
  }) {
    try {
      const result = await db
        .insert(salaryHistory)
        .values({
          userId: data.userId,
          walletId: data.walletId,
          amount: data.amount,
          starTitle: data.starTitle || null,
          qualifiedVip2Count: data.qualifiedVip2Count ?? 0,
          payPeriodStart: data.payPeriodStart,
          payPeriodEnd: data.payPeriodEnd,
          status: data.status || 'PAID',
          transactionId: data.transactionId,
          paidAt: data.paidAt || new Date(),
        })
        .returning();
      return result[0];
    } catch (error) {
      console.error('Database insertion (createSalary) failed:', error);
      throw new Error('Failed to record salary reward payout.');
    }
  }

  /**
   * Update payout status (e.g., from PENDING to PAID or REJECTED)
   */
  async updateStatus(
    id: string,
    status: string,
    updates?: Partial<{
      paidAt: Date;
      transactionId: string;
    }>
  ) {
    try {
      const result = await db
        .update(salaryHistory)
        .set({
          status,
          ...updates,
        })
        .where(eq(salaryHistory.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error('Database update (updateStatus) failed:', error);
      throw new Error('Failed to update salary payment status.');
    }
  }
}

export const salaryRepository = new SalaryRepository();
export default salaryRepository;
