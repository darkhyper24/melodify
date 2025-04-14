import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const profiles = pgTable('profiles', {
  id: text('id').primaryKey(),  
  fullName: text('full_name').notNull(),
  avatarUrl: text('avatar_url'),
  email: text('email').notNull(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  role: text('role').notNull().default('user'),
  phone: text('phone'),
  bio: text('bio'),
});