/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { eq, desc } from 'drizzle-orm';
import { db } from '../../src/db/index.ts';
import { vipStatus, vipHistory } from '../../src/db/schema.ts';

export class VipRepository {
  /**
   * Find a user's active VIP status
   */
  async findByUserId(userId: string) {
    try {
      const result = await db
        .select()
        .from(vipStatus)
        .where(eq(vipStatus.userId, userId));
      return result[0] || null;
    } catch (error) {
      console.error('Database query (findByUserId) failed:', error);
      throw new Error('Failed to retrieve VIP status from database.');
    }
  }

  /**
   * Create active VIP status for a user
   */
  async createVipStatus(data: {
    userId: string;
    tier?: string;
    points?: string;
    levelAValidCount?: number;
    levelBcdValidCount?: number;
    teamTotalCount?: number;
  }) {
    try {
      const result = await db
        .insert(vipStatus)
        .values({
          userId: data.userId,
          tier: data.tier || 'VIP1',
          points: data.points || '0.00000000',
          levelAValidCount: data.levelAValidCount ?? 0,
          levelBcdValidCount: data.levelBcdValidCount ?? 0,
          teamTotalCount: data.teamTotalCount ?? 0,
        })
        .returning();
      return result[0];
    } catch (error) {
      console.error('Database insertion (createVipStatus) failed:', error);
      throw new Error('Failed to initialize user VIP status.');
    }
  }

  /**
   * Update active VIP status details
   */
  async updateVipStatus(
    id: string,
    updates: Partial<{
      tier: string;
      points: string;
      levelAValidCount: number;
      levelBcdValidCount: number;
      teamTotalCount: number;
    }>
  ) {
    try {
      const result = await db
        .update(vipStatus)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(vipStatus.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error('Database update (updateVipStatus) failed:', error);
      throw new Error('Failed to update user VIP status.');
    }
  }

  /**
   * Add a record into the append-only VIP changes history ledger
   */
  async createVipHistoryEntry(data: {
    userId: string;
    previousTier: string;
    newTier: string;
    reason: string;
    updatedBy?: string;
  }) {
    try {
      const result = await db
        .insert(vipHistory)
        .values({
          userId: data.userId,
          previousTier: data.previousTier,
          newTier: data.newTier,
          reason: data.reason,
          updatedBy: data.updatedBy || 'SYSTEM',
        })
        .returning();
      return result[0];
    } catch (error) {
      console.error('Database insertion (createVipHistoryEntry) failed:', error);
      throw new Error('Failed to record VIP upgrade/downgrade history.');
    }
  }

  /**
   * Get user's historic VIP changes
   */
  async getVipHistoryByUserId(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
    }
  ) {
    try {
      const limit = options?.limit ?? 50;
      const offset = options?.offset ?? 0;

      const result = await db
        .select()
        .from(vipHistory)
        .where(eq(vipHistory.userId, userId))
        .orderBy(desc(vipHistory.createdAt))
        .limit(limit)
        .offset(offset);

      return result;
    } catch (error) {
      console.error('Database query (getVipHistoryByUserId) failed:', error);
      throw new Error('Failed to retrieve user VIP history.');
    }
  }
}

export const vipRepository = new VipRepository();
export default vipRepository;
