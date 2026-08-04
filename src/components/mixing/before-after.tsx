"use client";

import { AudioPlayer } from "@/components/beats/audio-player";
import { SectionHeading } from "@/components/shared/section-heading";
import { HudFrame } from "@/components/visuals/hud-frame";
import { BEFORE_AFTER_EXAMPLES } from "@/lib/mock-data";
import { useAudioPlayerStore } from "@/lib/store/player-store";
import { Reveal } from "@/components/shared/reveal";

/**
 * Bebas Neue carries no arrow glyph, so a bare "→" inside a display heading
 * silently drops to the metric-matched fallback and reads as a second
 * typeface mid-line. Setting it deliberately in the body face, smaller and
 * dimmer, turns the accident into a considered separator.
 */
function ArrowTitle({ title }: { title: string }) {
  const parts = title.split("→").map((part) => part.trim());

  return (
    <>
      {parts.map((part, i) => (
        <span key={i}>
          {i > 0 && (
            <span className="mx-2.5 font-sans text-[0.5em] font-light text-bone/35">→</span>
          )}
          {part}
        </span>
      ))}
    </>
  );
}

/**
 * The A/B rig. Each example is two monitored channels in identical housings:
 * CH A carries the raw source, CH B the delivered master, and B is the only
 * one that glows — the section's whole argument, stated by the hardware.
 *
 * This is a client component on purpose. It subscribes to the shared player
 * so a channel's live indicator lights when *that* channel is the one
 * playing; a hard-coded dot would be decoration, and the HUD readouts are
 * only worth having if they are true. It deliberately does not subscribe to
 * `currentTime` — that ticks continuously and would re-render the section
 * many times a second for nothing.
 */
export function BeforeAfter() {
  const currentBeatId = useAudioPlayerStore((s) => s.currentBeatId);
  const isPlaying = useAudioPlayerStore((s) => s.isPlaying);
  const liveId = isPlaying ? currentBeatId : null;

  return (
    <section className="relative mx-auto max-w-[1600px] px-5 py-28 sm:px-8 lg:px-14 lg:py-40">
      <Reveal>
        <SectionHeading
          chapter="02"
          eyebrow="Hear The Difference"
          title={
            <>
              Raw In. <span className="text-gradient-ember">Finished</span> Out.
            </>
          }
          description="Two sessions, before and after. Play them back to back — the same performance, rebuilt until it holds its own next to a release."
        />
      </Reveal>

      <div className="mt-16 space-y-16 lg:mt-24 lg:space-y-28">
        {BEFORE_AFTER_EXAMPLES.map((example, index) => {
          const rawId = `${example.id}-before`;
          const masterId = `${example.id}-after`;

          return (
            <Reveal key={example.id} delay={index * 0.06}>
              <article>
                <div className="hairline-dim" aria-hidden />

                {/* The gap between the slate and the pair is deliberately wider
                    than the gap inside the pair, so A and B read as one unit
                    once the columns stack on a phone. */}
                <div className="mt-9 grid gap-11 lg:grid-cols-12 lg:gap-14">
                  <header className="lg:col-span-4">
                    <p className="u-meta text-smoke">
                      <span className="text-bone/35 tabular-nums">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="mx-3 text-bone/20" aria-hidden>
                        /
                      </span>
                      {example.genre}
                    </p>
                    <h3 className="mt-5 font-display text-d3 uppercase text-balance text-bone">
                      <ArrowTitle title={example.title} />
                    </h3>
                    <p className="mt-5 max-w-xl text-base leading-relaxed text-smoke">
                      {example.description}
                    </p>
                  </header>

                  {/* Row gap stays tight and each housing carries its own top
                      margin: the HUD labels hang above their frames, so the
                      clearance has to belong to the frame, not the grid. */}
                  <div className="grid gap-y-6 md:grid-cols-2 md:gap-x-8 lg:col-span-8 lg:gap-x-12">
                    <div className="min-w-0" role="group" aria-label={`${example.title} — raw mix`}>
                      <HudFrame
                        label="CH A · Raw"
                        readout="Unprocessed"
                        live={liveId === rawId}
                        className="mt-8 p-3 sm:p-4"
                      >
                        <AudioPlayer beatId={rawId} src={example.beforeAudioUrl} />
                      </HudFrame>
                    </div>

                    <div
                      className="min-w-0"
                      role="group"
                      aria-label={`${example.title} — final master`}
                    >
                      <HudFrame
                        label="CH B · Mastered"
                        readout="Delivered"
                        live={liveId === masterId}
                        className="neon-edge mt-8 border-ember/25 p-3 sm:p-4"
                      >
                        <AudioPlayer beatId={masterId} src={example.afterAudioUrl} />
                      </HudFrame>
                    </div>
                  </div>
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
