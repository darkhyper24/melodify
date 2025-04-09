import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import {albums} from './album';
import { profiles } from './profile';

export const songs = pgTable('songs', {
    id: text('id').primaryKey(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    name: text('name').notNull(),
    songUrl: text('song_url').notNull(),
    category: text('category'),
    userId: text('user_id').notNull().references(() => profiles.id),
    albumId: text('album_id').notNull().references(() => albums.id)
    
});