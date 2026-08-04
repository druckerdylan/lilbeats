import { cn } from "@/lib/utils";

/**
 * Decorative level meter. Purely CSS — it is not driven by the audio
 * signal, it just signals "this is the track that's playing." Hidden from
 * assistive tech since the play/pause control already announces state.
 */
export function EqBars({
  className,
  bars = 4,
  playing = true,
}: {
  className?: string;
  bars?: number;
  playing?: boolean;
}) {
  // Staggered delays and heights keep the bars from marching in lockstep.
  const delays = [0, 0.32, 0.14, 0.46, 0.22, 0.38];
  const heights = [0.7, 1, 0.55, 0.85, 0.65, 0.95];

  return (
    <span
      aria-hidden
      className={cn("flex h-3.5 items-end gap-[2px]", className)}
    >
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className={cn("w-[2px] bg-current", playing && "eq-bar")}
          style={{
            height: `${heights[i % heights.length] * 100}%`,
            animationDelay: `${delays[i % delays.length]}s`,
            transform: playing ? undefined : "scaleY(0.3)",
          }}
        />
      ))}
    </span>
  );
}
