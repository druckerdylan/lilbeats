import { NewsletterForm } from "@/components/marketing/newsletter-form";
import { SectionHeading } from "@/components/shared/section-heading";
import { HudFrame } from "@/components/visuals/hud-frame";
import { Reveal } from "@/components/shared/reveal";

/**
 * Chapter 06. No card, no slab — the section is a pool of key light on
 * near-black, bracketed by hairlines that fade out before they reach the
 * viewport edge. A hard `border-y` here read as CSS; this reads as lit.
 *
 * The signup itself is the one terminal on the page: the form sits in a
 * bracketed housing behind a prompt line, and the field is switched to the
 * mono face from the outside (`[&_input]`) so `NewsletterForm` — which also
 * lives in the footer — keeps its own styling everywhere else.
 */
export function EmailSignup() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-ink via-pitch to-ink">
      <div className="hairline" aria-hidden />

      {/* The centring translate and the animation's transform have to live on
          separate elements — a keyframed `transform` replaces the utility one
          outright and the pool drifts off-centre. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[42%] h-[520px] w-[min(1100px,140vw)] -translate-x-1/2 -translate-y-1/2"
      >
        <div className="spotlight animate-drift size-full" />
      </div>

      <Reveal className="relative mx-auto flex max-w-3xl flex-col items-center px-5 py-32 text-center sm:px-8">
        <SectionHeading
          align="center"
          size="xl"
          chapter="04"
          eyebrow="Stay Updated"
          title={
            <>
              Get New Beats <span className="text-gradient-ember">First</span>
            </>
          }
          description="Catalog drops, limited discounts, and the occasional studio update — sent when there's something worth hearing."
        />

        <HudFrame
          label="Newsletter / Drops"
          readout="No Spam"
          className="mt-16 w-full max-w-xl bg-ink/50 p-5 text-left sm:p-6 [&_input]:font-mono"
        >
          <p aria-hidden className="u-meta mb-4 flex items-center gap-2 text-smoke">
            <span className="text-ember">&gt;</span>
            Enter your email
            <span className="animate-pulse-glow inline-block h-3 w-[7px] bg-ember/70" />
          </p>

          <NewsletterForm className="w-full max-w-none" source="home" />
        </HudFrame>

        <p className="u-meta mt-6 text-smoke">Unsubscribe any time</p>
      </Reveal>

      <div className="hairline-dim" aria-hidden />
    </section>
  );
}
