/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { pgTable, uuid, text, integer, timestamp, index, uniqueIndex, decimal, boolean } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users.ts';

// Stores permanent cryptocurrency deposit addresses per user per supported blockchain network.
// A user may accumulate MULTIPLE rows per (userId, network) over time via admin rotation —
// only ONE of them is ever "active" (shown to the user / used for new deposits) at a time.
// Archived (isActive = false) rows are NEVER deleted: they remain fully queryable so that
// blockchain deposits arriving on an old address are still recognized and credited correctly.
export const depositAddresses = pgTable(
  'deposit_addresses',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    network: text('network').notNull(), // e.g. 'USDT_BEP20', 'USDT_POLYGON', 'USDT_TRC20', etc.
    address: text('address').notNull(), // Unique generated blockchain wallet address
    derivationIndex: integer('derivation_index'), // Sequential HD Wallet index
    qrPath: text('qr_path'), // Locally generated QR code path/URL reference
    onChainBalance: decimal('on_chain_balance', { precision: 20, scale: 8 }).default('0.00000000').notNull(),
    nativeBalance: decimal('native_balance', { precision: 20, scale: 8 }).default('0.00000000').notNull(),
    // --- Address history / rotation fields ---
    isActive: boolean('is_active').default(true).notNull(), // Only the active row is shown to the user / used for new deposits
    rotatedAt: timestamp('rotated_at'), // When this address was archived (superseded by a newer one)
    rotatedBy: uuid('rotated_by').references(() => users.id), // Admin who performed the rotation, if applicable
    rotationReason: text('rotation_reason'), // e.g. 'Manual Admin Rotation'
    replacedByAddressId: uuid('replaced_by_address_id').references((): any => depositAddresses.id), // Forward-pointer to the new active row
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    // Only ONE active address per (user, network) — archived rows are exempt from this
    // constraint, which is what allows full address history to be kept without conflicts.
    uniqueIndex('deposit_addresses_active_user_network_idx')
      .on(table.userId, table.network)
      .where(sql`${table.isActive} = true`),
    uniqueIndex('deposit_addresses_address_idx').on(table.address),
    index('deposit_addresses_user_idx').on(table.userId),
  ]
);
