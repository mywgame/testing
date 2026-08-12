/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { or, eq } from 'drizzle-orm';
import { db } from '../../src/db/index.ts';
import { users } from '../../src/db/schema.ts';
import { notificationRepository } from '../repositories/notificationRepository.ts';

export class NotificationService {
  /**
   * Dispatch a notification to a specific user
   */
  async createNotification(userId: string, message: string, priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT') {
    return notificationRepository.createNotification({ userId, message, priority });
  }

  /**
   * Helper to format and create a structured notification with JSON payload
   */
  async createStructuredNotification(
    userId: string,
    data: {
      title: string;
      description: string;
      icon: string;
      type: string;
      priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    }
  ) {
    const message = JSON.stringify({
      title: data.title,
      description: data.description,
      icon: data.icon,
      type: data.type,
    });
    return notificationRepository.createNotification({
      userId,
      message,
      priority: data.priority || 'LOW',
    });
  }

  /**
   * Helper to send a structured notification to all administrators
   */
  async notifyAdmins(data: {
    title: string;
    description: string;
    icon: string;
    type: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  }) {
    try {
      const admins = await db
        .select()
        .from(users)
        .where(or(eq(users.role, 'ADMIN'), eq(users.role, 'SUPERADMIN')));

      const message = JSON.stringify({
        title: data.title,
        description: data.description,
        icon: data.icon,
        type: data.type,
      });

      for (const admin of admins) {
        await notificationRepository.createNotification({
          userId: admin.id,
          message,
          priority: data.priority || 'LOW',
        });
      }
    } catch (err) {
      console.error('Failed to notify admins:', err);
    }
  }

  /**
   * Retrieve paginated notifications for a user
   */
  async getUserNotifications(userId: string, options?: { limit?: number; offset?: number; read?: boolean }) {
    return notificationRepository.findByUserId(userId, options);
  }

  /**
   * Mark a specific notification as read after authorization check
   */
  async markNotificationAsRead(id: string, userId: string) {
    const notification = await notificationRepository.findById(id);
    if (!notification) {
      throw new Error(`Notification not found with ID: ${id}`);
    }
    if (notification.userId !== userId) {
      throw new Error('Unauthorized notification action.');
    }
    return notificationRepository.markAsRead(id);
  }

  /**
   * Mark all notifications of a user as read
   */
  async markAllNotificationsAsRead(userId: string) {
    return notificationRepository.markAllAsRead(userId);
  }

  /**
   * Dismiss/Delete a notification after authorization check
   */
  async deleteNotification(id: string, userId: string) {
    const notification = await notificationRepository.findById(id);
    if (!notification) {
      throw new Error(`Notification not found with ID: ${id}`);
    }
    if (notification.userId !== userId) {
      throw new Error('Unauthorized notification action.');
    }
    return notificationRepository.deleteNotification(id);
  }
}

export const notificationService = new NotificationService();
export default notificationService;
