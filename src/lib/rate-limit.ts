import "server-only";

/**
 * A small fixed-window limiter for the public POST routes.
 *
 * Every public write here costs something real: /api/newsletter and
 * /api/mixing-request each send mail on a metered Resend quota — the same
 * quota the order receipts depend on — and /api/mixing-request also writes
 * uploaded files to storage. Unthrottled, one script can burn the sending
 * quota and take paid customers' receipts down with it.
 *
 * ─── WHAT THIS IS NOT ──────────────────────────────────────────────────
 * In-memory, so the window is per serverless instance rather than global:
 * a distributed attacker spread across instances gets a higher effective
 * ceiling, and counters reset when an instance recycles. That is a real
 * limitation, and the fix when it matters is a shared store (Upstash /
 * Vercel KV). It is still worth having — it stops the trivial single-source
 * flood, which is the realistic threat at this size, and it costs nothing.
 * ───────────────────────────────────────────────────────────────────────
 */

type Hit = { count: number; resetAt: number };

const buckets = new Map<string, Hit>();

/** Bounded so a flood of unique keys cannot grow the map without limit. */
const MAX_KEYS = 10_000;

function sweep(now: number) {
  for (const [key, hit] of buckets) {
    if (hit.resetAt <= now) buckets.delete(key);
  }
}

/**
 * Identifies the caller. Vercel sets `x-forwarded-for`; the leftmost entry is
 * the client. Falls back to a constant so a missing header degrades to a
 * shared bucket (throttled) rather than to no limit at all.
 */
export function clientKey(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  const ip = fwd?.split(",")[0]?.trim();
  return ip || req.headers.get("x-real-ip") || "unknown";
}

export interface RateLimitResult {
  ok: boolean;
  /** Seconds until the window resets. Send as Retry-After. */
  retryAfter: number;
}

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): RateLimitResult {
  const now = Date.now();

  if (buckets.size > MAX_KEYS) sweep(now);

  const hit = buckets.get(key);
  if (!hit || hit.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }

  hit.count += 1;
  if (hit.count > limit) {
    return { ok: false, retryAfter: Math.ceil((hit.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfter: 0 };
}
