/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { pgTable, uuid, integer, text, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { users } from './users.ts';

export const supportTickets = pgTable(
  'support_tickets',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id), // Creator of the ticket
    ticketNumber: text('ticket_number').notNull().unique(), // e.g., TKT-20260627-XXXX
    status: text('status').default('OPEN').notNull(), // OPEN, IN_PROGRESS, RESOLVED, CLOSED
    priority: text('priority').default('LOW').notNull(), // LOW, MEDIUM, HIGH, CRITICAL
    assignedAdminUid: text('assigned_admin_uid'), // Admin user UID assigned to the ticket
    category: text('category').notNull(), // DEPOSIT, WITHDRAWAL, SECURITY, ACCOUNT, OTHER
    subject: text('subject').notNull(), // Headline summary of the support ticket
    description: text('description').notNull(), // Detail text submitted by user
    attachmentName: text('attachment_name'), // Name of the uploaded attachment
    attachmentData: text('attachment_data'), // Base64 data of the uploaded attachment
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('support_tickets_num_idx').on(table.ticketNumber),
    index('support_tickets_user_idx').on(table.userId),
    index('support_tickets_status_idx').on(table.status),
    index('support_tickets_priority_idx').on(table.priority),
  ]
);

// Support messages/replies under a ticket to store messaging history
export const supportMessages = pgTable(
  'support_messages',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    ticketId: uuid('ticket_id')
      .notNull()
      .references(() => supportTickets.id, { onDelete: 'cascade' }),
    senderId: uuid('sender_id')
      .references(() => users.id, { onDelete: 'set null' }), // Left null if sender is external system
    senderType: text('sender_type').notNull(), // USER, ADMIN, SYSTEM
    message: text('message').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('support_messages_ticket_idx').on(table.ticketId),
    index('support_messages_sender_idx').on(table.senderId),
    index('support_messages_created_idx').on(table.createdAt),
  ]
);
