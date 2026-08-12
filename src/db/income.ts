/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { pgTable, uuid, integer, text, numeric, timestamp, index, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users.ts';
import { wallets } from './wallets.ts';

export const incomeHistory = pgTable(
  'income_history',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    walletId: uuid('wallet_id')
      .notNull()
      .references(() => wallets.id),
    type: text('type').notNull(), // e.g., DAILY_YIELD, REFERRAL_INCOME, TEAM_INCOME, INCENTIVE_INCOME
    amount: numeric('amount', { precision: 20, scale: 8 }).notNull(), // Exact yield/income amount generated
    description: text('description').notNull(), // Clarifying description (e.g. "Level 1 commission from direct downline deposition")
    transactionId: uuid('transaction_id').notNull(), // Linked transaction tracing code
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('income_history_user_idx').on(table.userId),
    index('income_history_type_idx').on(table.type),
    index('income_history_created_idx').on(table.createdAt),
    check('income_amount_positive', sql`${table.amount} > 0`),
  ]
);
