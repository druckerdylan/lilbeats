import type { Metadata } from "next";
import Link from "next/link";
import { StarterPackForm } from "@/components/marketing/starter-pack-form";
import { Kicker } from "@/components/shared/section-heading";
import { Reveal, SplitWords } from "@/components/shared/reveal";
import { HudFrame } from "@/components/visuals/hud-frame";
import { STARTER_PACK_SIZE } from "@/lib/starter-pack";

const TITLE = "Free Beat Pack — 5 Dark Trap & Drill Instrumentals";
const DESCRIPTION =
  "Five full-length Lil Beats instrumentals, 320kbps MP3, free. Dark and melodic trap, drill, and phonk — sent straight to your inbox.";

export const metadata: Metadata = {
  title: { absolute: `${TITLE} | Lil Beats` },
  description: DESCRIPTION,
  alternates: { canonical: "/free" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/free",
    type: "website",
  },
};

/**
 * The pack's contents, set as an end-credits spec sheet — the same device
 * /contact uses for its details block. Values only, no marketing adjectives:
 * this page has no testimonials and no download counter to lean on, so the
 * honest numbers are the whole argument.
 */
const SPEC_ROWS: { label: string; value: string }[] = [
  { label: "Tracks", value: `${String(STARTER_PACK_SIZE).padStart(2, "0")} instrumentals` },
  { label: "Format", value: "MP3, 320kbps, full length" },
  { label: "Price", value: "Free" },
  { label: "Delivery", value: "Download links by email" },
];

const LINK =
  "text-ember underline underline-offset-4 decoration-ember/40 transition-colors hover:decoration-ember";

export default function FreeStarterPackPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Key light pooling behind the capture panel — the one thing on the
         page that has to be found first. */}
      <div
        aria-hidden
        className="spotlight pointer-events-none absolute -top-40 right-[-14%] h-[620px] w-[620px] opacity-70"
      />

      <div className="relative mx-auto max-w-[1600px] px-5 py-24 sm:px-8 lg:px-14 lg:py-32">
        <div className="grid gap-16 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-20 xl:gap-28">
          {/* ── Left: the offer ─────────────────────────────────────── */}
          <div>
            <Kicker>Free Download</Kicker>

            {/* The page's single neon moment. `neon-text` sets its own
               colour, so no `text-bone` here — the two would fight over
               `color` depending on which utility was emitted last. */}
            <h1 className="neon-text mt-6 font-display text-d1 uppercase">
              <span className="block">
                <SplitWords text="The Artist" />
              </span>
              <span className="block">
                <SplitWords text="Starter Pack" delay={0.12} />
              </span>
            </h1>

            <p className="mt-8 max-w-md text-base leading-relaxed text-smoke sm:text-lg">
              {STARTER_PACK_SIZE} full-length instrumentals, 320kbps MP3, free. Built for
              artists writing in the dark and melodic trap, drill, and phonk lanes — the
              same rooms the rest of the catalog lives in.
            </p>

            <Reveal variant="fade" delay={0.25} className="mt-16">
              {/* Label + measuring scale, so the contents read as a
                 calibrated spec sheet rather than a feature list. */}
              <div className="flex items-center gap-5">
                <h2 className="u-meta shrink-0 text-smoke">The Pack</h2>
                <span className="hud-ticks flex-1 opacity-60" aria-hidden />
              </div>

              <div className="mt-6">
                {SPEC_ROWS.map((row) => (
                  <div key={row.label}>
                    <div className="hairline-dim" aria-hidden />
                    <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-baseline gap-5 py-4 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-10">
                      <span className="u-meta text-smoke">{row.label}</span>
                      <span className="text-sm text-bone sm:text-base">{row.value}</span>
                    </div>
                  </div>
                ))}
                <div className="hairline-dim" aria-hidden />
              </div>
            </Reveal>

            <Reveal variant="fade" delay={0.35} className="mt-10">
              <p className="max-w-md text-sm leading-relaxed text-smoke">
                These are free demo MP3s to write and try ideas over. Releasing a track
                built on one needs a paid licence —{" "}
                <Link href="/licensing" className={LINK}>
                  see the tiers
                </Link>
                .
              </p>
            </Reveal>
          </div>

          {/* ── Right: the capture ──────────────────────────────────── */}
          {/*
            `pt-7` is load-bearing: `wipe` settles on `clip-path: inset(0)`, so
            anything painted outside the revealed box stays clipped forever.
            `HudFrame` hangs its label/readout at `-top-6`, and without this
            headroom inside the clip the whole readout row would vanish.
          */}
          <Reveal variant="wipe" delay={0.15} className="pt-7">
            <HudFrame
              label="Delivery / Inbox"
              readout={`${String(STARTER_PACK_SIZE).padStart(2, "0")} Tracks`}
              live
              className="bg-pitch/60"
            >
              <div className="p-6 sm:p-9 lg:p-10">
                <h2 className="font-display text-d3 uppercase text-bone">
                  Where Should They Go?
                </h2>
                {/* Stays a plain hairline: the frame around this panel is
                   already doing the instrumentation, and ticking the interior
                   rule too would be HUD on HUD. */}
                <div className="hairline-dim mt-6 mb-8" aria-hidden />

                {/* Terminal prompt above the field, the same cue the homepage
                   signup uses. Decorative — the input carries its own label. */}
                <p aria-hidden className="u-meta mb-4 flex items-center gap-2 text-smoke">
                  <span className="text-ember">&gt;</span>
                  Enter your email
                  <span className="animate-pulse-glow inline-block h-3 w-[7px] bg-ember/70" />
                </p>

                <StarterPackForm className="[&_input]:font-mono" />

                <p className="mt-6 text-sm leading-relaxed text-smoke">
                  You&rsquo;ll get one email with the download links. Unsubscribe any time.
                </p>
              </div>
            </HudFrame>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
