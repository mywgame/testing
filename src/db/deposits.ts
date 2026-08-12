/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { pgTable, uuid, integer, text, numeric, timestamp, index, uniqueIndex, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users.ts';
import { wallets } from './wallets.ts';

export const deposits = pgTable(
  'deposits',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    walletId: uuid('wallet_id')
      .notNull()
      .references(() => wallets.id),
    referenceNumber: text('reference_number').notNull().unique(), // Human-readable unique trace code (e.g. DEP-20260627-XXXX)
    amount: numeric('amount', { precision: 20, scale: 8 }).notNull(), // Exact deposited funds
    status: text('status').default('PENDING').notNull(), // PENDING, COMPLETED, FAILED
    txHash: text('tx_hash').unique(), // Blockchain transaction hash (unique to prevent double deposit/replay attacks)
    network: text('network').notNull(), // USDT BEP20, USDT Polygon, USDT TRC20, etc.
    depositAddress: text('deposit_address').notNull(), // The permanent deposit address where user sent funds
    adminNotes: text('admin_notes'), // Optional explanation for support or internal audits
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('deposits_ref_idx').on(table.referenceNumber),
    index('deposits_user_id_idx').on(table.userId),
    index('deposits_status_idx').on(table.status),
    index('deposits_created_at_idx').on(table.createdAt),
    index('deposits_tx_hash_idx').on(table.txHash),
    check('deposit_amount_positive', sql`${table.amount} > 0`),
  ]
);
