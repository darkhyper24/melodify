import { pgTable, text, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { songs } from './song';
import { playlists } from './playlist';

export const playlistSongs = pgTable('playlist_songs', {
  playlistId: text('playlist_id').notNull().references(() => playlists.id),
  songId: text('song_id').notNull().references(() => songs.id),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.playlistId, table.songId] })
  };
});