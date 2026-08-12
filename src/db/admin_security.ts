/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { pgTable, uuid, text, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { users } from './users.ts';

export const adminSecurity = pgTable(
  'admin_security',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' })
      .unique(),
    totpEnabled: boolean('totp_enabled').default(false).notNull(),
    totpSecret: text('totp_secret'), // Encrypted Base32 secret key
    recoveryCodes: text('recovery_codes'), // JSON array of hashed recovery codes
    failedAttempts: text('failed_attempts').default('0').notNull(),
    lockedUntil: timestamp('locked_until'),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('admin_security_user_idx').on(table.userId),
  ]
);
