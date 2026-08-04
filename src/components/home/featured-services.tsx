import Link from "next/link";
import { ArrowRight, Sliders, Sparkles } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { HudFrame } from "@/components/visuals/hud-frame";
import { Button } from "@/components/ui/button";
import { SERVICE_TIERS } from "@/lib/services";
import { formatPrice } from "@/lib/format";
import { Reveal, RevealGroup, RevealItem } from "@/components/shared/reveal";

const ICONS = {
  mastering: Sparkles,
  "mixing-mastering": Sliders,
};

export function FeaturedServices() {
  return (
    <section className="seam-top relative isolate overflow-hidden bg-ink">
      {/* Pool of key light behind the split — replaces the flat charcoal slab. */}
      <div
        aria-hidden
        className="spotlight pointer-events-none absolute -top-32 left-1/2 -z-10 h-[760px] w-[1200px] -translate-x-1/2 opacity-80"
      />

      <div className="mx-auto max-w-[1600px] px-5 py-32 sm:px-8 lg:px-14 lg:py-40">
        <Reveal>
          <SectionHeading
            chapter="02"
            eyebrow="Services"
            title={
              <>
                Mixing &amp; <span className="text-gradient-ember">Mastering</span>
              </>
            }
            description="Send your stems, get back a record that's ready to release. Every package is engineered by hand — no presets, no shortcuts."
          />
        </Reveal>

        {/*
          Two channels on a console rather than two pricing cards: each tier is
          housed in its own hairline frame with a channel label and a delivery
          readout, and the booked one is the only lit unit in the rack.

          `rise` rather than the house `wipe`: the wipe leaves a clip-path on
          the element, which would shear the highlighted panel's neon edge.
        */}
        <RevealGroup
          className="mt-20 grid grid-cols-1 gap-14 lg:mt-28 lg:grid-cols-2 lg:gap-10"
          stagger={0.12}
        >
          {SERVICE_TIERS.map((tier, index) => {
            const Icon = ICONS[tier.id as keyof typeof ICONS];
            return (
              <RevealItem key={tier.id} variant="rise" className="h-full">
                {/*
                  The whole channel strip is the booking control — it carries a
                  price and a spec, so making the panel itself the target beats
                  hanging a small button off the bottom of it. `?service=` is
                  the same param the pricing page uses, so the request form
                  arrives pre-selected.
                */}
                <Link
                  href={`/mixing-mastering/request?service=${tier.id}`}
                  aria-label={`Book ${tier.name} — ${formatPrice(tier.price)} ${tier.unit}`}
                  className="group block h-full"
                >
                  <HudFrame
                    label={`CH 0${index + 1} / ${tier.name}`}
                    readout="WAV + MP3"
                    className={`flex h-full flex-col p-7 transition-[border-color,box-shadow,transform] duration-300 group-hover:-translate-y-1 group-hover:border-ember/55 group-hover:shadow-[0_0_0_1px_rgba(255,45,71,0.45),0_0_46px_-6px_rgba(255,10,60,0.6)] lg:min-h-[30rem] lg:p-10 ${
                      tier.highlighted
                        ? "neon-edge border-ember/25 bg-gradient-to-b from-ember/[0.09] via-pitch/50 to-pitch/50"
                        : "bg-pitch/40"
                    }`}
                  >
                  <div className="flex items-center gap-4">
                    <span className="u-meta tabular-nums text-bone/35">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {/* Measuring scale instead of a plain rule — the panel's
                        one piece of instrumentation garnish. */}
                    <span aria-hidden className="hud-ticks flex-1 opacity-40" />
                    <Icon
                      aria-hidden
                      className={`size-5 ${tier.highlighted ? "text-ember" : "text-smoke"}`}
                    />
                  </div>

                  <h3 className="mt-9 font-display text-d3 uppercase text-bone">{tier.name}</h3>
                  <p className="mt-5 max-w-sm text-base leading-relaxed text-smoke">
                    {tier.description}
                  </p>

                  {/* The price is the largest thing in the panel, by a lot. */}
                  <div className="mt-auto pt-14">
                    <p
                      className={`font-display text-d2 tabular-nums ${
                        tier.highlighted ? "text-gradient-ember" : "text-bone"
                      }`}
                    >
                      {formatPrice(tier.price)}
                    </p>
                    <p className="u-meta mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-smoke">
                      <span>{tier.unit}</span>
                      <span aria-hidden className="h-px w-6 bg-bone/25" />
                      <span>Turnaround {tier.turnaround}</span>
                    </p>

                    {/* Says out loud that the panel is a control. Without it
                        the strip looks like a spec card and nobody clicks. */}
                    <span
                      aria-hidden
                      className="u-meta mt-8 inline-flex items-center gap-2 text-bone/55 transition-colors duration-300 group-hover:text-ember-bright"
                    >
                      Book a session
                      <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                    </div>
                  </HudFrame>
                </Link>
              </RevealItem>
            );
          })}
        </RevealGroup>

        <Reveal delay={0.15} className="mt-16 flex flex-wrap items-center gap-x-10 gap-y-6">
          <Button variant="cinema" size="cinema" render={<Link href="/mixing-mastering" />}>
            See full service details
            <ArrowRight />
          </Button>
          <p className="u-meta text-smoke">Two revision rounds included</p>
        </Reveal>
      </div>
    </section>
  );
}
