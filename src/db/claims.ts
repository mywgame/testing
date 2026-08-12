/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { pgTable, uuid, integer, text, numeric, boolean, timestamp, index, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users.ts';

export const claims = pgTable(
  'claims',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    claimDate: timestamp('claim_date').notNull(), // The targeted operational day or slot for this claim
    claimStatus: text('claim_status').default('PENDING').notNull(), // PENDING, CLAIMED, EXPIRED, FORFEITED
    rewardAmount: numeric('reward_amount', { precision: 20, scale: 8 }).notNull(), // Pre-set claimable reward (Total Assets * VIP Rate)
    totalAssets: numeric('total_assets', { precision: 20, scale: 8 }).default('0.00000000').notNull(), // User's total assets at the time of calculation
    vipTier: text('vip_tier').default('VIP1').notNull(), // User's VIP tier at the time of calculation
    vipRate: numeric('vip_rate', { precision: 20, scale: 8 }).default('0.00000000').notNull(), // Current VIP DPY % used (e.g., 0.00600000)
    claimedAt: timestamp('claimed_at'), // Instant when user successfully clicked/claimed
    expired: boolean('expired').default(false).notNull(), // Soft flag indicating if window has passed unclaimed
    claimWindowOpenTime: timestamp('claim_window_open_time').notNull(), // Active claim window start
    claimWindowCloseTime: timestamp('claim_window_close_time').notNull(), // Active claim window end (deadline)
    transactionId: uuid('transaction_id'), // Link to transaction table upon successful claim
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('claims_user_idx').on(table.userId),
    index('claims_date_idx').on(table.claimDate),
    index('claims_status_idx').on(table.claimStatus),
    check('claim_reward_amount_non_negative', sql`${table.rewardAmount} >= 0`),
    check('claim_total_assets_non_negative', sql`${table.totalAssets} >= 0`),
    check('claim_vip_rate_non_negative', sql`${table.vipRate} >= 0`),
  ]
);
