import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { REVIEWS, BEAT_FAQS } from "@/lib/mock-data";
import { getAllBeats, getBeatBySlug } from "@/lib/beats-repo";
import { AudioPlayer } from "@/components/beats/audio-player";
import { LicenseTable } from "@/components/beats/license-table";
import { ExclusiveLicenseDialog } from "@/components/beats/exclusive-license-dialog";
import { BeatReviews } from "@/components/beats/beat-reviews";
import { FavoriteButton } from "@/components/beats/favorite-button";
import { BeatCard } from "@/components/beats/beat-card";
import { SectionHeading, Kicker } from "@/components/shared/section-heading";
import { FilmFrame } from "@/components/shared/film-frame";
import { HudFrame } from "@/components/visuals/hud-frame";
import { MarqueeBand } from "@/components/shared/marquee";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { formatDuration, formatPrice } from "@/lib/format";
import { LICENSE_TIERS, priceForLicense } from "@/lib/licensing";
import { Reveal, RevealGroup, RevealItem, SplitWords } from "@/components/shared/reveal";
import { cn } from "@/lib/utils";

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const beats = await getAllBeats();
  return beats.map((beat) => ({ slug: beat.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const beat = await getBeatBySlug(slug);
  if (!beat) return {};

  return {
    title: beat.title,
    description: beat.description,
    openGraph: {
      title: beat.title,
      description: beat.description,
      images: [{ url: beat.artworkUrl }],
    },
  };
}

export default async function BeatPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const beat = await getBeatBySlug(slug);
  if (!beat) notFound();

  const reviews = REVIEWS.filter((r) => r.beatId === beat.id);
  const allBeats = await getAllBeats();
  const recommended = allBeats
    .filter((b) => b.id !== beat.id && (b.genre === beat.genre || b.featured))
    .slice(0, 4);

  // The end-credits spec sheet. Values only — BPM, key, and timecode read as
  // themselves, so labelling each one would just double the word count.
  const spec = [
    beat.genre,
    `${beat.bpm} BPM`,
    `${beat.key} ${beat.keyMode}`,
    formatDuration(beat.durationSeconds),
    `${beat.plays.toLocaleString()} Plays`,
  ];

  // Readouts for the two instrument panels below. Both are computed from the
  // same config the licence table renders, so the header can never quote a
  // tier count or an entry price the table disagrees with.
  const availableTiers = LICENSE_TIERS.filter((tier) =>
    beat.licenseAvailability.includes(tier.id)
  );
  const fromPrice = availableTiers.length
    ? Math.min(...availableTiers.map((tier) => priceForLicense(tier.id)))
    : beat.basePrice;

  return (
    <div className="bg-ink">
      {/* ── Title card ─────────────────────────────────────────────── */}
      <header className="relative">
        <FilmFrame
          src={beat.artworkUrl}
          alt={beat.title}
          eager
          intensity={0.12}
          grade="soft"
          // Cover art is whatever the artist uploaded — neon, stage wash,
          // RGB studio light. Desaturation alone leaves those fighting the
          // brand, so the hue is forced to ember instead; the soft grade
          // then keeps the luminance the duotone is riding on.
          duotone
          wash={false}
          sizes="100vw"
          objectPosition="center 45%"
          className="letterbox w-full"
        >
          {/* Foot of black so the title has something to sit on, plus a
              single red key light raking in from the left. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/10"
          />
          <div
            aria-hidden
            className="spotlight pointer-events-none absolute -left-56 top-1/4 size-[40rem] opacity-70"
          />

          {/* Height comes from the content, not a fixed vh: at `d0` a
              three-word title wraps to two lines on a short laptop, and a
              hard `h-[68vh]` cropped it against the frame's overflow. */}
          <div className="relative z-10 mx-auto flex min-h-[62vh] max-w-[1600px] flex-col justify-end px-5 pb-14 pt-28 sm:min-h-[74vh] sm:px-8 lg:px-14 lg:pb-20">
            <div className="flex flex-wrap items-center gap-2">
              {beat.isNew && <Badge variant="metaHot">New</Badge>}
              <Badge variant="meta">{beat.genre}</Badge>
            </div>

            {/* The page's one neon moment — the title lit like a sign, not
                every heading glowing. */}
            <h1 className="neon-text mt-6 font-display text-d0 uppercase">
              <SplitWords text={beat.title} />
            </h1>

            <div aria-hidden className="hairline mt-8 w-full max-w-lg" />

            <ul className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 sm:gap-x-4">
              {spec.map((item, i) => (
                <li key={`${item}-${i}`} className="flex items-center gap-3 sm:gap-4">
                  {i > 0 && <span aria-hidden className="h-3 w-px bg-bone/25" />}
                  <span className="u-meta text-bone/75">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </FilmFrame>
      </header>

      {/* ── 01 · The track ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1600px] px-5 pb-20 pt-16 sm:px-8 lg:px-14 lg:pt-24">
        <div className="grid grid-cols-1 gap-x-16 gap-y-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)]">
          <Reveal>
            <Kicker chapter="01">The Track</Kicker>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-bone/85 sm:text-xl">
              {beat.description}
            </p>
            <div className="mt-10 flex flex-wrap gap-2">
              {beat.mood.map((mood) => (
                <Badge key={mood} variant="meta">
                  {mood}
                </Badge>
              ))}
            </div>
          </Reveal>

          {/* Transport rides along with the licence table as you scroll — you
              should never have to hunt back up the page to hear it again. */}
          <Reveal variant="fade" className="lg:sticky lg:top-32 lg:self-start">
            {/*
              The deck: cover art under instrument housing, with the track's
              real spec read out along the top edge. Held back until `lg`
              because below that the title card is still a screen away and a
              second pass of the same artwork would just be an echo.
            */}
            <HudFrame
              live
              label="Signal"
              // Split across the housing rather than crammed into one line:
              // at the narrow end of `lg` this column is ~310px, and genres
              // here run as long as "R&B / Trap Soul", so a single strip of
              // all four values would wrap back over the artwork.
              readout={`${beat.bpm} BPM · ${beat.key} ${beat.keyMode}`}
              className="mb-8 hidden lg:block"
            >
              <FilmFrame
                src={beat.artworkUrl}
                alt=""
                // Same grade as the title card so the two reads of this
                // artwork are unmistakably the same object.
                intensity={0}
                grade="soft"
                duotone
                wash={false}
                sizes="(min-width: 1600px) 520px, 34vw"
                className="aspect-[4/3] w-full"
              >
                {/* On-screen display along the foot of the monitor. */}
                <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-bone/12 bg-ink/70 px-3 py-2">
                  <span className="u-meta text-bone/75">{beat.genre}</span>
                  <span aria-hidden className="h-2.5 w-px bg-bone/25" />
                  <span className="u-meta text-bone/75">
                    {formatDuration(beat.durationSeconds)}
                  </span>
                </div>
              </FilmFrame>
            </HudFrame>

            <AudioPlayer
              beatId={beat.id}
              src={beat.previewAudioUrl}
              label="Preview"
              durationSeconds={beat.durationSeconds}
              // Feeds the docked NowPlayingBar, so the preview keeps its
              // identity (and a way back here) after you navigate away.
              track={{
                title: beat.title,
                subtitle: `${beat.genre} · ${beat.bpm} BPM`,
                artworkUrl: beat.artworkUrl,
                href: `/beats/${beat.slug}`,
              }}
            />
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {/*
                Only offered when the exclusive tier isn't for sale on this
                beat (no stems uploaded). Showing "enquire about exclusive
                rights" next to a $140 "Add to cart" for the same thing reads
                as a contradiction and talks a ready buyer out of checking out.
              */}
              {!beat.licenseAvailability.includes("exclusive") && (
                <ExclusiveLicenseDialog beatTitle={beat.title} />
              )}
              <FavoriteButton
                beatId={beat.id}
                className="size-12 rounded-none border-bone/20 bg-transparent"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 02 · Licensing ─────────────────────────────────────────── */}
      <section className="seam-top relative">
        <div className="mx-auto max-w-[1600px] px-5 py-24 sm:px-8 lg:px-14 lg:py-32">
          <Reveal>
            <SectionHeading
              chapter="02"
              eyebrow="Licensing"
              title={
                <>
                  Choose Your <span className="text-gradient-ember">License</span>
                </>
              }
            />
          </Reveal>
          {/* The comparison grid is the page's other instrument, so it gets
              the same housing as the deck — brackets, and a header that
              states what is actually on offer. */}
          <Reveal delay={0.1} className="mt-14">
            <HudFrame
              label="Rights"
              readout={`${availableTiers.length} Tiers · From ${formatPrice(fromPrice)}`}
              className="bg-charcoal/30"
            >
              <LicenseTable beat={beat} />
            </HudFrame>
          </Reveal>
        </div>
      </section>

      <div aria-hidden>
        <div className="hairline-dim" />
        <MarqueeBand
          items={[beat.genre, `${beat.bpm} BPM`, `${beat.key} ${beat.keyMode}`, ...beat.mood]}
          duration={44}
          outline
          className="py-7"
        />
        <div className="hairline-dim" />
      </div>

      {/* ── 03 · Keep browsing ─────────────────────────────────────── */}
      {recommended.length > 0 && (
        <section className="mx-auto max-w-[1600px] px-5 py-20 sm:px-8 lg:px-14 lg:py-28">
          <Reveal>
            <SectionHeading chapter="03" eyebrow="Keep Browsing" title="More Like This" />
          </Reveal>
          <RevealGroup className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {recommended.map((r, i) => (
              // Alternating drop breaks the four-in-a-row template rhythm.
              <RevealItem key={r.id} className={cn("h-full", i % 2 === 1 && "lg:mt-14")}>
                <BeatCard beat={r} />
              </RevealItem>
            ))}
          </RevealGroup>
        </section>
      )}

      {/* ── 04 · Small print ───────────────────────────────────────── */}
      <section className="seam-top relative">
        <div className="mx-auto max-w-[1600px] px-5 pb-32 pt-24 sm:px-8 lg:px-14">
          <div className="grid grid-cols-1 gap-x-16 gap-y-20 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
            <Reveal>
              <SectionHeading chapter="04" eyebrow="Questions" title="FAQ" />
              <Accordion className="mt-10">
                {BEAT_FAQS.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border-bone/10">
                    <AccordionTrigger className="items-center gap-4 py-6 text-base font-normal text-bone hover:text-ember hover:no-underline sm:gap-6">
                      <span aria-hidden className="u-meta shrink-0 tabular-nums text-bone/25">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="flex-1">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-8 text-base leading-relaxed text-smoke">
                      <p className="max-w-xl sm:pl-12">{faq.answer}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Reveal>

            <Reveal delay={0.08}>
              <SectionHeading chapter="05" eyebrow="Feedback" title="Reviews" />
              <div className="mt-10">
                <BeatReviews reviews={reviews} />
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}
