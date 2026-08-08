import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal, RevealGroup, RevealItem } from "@/components/shared/reveal";

/*
  Deliberately *not* the homepage's why-choose table: no icons, no 12-column
  spread. This is a tight index held in the right two-thirds under a sticky
  heading — hollow numeral in a narrow gutter, claim and copy stacked beside
  it, each row opened by a ticked measuring rule that brightens under the
  cursor.
*/
const BENEFITS = [
  {
    number: "01",
    title: "Translates Everywhere",
    description:
      "Every mix is checked against studio monitors, consumer earbuds, and car speakers before delivery.",
  },
  {
    number: "02",
    title: "Competitive Loudness",
    description:
      "Masters hit modern streaming loudness targets without losing dynamics or crushing the transients.",
  },
  {
    number: "03",
    title: "Real Communication",
    description:
      "You'll get notes on what changed and why — not just a bounced file dropped in your inbox.",
  },
  {
    number: "04",
    title: "Built-In Revisions",
    description:
      "Three rounds are included on every package, and you can ask for two more — five in total, so the final version actually matches your vision.",
  },
];

export function MixingBenefits() {
  return (
    <section className="mx-auto max-w-[1600px] px-5 py-24 sm:px-8 lg:px-14 lg:py-32">
      <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <Reveal>
            <SectionHeading
              chapter="01"
              eyebrow="The Standard"
              title={
                <>
                  Engineered <span className="text-gradient-ember">By Hand</span>
                </>
              }
              description="No auto-mix plugins, no preset chains. Every session is built from scratch around your vocal and your reference."
              className="lg:sticky lg:top-28"
            />
          </Reveal>
        </div>

        <RevealGroup className="lg:col-span-8" stagger={0.08}>
          {BENEFITS.map((benefit) => (
            <RevealItem key={benefit.title}>
              <div className="group">
                <div
                  className="hud-ticks opacity-30 transition-opacity duration-500 group-hover:opacity-70"
                  aria-hidden
                />

                <div className="grid grid-cols-[auto_1fr] gap-x-6 py-9 sm:gap-x-9 lg:py-12">
                  {/* Two stacked numerals: hollow bone, with the ember stroke
                      cross-fading in on hover so the row ignites rather than
                      simply changing colour. */}
                  <span className="relative row-span-2 block leading-none" aria-hidden>
                    <span className="font-display text-d2 leading-none tabular-nums text-outline">
                      {benefit.number}
                    </span>
                    <span className="absolute inset-0 font-display text-d2 leading-none tabular-nums text-outline-ember opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                      {benefit.number}
                    </span>
                  </span>

                  <h3 className="self-start font-display text-d3 uppercase text-bone">
                    {benefit.title}
                  </h3>
                  <p className="mt-4 max-w-xl text-base leading-relaxed text-smoke">
                    {benefit.description}
                  </p>
                </div>
              </div>
            </RevealItem>
          ))}

          <RevealItem>
            <div className="hud-ticks opacity-30" aria-hidden />
          </RevealItem>
        </RevealGroup>
      </div>
    </section>
  );
}
