/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { pgTable, uuid, integer, text, timestamp, index, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users.ts';

export const achievements = pgTable(
  'achievements',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    achievementName: text('achievement_name').notNull(), // Code identifier or title (e.g., "STAKING_MAVEN")
    star: integer('star').default(1).notNull(), // Star level or difficulty tier (e.g., 1-star, 2-star, etc.)
    unlockedDate: timestamp('unlocked_date').defaultNow().notNull(), // Exact unlocking timestamp
    status: text('status').default('UNLOCKED').notNull(), // UNLOCKED, CLAIMED (if rewards are attached)
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('achievements_user_idx').on(table.userId),
    index('achievements_name_idx').on(table.achievementName),
    check('star_rating_non_negative', sql`${table.star} >= 0`),
  ]
);
