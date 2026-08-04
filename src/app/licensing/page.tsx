import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { Kicker, SectionHeading } from "@/components/shared/section-heading";
import { Reveal, RevealGroup, RevealItem, SplitWords } from "@/components/shared/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LICENSE_TIERS, EXCLUSIVE_LICENSE_NOTE } from "@/lib/licensing";
import { BRAND } from "@/lib/constants";
import type { LicenseTier } from "@/lib/types";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Licensing",
  description: "Beat licensing terms for MP3, WAV, and Stems tiers at Lil Beats.",
};

const LAST_UPDATED = "July 2026";

const LINK =
  "text-ember underline underline-offset-4 decoration-ember/40 transition-colors hover:decoration-ember";

const pad = (n: number) => String(n).padStart(2, "0");

/** The widest non-exclusive tier — the one the key light falls on. */
const TOP_TIER_ID = LICENSE_TIERS[LICENSE_TIERS.length - 1]?.id;

function specRows(tier: LicenseTier) {
  return [
    { label: "Distribution", value: tier.distributionLimit },
    { label: "Streams", value: tier.streamLimit },
    { label: "Music Videos", value: tier.musicVideos },
    { label: "Radio", value: tier.radioBroadcast },
    { label: "Performances", value: tier.performances },
  ];
}

/** Fading rule — the only divider on the page. */
function Rule({ className }: { className?: string }) {
  return <div className={cn("hairline-dim", className)} aria-hidden />;
}

/**
 * A legal clause set like a credit block: a hollow index number in the
 * gutter, the clause title in the display face, and the prose held to a
 * reading measure beside it. These sit under the "Fine Print" section
 * heading, so they are h3s.
 */
function Clause({
  index,
  title,
  children,
}: {
  index: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal variant="rise" duration={0.7}>
      <section className="grid gap-x-10 gap-y-4 lg:grid-cols-[4rem_minmax(0,1fr)]">
        <p aria-hidden className="u-meta tabular-nums text-bone/30 lg:pt-3">
          {pad(index)}
        </p>
        <div className="max-w-2xl">
          <h3 className="font-display text-d3 uppercase text-bone">{title}</h3>
          <div className="mt-5 space-y-4 text-base leading-relaxed text-bone/85">
            {children}
          </div>
        </div>
      </section>
    </Reveal>
  );
}

export default function LicensingPage() {
  return (
    <div className="relative">
      {/* Key light over the title card. It gets its own clipping frame so
         the page root can stay overflow-visible — an `overflow` on the root
         would make it a scroll container and kill the sticky rail below. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[400px] overflow-hidden"
      >
        <div className="spotlight absolute -top-56 left-1/2 h-[560px] w-[1000px] -translate-x-1/2 opacity-60" />
      </div>

      {/* ── Title card ──────────────────────────────────────────────── */}
      <header className="relative mx-auto max-w-[1600px] px-5 pt-24 sm:px-8 lg:px-14 lg:pt-32">
        <Kicker>Legal</Kicker>
        <h1 className="mt-7 font-display text-d0 uppercase text-bone">
          <SplitWords text="Licensing" />
        </h1>
        {/*
          Matches the Privacy and Terms title cards: a ticked scale and a
          colourless document readout. The tier tables below are already the
          instrumentation on this page and take nothing extra.
        */}
        <div className="hud-ticks mt-10 opacity-70" aria-hidden />
        <div className="mt-5 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
          <p className="u-meta text-smoke">Last updated: {LAST_UPDATED}</p>
          <p className="u-meta text-smoke/70 tabular-nums">
            {pad(LICENSE_TIERS.length)} Tiers
          </p>
        </div>
        <p className="mt-10 max-w-xl text-base leading-relaxed text-smoke sm:text-lg">
          Every beat purchased from Lil Beats is licensed, not sold outright —
          here&rsquo;s exactly what each tier includes.
        </p>
      </header>

      {/* ── Tier spec sheets ────────────────────────────────────────── */}
      <section className="relative mx-auto mt-20 max-w-[1600px] px-5 sm:px-8 lg:mt-28 lg:px-14">
        <Reveal>
          <SectionHeading eyebrow="What You Get" size="xl" title="License Tiers" />
        </Reveal>

        <RevealGroup className="mt-14 lg:mt-20" stagger={0.12}>
          {LICENSE_TIERS.map((tier, i) => {
            const isTop = tier.id === TOP_TIER_ID;

            return (
              <RevealItem key={tier.id} variant="rise">
                <Rule />
                <article
                  className={cn(
                    "relative grid gap-x-12 gap-y-9 py-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:py-16",
                    isTop && "lg:pl-8"
                  )}
                >
                  {isTop && (
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-y-0 left-0 hidden w-px bg-gradient-to-b from-transparent via-ember/70 to-transparent lg:block"
                    />
                  )}

                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="u-meta tabular-nums text-bone/30" aria-hidden>
                        {pad(i + 1)}
                      </span>
                      <Badge variant="meta">{tier.formatLabel}</Badge>
                      {isTop && <Badge variant="metaHot">Top Tier</Badge>}
                    </div>

                    <h3 className="mt-6 font-display text-d2 uppercase text-bone">
                      {tier.name}
                    </h3>

                    <p className="mt-5 max-w-sm text-base leading-relaxed text-smoke">
                      {tier.description}
                    </p>
                  </div>

                  <div>
                    {/*
                      A stacked spec sheet rather than a comparison table: at
                      390px a three-column table would either overflow the
                      page or squeeze every cell into a word-per-line, and
                      each tier's numbers only ever need to be read against
                      its own label.
                    */}
                    <div>
                      {specRows(tier).map((row) => (
                        <div key={row.label}>
                          <Rule />
                          <div className="grid grid-cols-[8.5rem_minmax(0,1fr)] items-baseline gap-x-4 py-3.5 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-x-10">
                            <span className="u-meta text-smoke">{row.label}</span>
                            <span className="text-sm leading-relaxed text-bone sm:text-base">
                              {row.value}
                            </span>
                          </div>
                        </div>
                      ))}
                      <Rule />
                    </div>

                    <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                      {tier.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-3 text-sm leading-relaxed text-bone/85"
                        >
                          <Check
                            className={cn(
                              "mt-0.5 size-3.5 shrink-0",
                              isTop ? "text-ember" : "text-bone/35"
                            )}
                            aria-hidden
                          />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              </RevealItem>
            );
          })}
        </RevealGroup>
        <Rule />
      </section>

      {/* ── General terms ───────────────────────────────────────────── */}
      <section className="relative mx-auto max-w-[1600px] px-5 pt-24 pb-28 sm:px-8 lg:px-14 lg:pt-36 lg:pb-40">
        <div className="grid gap-x-16 gap-y-14 lg:grid-cols-12">
          <Reveal className="lg:sticky lg:top-28 lg:col-span-5 lg:self-start">
            <SectionHeading
              eyebrow="General Terms"
              size="xl"
              title={
                <>
                  The Fine <span className="text-outline">Print</span>
                </>
              }
            />
          </Reveal>

          <div className="lg:col-span-7">
            <Clause index={1} title="General License Terms">
              <ul className="list-disc space-y-2.5 pl-5 marker:text-ember/60">
                <li>All licenses are non-exclusive unless an exclusive license has been purchased separately.</li>
                <li>Licenses are non-transferable and apply only to the purchasing artist or entity.</li>
                <li>You may not resell or redistribute the beat, stems, or files in their original, unedited form.</li>
                <li>Production credit (e.g. &ldquo;Prod. Lil Beats&rdquo;) is appreciated but not required.</li>
                <li>Exceeding your tier&rsquo;s distribution or streaming limits requires an upgraded license.</li>
              </ul>
            </Clause>

            <Rule className="my-12 lg:my-16" />

            <Clause index={2} title="Exclusive Licensing">
              <p>{EXCLUSIVE_LICENSE_NOTE}</p>
              <div className="pt-3">
                {/*
                  `cinema` is nowrap by default and this label runs ~352px at
                  its mono tracking — wider than a 390px viewport's text
                  column. It goes full-bleed and wraps below `sm` instead of
                  being clipped.
                */}
                <Button
                  variant="cinema"
                  size="cinema"
                  className="h-auto w-full py-4 text-center whitespace-normal sm:h-12 sm:w-auto sm:py-0"
                  render={<Link href="/contact?subject=exclusive-license" />}
                >
                  Inquire About Exclusive Rights
                </Button>
              </div>
            </Clause>

            <Rule className="my-12 lg:my-16" />

            <Clause index={3} title="Questions">
              <p>
                For custom licensing arrangements, sync placements, or any
                questions about what your license permits, contact{" "}
                <a href={`mailto:${BRAND.email}`} className={LINK}>
                  {BRAND.email}
                </a>
                .
              </p>
            </Clause>
          </div>
        </div>
      </section>
    </div>
  );
}
