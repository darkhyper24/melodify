import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../models/profile';

export let supabase: any;
export let db: any;

export function initClients(env: any) {
  const supabaseUrl = env.SUPABASE_URL;
  const supabaseKey = env.SUPABASE_ANON_KEY;
  const databaseUrl = env.DATABASE_URL;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  if (!databaseUrl) {
    throw new Error('Missing DATABASE_URL environment variable');
  }
  
  supabase = createClient(supabaseUrl, supabaseKey);
  const queryClient = postgres(databaseUrl);
  db = drizzle(queryClient, { schema });
  
  return { supabase, db };
}