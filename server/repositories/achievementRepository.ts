/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { eq, and, desc } from 'drizzle-orm';
import { db } from '../../src/db/index.ts';
import { achievements } from '../../src/db/schema.ts';

export class AchievementRepository {
  /**
   * Find an achievement record by its unique database ID
   */
  async findById(id: string) {
    try {
      const result = await db
        .select()
        .from(achievements)
        .where(eq(achievements.id, id));
      return result[0] || null;
    } catch (error) {
      console.error('Database query (findById) failed:', error);
      throw new Error('Failed to retrieve achievement record.');
    }
  }

  /**
   * Get all unlocked achievements for a specific user with pagination and optional status filter
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

      let query = db.select().from(achievements).$dynamic();
      const conditions = [eq(achievements.userId, userId)];

      if (status) {
        conditions.push(eq(achievements.status, status));
      }

      const result = await query
        .where(and(...conditions))
        .orderBy(desc(achievements.unlockedDate))
        .limit(limit)
        .offset(offset);

      return result;
    } catch (error) {
      console.error('Database query (findByUserId) failed:', error);
      throw new Error('Failed to retrieve user milestones.');
    }
  }

  /**
   * Find a user's achievement by its direct name/code identifier
   */
  async findByNameAndUser(userId: string, achievementName: string) {
    try {
      const result = await db
        .select()
        .from(achievements)
        .where(
          and(
            eq(achievements.userId, userId),
            eq(achievements.achievementName, achievementName)
          )
        );
      return result[0] || null;
    } catch (error) {
      console.error('Database query (findByNameAndUser) failed:', error);
      throw new Error('Failed to check milestone status.');
    }
  }

  /**
   * Record a new unlocked achievement/milestone for a user
   */
  async createAchievement(data: {
    userId: string;
    achievementName: string;
    star?: number;
    status?: string;
    unlockedDate?: Date;
  }) {
    try {
      const result = await db
        .insert(achievements)
        .values({
          userId: data.userId,
          achievementName: data.achievementName,
          star: data.star ?? 1,
          status: data.status || 'UNLOCKED',
          unlockedDate: data.unlockedDate || new Date(),
        })
        .returning();
      return result[0];
    } catch (error) {
      console.error('Database insertion (createAchievement) failed:', error);
      throw new Error('Failed to store unlocked milestone.');
    }
  }

  /**
   * Update achievement status (e.g. from UNLOCKED to CLAIMED when reward is redeemed)
   */
  async updateStatus(id: string, status: string) {
    try {
      const result = await db
        .update(achievements)
        .set({ status })
        .where(eq(achievements.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error('Database update (updateStatus) failed:', error);
      throw new Error('Failed to update achievement status.');
    }
  }
}

export const achievementRepository = new AchievementRepository();
export default achievementRepository;
