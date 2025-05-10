import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { profiles } from './profile';

export const playlist = pgTable('Playlist', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    user_id: text('user_id').notNull().references(() => profiles.id),
});