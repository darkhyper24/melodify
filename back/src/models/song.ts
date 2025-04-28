import {  numeric, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import {albums} from './album';
import { profiles } from './profile';
import { float } from 'drizzle-orm/mysql-core';

export const songs = pgTable('songs', {
    id: text('id').primaryKey(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    title: text('title').notNull(),
    songUrl: text('song_url').notNull(),
    category: text('category'),
    userId: text('user_id').notNull().references(() => profiles.id),
    albumId: text('album_id').notNull().references(() => albums.id),
    average_rating: numeric('average_rating').default('0'),
    review_count: numeric('review_count').default("0"),
    cover: text('cover'),
    lyrics: text('lyrics')
    
});