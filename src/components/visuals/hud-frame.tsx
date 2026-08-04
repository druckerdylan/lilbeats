"use client";

import { cn } from "@/lib/utils";

/**
 * Instrumentation housing: a hairline panel with targeting brackets at the
 * corners and optional readouts along the top edge.
 *
 * Used to frame anything that should read as a monitored feed rather than
 * a web card — the hero visualiser, artwork, before/after players.
 */
export function HudFrame({
  children,
  className,
  label,
  readout,
  live = false,
}: {
  children: React.ReactNode;
  className?: string;
  /** Left-hand caption, e.g. "SIGNAL / SPECTRUM". */
  label?: string;
  /** Right-hand value, e.g. a BPM or status string. */
  readout?: string;
  /** Renders a pulsing dot next to the label. */
  live?: boolean;
}) {
  return (
    <div className={cn("hud-corners relative border border-bone/12", className)}>
      {(label || readout) && (
        <div className="pointer-events-none absolute inset-x-0 -top-6 flex items-center justify-between gap-4">
          {label && (
            <span className="u-meta flex items-center gap-2 text-smoke">
              {live && (
                <span className="relative flex size-1.5">
                  <span className="animate-pulse-glow absolute inset-0 rounded-full bg-ember-bright" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-ember-bright" />
                </span>
              )}
              {label}
            </span>
          )}
          {readout && <span className="u-meta text-smoke/70">{readout}</span>}
        </div>
      )}
      {children}
    </div>
  );
}
