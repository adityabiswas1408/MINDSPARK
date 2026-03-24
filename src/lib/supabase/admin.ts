import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// 1. Runtime Browser Guard (defence in depth against client bundling)
if (typeof window !== 'undefined') {
  throw new Error(
    '[SECURITY] admin.ts must not run in browser context.\n' +
    'This file is server-only. See docs/security.md §4.'
  );
}

// 2. Startup Guard (fails fast at server start, not request time)
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('[SECURITY] SUPABASE_SERVICE_ROLE_KEY is not set.');
}

/**
 * SERVICE-ROLE CLIENT — RESTRICTED
 *
 * ⛔ NEVER import this file in client components, Edge handlers, or /(student) routes.
 * ✅ ONLY import in Server Actions and Security Definer RPC wrappers.
 */
export const adminSupabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
