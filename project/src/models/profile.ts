import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
// we haven't yet decided if we will use postgres with drizzle orm for supabase or d1
// this entity will change according to the data needed for the fields in the website
export const profiles = sqliteTable('profiles', {
  id: text('id').primaryKey(),
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().defaultNow(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().defaultNow()
});