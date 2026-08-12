/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { eq, and, desc } from 'drizzle-orm';
import { db } from '../../src/db/index.ts';
import { activityLogs } from '../../src/db/schema.ts';

export class ActivityRepository {
  /**
   * Find an activity log by its unique database ID
   */
  async findById(id: string) {
    try {
      const result = await db
        .select()
        .from(activityLogs)
        .where(eq(activityLogs.id, id));
      return result[0] || null;
    } catch (error) {
      console.error('Database query (findById) failed:', error);
      throw new Error('Failed to retrieve activity log.');
    }
  }

  /**
   * Find activity logs for a specific user with pagination and optional filters
   */
  async findByUserId(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
      event?: string;
      status?: string;
    }
  ) {
    try {
      const limit = options?.limit ?? 50;
      const offset = options?.offset ?? 0;
      const event = options?.event;
      const status = options?.status;

      let query = db.select().from(activityLogs).$dynamic();
      const conditions = [eq(activityLogs.userId, userId)];

      if (event) {
        conditions.push(eq(activityLogs.event, event));
      }
      if (status) {
        conditions.push(eq(activityLogs.status, status));
      }

      const result = await query
        .where(and(...conditions))
        .orderBy(desc(activityLogs.createdAt))
        .limit(limit)
        .offset(offset);

      return result;
    } catch (error) {
      console.error('Database query (findByUserId) failed:', error);
      throw new Error('Failed to query user activity logs.');
    }
  }

  /**
   * Write a new user session or profile-related security activity log (append-only)
   */
  async createActivityLog(data: {
    userId: string;
    event: 'LOGIN' | 'LOGOUT' | 'PASSWORD_CHANGE' | 'PROFILE_UPDATE' | 'SECURITY_EVENT' | 'MFA_ENABLE' | string;
    status?: 'SUCCESS' | 'FAILED' | string;
    ipAddress?: string | null;
    device?: string | null;
    details?: string | null;
  }) {
    try {
      const result = await db
        .insert(activityLogs)
        .values({
          userId: data.userId,
          event: data.event,
          status: data.status || 'SUCCESS',
          ipAddress: data.ipAddress || null,
          device: data.device || null,
          details: data.details || null,
        })
        .returning();
      return result[0];
    } catch (error) {
      console.error('Database insertion (createActivityLog) failed:', error);
      throw new Error('Failed to record user activity log.');
    }
  }

  /**
   * Get system-wide user activity logs (useful for admin monitoring)
   */
  async findAll(options?: {
    event?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    try {
      const limit = options?.limit ?? 50;
      const offset = options?.offset ?? 0;
      const event = options?.event;
      const status = options?.status;

      let query = db.select().from(activityLogs).$dynamic();
      const conditions = [];

      if (event) {
        conditions.push(eq(activityLogs.event, event));
      }
      if (status) {
        conditions.push(eq(activityLogs.status, status));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      const result = await query
        .orderBy(desc(activityLogs.createdAt))
        .limit(limit)
        .offset(offset);

      return result;
    } catch (error) {
      console.error('Database query (findAll) failed:', error);
      throw new Error('Failed to retrieve system activity logs.');
    }
  }
}

export const activityRepository = new ActivityRepository();
export default activityRepository;
