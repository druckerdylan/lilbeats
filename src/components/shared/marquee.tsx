"use client";

import { Children } from "react";
import { cn } from "@/lib/utils";

/**
 * Infinite horizontal ticker.
 *
 * The track renders its children twice and slides by exactly -50%, so the
 * second copy lands where the first started and the loop is seamless. The
 * duplicate is `aria-hidden` — screen readers hear the content once.
 */
export function Marquee({
  children,
  className,
  duration = 34,
  reverse = false,
  pauseOnHover = true,
  fade = true,
}: {
  children: React.ReactNode;
  className?: string;
  /** Seconds for one full pass. Longer = calmer. */
  duration?: number;
  reverse?: boolean;
  pauseOnHover?: boolean;
  /** Feathers both edges so items enter and leave instead of popping. */
  fade?: boolean;
}) {
  const items = Children.toArray(children);

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden",
        pauseOnHover && "marquee-paused",
        className
      )}
      style={
        fade
          ? {
              maskImage:
                "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
              WebkitMaskImage:
                "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
            }
          : undefined
      }
    >
      <div
        className={cn("marquee-track", reverse && "marquee-track-reverse")}
        style={{ ["--marquee-duration" as string]: `${duration}s` }}
      >
        <div className="flex shrink-0 items-center">{items}</div>
        <div className="flex shrink-0 items-center" aria-hidden>
          {items}
        </div>
      </div>
    </div>
  );
}

/**
 * The standard band: oversized display text with a diamond between each
 * phrase. Used as a section divider and at the foot of the hero.
 */
export function MarqueeBand({
  items,
  className,
  duration = 34,
  reverse = false,
  outline = false,
}: {
  items: string[];
  className?: string;
  duration?: number;
  reverse?: boolean;
  /** Renders the words hollow — quieter, for stacking two bands. */
  outline?: boolean;
}) {
  return (
    <Marquee duration={duration} reverse={reverse} className={className}>
      {items.map((item, i) => (
        <span key={`${item}-${i}`} className="flex shrink-0 items-center">
          <span
            className={cn(
              "font-display text-d2 whitespace-nowrap uppercase",
              outline ? "text-outline" : "text-bone/85"
            )}
          >
            {item}
          </span>
          <span className="mx-6 text-ember sm:mx-9" aria-hidden>
            ◆
          </span>
        </span>
      ))}
    </Marquee>
  );
}
