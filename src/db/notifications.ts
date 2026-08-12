/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { pgTable, uuid, integer, text, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { users } from './users.ts';

export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    priority: text('priority').default('LOW').notNull(), // LOW, MEDIUM, HIGH, URGENT
    read: boolean('read').default(false).notNull(), // Read status flag
    message: text('message').notNull(), // Rich text or raw message payload
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('notifications_user_idx').on(table.userId),
    index('notifications_read_idx').on(table.read),
    index('notifications_created_idx').on(table.createdAt),
  ]
);
