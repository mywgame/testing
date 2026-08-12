/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { pgTable, uuid, integer, text, boolean, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { users } from './users.ts';

// Dynamic, soft-configurable platform business rules (avoiding code-level hardcoding)
export const systemSettings = pgTable(
  'system_settings',
  {
    id: integer('id').primaryKey(), // Numeric identifier (usually 1, 2, or standard IDs)
    key: text('key').notNull().unique(), // Configuration key (e.g., "DAILY_CLAIM_REWARD_PERCENTAGE", "MIN_WITHDRAWAL_LIMIT")
    value: text('value').notNull(), // Stringified value, JSON object, or decimal scale rule
    description: text('description'), // Clarifying detail about which business logic is modified by this parameter
    updatedBy: text('updated_by').default('SYSTEM').notNull(), // Administrator UID modifying the setting
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('system_settings_key_idx').on(table.key),
  ]
);

// Individual personalizations, localized UI themes, or security preferences per account
export const userSettings = pgTable(
  'user_settings',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' })
      .unique(), // 1-to-1 User configuration alignment
    mfaEnabled: boolean('mfa_enabled').default(false).notNull(), // Multi-Factor Auth status
    mfaSecret: text('mfa_secret'), // Google Authenticator Base32 secret key
    withdrawalAddresses: text('withdrawal_addresses'), // JSON string of verified withdrawal addresses per network
    emailNotifications: boolean('email_notifications').default(true).notNull(), // Transactional and general alerts
    marketingConsent: boolean('marketing_consent').default(false).notNull(), // Promotional newsletter Opt-In status
    language: text('language').default('en').notNull(), // Standard locale preference (e.g. "en", "es", "zh")
    theme: text('theme').default('light').notNull(), // Dark/Light default visual frame
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('user_settings_user_idx').on(table.userId),
  ]
);
