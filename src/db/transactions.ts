/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * FINANCIAL INTEGRITY & ARCHITECTURE RULES:
 * 1. Financial values must always use fixed-precision decimal types (NUMERIC/DECIMAL with 20,8 precision).
 * 2. Floating-point arithmetic (FLOAT, DOUBLE, REAL) is strictly prohibited for any financial or balance calculations to prevent precision loss.
 * 3. Historical ledger records are immutable.
 * 4. Financial and ledger records (such as transactions, deposits, withdrawals, etc.) must NEVER be updated or deleted.
 * 5. Corrections must always be inserted as new ledger records to maintain audit logs.
 * 6. This project strictly follows an append-only financial ledger architecture.
 */

import { pgTable, uuid, text, numeric, timestamp, index, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users.ts';
import { wallets } from './wallets.ts';

export const transactions = pgTable(
  'transactions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    walletId: uuid('wallet_id')
      .notNull()
      .references(() => wallets.id),
    type: text('type').notNull(), // DEPOSIT, WITHDRAWAL, DAILY_YIELD, REFERRAL_INCOME, TEAM_INCOME, INCENTIVE_INCOME, TRIAL_FUND, TRIAL_EXPIRY, ADJUSTMENT
    referenceId: text('reference_id').notNull(), // References the source entity uuid or receipt code
    status: text('status').default('COMPLETED').notNull(), // PENDING, COMPLETED, FAILED
    description: text('description').notNull(), // Human readable description (e.g., "Staking Claim Reward for Period X")
    amount: numeric('amount', { precision: 20, scale: 8 }).notNull(), // Signed delta: positive for credit, negative for debit
    balanceBefore: numeric('balance_before', { precision: 20, scale: 8 }).notNull(), // Audit trace: balance of wallet before execution
    balanceAfter: numeric('balance_after', { precision: 20, scale: 8 }).notNull(), // Audit trace: balance of wallet after execution
    createdBy: text('created_by').default('SYSTEM').notNull(), // Initiating identity reference ("SYSTEM" or Admin/User UID)
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('transactions_user_id_idx').on(table.userId),
    index('transactions_wallet_id_idx').on(table.walletId),
    index('transactions_type_idx').on(table.type),
    index('transactions_ref_id_idx').on(table.referenceId),
    index('transactions_created_at_idx').on(table.createdAt),
    index('transactions_status_idx').on(table.status),
    // Balances before and after must always be non-negative
    check('balance_before_non_negative', sql`${table.balanceBefore} >= 0`),
    check('balance_after_non_negative', sql`${table.balanceAfter} >= 0`),
  ]
);
