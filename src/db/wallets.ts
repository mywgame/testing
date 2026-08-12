/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { pgTable, uuid, integer, numeric, timestamp, index, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users.ts';

export const wallets = pgTable(
  'wallets',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }), // 1-to-1 User relation
    availableBalance: numeric('available_balance', { precision: 20, scale: 8 })
      .default('0.00000000')
      .notNull(), // Liquid spendable balance
    lockedBalance: numeric('locked_balance', { precision: 20, scale: 8 })
      .default('0.00000000')
      .notNull(), // Balances locked for staking or pending claims
    principalBalance: numeric('principal_balance', { precision: 20, scale: 8 })
      .default('0.00000000')
      .notNull(), // Principal balance (real deposited capital)
    trialBalance: numeric('trial_balance', { precision: 20, scale: 8 })
      .default('0.00000000')
      .notNull(), // Trial Fund balance (non-withdrawable, generates interest)
    trialExpiresAt: timestamp('trial_expires_at'), // Expiration timestamp for trial fund
    referralIncome: numeric('referral_income', { precision: 20, scale: 8 })
      .default('0.00000000')
      .notNull(), // Referral income
    dailyYield: numeric('daily_yield', { precision: 20, scale: 8 })
      .default('0.00000000')
      .notNull(), // Daily DPY yield income
    teamIncome: numeric('team_income', { precision: 20, scale: 8 })
      .default('0.00000000')
      .notNull(), // Team commission income
    incentiveIncome: numeric('incentive_income', { precision: 20, scale: 8 })
      .default('0.00000000')
      .notNull(), // Combined category for other incomes (Weekly Salary, Airdrops, Bonuses, etc.)
    totalDeposited: numeric('total_deposited', { precision: 20, scale: 8 })
      .default('0.00000000')
      .notNull(), // Historical cumulative deposit counter
    totalWithdrawn: numeric('total_withdrawn', { precision: 20, scale: 8 })
      .default('0.00000000')
      .notNull(), // Historical cumulative withdrawal counter
    totalEarned: numeric('total_earned', { precision: 20, scale: 8 })
      .default('0.00000000')
      .notNull(), // Historical cumulative rewards and interest earned
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('wallets_user_id_idx').on(table.userId),
    // Business rules: Balances must always remain non-negative
    check('available_balance_non_negative', sql`${table.availableBalance} >= 0`),
    check('locked_balance_non_negative', sql`${table.lockedBalance} >= 0`),
    check('principal_balance_non_negative', sql`${table.principalBalance} >= 0`),
    check('trial_balance_non_negative', sql`${table.trialBalance} >= 0`),
    check('referral_income_non_negative', sql`${table.referralIncome} >= 0`),
    check('daily_yield_non_negative', sql`${table.dailyYield} >= 0`),
    check('team_income_non_negative', sql`${table.teamIncome} >= 0`),
    check('incentive_income_non_negative', sql`${table.incentiveIncome} >= 0`),
    check('total_deposited_non_negative', sql`${table.totalDeposited} >= 0`),
    check('total_withdrawn_non_negative', sql`${table.totalWithdrawn} >= 0`),
    check('total_earned_non_negative', sql`${table.totalEarned} >= 0`),
  ]
);
