import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient | null = null;
let supabaseAdmin: SupabaseClient | null = null;

export function initDatabase(): void {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || (!anonKey && !serviceKey)) {
    console.warn('⚠️  Supabase not configured. Database operations will fail.');
    return;
  }

  // Primary backend client uses SUPABASE_SERVICE_ROLE_KEY for server operations
  const primaryKey = serviceKey || anonKey!;

  supabaseAdmin = createClient(url, primaryKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  if (anonKey) {
    supabase = createClient(url, anonKey);
  } else {
    supabase = supabaseAdmin;
  }

  console.log('✅ Supabase client initialized');
}

export function getSupabase(): SupabaseClient {
  if (!supabase && !supabaseAdmin) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return supabaseAdmin || supabase!;
}

export function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not initialized. Check SUPABASE_SERVICE_ROLE_KEY.');
  }
  return supabaseAdmin;
}
