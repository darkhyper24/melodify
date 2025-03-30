import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../models/profile';

export let supabase: any;
export let db: any;

export function initClients(env: any) {
  const supabaseUrl = env.SUPABASE_URL;
  const supabaseKey = env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  supabase = createClient(supabaseUrl, supabaseKey);
  
  db = drizzle(env.DB, { schema });
  
  return { supabase, db };
}