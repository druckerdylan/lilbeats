import "server-only";
import { createClient } from "@/lib/supabase/server";

/**
 * Re-checks the admin session inside each protected API route. `proxy.ts`
 * already gates `/admin/*` page navigation, but a matcher change or a
 * moved route can silently drop that coverage — API routes must not rely
 * on it alone.
 *
 * Two things this deliberately does NOT assume:
 *
 * 1. That a valid Supabase session means "admin". The anon key is public and
 *    Supabase projects ship with email sign-up enabled, so without an
 *    allowlist any stranger could register and reach the dashboard — which
 *    reads customer names, emails and phone numbers. Set ADMIN_EMAILS to a
 *    comma-separated list of the accounts allowed in.
 * 2. That Supabase is configured at all. If the env vars are missing the
 *    client constructor throws, which surfaces as a 500 and reads like a
 *    server bug rather than a refusal. Fail closed and return null instead.
 */
function adminAllowlist(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function requireAdminUser() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const allowed = adminAllowlist();
    if (allowed.length === 0) {
      // Refusing here is the safe default: an unset allowlist would otherwise
      // mean "anyone who can sign up is an admin".
      console.error(
        "[admin-auth] ADMIN_EMAILS is not set — refusing admin access. Set it to the account(s) allowed into /admin."
      );
      return null;
    }

    const email = user.email?.toLowerCase();
    if (!email || !allowed.includes(email)) return null;

    return user;
  } catch (error) {
    console.error("[admin-auth] session check failed", error);
    return null;
  }
}
