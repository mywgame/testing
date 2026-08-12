/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { pgTable, uuid, text, boolean, decimal, integer, timestamp, index } from 'drizzle-orm/pg-core';
import { deposits } from './deposits.ts';
import { users } from './users.ts';

export const treasuryWallets = pgTable(
  'treasury_wallets',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    network: text('network').notNull(), // e.g. 'USDT_BEP20', 'USDT_POLYGON', 'USDT_TRC20'
    walletType: text('wallet_type').default('HOT').notNull(), // 'HOT', 'COLD'
    walletNumber: integer('wallet_number').default(1).notNull(), // 1, 2, 3...
    label: text('label').default('Treasury Wallet').notNull(), // e.g. 'BSC Hot Wallet 1'
    address: text('address').default('').notNull(),
    status: text('status').default('ACTIVE').notNull(), // 'ACTIVE', 'DISABLED'
    priority: integer('priority').default(1).notNull(),
    balance: decimal('balance', { precision: 20, scale: 8 }).default('0.00000000').notNull(),
    hotAddress: text('hot_address'),
    coldAddress: text('cold_address'),
    hotBalance: decimal('hot_balance', { precision: 20, scale: 8 }).default('0.00000000'),
    coldBalance: decimal('cold_balance', { precision: 20, scale: 8 }).default('0.00000000'),
    autoSweepEnabled: boolean('auto_sweep_enabled').default(true).notNull(),
    autoSweepThreshold: decimal('auto_sweep_threshold', { precision: 20, scale: 8 }).default('50.00000000').notNull(),
    sweepMode: text('sweep_mode').default('AUTOMATIC').notNull(), // 'AUTOMATIC', 'MANUAL', 'HYBRID'
    sweepDelay: text('sweep_delay').default('IMMEDIATE').notNull(), // 'IMMEDIATE', '1_HOUR', '6_HOURS', '24_HOURS', '3_DAYS', '7_DAYS', 'CUSTOM', 'MANUAL_ONLY'
    customDelayMinutes: integer('custom_delay_minutes').default(0).notNull(),
    paused: boolean('paused').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('treasury_wallets_net_type_idx').on(table.network, table.walletType, table.walletNumber),
  ]
);

export const treasurySweepJobs = pgTable(
  'treasury_sweep_jobs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    network: text('network').notNull(), // e.g. 'USDT_BEP20'
    sourceAddress: text('source_address').notNull(),
    destinationAddress: text('destination_address').notNull(),
    sweepType: text('sweep_type').notNull(), // 'USER_TO_HOT' or 'HOT_TO_COLD'
    amount: decimal('amount', { precision: 20, scale: 8 }).notNull(),
    txHash: text('tx_hash'),
    status: text('status').notNull(), // 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED'
    errorMessage: text('error_message'),
    attempts: integer('attempts').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  }
);

export const sweepQueue = pgTable(
  'sweep_queue',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    depositId: uuid('deposit_id').references(() => deposits.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    depositAddress: text('deposit_address').notNull(),
    network: text('network').notNull(),
    amount: decimal('amount', { precision: 20, scale: 8 }).notNull(),
    status: text('status').default('PENDING').notNull(), // PENDING, WAITING_DELAY, WAITING_GAS, GAS_FUNDING, READY_TO_SWEEP, SWEEPING, COMPLETED, FAILED, CANCELLED
    gasStatus: text('gas_status').default('LOW').notNull(), // OK, LOW, FUNDING_SENT, FAILED
    gasTxHash: text('gas_tx_hash'),
    sweepTxHash: text('sweep_tx_hash'),
    errorMessage: text('error_message'),
    attempts: integer('attempts').default(0).notNull(),
    eligibleAt: timestamp('eligible_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('sweep_queue_status_idx').on(table.status),
    index('sweep_queue_deposit_id_idx').on(table.depositId),
  ]
);
