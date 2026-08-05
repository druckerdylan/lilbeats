import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FilmFrame } from "@/components/shared/film-frame";
import { Kicker } from "@/components/shared/section-heading";
import { Reveal, SplitWords } from "@/components/shared/reveal";
import { GlitchText } from "@/components/visuals/glitch-text";
import { SERVICE_TIERS } from "@/lib/services";
import { formatPrice } from "@/lib/format";
import { unsplash } from "@/lib/unsplash";

/*
  The slate under the headline reads straight off `services.ts` so the hero
  can never drift from the pricing table further down the page.
*/
const FEATURED = SERVICE_TIERS.find((tier) => tier.highlighted) ?? SERVICE_TIERS[0];
const ENTRY = SERVICE_TIERS.reduce(
  (cheapest, tier) => (tier.price < cheapest.price ? tier : cheapest),
  SERVICE_TIERS[0]
);

const SLATE = [
  { label: "Turnaround", value: FEATURED.turnaround },
  { label: "From", value: `${formatPrice(ENTRY.price)} ${ENTRY.unit}` },
  { label: "Delivery", value: "WAV + MP3" },
];

export function MixingHero() {
  return (
    <section className="relative isolate bg-ink">
      <FilmFrame
        src={unsplash("1519892300165-cb5542fb47c7", "w=2400&q=80&fit=crop&auto=format")}
        alt=""
        eager
        kenBurns
        intensity={0.2}
        sizes="100vw"
        objectPosition="center 42%"
        className="letterbox flex min-h-[78vh] items-end sm:min-h-[86vh]"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/5"
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-0 scanlines opacity-25" aria-hidden />

        <div className="relative z-30 mx-auto w-full max-w-[1600px] px-5 pt-32 pb-16 sm:px-8 lg:px-14 lg:pb-24">
          <Reveal variant="fade" duration={0.7}>
            <Kicker>
              <GlitchText text="Mixing & Mastering" trigger="view" />
            </Kicker>
          </Reveal>

          <h1 className="mt-8 font-display text-d0 uppercase text-bone">
            <span className="block">
              <SplitWords text="Records That Sound" />
            </span>
            {/* The page's one neon moment: the payoff word burns, the rest of
                the title stays bone. The neon treatment paints via
                background-clip, so it has to sit on the word span itself. */}
            <span className="block">
              <SplitWords
                text="Finished"
                delay={0.16}
                wordClassName="neon-text-hot"
              />
            </span>
          </h1>

          <Reveal variant="rise" delay={0.35} className="mt-9 max-w-xl">
            <p className="text-base leading-relaxed text-smoke sm:text-lg">
              Send your stems, get back a record engineered to sit next to anything on the
              charts — balanced, loud without distortion, and built to translate on every
              system.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button
                variant="cinema"
                size="cinema"
                render={<Link href="/mixing-mastering/request" />}
              >
                Book The Session
              </Button>
              <Button variant="cinemaGhost" size="cinema" render={<Link href="#pricing" />}>
                See Pricing
              </Button>
            </div>
          </Reveal>

          <Reveal variant="fade" delay={0.5} className="mt-14">
            {/* Measuring scale rather than a plain rule — the same tick strip
                that sits under the home hero's credits. */}
            <div className="hud-ticks opacity-40" aria-hidden />
            <dl className="mt-7 flex flex-col gap-7 sm:flex-row sm:gap-14">
              {SLATE.map((item) => (
                <div key={item.label}>
                  <dt className="u-meta text-smoke">{item.label}</dt>
                  <dd className="mt-2.5 font-display text-d3 uppercase text-bone">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </FilmFrame>
    </section>
  );
}
