/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { pgTable, uuid, integer, numeric, timestamp, index, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users.ts';
import { claims } from './claims.ts';

/**
 * Business Logic Spec Section 16 — Team Commission/Level.
 *
 * Immutable ledger of every Team Commission payout generated when a downline user
 * (source_user_id) claims their Daily DPY and an upline (receiver_user_id, Level A-D)
 * earns a percentage of that claim based on the RECEIVING upline's current VIP tier.
 *
 * Username is intentionally NOT stored here — the Users table is the single source
 * of truth for user identity; username must always be resolved via source_user_id.
 *
 * Owning Service: ReferralService (per Section 17 — Service Ownership Matrix).
 * This table is written to ONLY by ReferralService.
 */
export const teamCommissionHistory = pgTable(
  'team_commission_history',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    receiverUserId: uuid('receiver_user_id')
      .notNull()
      .references(() => users.id), // Upline who receives the Team Commission
    sourceUserId: uuid('source_user_id')
      .notNull()
      .references(() => users.id), // Downline whose DPY claim generated this commission
    claimId: uuid('claim_id')
      .notNull()
      .references(() => claims.id), // The specific Daily DPY claim that triggered this commission
    level: integer('level').notNull(), // 1 = Level A, 2 = Level B, 3 = Level C, 4 = Level D
    sourceDpyAmount: numeric('source_dpy_amount', { precision: 20, scale: 8 }).notNull(), // DPY amount claimed by source user
    commissionAmount: numeric('commission_amount', { precision: 20, scale: 8 }).notNull(), // Amount credited to receiver
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('team_commission_history_receiver_idx').on(table.receiverUserId),
    index('team_commission_history_source_idx').on(table.sourceUserId),
    index('team_commission_history_created_idx').on(table.createdAt),
    check('team_commission_level_range', sql`${table.level} >= 1 AND ${table.level} <= 4`),
    check('team_commission_source_dpy_positive', sql`${table.sourceDpyAmount} > 0`),
    check('team_commission_amount_positive', sql`${table.commissionAmount} > 0`),
  ]
);
