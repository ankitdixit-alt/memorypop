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
 */

import { createClient } from '@supabase/supabase-js';

export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
