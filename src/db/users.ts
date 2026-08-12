/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { pgTable, uuid, text, timestamp, uniqueIndex, index, integer, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    uid: text('uid').notNull().unique(), // Unique identity mapping from Auth (e.g. Firebase/Custom JWT sub)
    email: text('email').notNull().unique(), // User email address
    username: text('username').unique(), // Unique username
    passwordHash: text('password_hash'), // Optional secure hash for credentials backup
    status: text('status').default('ACTIVE').notNull(), // ACTIVE, SUSPENDED, PENDING_VERIFICATION
    role: text('role').default('USER').notNull(), // USER, VIP, ADMIN, SUPERADMIN
    userId: text('user_id').notNull().unique(), // Formatted visible ID (e.g., DS322256)
    referralCode: text('referral_code').notNull().unique(), // Shareable referral code
    parentReferralId: uuid('parent_referral_id').references(() => users.id), // Self-referencing foreign key for referral tracking
    failedLoginAttempts: integer('failed_login_attempts').default(0).notNull(), // Lockout tracking
    lockUntil: timestamp('lock_until'), // Account temporary lockout expiration
    name: text('name'), // Profile display name
    phone: text('phone'), // Profile phone number
    country: text('country'), // Country of residence
    passwordChangedAt: timestamp('password_changed_at'), // Tracking for password updates
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('users_email_idx').on(table.email),
    uniqueIndex('users_username_idx').on(table.username),
    uniqueIndex('users_user_id_idx').on(table.userId),
    uniqueIndex('users_referral_code_idx').on(table.referralCode),
    index('users_status_idx').on(table.status),
    index('users_created_at_idx').on(table.createdAt),
    index('users_parent_referral_idx').on(table.parentReferralId),
  ]
);
