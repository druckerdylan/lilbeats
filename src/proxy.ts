import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Protects /admin/* routes. Runs before every matched request, but each
 * admin Server Component and API route still re-checks the session itself —
 * proxy coverage can silently drop if a route is moved or the matcher
 * changes, so it's a first line of defense, not the only one.
 */
export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/admin/login") {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  /*
    Signed in is not the same as allowed. Supabase projects ship with sign-up
    enabled and the anon key is public, so gating on user-existence alone would
    let anyone who registers reach a dashboard full of customer PII. The layout
    re-checks this too — the proxy is the cheap early exit, not the only lock.
  */
  const allowed = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  const email = user?.email?.toLowerCase();

  if (!user || allowed.length === 0 || !email || !allowed.includes(email)) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return response;
}

export const config = {
  matcher: "/admin/:path*",
};
