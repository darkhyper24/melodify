import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { profiles } from "./profile";

export const albums = pgTable('albums', {
    id: text('id').primaryKey(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    name: text('name').notNull(),
    albumPic: text('album_pic'),
    userId: text('user_id').notNull().references(() => profiles.id),
});