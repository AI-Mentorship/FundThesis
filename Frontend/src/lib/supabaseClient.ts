import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create client with fallback values to allow build to succeed
// The client will error when actually used if env vars are missing
export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey
);
