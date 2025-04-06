import { createClient } from '@supabase/supabase-js';

export let supabase: any;

export function initClients(env: any) {
  const supabaseUrl = env.SUPABASE_URL;
  const supabaseKey = env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  console.log('Initializing Supabase client...');
  supabase = createClient(supabaseUrl, supabaseKey);
  
  // Test connection
  supabase.from('profiles')
    .select('count', { count: 'exact', head: true })
    .then(() => console.log('Supabase connection successful'))
    .catch((err: Error) => console.error('Supabase connection error:', err));
  
  return { supabase };
}