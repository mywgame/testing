/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { db } from '../../src/db/index.ts';
import { activityLogs, auditLogs } from '../../src/db/schema.ts';

export class SecurityLogger {
  /**
   * Log an authentication or user activity to the database activity_logs
   */
  static async logActivity(data: {
    userId: string;
    event: 'LOGIN' | 'LOGOUT' | 'PASSWORD_CHANGE' | 'PROFILE_UPDATE' | 'SECURITY_EVENT' | 'MFA_ENABLE';
    status: 'SUCCESS' | 'FAILED';
    ipAddress?: string | null;
    device?: string | null;
    details?: string | null;
  }) {
    try {
      await db.insert(activityLogs).values({
        userId: data.userId,
        event: data.event,
        status: data.status,
        ipAddress: data.ipAddress || null,
        device: data.device || null,
        details: data.details || null,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error('Failed to write database activity log:', error);
    }
  }

  /**
   * Log a security or system modification to the database audit_logs (e.g., when userId is unavailable or for system-level actions)
   */
  static async logAudit(data: {
    actorUid: string;
    action: string;
    resource: string;
    ipAddress?: string | null;
    device?: string | null;
    oldValue?: string | null;
    newValue?: string | null;
  }) {
    try {
      await db.insert(auditLogs).values({
        actorUid: data.actorUid,
        action: data.action,
        resource: data.resource,
        ipAddress: data.ipAddress || null,
        device: data.device || null,
        oldValue: data.oldValue || null,
        newValue: data.newValue || null,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error('Failed to write database audit log:', error);
    }
  }
}
