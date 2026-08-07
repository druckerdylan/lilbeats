import { track as vercelTrack } from "@vercel/analytics";

/**
 * The complete event vocabulary. Four events, named here rather than passed
 * as free strings, so a typo can't quietly create a fifth series in the
 * dashboard that nobody ever looks at.
 *
 * - `preview_play`   — a catalogue preview started playing
 * - `add_to_cart`    — a licence went into the cart
 * - `magnet_signup`  — the /free starter-pack form was accepted
 * - `mixing_request` — a mixing & mastering intake was accepted
 */
export type AnalyticsEvent =
  | "preview_play"
  | "add_to_cart"
  | "magnet_signup"
  | "mixing_request";

/**
 * Vercel flattens event properties — nested objects are dropped — so the
 * value type is deliberately scalar-only, matching the library's own
 * `AllowedPropertyValues`.
 */
export type AnalyticsProps = Record<string, string | number | boolean | null>;

/**
 * Fire-and-forget wrapper over Vercel Web Analytics' `track`.
 *
 * Three things it guarantees that the raw import does not:
 *
 * 1. **Never throws.** `@vercel/analytics`'s `track` throws outright when
 *    called outside a browser in a non-production build, so a stray import
 *    into a server component would take a page down. The window check runs
 *    first, and the whole call is wrapped besides — a missed metric is
 *    always cheaper than a broken checkout.
 * 2. **Silent in development.** The Vercel script is only injected on Vercel
 *    deployments, so locally there is nothing to send to; the event is
 *    logged instead, which is what you actually want while wiring a call
 *    site up.
 * 3. **A closed event vocabulary**, via `AnalyticsEvent`.
 *
 * NEVER pass an email address, name, phone number, IP, or anything else that
 * identifies a person. Props are for shape-of-behaviour only — a beat slug,
 * a licence tier, a service name. See `/privacy`, which states this.
 */
export function track(event: AnalyticsEvent, props?: AnalyticsProps): void {
  // SSR and server components: no window, nothing to send to.
  if (typeof window === "undefined") return;

  if (process.env.NODE_ENV !== "production") {
    console.debug(`[analytics] ${event}`, props ?? {});
    return;
  }

  try {
    vercelTrack(event, props);
  } catch {
    // Analytics is never allowed to break a user flow.
  }
}
