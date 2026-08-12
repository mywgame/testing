/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { eq, and, desc } from 'drizzle-orm';
import { db } from '../../src/db/index.ts';
import { notifications } from '../../src/db/schema.ts';

export class NotificationRepository {
  /**
   * Find a notification by its unique database ID
   */
  async findById(id: string) {
    try {
      const result = await db
        .select()
        .from(notifications)
        .where(eq(notifications.id, id));
      return result[0] || null;
    } catch (error) {
      console.error('Database query (findById) failed:', error);
      throw new Error('Failed to retrieve notification from database.');
    }
  }

  /**
   * Find all notifications for a user with pagination and optional read status filter
   */
  async findByUserId(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
      read?: boolean;
    }
  ) {
    try {
      const limit = options?.limit ?? 50;
      const offset = options?.offset ?? 0;
      const read = options?.read;

      let query = db.select().from(notifications).$dynamic();
      const conditions = [eq(notifications.userId, userId)];

      if (read !== undefined) {
        conditions.push(eq(notifications.read, read));
      }

      const result = await query
        .where(and(...conditions))
        .orderBy(desc(notifications.createdAt))
        .limit(limit)
        .offset(offset);

      return result;
    } catch (error) {
      console.error('Database query (findByUserId) failed:', error);
      throw new Error('Failed to retrieve user notifications.');
    }
  }

  /**
   * Create a new notification record for a user
   */
  async createNotification(data: {
    userId: string;
    message: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  }) {
    try {
      const result = await db
        .insert(notifications)
        .values({
          userId: data.userId,
          message: data.message,
          priority: data.priority || 'LOW',
        })
        .returning();
      return result[0];
    } catch (error) {
      console.error('Database insertion (createNotification) failed:', error);
      throw new Error('Failed to store notification record.');
    }
  }

  /**
   * Mark a specific notification as read
   */
  async markAsRead(id: string) {
    try {
      const result = await db
        .update(notifications)
        .set({ read: true })
        .where(eq(notifications.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error('Database update (markAsRead) failed:', error);
      throw new Error('Failed to mark notification as read.');
    }
  }

  /**
   * Mark all notifications for a user as read
   */
  async markAllAsRead(userId: string) {
    try {
      const result = await db
        .update(notifications)
        .set({ read: true })
        .where(eq(notifications.userId, userId))
        .returning();
      return result;
    } catch (error) {
      console.error('Database update (markAllAsRead) failed:', error);
      throw new Error('Failed to mark all user notifications as read.');
    }
  }

  /**
   * Delete a notification (standard cleanup/dismiss action)
   */
  async deleteNotification(id: string) {
    try {
      const result = await db
        .delete(notifications)
        .where(eq(notifications.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error('Database deletion (deleteNotification) failed:', error);
      throw new Error('Failed to delete notification.');
    }
  }
}

export const notificationRepository = new NotificationRepository();
export default notificationRepository;
