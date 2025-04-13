import { pgTable, text, timestamp, numeric } from 'drizzle-orm/pg-core';
import { songs } from './song';
import { profiles } from './profile';

export const playedTracks = pgTable('played_tracks', {
  id: text('id').primaryKey(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  lastPosition: numeric('last_position').notNull(),
  lastChunck: numeric('last_chunck').notNull(),
  songId: text('song_id').notNull().references(() => songs.id),
  userId: text('user_id').notNull().references(() => profiles.id),
});