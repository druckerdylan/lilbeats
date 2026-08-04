"use client";

import { Pause, Play } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { EqBars } from "@/components/shared/eq-bars";
import { useAudioPlayerStore, type NowPlayingTrack } from "@/lib/store/player-store";
import { formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Played portion of the scrub ruler. Written inline rather than as a utility
 * because it has to share `hud-ticks`' exact 9px geometry while swapping the
 * tick colour to ember — the two rulers are stacked and must not drift apart.
 */
const EMBER_TICKS =
  "repeating-linear-gradient(90deg, rgba(255,45,71,0.85) 0 1px, transparent 1px 9px)";

/**
 * Inline transport: a hairline housing, mono timecodes, a ticked scrub scale
 * and an ember playhead — the same vocabulary as the docked NowPlayingBar so
 * a preview looks identical wherever it appears. It should read as a piece of
 * rack equipment, not as a web audio widget.
 *
 * Deliberately self-contained and width-agnostic: the beat page, the
 * portfolio cards, and the mixing before/after pairs all drop it into very
 * different containers, so it carries no page-specific layout of its own and
 * no outer chrome that would collide with a caller's own framing.
 *
 * Pass `track` for anything that is a real catalogue item — it is what the
 * docked NowPlayingBar renders once playback survives a route change.
 * Comparison players (before/after mixdowns) deliberately omit it so the
 * bar stays out of the way for them.
 */
export function AudioPlayer({
  beatId,
  src,
  label,
  track,
  durationSeconds,
}: {
  beatId: string;
  src: string;
  label?: string;
  track?: NowPlayingTrack;
  /**
   * Known length of the source, for display only. The store only knows a
   * duration once the element has loaded metadata, so without this an idle
   * transport reads "0:00" where the tape length should be. Callers that
   * don't have the figure simply omit it and get the old behaviour.
   */
  durationSeconds?: number;
}) {
  const currentBeatId = useAudioPlayerStore((s) => s.currentBeatId);
  const isPlaying = useAudioPlayerStore((s) => s.isPlaying);
  const currentTime = useAudioPlayerStore((s) => s.currentTime);
  const duration = useAudioPlayerStore((s) => s.duration);
  const toggle = useAudioPlayerStore((s) => s.toggle);
  const seek = useAudioPlayerStore((s) => s.seek);

  const isActive = currentBeatId === beatId;
  const isLive = isActive && isPlaying;
  // The live figure wins once it exists; the passed-in one is the fallback.
  const displayDuration = isActive && duration > 0 ? duration : (durationSeconds ?? 0);
  const displayTime = isActive ? currentTime : 0;
  const progress =
    displayDuration > 0 ? Math.min(100, (displayTime / displayDuration) * 100) : 0;

  return (
    <div
      className={cn(
        "border border-bone/12 bg-pitch/70 transition-[border-color,box-shadow] duration-300 hover:border-bone/25",
        isActive && "border-ember/35 hover:border-ember/45",
        // The housing itself lights up while the transport is running.
        isLive && "shadow-[0_0_36px_-16px_rgba(255,45,71,0.95)]"
      )}
    >
      <div className="flex items-center gap-4 p-4">
        <button
          type="button"
          onClick={() => toggle(beatId, src, track)}
          aria-label={
            isActive && isPlaying
              ? `Pause ${track?.title ?? "preview"}`
              : `Play ${track?.title ? `${track.title} preview` : "preview"}`
          }
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-ember text-primary-foreground transition-all duration-300 hover:bg-ember-bright hover:shadow-[0_0_30px_-4px_rgba(255,45,71,0.7)]"
        >
          {isActive && isPlaying ? (
            <Pause className="size-4" />
          ) : (
            <Play className="ml-0.5 size-4" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          {(label || isActive) && (
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                {label && <p className="u-meta truncate text-smoke">{label}</p>}
                {isActive && <EqBars playing={isPlaying} className="h-2.5 text-ember" />}
              </div>
              {/* Only the paused state is spelled out: a running meter says
                  "playing" on its own, but a frozen one just looks stalled.
                  A second always-on indicator beside the pause icon would be
                  the same fact stated three times. */}
              {isActive && !isPlaying && (
                <span className="u-meta shrink-0 text-bone/40">Paused</span>
              )}
            </div>
          )}

          <Slider
            min={0}
            max={displayDuration || 1}
            step={0.1}
            value={[displayTime]}
            onValueChange={(value) => {
              const v = Array.isArray(value) ? value[0] : value;
              if (isActive) seek(v);
            }}
            // The stock slider is a rounded app control; this flattens it into
            // a 2px transport line with a square ember playhead.
            className={cn(
              "[&_[data-slot=slider-track]]:h-[2px]! [&_[data-slot=slider-track]]:rounded-none [&_[data-slot=slider-track]]:bg-bone/12 [&_[data-slot=slider-range]]:bg-ember [&_[data-slot=slider-thumb]]:h-3.5 [&_[data-slot=slider-thumb]]:w-[3px] [&_[data-slot=slider-thumb]]:rounded-none [&_[data-slot=slider-thumb]]:border-0 [&_[data-slot=slider-thumb]]:bg-ember-bright",
              isActive &&
                "[&_[data-slot=slider-range]]:shadow-[0_0_12px_rgba(255,45,71,0.6)] [&_[data-slot=slider-thumb]]:shadow-[0_0_12px_rgba(255,45,71,0.9)]"
            )}
          />

          {/* Measuring scale under the transport line: bone ticks for the
              tape, ember ticks for the part that has already run. */}
          <div aria-hidden className="relative mt-2">
            <div className="hud-ticks opacity-30" />
            <div
              className="absolute inset-y-0 left-0 transition-[width] duration-150"
              style={{ width: `${progress}%`, backgroundImage: EMBER_TICKS }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between font-mono text-[10px] tracking-[0.2em] tabular-nums">
            <span className={cn(isActive ? "text-ember" : "text-bone/40")}>
              {formatDuration(displayTime)}
            </span>
            <span className="text-bone/40">{formatDuration(displayDuration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
