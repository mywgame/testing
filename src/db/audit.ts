/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { pgTable, uuid, text, timestamp, index } from 'drizzle-orm/pg-core';
import { users } from './users.ts';

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    actorUid: text('actor_uid').notNull(), // "Who": UID of the admin or system agent triggering changes
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }), // Optional direct reference to the affected user account
    action: text('action').notNull(), // "Action": e.g., UPDATE_ROLE, ADJUST_BALANCE, UPDATE_SETTING
    resource: text('resource').notNull(), // "Resource": e.g., "users/usr_123", "wallets/wl_abc"
    ipAddress: text('ip_address'), // Network IP address origin of request
    device: text('device'), // User agent string or device metadata
    oldValue: text('old_value'), // Stringified JSON snapshot before modification
    newValue: text('new_value'), // Stringified JSON snapshot after modification
    createdAt: timestamp('created_at').defaultNow().notNull(), // "Timestamp"
  },
  (table) => [
    index('audit_logs_actor_idx').on(table.actorUid),
    index('audit_logs_user_idx').on(table.userId),
    index('audit_logs_action_idx').on(table.action),
    index('audit_logs_resource_idx').on(table.resource),
    index('audit_logs_created_idx').on(table.createdAt),
  ]
);
