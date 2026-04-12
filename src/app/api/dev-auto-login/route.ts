import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';

/**
 * Dev-only auto-login route.
 *
 * Triple-gated:
 *   1. `DEV_AUTO_LOGIN === 'true'` must be set
 *   2. `NODE_ENV !== 'production'` must hold
 *   3. A loud console.warn fires on every trigger so it's impossible
 *      to forget this is active
 *
 * If any gate fails, returns 404 so the route is effectively invisible
 * in production environments.
 *
 * Query params:
 *   role     = 'admin' | 'student' (required)
 *   redirect = absolute path to redirect to after sign-in (required)
 *
 * Credentials come from env vars, never from the source tree:
 *   DEV_TEST_ADMIN_EMAIL / DEV_TEST_ADMIN_PASSWORD
 *   DEV_TEST_STUDENT_EMAIL / DEV_TEST_STUDENT_PASSWORD
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  // Gate 1 + 2: env flag + not production
  const devAutoLoginEnabled = process.env.DEV_AUTO_LOGIN === 'true';
  const isProduction = process.env.NODE_ENV === 'production';

  if (!devAutoLoginEnabled || isProduction) {
    return new NextResponse('Not found', { status: 404 });
  }

  // Gate 3: loud warning
  // eslint-disable-next-line no-console
  console.warn(
    '[DEV AUTO-LOGIN] Auto-login route triggered. ' +
      'This must NEVER run in production. ' +
      'Set DEV_AUTO_LOGIN=false or unset it before deploying.'
  );

  const { searchParams } = request.nextUrl;
  const role = searchParams.get('role');
  const redirectTo = searchParams.get('redirect') ?? '/';

  if (role !== 'admin' && role !== 'student') {
    return new NextResponse('Invalid role', { status: 400 });
  }

  // Redirect target must be a local path to avoid open-redirect.
  if (!redirectTo.startsWith('/')) {
    return new NextResponse('Invalid redirect', { status: 400 });
  }

  const email =
    role === 'admin'
      ? process.env.DEV_TEST_ADMIN_EMAIL
      : process.env.DEV_TEST_STUDENT_EMAIL;
  const password =
    role === 'admin'
      ? process.env.DEV_TEST_ADMIN_PASSWORD
      : process.env.DEV_TEST_STUDENT_PASSWORD;

  if (!email || !password) {
    return new NextResponse(
      `[dev-auto-login] Missing DEV_TEST_${role.toUpperCase()}_EMAIL / DEV_TEST_${role.toUpperCase()}_PASSWORD in .env.local`,
      { status: 500 }
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return new NextResponse(
      '[dev-auto-login] Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY',
      { status: 500 }
    );
  }

  // Build the response shell first — Supabase SSR writes cookies onto it.
  const response = NextResponse.redirect(new URL(redirectTo, request.url));

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // Clear any existing session first so swapping roles between /admin and
  // /student doesn't leave a stale cookie behind.
  await supabase.auth.signOut();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return new NextResponse(
      `[dev-auto-login] signInWithPassword failed for ${role}: ${error.message}`,
      { status: 500 }
    );
  }

  return response;
}
