import { Zap, ShieldCheck, Headphones, Layers } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal, RevealGroup, RevealItem } from "@/components/shared/reveal";

const REASONS = [
  {
    icon: Zap,
    title: "Instant Delivery",
    description:
      "Every beat license delivers automatically the moment payment clears — no waiting on an email back.",
  },
  {
    icon: Headphones,
    title: "Mixes That Translate",
    description:
      "Every mix is checked across studio monitors, earbuds, and car speakers before it ever reaches you.",
  },
  {
    icon: Layers,
    title: "Real Stems, Real Flexibility",
    description:
      "Stem licenses hand you full trackouts, so your engineer has total control over the final sound.",
  },
  {
    icon: ShieldCheck,
    title: "Clear, Honest Licensing",
    description:
      "No hidden clauses. Every tier states exactly what you can do with the beat before you buy.",
  },
];

export function WhyChoose() {
  return (
    // Lighter on top than at the bottom: the services section above ends with
    // its own generous padding, and two full-size gaps stacking left a dead
    // screen-height of nothing between the two.
    <section className="mx-auto max-w-[1600px] px-5 pt-16 pb-28 sm:px-8 lg:px-14 lg:pt-20 lg:pb-36">
      <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between md:gap-16">
        <Reveal className="flex-1">
          <SectionHeading
            chapter="03"
            eyebrow="Why Lil Beats"
            title={
              <>
                Built For <span className="text-gradient-ember">Serious</span> Artists
              </>
            }
            description="Lil Beats exists for artists who take their sound seriously — not another tagged loop pack."
          />
        </Reveal>
        <Reveal delay={0.12} variant="fade">
          <p className="u-meta text-smoke">
            Reasons 01 <span className="text-bone/25">—</span> 04
          </p>
        </Reveal>
      </div>

      {/* A credits table, not a quad of centred cards: number, title, copy. */}
      <RevealGroup className="mt-16 lg:mt-24" stagger={0.1}>
        {REASONS.map((reason, index) => (
          <RevealItem key={reason.title}>
            <div className="group">
              {/* Row rule that ignites under the cursor. */}
              <div aria-hidden className="hairline-dim relative w-full">
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-ember/70 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </div>

              <div className="grid grid-cols-1 gap-y-5 py-10 md:grid-cols-12 md:items-start md:gap-x-8 md:py-14 lg:gap-x-12">
                <span
                  aria-hidden
                  className="text-outline inline-block font-display text-d2 leading-none tabular-nums transition-transform duration-500 group-hover:translate-x-1 md:col-span-2"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="md:col-span-4">
                  <reason.icon
                    aria-hidden
                    className="mb-4 size-5 text-ember/70 transition-colors duration-300 group-hover:text-ember-bright"
                  />
                  <h3 className="font-display text-d3 uppercase text-bone">{reason.title}</h3>
                </div>

                <p className="max-w-xl text-base leading-relaxed text-smoke md:col-span-5 md:col-start-8 md:pt-2">
                  {reason.description}
                </p>
              </div>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>

      {/*
        The table opens on hairlines and closes on a measuring scale. That is
        the entire cyberpunk budget for this section: the numbered rows already
        carry it, and HUD garnish on four quiet editorial rows would be noise.
      */}
      <Reveal variant="fade">
        <div aria-hidden className="hud-ticks opacity-40" />
      </Reveal>
    </section>
  );
}
