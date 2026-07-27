/**
 * Server-Side Supabase Client (Service Role)
 *
 * IMPORTANT: This client uses the service role key which bypasses Row Level Security (RLS).
 *
 * Usage:
 * - ONLY import in Server Components and Route Handlers
 * - NEVER import in Client Components (files with "use client")
 * - Service role key must NEVER be exposed to the browser
 *
 * Security:
 * - Service role bypasses all RLS policies
 * - Has full database access (read, write, delete)
 * - Should only be used for authorized server-side operations
 *
 * Environment Variable:
 * - SUPABASE_SERVICE_ROLE_KEY (from Supabase Dashboard → Settings → API)
 *
 * Build Optimization:
 * - Lazy initialization to prevent module evaluation during Next.js build
 * - Client created only when first accessed at runtime
 */

import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

let _supabaseServer: SupabaseClient | null = null;

function getSupabaseServer(): SupabaseClient {
  if (_supabaseServer) {
    return _supabaseServer;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  _supabaseServer = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  return _supabaseServer;
}

export const supabaseServer = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseServer();
    const value = client[prop as keyof SupabaseClient];
    return typeof value === 'function' ? value.bind(client) : value;
  }
});
