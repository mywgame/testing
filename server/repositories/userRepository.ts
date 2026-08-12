/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { eq, desc } from 'drizzle-orm';
import { db } from '../../src/db/index.ts';
import { users } from '../../src/db/schema.ts';
import { UserRole } from '../../shared/types/index.ts';

export class UserRepository {
  /**
   * Find user by database sequential ID
   */
  async findById(id: string) {
    try {
      const result = await db.select().from(users).where(eq(users.id, id));
      return result[0] || null;
    } catch (error) {
      console.error('Database query (findById) failed:', error);
      throw new Error('Failed to retrieve user from database.', { cause: error });
    }
  }

  /**
   * Find user by unique auth UID
   */
  async findByUid(uid: string) {
    try {
      const result = await db.select().from(users).where(eq(users.uid, uid));
      return result[0] || null;
    } catch (error) {
      console.error('Database query (findByUid) failed:', error);
      throw new Error('Failed to retrieve user from database.', { cause: error });
    }
  }

  /**
   * Create a new user account explicitly
   */
  async createUser(data: {
    name?: string;
    email: string;
    phone?: string;
    passwordHash?: string;
    status?: string;
    role?: string;
  }) {
    try {
      const randomDigits = Math.floor(100000 + Math.random() * 900000).toString();
      const generatedUserId = `DS${randomDigits}`;
      const generatedReferralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      const generatedUid = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      const result = await db
        .insert(users)
        .values({
          uid: generatedUid,
          email: data.email,
          name: data.name || null,
          phone: data.phone || null,
          passwordHash: data.passwordHash || null,
          status: data.status || 'ACTIVE',
          role: data.role || UserRole.USER,
          userId: generatedUserId,
          referralCode: generatedReferralCode,
        })
        .returning();
      return result[0];
    } catch (error) {
      console.error('Database mutation (createUser) failed:', error);
      throw new Error('Failed to create user record in database.', { cause: error });
    }
  }

  /**
   * Upsert user: safely inserts or updates email upon logins.
   * Leverages Drizzle's onConflictDoUpdate for transactional safety.
   */
  async upsertUser(data: {
    uid: string;
    email: string;
  }) {
    try {
      // Generate a visible unique User ID (e.g. DS followed by 6 random digits)
      const randomDigits = Math.floor(100000 + Math.random() * 900000).toString();
      const generatedUserId = `DS${randomDigits}`;
      
      // Generate a short 8-character unique referral code
      const generatedReferralCode = Math.random().toString(36).substring(2, 10).toUpperCase();

      const result = await db
        .insert(users)
        .values({
          uid: data.uid,
          email: data.email,
          role: UserRole.USER,
          userId: generatedUserId,
          referralCode: generatedReferralCode,
        })
        .onConflictDoUpdate({
          target: users.uid,
          set: {
            email: data.email,
            updatedAt: new Date(),
          },
        })
        .returning();
      return result[0];
    } catch (error) {
      console.error('Database mutation (upsertUser) failed:', error);
      throw new Error('Failed to synchronize user state in database.', { cause: error });
    }
  }

  /**
   * Retrieve all registered users, paginated, newest first.
   * Added so Services never need to query Drizzle/users directly (Blueprint Rule #2).
   */
  async findAll(options?: { limit?: number; offset?: number }) {
    try {
      const limit = options?.limit ?? 50;
      const offset = options?.offset ?? 0;
      const result = await db
        .select()
        .from(users)
        .orderBy(desc(users.createdAt))
        .limit(limit)
        .offset(offset);
      return result;
    } catch (error) {
      console.error('Database query (findAll) failed:', error);
      throw new Error('Failed to retrieve registered users from database.');
    }
  }

  /**
   * Update user roles (Admin or system upgrades)
   */
  async updateUserProfile(uid: string, fields: Partial<{ role: string }>) {
    try {
      const result = await db
        .update(users)
        .set({
          ...fields,
          updatedAt: new Date(),
        })
        .where(eq(users.uid, uid))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error('Database mutation (updateUserProfile) failed:', error);
      throw new Error('Failed to apply updates to the user profile.', { cause: error });
    }
  }
}

export const userRepository = new UserRepository();
export default userRepository;
