/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { pgTable, uuid, integer, text, timestamp, index } from 'drizzle-orm/pg-core';
import { users } from './users.ts';

export const activityLogs = pgTable(
  'activity_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    event: text('event').notNull(), // LOGIN, LOGOUT, PASSWORD_CHANGE, PROFILE_UPDATE, SECURITY_EVENT, MFA_ENABLE
    status: text('status').default('SUCCESS').notNull(), // SUCCESS, FAILED
    ipAddress: text('ip_address'), // Network IP of user connection
    device: text('device'), // Client user agent
    details: text('details'), // Optional context messages (e.g., "Failed login attempt: incorrect credentials")
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('activity_logs_user_idx').on(table.userId),
    index('activity_logs_event_idx').on(table.event),
    index('activity_logs_created_idx').on(table.createdAt),
  ]
);
