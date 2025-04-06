import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const profiles = pgTable('profiles', {
  id: text('id').primaryKey(),
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),// 'user' or 'artist'
  email: text('email').notNull(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  role: text('role').notNull().default('user'),
  phone: text('phone'),
});