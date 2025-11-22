'use client';

import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';

type BrowserSupabaseClient = ReturnType<typeof createBrowserSupabaseClient>;

let browserSupabase: BrowserSupabaseClient | null = null;

export function getSupabaseClient(): BrowserSupabaseClient {
  if (!browserSupabase) {
    browserSupabase = createBrowserSupabaseClient();
  }

  return browserSupabase;
}

export const supabase = getSupabaseClient();
