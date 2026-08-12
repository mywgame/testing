/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as dotenv from 'dotenv';
dotenv.config();

import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import { db } from '../src/db/index.ts';
import { users } from '../src/db/schema.ts';
import { hashPassword } from '../server/utils/password.ts';

async function generateUniqueReferralCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase(); // 8 characters
    const existing = await db.select().from(users).where(eq(users.referralCode, code));
    if (existing.length === 0) {
      return code;
    }
  }
  throw new Error('Failed to generate unique referral code.');
}

async function generateUniqueUserId(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const digits = Math.floor(100000 + Math.random() * 900000).toString();
    const userIdCandidate = `DS${digits}`;
    const existing = await db.select().from(users).where(eq(users.userId, userIdCandidate));
    if (existing.length === 0) {
      return userIdCandidate;
    }
  }
  throw new Error('Failed to generate unique public user ID.');
}

async function main() {
  console.log('----------------------------------------------------');
  console.log('CeFi Platform - Superadmin Bootstrap System');
  console.log('----------------------------------------------------');

  const email = process.env.SUPERADMIN_EMAIL;
  const password = process.env.SUPERADMIN_PASSWORD;

  if (!email || !password) {
    console.error('CRITICAL: SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD environment variables are required.');
    console.error('Please declare them in your environment or active session secrets.');
    process.exit(1);
  }

  const trimmedEmail = email.trim().toLowerCase();

  try {
    // 1. Check if any user with role SUPERADMIN already exists in the database
    console.log('Checking for existing SUPERADMIN role...');
    const superadmins = await db
      .select()
      .from(users)
      .where(eq(users.role, 'SUPERADMIN'));

    if (superadmins.length > 0) {
      console.log(`[IDEMPOTENT] A SUPERADMIN already exists (Email: ${superadmins[0].email}). No duplicate actions taken.`);
      process.exit(0);
    }

    // 2. Check if a user with the specified email already exists with a different role
    console.log(`Checking if email ${trimmedEmail} is already registered...`);
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, trimmedEmail));

    if (existingUser.length > 0) {
      const userToPromote = existingUser[0];
      console.log(`User ${trimmedEmail} exists with role: ${userToPromote.role}. Upgrading role to SUPERADMIN...`);
      
      const updated = await db
        .update(users)
        .set({
          role: 'SUPERADMIN',
          status: 'ACTIVE',
          updatedAt: new Date()
        })
        .where(eq(users.id, userToPromote.id))
        .returning();

      if (updated.length > 0) {
        console.log('SUCCESS: Existing user upgraded to SUPERADMIN role successfully!');
        console.log(`Email: ${updated[0].email}`);
        console.log(`User ID: ${updated[0].userId}`);
        console.log(`Status: ${updated[0].status}`);
      } else {
        throw new Error('Failed to update user role in database.');
      }
      process.exit(0);
    }

    // 3. Create a fresh Superadmin from scratch
    console.log(`Creating fresh SUPERADMIN account for ${trimmedEmail}...`);
    const uid = crypto.randomUUID();
    const userId = await generateUniqueUserId();
    const referralCode = await generateUniqueReferralCode();
    const passwordHash = await hashPassword(password);

    const result: any = await db
      .insert(users)
      .values({
        uid,
        email: trimmedEmail,
        passwordHash,
        role: 'SUPERADMIN',
        status: 'ACTIVE',
        userId,
        referralCode,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    if (result.length > 0) {
      console.log('----------------------------------------------------');
      console.log('🎉 SUCCESS: SUPERADMIN BOOTSTRAP COMPLETED SUCCESSFULLY! 🎉');
      console.log('----------------------------------------------------');
      console.log(`User Database ID: ${result[0].id}`);
      console.log(`User Auth UUID:   ${result[0].uid}`);
      console.log(`User Public ID:   ${result[0].userId}`);
      console.log(`Email Address:    ${result[0].email}`);
      console.log(`Assigned Role:    ${result[0].role}`);
      console.log(`Status:           ${result[0].status}`);
      console.log(`Referral Code:    ${result[0].referralCode}`);
      console.log('----------------------------------------------------');
    } else {
      throw new Error('Database insert returned empty result array.');
    }

    process.exit(0);
  } catch (error: any) {
    console.error('CRITICAL ERROR: Failed to bootstrap SUPERADMIN:', error);
    process.exit(1);
  }
}

main();
