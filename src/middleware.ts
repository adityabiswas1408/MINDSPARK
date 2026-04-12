import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // Return early during localized testing/building where envs aren't loaded
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Check auth status
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith("/admin/") || pathname === "/admin";
  const isStudentRoute = pathname.startsWith("/student/") || pathname === "/student";
  const isProtectedRoute = isAdminRoute || isStudentRoute;

  if (isProtectedRoute && !user) {
    // DEV AUTO-LOGIN (triple-gated): if the env flag is on AND we're not
    // in production, redirect unauthenticated protected-route requests to
    // the dev-auto-login API which signs in the appropriate test user
    // and bounces back here. Otherwise, fall through to /login.
    const devAutoLoginEnabled = process.env.DEV_AUTO_LOGIN === "true";
    const isProduction = process.env.NODE_ENV === "production";

    if (devAutoLoginEnabled && !isProduction) {
      const role = isAdminRoute ? "admin" : "student";
      const redirectPath = request.nextUrl.pathname + request.nextUrl.search;
      const url = request.nextUrl.clone();
      url.pathname = "/api/dev-auto-login";
      url.search =
        `?role=${role}&redirect=${encodeURIComponent(redirectPath)}`;
      return NextResponse.redirect(url);
    }

    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
