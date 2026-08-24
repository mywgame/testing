/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { eq, and, desc, lte, gte, lt } from 'drizzle-orm';
import { db } from '../../src/db/index.ts';
import { claims } from '../../src/db/schema.ts';

export class ClaimRepository {
  /**
   * Find a claim by its unique database ID
   */
  async findById(id: string) {
    try {
      const result = await db.select().from(claims).where(eq(claims.id, id));
      return result[0] || null;
    } catch (error) {
      console.error('Database query (findById) failed:', error);
      throw new Error('Failed to retrieve claim from database.');
    }
  }

  /**
   * Find all claims for a user with pagination and optional status filter
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

      let query = db.select().from(claims).$dynamic();
      const conditions = [eq(claims.userId, userId)];

      if (status) {
        conditions.push(eq(claims.claimStatus, status));
      }

      const result = await query
        .where(and(...conditions))
        .orderBy(desc(claims.claimDate))
        .limit(limit)
        .offset(offset);

      return result;
    } catch (error) {
      console.error('Database query (findByUserId) failed:', error);
      throw new Error('Failed to retrieve user claims.');
    }
  }

  /**
   * Create a new claimable reward record. Uses onConflictDoNothing to guarantee idempotency.
   */
  async createClaim(data: {
    userId: string;
    claimDate: Date;
    claimStatus?: string;
    rewardAmount: string;
    totalAssets?: string;
    vipTier?: string;
    vipRate?: string;
    claimWindowOpenTime: Date;
    claimWindowCloseTime: Date;
  }) {
    try {
      const result = await db
        .insert(claims)
        .values({
          userId: data.userId,
          claimDate: data.claimDate,
          claimStatus: data.claimStatus || 'PENDING',
          rewardAmount: data.rewardAmount,
          totalAssets: data.totalAssets || '0.00000000',
          vipTier: data.vipTier || 'VIP1',
          vipRate: data.vipRate || '0.00000000',
          claimWindowOpenTime: data.claimWindowOpenTime,
          claimWindowCloseTime: data.claimWindowCloseTime,
        })
        .onConflictDoNothing()
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error('Database insertion (createClaim) failed:', error);
      throw new Error('Failed to initialize new claimable yield entry.');
    }
  }

  /**
   * Mark a claim as CLAIMED, EXPIRED, or FORFEITED, linking any associated transaction.
   * If expectedCurrentStatus is provided, only updates if current status matches (concurrency guard).
   */
  async updateClaimStatus(
    id: string,
    status: string,
    updates?: Partial<{
      claimedAt: Date;
      transactionId: string;
      expired: boolean;
    }>,
    expectedCurrentStatus?: string
  ) {
    try {
      const conditions = [eq(claims.id, id)];
      if (expectedCurrentStatus) {
        conditions.push(eq(claims.claimStatus, expectedCurrentStatus));
      }

      const result = await db
        .update(claims)
        .set({
          claimStatus: status,
          ...updates,
        })
        .where(and(...conditions))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error('Database update (updateClaimStatus) failed:', error);
      throw new Error('Failed to update claim state.');
    }
  }

  /**
   * Find all PENDING claims whose claim window has already closed as of the given time
   * (i.e. unclaimed DPY that must expire at the next 00:00 UTC reset).
   */
  async findExpiredPendingClaims(asOf: Date = new Date()) {
    try {
      const result = await db
        .select()
        .from(claims)
        .where(and(eq(claims.claimStatus, 'PENDING'), lt(claims.claimWindowCloseTime, asOf)));
      return result;
    } catch (error) {
      console.error('Database query (findExpiredPendingClaims) failed:', error);
      throw new Error('Failed to look up expired pending claims.');
    }
  }

  /**
   * Find any daily claim record in today's window regardless of its status (PENDING, CLAIMED, etc.)
   */
  async findAnyClaimInWindow(userId: string, date: Date) {
    try {
      const openTime = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
      const closeTime = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999));

      const result = await db
        .select()
        .from(claims)
        .where(
          and(
            eq(claims.userId, userId),
            gte(claims.claimWindowOpenTime, openTime),
            lte(claims.claimWindowOpenTime, closeTime)
          )
        );
      return result;
    } catch (error) {
      console.error('Database query (findAnyClaimInWindow) failed:', error);
      throw new Error('Failed to look up any claims in the current window.');
    }
  }

  /**
   * Find any currently active pending claim(s) where the current time falls inside the window
   */
  async findActiveClaimsInWindow(userId: string, date: Date) {
    try {
      const openTime = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
      const closeTime = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999));

      const result = await db
        .select()
        .from(claims)
        .where(
          and(
            eq(claims.userId, userId),
            eq(claims.claimStatus, 'PENDING'),
            gte(claims.claimWindowOpenTime, openTime),
            lte(claims.claimWindowOpenTime, closeTime)
          )
        );
      return result;
    } catch (error) {
      console.error('Database query (findActiveClaimsInWindow) failed:', error);
      throw new Error('Failed to look up active claims in the current window.');
    }
  }

  /**
   * Find all claims for a user in a given date range
   */
  async findClaimsInDateRange(userId: string, startDate: Date, endDate: Date) {
    try {
      const result = await db
        .select()
        .from(claims)
        .where(
          and(
            eq(claims.userId, userId),
            gte(claims.claimWindowOpenTime, startDate),
            lte(claims.claimWindowCloseTime, endDate)
          )
        )
        .orderBy(desc(claims.claimWindowOpenTime));
      return result;
    } catch (error) {
      console.error('Database query (findClaimsInDateRange) failed:', error);
      return [];
    }
  }
}

export const claimRepository = new ClaimRepository();
export default claimRepository;
