import { pgTable, text, primaryKey } from 'drizzle-orm/pg-core';
import { songs } from './song';
import { playlist } from './playlist';

export const playlistSongs = pgTable('playlist_song', {
  playlistId: text('playlist_id').notNull().references(() => playlist.id),
  songId: text('song_id').notNull().references(() => songs.id),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.playlistId, table.songId] })
  };
});