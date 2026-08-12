/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { pgTable, uuid, integer, text, numeric, timestamp, index, uniqueIndex, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users.ts';

// Current active VIP tier and progress tracker
export const vipStatus = pgTable(
  'vip_status',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' })
      .unique(), // Ensure strict 1-to-1 current VIP status per user
    tier: text('tier').default('VIP1').notNull(), // Default to VIP1 per Business Logic, e.g. VIP1, VIP2, VIP3...
    points: numeric('points', { precision: 20, scale: 8 }).default('0.00000000').notNull(), // Tier qualification points or volume metrics
    levelAValidCount: integer('level_a_valid_count').default(0).notNull(), // Current count of Level A valid users (upline wallet balance >= 50)
    levelBcdValidCount: integer('level_bcd_valid_count').default(0).notNull(), // Current count of Level B+C+D valid users (wallet balance >= 50)
    teamTotalCount: integer('team_total_count').default(0).notNull(), // Combined Level A+B+C+D valid users count
    assignedAt: timestamp('assigned_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('vip_status_user_idx').on(table.userId),
    index('vip_status_tier_idx').on(table.tier),
    check('level_a_valid_count_non_negative', sql`${table.levelAValidCount} >= 0`),
    check('level_bcd_valid_count_non_negative', sql`${table.levelBcdValidCount} >= 0`),
    check('team_total_count_non_negative', sql`${table.teamTotalCount} >= 0`),
  ]
);

// Append-only historical log of VIP changes
export const vipHistory = pgTable(
  'vip_history',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    previousTier: text('previous_tier').notNull(),
    newTier: text('new_tier').notNull(),
    reason: text('reason').notNull(), // e.g., "Deposited over $10k", "Admin manual upgrade"
    updatedBy: text('updated_by').default('SYSTEM').notNull(), // Admin UID or SYSTEM
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('vip_history_user_idx').on(table.userId),
    index('vip_history_created_idx').on(table.createdAt),
  ]
);
