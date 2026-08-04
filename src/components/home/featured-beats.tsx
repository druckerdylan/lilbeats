import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAllBeats } from "@/lib/beats-repo";
import { BeatCard } from "@/components/beats/beat-card";
import { SectionHeading, Kicker } from "@/components/shared/section-heading";
import { GlitchText } from "@/components/visuals/glitch-text";
import { Button } from "@/components/ui/button";
import { Reveal, RevealGroup, RevealItem } from "@/components/shared/reveal";

export async function FeaturedBeats() {
  const beats = await getAllBeats();
  const featured = beats.filter((b) => b.featured).slice(0, 4);
  const [lead, ...rest] = featured;
  const genreCount = new Set(beats.map((b) => b.genre)).size;

  return (
    <section className="relative overflow-hidden py-28 sm:py-32 lg:py-40">
      {/* One pool of key light behind the lead tile — the only red in the
          section besides the accented word and the CTAs. */}
      <div
        aria-hidden
        className="spotlight pointer-events-none absolute -top-24 left-0 h-[38rem] w-[38rem] opacity-60"
      />

      <div className="relative mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-14">
        <Reveal>
          <SectionHeading
            chapter="01"
            eyebrow="The Catalog"
            size="lg"
            title={
              <>
                Beats That <span className="text-gradient-ember">Hit</span>
              </>
            }
            description="Hand-picked instrumentals from the current catalog — dark, cinematic, and ready to license instantly."
          />
        </Reveal>

        {/* The seam becomes a measuring scale with a count on it: same single
            line as before, now reading as an instrument rather than a border. */}
        <Reveal delay={0.15} variant="fade" className="mt-14">
          <div className="flex items-center gap-4">
            <div aria-hidden className="hud-ticks w-20 shrink-0 opacity-70 sm:w-28" />
            <div aria-hidden className="hairline flex-1" />
            <span className="u-meta shrink-0 tabular-nums text-smoke/70">
              Showing {String(featured.length).padStart(2, "0")} / {beats.length}
            </span>
          </div>
        </Reveal>

        {/* Deliberately unequal: one full-height editorial tile holding two
            columns and two rows, the rest orbiting it. */}
        <RevealGroup
          stagger={0.1}
          className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {lead && (
            <RevealItem className="sm:col-span-2 lg:row-span-2">
              <BeatCard beat={lead} variant="feature" />
            </RevealItem>
          )}

          {rest.map((beat) => (
            <RevealItem key={beat.id}>
              <BeatCard beat={beat} />
            </RevealItem>
          ))}

          {/* Terminal cell: the grid runs out of featured beats here, so the
              hole becomes the way out to the full catalogue — an index panel
              with the catalogue's real counters on it. */}
          <RevealItem className="min-h-[16rem]">
            <div className="hud-corners relative flex h-full flex-col justify-between gap-8 border border-bone/10 bg-pitch/60 p-7 transition-colors duration-300 hover:border-ember/35">
              <div className="flex items-start justify-between gap-4">
                <Kicker tone="smoke">Keep Digging</Kicker>
                <span className="u-meta shrink-0 tabular-nums text-smoke/60">
                  {genreCount} Genres
                </span>
              </div>
              <div>
                <p className="font-display text-d3 uppercase text-bone">
                  <GlitchText text={`${beats.length} Beats`} className="block" />
                  In Rotation
                </p>
                <div className="mt-7">
                  <Button variant="cinemaGhost" size="cinemaSm" render={<Link href="/beats" />}>
                    View all beats
                    <ArrowRight />
                  </Button>
                </div>
              </div>
            </div>
          </RevealItem>
        </RevealGroup>
      </div>
    </section>
  );
}
