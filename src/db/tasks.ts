/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { pgTable, uuid, integer, text, numeric, boolean, timestamp, index, uniqueIndex, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users.ts';
import { transactions } from './transactions.ts';

export const taskDefinitions = pgTable(
  'task_definitions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    taskCode: text('task_code').notNull().unique(), // e.g. DEPOSIT_MILESTONE_100, REFERRAL_MILESTONE_5
    title: text('title').notNull(),
    description: text('description').notNull(),
    category: text('category').notNull(), // ACTIVITY, DEPOSIT, REFERRAL
    rewardType: text('reward_type').default('CASH').notNull(), // CASH, TRIAL_FUND, BONUS
    rewardAmount: numeric('reward_amount', { precision: 20, scale: 8 }).default('0.00000000').notNull(),
    rewardPerUnit: numeric('reward_per_unit', { precision: 20, scale: 8 }).default('0.00000000').notNull(),
    triggerType: text('trigger_type').notNull(), // REGISTRATION, AUTHENTICATOR, TELEGRAM, REFERRAL_SINGLE, REFERRAL_COUNT, DEPOSIT_TOTAL
    targetProgress: numeric('target_progress', { precision: 20, scale: 8 }).default('1.00000000').notNull(),
    unit: text('unit').default('Step').notNull(),
    minDepositRequired: numeric('min_deposit_required', { precision: 20, scale: 8 }).default('0.00000000').notNull(),
    ruleConfig: text('rule_config'), // JSON string with config parameters
    maxClaimsPerUser: integer('max_claims_per_user').default(1).notNull(),
    startDate: timestamp('start_date'),
    endDate: timestamp('end_date'),
    isActive: boolean('is_active').default(true).notNull(),
    displayOrder: integer('display_order').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('task_def_code_idx').on(table.taskCode),
    index('task_def_category_idx').on(table.category),
    index('task_def_active_idx').on(table.isActive),
    check('task_def_reward_amount_non_negative', sql`${table.rewardAmount} >= 0`),
  ]
);

export const userTaskClaims = pgTable(
  'user_task_claims',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    taskId: uuid('task_id')
      .notNull()
      .references(() => taskDefinitions.id),
    taskCode: text('task_code').notNull(),
    claimKey: text('claim_key').default('DEFAULT').notNull(), // DEFAULT or referredUserId for single referral claims
    rewardAmount: numeric('reward_amount', { precision: 20, scale: 8 }).notNull(),
    rewardType: text('reward_type').default('CASH').notNull(),
    claimMetadata: text('claim_metadata'), // JSON details
    transactionId: uuid('transaction_id').references(() => transactions.id),
    claimedAt: timestamp('claimed_at').defaultNow().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('user_task_claims_user_idx').on(table.userId),
    index('user_task_claims_task_idx').on(table.taskId),
    uniqueIndex('user_task_claims_user_task_key_uq').on(table.userId, table.taskCode, table.claimKey),
    check('user_task_claims_reward_non_negative', sql`${table.rewardAmount} >= 0`),
  ]
);
