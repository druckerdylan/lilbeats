import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * The wordmark, set as a title card rather than a logotype: condensed
 * display caps, tracking pulled in tight, and the back half lit by the
 * brand's single key light. The bloom is what sells it — an ember word with
 * no halo reads as *coloured text*, an ember word with one reads as *lit*.
 *
 * The halo is written out rather than borrowed from `text-bloom` because a
 * neon tube needs a tight core the wide film bloom doesn't have: ~7px of
 * hot centre reads as glass and gas, the 26/70px falloff reads as the room
 * around it. It stays at low alpha at rest so the counters in "Beats" never
 * fill in at 28px on a phone; hovering ramps it to full tube brightness.
 *
 * Deliberately one un-prefixed font-size so callers (admin chrome, footer)
 * can override the scale with a single class.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      // The word space is a flex `gap`, so the two halves sit adjacent in the
      // text content — without this, assistive tech announces "LilBeats".
      aria-label={SITE_NAME}
      className={cn(
        // `gap` rather than a literal space character: the two halves are
        // flex children, so a text node between them would collapse.
        "group inline-flex shrink-0 items-baseline gap-[0.22em] font-display text-[1.75rem] leading-none tracking-[0.012em] text-bone uppercase select-none",
        className
      )}
    >
      <span className="transition-colors duration-300 group-hover:text-bone/65">
        Lil
      </span>
      <span className="text-ember [text-shadow:0_0_7px_rgba(255,10,60,0.34),0_0_26px_rgba(255,45,71,0.28),0_0_70px_rgba(194,20,47,0.22)] transition-[color,text-shadow] duration-300 group-hover:text-ember-bright group-hover:[text-shadow:0_0_8px_rgba(255,10,60,0.85),0_0_28px_rgba(255,10,60,0.55),0_0_78px_rgba(255,10,60,0.38)]">
        Beats
      </span>
    </Link>
  );
}
