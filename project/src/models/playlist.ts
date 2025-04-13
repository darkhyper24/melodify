import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { profiles } from './profile';

export const playlists = pgTable('playlists', {
    id: text('id').primaryKey(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    name: text('name').notNull(),
    userId: text('user_id').notNull().references(() => profiles.id),
});