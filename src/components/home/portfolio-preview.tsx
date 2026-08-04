import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PORTFOLIO_ITEMS } from "@/lib/mock-data";
import type { PortfolioItem } from "@/lib/types";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { FilmFrame } from "@/components/shared/film-frame";
import { Reveal, RevealGroup, RevealItem } from "@/components/shared/reveal";
import { GlitchText } from "@/components/visuals/glitch-text";
import { Tilt } from "@/components/visuals/tilt";
import { cn } from "@/lib/utils";

/**
 * One tall lead plate plus two stacked secondaries. The photography is
 * routed through `FilmFrame` so three unrelated stock shots come back
 * looking like they were lit on the same day.
 *
 * The tilt is deliberately shallower than the /portfolio wall's, and
 * shallower still on the lead: rotation reads as a surface catching light on
 * a 400px card, and as a wobble on a 1000px-tall plate.
 */
function PortfolioTile({
  item,
  index,
  aspect,
  sizes,
  lead = false,
}: {
  item: PortfolioItem;
  index: number;
  aspect: string;
  sizes: string;
  lead?: boolean;
}) {
  return (
    <Tilt max={lead ? 3 : 5} className={cn("w-full", aspect)}>
      <Link
        href="/portfolio"
        className={cn(
          "edge-hot group relative block h-full w-full overflow-hidden bg-pitch",
          // `transform`, not Tailwind's translate utility: `edge-hot`
          // transitions `transform`, and `-translate-y-1` writes the separate
          // `translate` property, so the lift would snap instead of easing.
          "hover:[transform:translateY(-4px)]"
        )}
      >
        <FilmFrame
          src={item.coverUrl}
          alt=""
          sizes={sizes}
          intensity={lead ? 0.2 : 0.12}
          className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-transparent"
        />

        <div className="relative flex h-full flex-col justify-between p-5 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <span className="u-meta tabular-nums text-bone/40">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="u-meta tabular-nums text-bone/40">{item.year}</span>
          </div>

          <div>
            <p className="u-meta text-ember">{item.role}</p>
            {/* Ticked scale instead of a plain rule — the same instrument
                voice the hero's credit strip is set in. */}
            <div aria-hidden className="hud-ticks mt-4 opacity-45" />
            <h3
              className={cn(
                "mt-4 font-display uppercase text-bone",
                lead ? "text-d3 lg:text-d2" : "text-d3"
              )}
            >
              <GlitchText text={item.title} />
            </h3>
            <p className="mt-1 text-sm text-smoke sm:text-base">{item.artist}</p>
          </div>
        </div>
      </Link>
    </Tilt>
  );
}

export function PortfolioPreview() {
  // Hidden until there is real released work to show.
  if (PORTFOLIO_ITEMS.length === 0) return null;

  const items = PORTFOLIO_ITEMS.slice(0, 3);
  const [lead, ...rest] = items;

  return (
    <section className="relative overflow-hidden bg-ink py-24 sm:py-32 lg:py-40">
      <div aria-hidden className="hairline absolute inset-x-0 top-0" />
      <div
        aria-hidden
        className="spotlight pointer-events-none absolute -left-48 top-1/3 size-[620px] opacity-40"
      />

      <div className="relative mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-14">
        <Reveal className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-end">
          <SectionHeading
            chapter="04"
            eyebrow="Portfolio"
            title={
              <>
                Records We&apos;ve <span className="text-gradient-ember">Shipped</span>
              </>
            }
            description="A sample of production, mixing, and mastering work delivered for independent artists."
          />
          <Button
            variant="cinemaGhost"
            size="cinema"
            className="shrink-0"
            render={<Link href="/portfolio" />}
          >
            View full portfolio
            <ArrowRight className="size-4" />
          </Button>
        </Reveal>

        <div aria-hidden className="hairline-dim mt-14" />

        <RevealGroup className="mt-10 grid grid-cols-1 gap-6 lg:mt-14 lg:grid-cols-12 lg:gap-8">
          {lead && (
            <RevealItem className="lg:col-span-7">
              <PortfolioTile
                item={lead}
                index={0}
                lead
                aspect="aspect-[4/5] sm:aspect-[16/10] lg:aspect-[4/5]"
                sizes="(min-width: 1024px) 58vw, 100vw"
              />
            </RevealItem>
          )}

          <div className="flex flex-col gap-6 lg:col-span-5 lg:mt-20 lg:gap-8">
            {rest.map((item, i) => (
              <RevealItem key={item.id}>
                <PortfolioTile
                  item={item}
                  index={i + 1}
                  aspect="aspect-[4/5] sm:aspect-[16/10] lg:aspect-[4/3]"
                  sizes="(min-width: 1024px) 40vw, 100vw"
                />
              </RevealItem>
            ))}
          </div>
        </RevealGroup>
      </div>
    </section>
  );
}
