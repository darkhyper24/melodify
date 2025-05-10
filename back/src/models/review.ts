import { pgTable, timestamp, uuid, unique, integer } from 'drizzle-orm/pg-core';
import { songs } from './song';
import { profiles } from './profile';

export const songReview = pgTable('song_review', {
  id: uuid('id').defaultRandom().primaryKey(),
  rating: integer('rating').notNull(),
  song_id: uuid('song_id').references(() => songs.id).notNull(),
  user_id: uuid('user_id').references(() => profiles.id).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    unique_review: unique().on(table.user_id, table.song_id),
  }
});