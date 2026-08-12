/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { eq, and, desc } from 'drizzle-orm';
import { db } from '../../src/db/index.ts';
import { referralRelationships, referralIncomeHistory, users } from '../../src/db/schema.ts';

export class ReferralRepository {
  /**
   * Find the upline/parent relationship for a given child user ID
   */
  async findRelationshipByChildId(childId: string) {
    try {
      const result = await db
        .select()
        .from(referralRelationships)
        .where(eq(referralRelationships.childId, childId));
      
      if (result[0]) {
        return result[0];
      }

      // Auto-heal fallback: if user record has parentReferralId set, create missing relationship entry
      const userList = await db.select().from(users).where(eq(users.id, childId));
      const childUser = userList[0];
      if (childUser && childUser.parentReferralId) {
        const newRel = await this.createRelationship({
          parentId: childUser.parentReferralId,
          childId: childUser.id,
          referralLevel: 1,
        });
        return newRel;
      }

      return null;
    } catch (error) {
      console.error('Database query (findRelationshipByChildId) failed:', error);
      throw new Error('Failed to retrieve referral parent relationship.');
    }
  }

  /**
   * Find downline relationships under a parent user
   */
  async findRelationshipsByParentId(
    parentId: string,
    options?: {
      referralLevel?: number;
      limit?: number;
      offset?: number;
    }
  ) {
    try {
      const limit = options?.limit ?? 100;
      const offset = options?.offset ?? 0;
      const referralLevel = options?.referralLevel;

      let query = db.select().from(referralRelationships).$dynamic();
      const conditions = [eq(referralRelationships.parentId, parentId)];

      if (referralLevel !== undefined) {
        conditions.push(eq(referralRelationships.referralLevel, referralLevel));
      }

      const result = await query
        .where(and(...conditions))
        .orderBy(desc(referralRelationships.createdAt))
        .limit(limit)
        .offset(offset);

      return result;
    } catch (error) {
      console.error('Database query (findRelationshipsByParentId) failed:', error);
      throw new Error('Failed to query referral children.');
    }
  }

  /**
   * Record a new referral hierarchical relationship link
   */
  async createRelationship(data: { parentId: string; childId: string; referralLevel: number }) {
    try {
      const result = await db
        .insert(referralRelationships)
        .values({
          parentId: data.parentId,
          childId: data.childId,
          referralLevel: data.referralLevel,
        })
        .returning();
      return result[0];
    } catch (error) {
      console.error('Database insertion (createRelationship) failed:', error);
      throw new Error('Failed to save referral relationship.');
    }
  }

  /**
   * Record an earned referral reward commission
   */
  async createReferralIncome(data: {
    userId: string;
    sourceUserId: string;
    depositId?: string | null;
    amount: string;
    level: number;
    transactionId: string;
  }) {
    try {
      const result = await db
        .insert(referralIncomeHistory)
        .values({
          userId: data.userId,
          sourceUserId: data.sourceUserId,
          depositId: data.depositId || null,
          amount: data.amount,
          level: data.level,
          transactionId: data.transactionId,
        })
        .returning();
      return result[0];
    } catch (error) {
      console.error('Database insertion (createReferralIncome) failed:', error);
      throw new Error('Failed to record referral reward.');
    }
  }

  /**
   * Retrieve a user's referral income history with pagination
   */
  async getReferralIncomeByUserId(
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
        .from(referralIncomeHistory)
        .where(eq(referralIncomeHistory.userId, userId))
        .orderBy(desc(referralIncomeHistory.createdAt))
        .limit(limit)
        .offset(offset);

      return result;
    } catch (error) {
      console.error('Database query (getReferralIncomeByUserId) failed:', error);
      throw new Error('Failed to load referral earnings history.');
    }
  }
}

export const referralRepository = new ReferralRepository();
export default referralRepository;
