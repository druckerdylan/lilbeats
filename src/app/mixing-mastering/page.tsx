import type { Metadata } from "next";
import { MixingHero } from "@/components/mixing/mixing-hero";
import { MixingBenefits } from "@/components/mixing/mixing-benefits";
import { Testimonials } from "@/components/home/testimonials";
import { PricingSection } from "@/components/mixing/pricing-section";
import { FinalCta } from "@/components/home/final-cta";
import { SectionHeading } from "@/components/shared/section-heading";
import { MarqueeBand } from "@/components/shared/marquee";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MIXING_FAQS } from "@/lib/mock-data";
import { Reveal } from "@/components/shared/reveal";

export const metadata: Metadata = {
  title: "Mixing & Mastering For Rappers & Singers",
  description:
    "Professional mixing and mastering for rappers and singers. Mastering $60, full mix and master $150 — three revision rounds included, 2–5 day turnaround.",
  alternates: { canonical: "/mixing-mastering" },
};

const SERVICE_WORDS = [
  "Mixing",
  "Mastering",
  "Vocal Tuning",
  "Stem Cleanup",
  "Rush Delivery",
];

export default function MixingMasteringPage() {
  return (
    <>
      <MixingHero />
      <MixingBenefits />

      <section className="relative py-10" aria-hidden>
        <div className="hairline-dim" />
        <MarqueeBand items={SERVICE_WORDS} duration={46} outline className="py-9" />
        <div className="hairline-dim" />
      </section>

      <Testimonials />
      <PricingSection />

      <section className="mx-auto max-w-[1600px] px-5 py-20 sm:px-8 lg:px-14 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <Reveal>
              <SectionHeading
                chapter="03"
                eyebrow="Questions"
                title={
                  <>
                    Before You <span className="text-gradient-ember">Send</span>
                  </>
                }
                description="What we need, what you get back, and how long it takes."
                className="lg:sticky lg:top-28"
              />
            </Reveal>
          </div>

          {/* Set as a terminal log rather than a stack of display headings:
              mono queries between ticked rules, no boxes, no radius. The
              display face already carries the rest of the page — this reads
              as the machine answering. */}
          <Reveal delay={0.05} className="lg:col-span-8">
            <Accordion>
              {MIXING_FAQS.map((faq, index) => (
                // `not-last:border-b-0` carries the same modifier as the
                // primitive's own `not-last:border-b`, which is what lets
                // tailwind-merge drop it — the ticked rule opening each row is
                // the divider now.
                <AccordionItem key={index} value={`item-${index}`} className="not-last:border-b-0">
                  <div className="hud-ticks opacity-30" aria-hidden />
                  <AccordionTrigger className="items-start gap-6 rounded-none py-7 hover:no-underline **:data-[slot=accordion-trigger-icon]:mt-1 **:data-[slot=accordion-trigger-icon]:size-3.5 **:data-[slot=accordion-trigger-icon]:text-bone/30">
                    <span className="u-meta shrink-0 pt-1.5 tabular-nums text-bone/30 transition-colors duration-300 group-aria-expanded/accordion-trigger:text-ember">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1 font-mono text-base leading-snug tracking-tight text-bone transition-colors duration-300 group-hover/accordion-trigger:text-ember group-aria-expanded/accordion-trigger:text-ember sm:text-lg">
                      {faq.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="max-w-2xl pb-9 pl-[2.65rem] text-base leading-relaxed text-smoke">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <div className="hud-ticks opacity-30" aria-hidden />
          </Reveal>
        </div>
      </section>

      <FinalCta />
    </>
  );
}
