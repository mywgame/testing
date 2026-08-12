/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { eq, and, ne, desc } from 'drizzle-orm';
import { db } from '../../src/db/index.ts';
import { sessions } from '../../src/db/schema.ts';

export interface CreateSessionInput {
  userId: string;
  tokenHash: string;
  device?: string | null;
  browser?: string | null;
  ipAddress?: string | null;
  expiresAt: Date;
}

export class SessionRepository {
  /**
   * Create and persist a new user session
   */
  async createSession(data: CreateSessionInput) {
    try {
      const result = await db
        .insert(sessions)
        .values({
          userId: data.userId,
          tokenHash: data.tokenHash,
          device: data.device || null,
          browser: data.browser || null,
          ipAddress: data.ipAddress || null,
          expiresAt: data.expiresAt,
          createdAt: new Date(),
          lastActivity: new Date(),
          revoked: false,
        })
        .returning();
      return result[0];
    } catch (error) {
      console.error('Failed to create session in database:', error);
      throw new Error('Failed to persist secure session in database.');
    }
  }

  /**
   * Find a session by its secure token hash
   */
  async findByTokenHash(tokenHash: string) {
    try {
      const result = await db
        .select()
        .from(sessions)
        .where(eq(sessions.tokenHash, tokenHash));
      return result[0] || null;
    } catch (error) {
      console.error('Failed to query session by token hash:', error);
      throw new Error('Failed to query session from database.');
    }
  }

  /**
   * Update the last activity timestamp for session lifetime tracking
   */
  async updateLastActivity(id: string) {
    try {
      await db
        .update(sessions)
        .set({ lastActivity: new Date() })
        .where(eq(sessions.id, id));
    } catch (error) {
      console.error('Failed to update session last activity:', error);
    }
  }

  /**
   * Find all active (non-revoked, non-expired) sessions for a user, newest first.
   * Added so Services never need to query Drizzle/sessions directly (Blueprint Rule #2).
   */
  async findActiveSessionsByUserId(userId: string) {
    try {
      const result = await db
        .select()
        .from(sessions)
        .where(and(eq(sessions.userId, userId), eq(sessions.revoked, false), ne(sessions.expiresAt, new Date())))
        .orderBy(desc(sessions.createdAt));
      return result;
    } catch (error) {
      console.error('Database query (findActiveSessionsByUserId) failed:', error);
      throw new Error('Failed to retrieve active sessions from database.');
    }
  }

  /**
   * Find the most recently active session for a user (used for security summaries).
   */
  async findLatestActiveSession(userId: string) {
    try {
      const result = await db
        .select()
        .from(sessions)
        .where(and(eq(sessions.userId, userId), eq(sessions.revoked, false)))
        .orderBy(desc(sessions.lastActivity))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Database query (findLatestActiveSession) failed:', error);
      throw new Error('Failed to retrieve latest active session from database.');
    }
  }

  /**
   * Revoke every session for a user EXCEPT the one matching the given token hash
   * (used for "log out all other devices").
   */
  async revokeAllExcept(userId: string, keepTokenHash: string) {
    try {
      await db
        .update(sessions)
        .set({ revoked: true })
        .where(and(eq(sessions.userId, userId), ne(sessions.tokenHash, keepTokenHash)));
    } catch (error) {
      console.error('Failed to revoke other sessions:', error);
      throw new Error('Failed to terminate other active sessions.');
    }
  }

  /**
   * Revoke a specific session (soft delete / logout)
   */
  async revokeSession(tokenHash: string) {
    try {
      await db
        .update(sessions)
        .set({ revoked: true })
        .where(eq(sessions.tokenHash, tokenHash));
    } catch (error) {
      console.error('Failed to revoke session:', error);
      throw new Error('Failed to revoke session in database.');
    }
  }

  /**
   * Revoke all sessions for a specific user (global sign-out)
   */
  async revokeAllUserSessions(userId: string) {
    try {
      await db
        .update(sessions)
        .set({ revoked: true })
        .where(eq(sessions.userId, userId));
    } catch (error) {
      console.error('Failed to revoke all user sessions:', error);
      throw new Error('Failed to terminate all active sessions.');
    }
  }
}

export const sessionRepository = new SessionRepository();
export default sessionRepository;
