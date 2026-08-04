import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/shared/reveal";
import { MarqueeBand } from "@/components/shared/marquee";
import { Kicker } from "@/components/shared/section-heading";

const BAND = ["Beats", "Mixing", "Mastering", "Records That Hit"];

/**
 * The last frame of the film. No chapter number — this is the title card
 * the credits roll over, so it gets the page's most generous vertical
 * space, a single pool of key light, and nothing else competing.
 */
export function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-ink">
      <div className="hairline-dim" aria-hidden />
      <MarqueeBand items={BAND} duration={46} outline className="py-7" />
      <div className="hairline-dim" aria-hidden />

      <div className="relative">
        {/* The centring translate and the animation's transform have to live
            on separate elements — a keyframed `transform` replaces the
            utility one outright and the pool drifts off-centre. */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[620px] w-[min(1200px,150vw)] -translate-x-1/2 -translate-y-1/2"
        >
          <div className="spotlight animate-pulse-glow size-full" />
        </div>

        <Reveal className="relative mx-auto flex max-w-5xl flex-col items-center px-5 py-32 text-center sm:px-8 lg:py-44">
          <Kicker tone="smoke" className="mb-8">
            Roll Credits
          </Kicker>

          {/*
            Deliberately NOT neon. The footer's closing tagline sits about a
            screen below this and is lit — two glowing headlines that close to
            each other cancel each other out, and the footer's is the stronger
            of the two. Scale, the spotlight behind it, and the hot accent word
            carry this one on their own.
          */}
          <h2 className="font-display text-d1 text-balance uppercase text-bone">
            Your Next Record{" "}
            <span className="text-ember-bright">Starts Here</span>
          </h2>

          <p className="mt-8 max-w-xl text-base leading-relaxed text-smoke sm:text-lg">
            License a beat instantly or book mixing &amp; mastering — either way,
            you leave with something that sounds finished.
          </p>

          <div className="mt-12 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button variant="cinema" size="cinema" render={<Link href="/beats" />}>
              Browse Beats
            </Button>
            <Button
              variant="cinemaGhost"
              size="cinema"
              render={<Link href="/contact" />}
            >
              Get In Touch
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
