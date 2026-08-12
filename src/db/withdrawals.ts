/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { pgTable, uuid, integer, text, numeric, timestamp, index, uniqueIndex, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users.ts';
import { wallets } from './wallets.ts';

export const withdrawals = pgTable(
  'withdrawals',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    walletId: uuid('wallet_id')
      .notNull()
      .references(() => wallets.id),
    amount: numeric('amount', { precision: 20, scale: 8 }).notNull(), // Gross amount to withdraw
    fee: numeric('fee', { precision: 20, scale: 8 }).default('0.00000000').notNull(), // Withdrawal fee (e.g., 10%)
    netAmount: numeric('net_amount', { precision: 20, scale: 8 }).default('0.00000000').notNull(), // Amount disbursed to user (amount - fee)
    status: text('status').default('PENDING').notNull(), // PENDING, PROCESSING, COMPLETED, FAILED, CANCELLED
    walletAddress: text('wallet_address').notNull(), // Destination crypto address
    network: text('network').notNull(), // USDT BEP20, USDT Polygon, USDT TRC20, etc.
    txHash: text('tx_hash'), // Optional blockchain transaction hash populated once executed
    reference: text('reference').notNull().unique(), // Unique human-readable trace code (e.g. WD-20260627-XXXX)
    adminApprovalStatus: text('admin_approval_status').default('PENDING').notNull(), // PENDING, APPROVED, REJECTED
    adminNotes: text('admin_notes'), // Auditable explanation for approval or rejection
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('withdrawals_ref_idx').on(table.reference),
    index('withdrawals_user_id_idx').on(table.userId),
    index('withdrawals_status_idx').on(table.status),
    index('withdrawals_created_at_idx').on(table.createdAt),
    index('withdrawals_tx_hash_idx').on(table.txHash),
    check('withdrawal_amount_positive', sql`${table.amount} > 0`),
    check('withdrawal_fee_non_negative', sql`${table.fee} >= 0`),
    check('withdrawal_net_amount_non_negative', sql`${table.netAmount} >= 0`),
  ]
);
