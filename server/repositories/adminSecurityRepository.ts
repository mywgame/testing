/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { db, pool } from '../../src/db/index.ts';
import { adminSecurity } from '../../src/db/admin_security.ts';
import { eq } from 'drizzle-orm';

export class AdminSecurityRepository {
  private initialized = false;

  /**
   * Ensures admin_security table exists dynamically
   */
  async ensureTable() {
    if (this.initialized) return;
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS admin_security (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
          totp_enabled BOOLEAN NOT NULL DEFAULT false,
          totp_secret TEXT,
          recovery_codes TEXT,
          failed_attempts TEXT NOT NULL DEFAULT '0',
          locked_until TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS admin_security_user_idx ON admin_security(user_id);
      `);
      this.initialized = true;
    } catch (error) {
      console.error('Failed to ensure admin_security table existence:', error);
    }
  }

  async findByUserId(userId: string) {
    await this.ensureTable();
    const records = await db.select().from(adminSecurity).where(eq(adminSecurity.userId, userId)).limit(1);
    return records[0] || null;
  }

  async upsertAdminSecurity(userId: string, data: Partial<{
    totpEnabled: boolean;
    totpSecret: string | null;
    recoveryCodes: string | null;
    failedAttempts: string;
    lockedUntil: Date | null;
  }>) {
    await this.ensureTable();
    const existing = await this.findByUserId(userId);
    if (existing) {
      const [updated] = await db.update(adminSecurity)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(adminSecurity.userId, userId))
        .returning();
      return updated;
    } else {
      const [inserted] = await db.insert(adminSecurity)
        .values({
          userId,
          totpEnabled: data.totpEnabled ?? false,
          totpSecret: data.totpSecret ?? null,
          recoveryCodes: data.recoveryCodes ?? null,
          failedAttempts: data.failedAttempts ?? '0',
          lockedUntil: data.lockedUntil ?? null,
        })
        .returning();
      return inserted;
    }
  }

  async incrementFailedAttempts(userId: string) {
    const sec = await this.findByUserId(userId);
    const current = sec ? parseInt(sec.failedAttempts || '0', 10) : 0;
    const nextAttempts = current + 1;
    let lockedUntil: Date | null = sec?.lockedUntil || null;

    if (nextAttempts >= 5) {
      lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 minutes
    }

    await this.upsertAdminSecurity(userId, {
      failedAttempts: nextAttempts.toString(),
      lockedUntil,
    });

    return { nextAttempts, lockedUntil };
  }

  async resetFailedAttempts(userId: string) {
    await this.upsertAdminSecurity(userId, {
      failedAttempts: '0',
      lockedUntil: null,
    });
  }
}

export const adminSecurityRepository = new AdminSecurityRepository();
