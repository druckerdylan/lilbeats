import type { Metadata } from "next";
import { PORTFOLIO_ITEMS } from "@/lib/mock-data";
import {
  PLATFORM_META,
  PlatformLink,
  PortfolioCard,
  coverNeedsDuotone,
} from "@/components/portfolio/portfolio-card";
import { AudioPlayer } from "@/components/beats/audio-player";
import { BeforeAfter } from "@/components/mixing/before-after";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Kicker, SectionHeading } from "@/components/shared/section-heading";
import { FilmFrame } from "@/components/shared/film-frame";
import { MarqueeBand } from "@/components/shared/marquee";
import { Badge } from "@/components/ui/badge";
import { FinalCta } from "@/components/home/final-cta";
import { GlitchText } from "@/components/visuals/glitch-text";
import { Reveal, RevealGroup, RevealItem, SplitWords } from "@/components/shared/reveal";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Production, mixing, and mastering work from Lil Beats — real releases across Spotify, Apple Music, YouTube, and SoundCloud.",
};

const YEARS = PORTFOLIO_ITEMS.map((item) => item.year);
const YEAR_RANGE = `${Math.min(...YEARS)}—${Math.max(...YEARS)}`;
const RELEASE_COUNT = String(PORTFOLIO_ITEMS.length).padStart(2, "0");
const PLATFORMS = Array.from(new Set(PORTFOLIO_ITEMS.map((item) => item.platform))).map(
  (platform) => PLATFORM_META[platform]
);
/** Artist names for the credit roll between the feature and the wall. */
const CREDIT_ROLL = Array.from(new Set(PORTFOLIO_ITEMS.map((item) => item.artist)));

/**
 * Column spans for the wall, cycled by index. The unit is two rows — a 7/5
 * split followed by three squares — so the grid never settles into the
 * uniform 3-up that made every release look equally important.
 *
 * Below `lg` the spans are inert and the wall is a plain 2-up (1-up on a
 * phone), so the cover ratios have to stand on their own there too: nothing
 * taller than 4/3, or a stacked phone column turns into a mile of artwork.
 */
const SLOTS = [
  {
    span: "lg:col-span-7",
    cover: "aspect-[16/10]",
    sizes: "(min-width: 1024px) 54vw, (min-width: 640px) 48vw, 100vw",
  },
  {
    span: "lg:col-span-5",
    cover: "aspect-[4/3]",
    sizes: "(min-width: 1024px) 38vw, (min-width: 640px) 48vw, 100vw",
  },
  {
    span: "lg:col-span-4",
    cover: "aspect-[4/3] lg:aspect-square",
    sizes: "(min-width: 1024px) 30vw, (min-width: 640px) 48vw, 100vw",
  },
  {
    span: "lg:col-span-4",
    cover: "aspect-[4/3] lg:aspect-square",
    sizes: "(min-width: 1024px) 30vw, (min-width: 640px) 48vw, 100vw",
  },
  {
    span: "lg:col-span-4",
    cover: "aspect-[4/3] lg:aspect-square",
    sizes: "(min-width: 1024px) 30vw, (min-width: 640px) 48vw, 100vw",
  },
] as const;

export default function PortfolioPage() {
  const [feature, ...rest] = PORTFOLIO_ITEMS;

  /*
    With no releases the page would destructure `undefined` and the derived
    stats above would read "Infinity—-Infinity", so it gets an honest holding
    state instead. This is the launch state until real, cleared credits exist.
  */
  if (!feature) {
    return (
      <section className="relative isolate flex min-h-[70vh] flex-col items-center justify-center overflow-hidden px-5 py-28 text-center sm:px-8">
        <div
          aria-hidden
          className="spotlight pointer-events-none absolute top-1/4 left-1/2 -z-10 size-[620px] max-w-full -translate-x-1/2 opacity-60"
        />
        <Kicker className="mb-8">Portfolio</Kicker>
        <h1 className="font-display text-d1 uppercase text-bone">Credits Coming Soon</h1>
        <p className="mt-6 max-w-md text-base leading-relaxed text-smoke">
          Released work will be listed here as it clears. In the meantime the
          catalogue is the best place to hear what the productions sound like.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button variant="cinema" size="cinema" render={<Link href="/beats" />}>
            Browse Beats
          </Button>
          <Button variant="cinemaGhost" size="cinema" render={<Link href="/contact" />}>
            Get In Touch
          </Button>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* ── Title card ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="spotlight pointer-events-none absolute -top-64 left-[6%] size-[680px] opacity-70"
        />

        <div className="relative mx-auto max-w-[1600px] px-5 pt-24 sm:px-8 lg:px-14 lg:pt-36">
          <Reveal variant="fade">
            <Kicker>Portfolio — Selected Credits</Kicker>
          </Reveal>

          {/*
            The page's one neon moment, and its one cold element: "Selected"
            carries the red/cyan fringe of a mistracking monitor, "Work"
            carries the tube glow. Both are display type at 200px, which is
            the only size `aberrate` is legible at — it is never allowed near
            body copy.
          */}
          <h1 className="mt-7 font-display text-d0 uppercase text-bone">
            <SplitWords text="Selected" delay={0.08} className="aberrate" />{" "}
            <SplitWords
              text="Work"
              delay={0.2}
              wordClassName="neon-text-hot"
            />
          </h1>

          <Reveal delay={0.18}>
            <p className="mt-9 max-w-xl text-base leading-relaxed text-smoke sm:text-lg">
              A cross-section of beats produced and records mixed &amp; mastered for independent
              artists — original production and client work side by side.
            </p>
          </Reveal>

          {/* A measuring scale rather than a rule — the stat rail below it is
              a readout, so the thing it hangs from should look like part of
              the instrument. */}
          <div className="mt-14 hud-ticks opacity-40" aria-hidden />

          {/* End-credit stat rail: 11px mono label over a display-face value,
              the same anatomy as the catalogue rail on /beats. The platform
              list is the one variable-length value here, so it takes its own
              row on a phone instead of wrapping mid-string beside the rest. */}
          <Reveal variant="fade" delay={0.1}>
            <dl className="flex flex-wrap gap-x-12 gap-y-8 py-9 sm:gap-x-16 lg:py-11">
              <div>
                <dt className="u-meta text-smoke">Releases</dt>
                <dd className="mt-2 font-display text-d3 uppercase leading-none tabular-nums text-bone">
                  {RELEASE_COUNT}
                </dd>
              </div>
              <div>
                <dt className="u-meta text-smoke">Years</dt>
                <dd className="mt-2 font-display text-d3 uppercase leading-none tabular-nums text-bone">
                  {YEAR_RANGE}
                </dd>
              </div>
              <div className="min-w-0 basis-full sm:basis-auto">
                <dt className="u-meta text-smoke">Platforms</dt>
                <dd className="mt-3.5 flex flex-wrap items-center gap-x-5 gap-y-2.5">
                  {PLATFORMS.map(({ label, Icon }) => (
                    <span key={label} className="u-meta flex items-center gap-2.5 text-bone">
                      <Icon className="size-3.5 shrink-0 text-ember" aria-hidden />
                      {label}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>
          </Reveal>
        </div>
      </section>

      {/* ── Featured release: full-bleed still, credits underneath ───── */}
      {feature && (
        <section aria-labelledby="featured-release" className="relative mt-6">
          <FilmFrame
            src={feature.coverUrl}
            alt={`${feature.title} — ${feature.artist}`}
            sizes="100vw"
            eager
            intensity={0.18}
            // The cover photography is stock and lit nowhere near this
            // palette; the duotone forces its hue to brand red and the
            // heavier ink ramp pulls the highlights down far enough that a
            // near-black page can hold a full-bleed still.
            duotone={coverNeedsDuotone(feature)}
            className="h-[58vh] min-h-[380px] w-full sm:h-[64vh] lg:h-[74vh]"
            overlayClassName="bg-gradient-to-t from-ink via-ink/50 to-ink/25"
          >
            <div className="absolute inset-0 flex items-end">
              <div className="mx-auto w-full max-w-[1600px] px-5 pb-9 sm:px-8 lg:px-14 lg:pb-14">
                <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                  <Kicker>Featured Release</Kicker>
                  <Badge
                    variant="meta"
                    className="h-6 border-bone/25 bg-ink/50 px-2.5 text-bone/90 backdrop-blur-sm"
                  >
                    {feature.year}
                  </Badge>
                </div>
                {/* Release titles decode under the pointer everywhere on the
                    page; the feature is a release, so it does too. The real
                    string stays on `aria-label`, which is what
                    `aria-labelledby` on the section resolves to. */}
                <h2
                  id="featured-release"
                  className="mt-5 max-w-4xl font-display text-d2 uppercase text-balance text-bone text-bloom"
                >
                  <GlitchText text={feature.title} />
                </h2>
                {/* Tokenised rather than one string: the artist and the role
                    together overrun a phone, and this breaks between them
                    instead of orphaning the diamond. */}
                <p className="u-meta mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-smoke">
                  <span>{feature.artist}</span>
                  <span className="text-ember" aria-hidden>
                    ◆
                  </span>
                  <span>{feature.role}</span>
                </p>
              </div>
            </div>
          </FilmFrame>

          <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-14">
            <div className="grid gap-9 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-start lg:gap-20 lg:py-14">
              <Reveal variant="fade">
                <p className="max-w-xl text-base leading-relaxed text-smoke sm:text-lg">
                  {feature.description}
                </p>
              </Reveal>
              <Reveal variant="fade" delay={0.08} className="flex flex-col gap-4">
                <AudioPlayer beatId={feature.id} src={feature.previewAudioUrl} label="Preview" />
                <PlatformLink item={feature} />
              </Reveal>
            </div>
            <div className="hairline-dim" aria-hidden />
          </div>
        </section>
      )}

      {/* Credit roll — the seam between the feature and the wall. */}
      {CREDIT_ROLL.length > 0 && (
        <MarqueeBand items={CREDIT_ROLL} duration={54} outline className="py-9 lg:py-12" />
      )}

      {/* ── The wall ────────────────────────────────────────────────── */}
      {rest.length > 0 && (
        <section className="mx-auto max-w-[1600px] px-5 pt-8 pb-28 sm:px-8 lg:px-14 lg:pt-14 lg:pb-40">
          <Reveal>
            <SectionHeading
              eyebrow="Full Credits"
              title={
                <>
                  Everything <span className="text-gradient-ember">Else</span>
                </>
              }
              description="The rest of the credits — what was produced, what was mixed, and where each record landed."
              className="mb-12 lg:mb-16"
            />
          </Reveal>

          <RevealGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-12 lg:gap-6">
            {rest.map((item, index) => {
              const slot = SLOTS[index % SLOTS.length];
              return (
                <RevealItem key={item.id} className={cn("flex", slot.span)}>
                  <PortfolioCard item={item} coverClassName={slot.cover} sizes={slot.sizes} />
                </RevealItem>
              );
            })}
          </RevealGroup>
        </section>
      )}

      <div className="seam-top">
        <BeforeAfter />
      </div>

      <FinalCta />
    </>
  );
}
