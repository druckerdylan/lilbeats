import Link from "next/link";
import { Check } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SERVICE_TIERS, REVISION_POLICY } from "@/lib/services";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Reveal, RevealGroup, RevealItem } from "@/components/shared/reveal";
import { GlitchText } from "@/components/visuals/glitch-text";
import { Tilt } from "@/components/visuals/tilt";

export function PricingSection() {
  return (
    <section id="pricing" className="seam-top relative bg-pitch">
      <div className="mx-auto max-w-[1600px] px-5 py-24 sm:px-8 lg:px-14 lg:py-36">
        <Reveal>
          <SectionHeading
            chapter="03"
            eyebrow="Pricing"
            title={
              <>
                Packages &amp; <span className="text-gradient-ember">Turnaround</span>
              </>
            }
            description="Straightforward pricing per song. Bundle discounts available for EPs and full projects — ask when you book."
          />
        </Reveal>

        {/* The recommended tier takes the wider column — the grid itself
            argues for it before any badge does. */}
        <RevealGroup className="mt-16 grid grid-cols-1 gap-6 lg:mt-20 lg:grid-cols-12 lg:gap-8">
          {SERVICE_TIERS.map((tier) => {
            const card = (
              <div
                className={cn(
                  // Lights up on hover to match the homepage service panels.
                  // The whole panel isn't a link here — it already contains a
                  // Book button, and nesting anchors is invalid.
                  "relative flex h-full flex-col overflow-hidden p-8 transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-ember/55 hover:shadow-[0_0_0_1px_rgba(255,45,71,0.45),0_0_46px_-6px_rgba(255,10,60,0.6)] sm:p-10",
                  tier.highlighted
                    ? "neon-edge border border-ember/30 bg-ink"
                    : "edge-hot bg-ink/50"
                )}
              >
                {tier.highlighted && (
                  <div
                    className="pointer-events-none absolute -top-32 -right-24 size-72 spotlight opacity-70"
                    aria-hidden
                  />
                )}

                <div className="relative flex items-start justify-between gap-5">
                  <h3 className="font-display text-d3 uppercase text-bone">
                    <GlitchText text={tier.name} />
                  </h3>
                  {tier.highlighted && <Badge variant="metaHot">Recommended</Badge>}
                </div>

                <p className="relative mt-5 max-w-md text-base leading-relaxed text-smoke">
                  {tier.description}
                </p>

                <p className="relative mt-10 flex flex-wrap items-end gap-x-4 gap-y-2">
                  <span className="font-display text-d2 leading-none tabular-nums text-bone">
                    {formatPrice(tier.price)}
                  </span>
                  <span className="u-meta pb-1.5 text-smoke">{tier.unit}</span>
                </p>
                <p className="u-meta relative mt-5 text-smoke">
                  Turnaround
                  <span className="mx-3 text-bone/20" aria-hidden>
                    —
                  </span>
                  <span className="text-bone/70">{tier.turnaround}</span>
                </p>

                <ul className="relative mt-9 flex-1">
                  {tier.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-4 border-t border-bone/10 py-4 text-base leading-relaxed text-bone/85"
                    >
                      <Check className="mt-1 size-3.5 shrink-0 text-ember" aria-hidden />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={tier.highlighted ? "cinema" : "cinemaGhost"}
                  size="cinema"
                  className="relative mt-10 w-full"
                  render={<Link href={`/mixing-mastering/request?service=${tier.id}`} />}
                >
                  Book {tier.name}
                </Button>
              </div>
            );

            return (
              <RevealItem
                key={tier.id}
                className={cn(tier.highlighted ? "lg:col-span-7" : "lg:col-span-5")}
              >
                {/* Only the recommended tier turns under the pointer. Tilting
                    both would flatten the distinction the wider column and the
                    glowing edge are there to make. */}
                {tier.highlighted ? (
                  <Tilt max={5} className="h-full">
                    {card}
                  </Tilt>
                ) : (
                  card
                )}
              </RevealItem>
            );
          })}
        </RevealGroup>

        <Reveal delay={0.15} className="mt-16 lg:mt-20">
          <div className="hairline-dim" aria-hidden />
          <div className="mt-8 grid gap-6 lg:grid-cols-12">
            <p className="u-meta text-smoke lg:col-span-4">Revisions &amp; Rush</p>
            <p className="max-w-2xl text-base leading-relaxed text-smoke lg:col-span-8">
              {REVISION_POLICY}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
