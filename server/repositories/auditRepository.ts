/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { eq, and, desc } from 'drizzle-orm';
import { db } from '../../src/db/index.ts';
import { auditLogs } from '../../src/db/schema.ts';

export class AuditRepository {
  /**
   * Find an audit log by its unique database ID
   */
  async findById(id: string) {
    try {
      const result = await db
        .select()
        .from(auditLogs)
        .where(eq(auditLogs.id, id));
      return result[0] || null;
    } catch (error) {
      console.error('Database query (findById) failed:', error);
      throw new Error('Failed to retrieve audit log from database.');
    }
  }

  /**
   * Get audit logs for actions triggered by a specific actor (admin or system agent)
   */
  async findByActor(
    actorUid: string,
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
        .from(auditLogs)
        .where(eq(auditLogs.actorUid, actorUid))
        .orderBy(desc(auditLogs.createdAt))
        .limit(limit)
        .offset(offset);

      return result;
    } catch (error) {
      console.error('Database query (findByActor) failed:', error);
      throw new Error('Failed to query actor audit logs.');
    }
  }

  /**
   * Get audit logs that affected a specific user ID
   */
  async findByUserId(
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
        .from(auditLogs)
        .where(eq(auditLogs.userId, userId))
        .orderBy(desc(auditLogs.createdAt))
        .limit(limit)
        .offset(offset);

      return result;
    } catch (error) {
      console.error('Database query (findByUserId) failed:', error);
      throw new Error('Failed to query user-focused audit logs.');
    }
  }

  /**
   * Get audit logs targeting a specific resource path (e.g. "users/u-123" or "wallets/w-abc")
   */
  async findByResource(
    resource: string,
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
        .from(auditLogs)
        .where(eq(auditLogs.resource, resource))
        .orderBy(desc(auditLogs.createdAt))
        .limit(limit)
        .offset(offset);

      return result;
    } catch (error) {
      console.error('Database query (findByResource) failed:', error);
      throw new Error('Failed to query resource audit logs.');
    }
  }

  /**
   * Record a new audit log entry (immutable security journal)
   */
  async createAuditLog(
    data: {
      actorUid: string;
      userId?: string | null;
      action: string;
      resource: string;
      ipAddress?: string | null;
      device?: string | null;
      oldValue?: string | null;
      newValue?: string | null;
    },
    executor: any = db
  ) {
    try {
      const result = await executor
        .insert(auditLogs)
        .values({
          actorUid: data.actorUid,
          userId: data.userId || null,
          action: data.action,
          resource: data.resource,
          ipAddress: data.ipAddress || null,
          device: data.device || null,
          oldValue: data.oldValue || null,
          newValue: data.newValue || null,
        })
        .returning();
      return result[0];
    } catch (error) {
      console.error('Database insertion (createAuditLog) failed:', error);
      throw new Error('Failed to write immutable audit ledger entry.');
    }
  }

  /**
   * Get all audit logs with optional filters (comprehensive admin panel list)
   */
  async findAll(options?: {
    action?: string;
    limit?: number;
    offset?: number;
  }) {
    try {
      const limit = options?.limit ?? 50;
      const offset = options?.offset ?? 0;
      const action = options?.action;

      let query = db.select().from(auditLogs).$dynamic();

      if (action) {
        query = query.where(eq(auditLogs.action, action));
      }

      const result = await query
        .orderBy(desc(auditLogs.createdAt))
        .limit(limit)
        .offset(offset);

      return result;
    } catch (error) {
      console.error('Database query (findAll) failed:', error);
      throw new Error('Failed to load system audit logs.');
    }
  }
}

export const auditRepository = new AuditRepository();
export default auditRepository;
