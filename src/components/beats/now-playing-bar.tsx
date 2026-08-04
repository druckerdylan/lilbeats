"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Pause, Play, X } from "lucide-react";
import { useAudioPlayerStore } from "@/lib/store/player-store";
import { EqBars } from "@/components/shared/eq-bars";
import { formatDuration } from "@/lib/format";

/**
 * Persistent transport docked to the bottom of the viewport whenever a beat
 * is playing — the site's audio keeps running across route changes, so the
 * controls should too. Only appears for sources that supplied track
 * metadata (beat cards and beat pages), not for the mixing page's raw
 * before/after comparison players.
 */
export function NowPlayingBar() {
  const track = useAudioPlayerStore((s) => s.currentTrack);
  const beatId = useAudioPlayerStore((s) => s.currentBeatId);
  const isPlaying = useAudioPlayerStore((s) => s.isPlaying);
  const currentTime = useAudioPlayerStore((s) => s.currentTime);
  const duration = useAudioPlayerStore((s) => s.duration);
  const playPause = useAudioPlayerStore((s) => s.playPause);
  const seek = useAudioPlayerStore((s) => s.seek);
  const stop = useAudioPlayerStore((s) => s.stop);
  const reduced = useReducedMotion();

  const open = Boolean(track && beatId);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <AnimatePresence>
      {open && track && (
        <motion.div
          initial={reduced ? false : { y: "110%" }}
          animate={{ y: 0 }}
          exit={reduced ? undefined : { y: "110%" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-x-0 bottom-0 z-50 border-t border-ember/25 glass"
          role="region"
          aria-label="Now playing"
        >
          {/* Scrub bar doubles as the progress readout. */}
          <button
            type="button"
            aria-label="Seek within preview"
            onClick={(e) => {
              if (duration <= 0) return;
              const rect = e.currentTarget.getBoundingClientRect();
              seek(((e.clientX - rect.left) / rect.width) * duration);
            }}
            className="group absolute -top-1 inset-x-0 h-3 cursor-pointer"
          >
            <span className="absolute inset-x-0 top-1 block h-px bg-bone/10" />
            <span
              className="absolute top-1 left-0 block h-px bg-ember transition-[width] duration-150 group-hover:h-[3px] group-hover:-translate-y-px"
              style={{ width: `${progress}%` }}
            />
          </button>

          <div className="mx-auto flex max-w-[1600px] items-center gap-4 px-4 py-3 sm:px-8">
            <button
              type="button"
              onClick={playPause}
              aria-label={isPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-ember text-primary-foreground transition-transform hover:scale-105"
            >
              {isPlaying ? <Pause className="size-4" /> : <Play className="ml-0.5 size-4" />}
            </button>

            {track.artworkUrl && (
              <div className="relative hidden size-10 shrink-0 overflow-hidden sm:block">
                <Image
                  src={track.artworkUrl}
                  alt=""
                  fill
                  sizes="40px"
                  className="object-cover grade-cinema-soft"
                />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <EqBars className="text-ember" playing={isPlaying} bars={4} />
                {track.href ? (
                  <Link
                    href={track.href}
                    className="truncate font-display text-lg uppercase tracking-wide text-bone transition-colors hover:text-ember"
                  >
                    {track.title}
                  </Link>
                ) : (
                  <span className="truncate font-display text-lg uppercase tracking-wide text-bone">
                    {track.title}
                  </span>
                )}
              </div>
              {track.subtitle && (
                <p className="u-meta mt-0.5 truncate text-smoke">{track.subtitle}</p>
              )}
            </div>

            <p className="u-meta hidden shrink-0 tabular-nums text-smoke sm:block">
              {formatDuration(currentTime)} / {formatDuration(duration)}
            </p>

            <button
              type="button"
              onClick={stop}
              aria-label="Close player"
              className="flex size-8 shrink-0 items-center justify-center text-smoke transition-colors hover:text-bone"
            >
              <X className="size-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
