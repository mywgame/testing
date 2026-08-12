/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { pgTable, uuid, integer, numeric, timestamp, index, uniqueIndex, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users.ts';
import { deposits } from './deposits.ts';

// Structural Referral Tree Relationships (Adjacency List & Path Level)
export const referralRelationships = pgTable(
  'referral_relationships',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    parentId: uuid('parent_id')
      .notNull()
      .references(() => users.id), // Parent/Upline referrer
    childId: uuid('child_id')
      .notNull()
      .references(() => users.id)
      .unique(), // Child/Downline referee. Standard 1 parent per node rule.
    referralLevel: integer('referral_level').notNull(), // Level relative to parent (1 = Direct, 2 = Indirect Level 2, etc.)
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('referral_relationships_parent_idx').on(table.parentId),
    index('referral_relationships_child_idx').on(table.childId),
    index('referral_relationships_level_idx').on(table.referralLevel),
    check('referral_level_positive', sql`${table.referralLevel} > 0`),
  ]
);

// Immutable record of referral commission earnings
export const referralIncomeHistory = pgTable(
  'referral_income_history',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id), // Beneficiary who receives the income
    sourceUserId: uuid('source_user_id')
      .notNull()
      .references(() => users.id), // Downline user whose activity triggered this reward
    depositId: uuid('deposit_id')
      .references(() => deposits.id), // The specific first successful deposit that triggered this reward
    amount: numeric('amount', { precision: 20, scale: 8 }).notNull(), // Exact commission amount
    level: integer('level').notNull(), // Level of the downline user relative to the beneficiary
    transactionId: uuid('transaction_id').notNull(), // Direct link to master transactions ledger
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('referral_income_user_idx').on(table.userId),
    index('referral_income_source_idx').on(table.sourceUserId),
    index('referral_income_created_idx').on(table.createdAt),
    check('referral_income_amount_positive', sql`${table.amount} > 0`),
    check('referral_income_level_positive', sql`${table.level} > 0`),
  ]
);
