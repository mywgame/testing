/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { eq } from 'drizzle-orm';
import { db } from '../../src/db/index.ts';
import { users } from '../../src/db/schema.ts';
import { UserRole } from '../../shared/types/index.ts';

export class AuthRepository {
  /**
   * Find user by email
   */
  async findByEmail(email: string) {
    try {
      const result = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim()));
      return result[0] || null;
    } catch (error) {
      console.error('Database query (findByEmail) failed:', error);
      throw new Error('Failed to query repository state.');
    }
  }

  /**
   * Find user by username
   */
  async findByUsername(username: string) {
    try {
      const result = await db.select().from(users).where(eq(users.username, username.toLowerCase().trim()));
      return result[0] || null;
    } catch (error) {
      console.error('Database query (findByUsername) failed:', error);
      throw new Error('Failed to query repository state.');
    }
  }

  /**
   * Find user by unique public/visible User ID (e.g. DS322256)
   */
  async findByUserId(userId: string) {
    try {
      const result = await db.select().from(users).where(eq(users.userId, userId));
      return result[0] || null;
    } catch (error) {
      console.error('Database query (findByUserId) failed:', error);
      throw new Error('Failed to query repository state.');
    }
  }

  /**
   * Find user by referral code
   */
  async findByReferralCode(referralCode: string) {
    try {
      const result = await db.select().from(users).where(eq(users.referralCode, referralCode.toUpperCase().trim()));
      return result[0] || null;
    } catch (error) {
      console.error('Database query (findByReferralCode) failed:', error);
      throw new Error('Failed to query repository state.');
    }
  }

  /**
   * Create and persist a new user record
   */
  async createUser(data: {
    uid: string;
    email: string;
    username: string;
    name?: string | null;
    phone?: string | null;
    country?: string | null;
    passwordHash: string;
    role: UserRole;
    userId: string;
    referralCode: string;
    parentReferralId?: string | null;
    status?: string;
  }) {
    try {
      const result = await db
        .insert(users)
        .values({
          uid: data.uid,
          email: data.email.toLowerCase().trim(),
          username: data.username.toLowerCase().trim(),
          name: data.name || null,
          phone: data.phone || null,
          country: data.country || null,
          passwordHash: data.passwordHash,
          role: data.role,
          userId: data.userId,
          referralCode: data.referralCode,
          parentReferralId: data.parentReferralId || null,
          status: data.status || 'ACTIVE',
        })
        .returning();
      return result[0];
    } catch (error) {
      console.error('Database insertion (createUser) failed:', error);
      throw new Error('Failed to persist credentials state in database.');
    }
  }

  /**
   * Update password hash of a user
   */
  async updatePassword(uid: string, passwordHash: string) {
    try {
      const result = await db
        .update(users)
        .set({
          passwordHash,
          updatedAt: new Date(),
        })
        .where(eq(users.uid, uid))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error('Database update (updatePassword) failed:', error);
      throw new Error('Failed to update credentials state in database.');
    }
  }

  /**
   * Update status of a user
   */
  async updateStatus(uid: string, status: string) {
    try {
      const result = await db
        .update(users)
        .set({
          status,
          updatedAt: new Date(),
        })
        .where(eq(users.uid, uid))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error('Database update (updateStatus) failed:', error);
      throw new Error('Failed to update status in database.');
    }
  }

  /**
   * Increment failed login attempts. If attempts reach 5, lock the account for 15 minutes.
   */
  async incrementFailedLoginAttempts(id: string, currentAttempts: number) {
    try {
      const attempts = currentAttempts + 1;
      const lockUntil = attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
      
      const result = await db
        .update(users)
        .set({
          failedLoginAttempts: attempts,
          lockUntil: lockUntil,
          updatedAt: new Date(),
        })
        .where(eq(users.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error('Database update (incrementFailedLoginAttempts) failed:', error);
      throw new Error('Failed to update login attempt tracking.');
    }
  }

  /**
   * Reset failed login attempts and unlock the account.
   */
  async resetFailedLoginAttempts(id: string) {
    try {
      const result = await db
        .update(users)
        .set({
          failedLoginAttempts: 0,
          lockUntil: null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error('Database update (resetFailedLoginAttempts) failed:', error);
      throw new Error('Failed to reset login attempt tracking.');
    }
  }
}

export const authRepository = new AuthRepository();
export default authRepository;
