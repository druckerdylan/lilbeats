"use client";

import { useAudioPlayerStore } from "@/lib/store/player-store";
import { SpectrumCity } from "@/components/visuals/spectrum-city";

/**
 * The hero's spectrum, reused as a fixed backdrop for the catalogue.
 *
 * Pinned to the viewport rather than the document so it stays visible while
 * scrolling a long grid — the point is to see the beat you're previewing
 * react, which a backdrop that scrolls away cannot do.
 *
 * It sits well behind the cards and lifts only while something is playing:
 * at full strength it competes with 25 pieces of artwork, and when nothing
 * is playing there is nothing to look at.
 */
export function CatalogSpectrum() {
  const isPlaying = useAudioPlayerStore((s) => s.isPlaying);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 bottom-0 top-[45vh] z-0"
    >
      <div
        className="size-full transition-opacity duration-1000 ease-out"
        style={{
          opacity: isPlaying ? 0.4 : 0.12,
          // Fades into the page rather than ending on a hard edge.
          maskImage: "linear-gradient(180deg, transparent, black 45%)",
          WebkitMaskImage: "linear-gradient(180deg, transparent, black 45%)",
        }}
      >
        <SpectrumCity />
      </div>
    </div>
  );
}
