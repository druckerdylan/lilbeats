import Image from "next/image";
import { Play } from "lucide-react";
import { YoutubeIcon, BeatstarsIcon } from "@/components/shared/social-icons";
import { SectionHeading } from "@/components/shared/section-heading";
import { GlitchText } from "@/components/visuals/glitch-text";
import { SOCIAL_LINKS } from "@/lib/constants";
import { unsplash } from "@/lib/unsplash";
import { Reveal, RevealGroup, RevealItem } from "@/components/shared/reveal";

/**
 * Contact sheet, not a gallery widget: every frame is a different span and
 * hangs from a different vertical offset, so the eye travels across the
 * row instead of scanning four identical squares.
 */
const GALLERY = [
  {
    src: unsplash("1585699324551-f6c309eedeca", "w=1000&q=75&fit=crop&auto=format"),
    cell: "col-span-2 lg:col-span-4",
    frame: "aspect-[16/10] lg:aspect-[4/5]",
    sizes: "(min-width: 1024px) 33vw, 100vw",
  },
  {
    src: unsplash("1519638399535-1b036603ac77", "w=800&q=75&fit=crop&auto=format"),
    cell: "col-span-1 lg:col-span-3 lg:mt-20",
    frame: "aspect-[3/4]",
    sizes: "(min-width: 1024px) 25vw, 50vw",
  },
  {
    src: unsplash("1478147427282-58a87a120781", "w=700&q=75&fit=crop&auto=format"),
    cell: "col-span-1 lg:col-span-2 lg:mt-8",
    frame: "aspect-[3/4] lg:aspect-[2/3]",
    sizes: "(min-width: 1024px) 17vw, 50vw",
  },
];

const CHIP =
  "group/chip inline-flex items-center gap-2.5 rounded-full border border-bone/15 px-5 py-2.5 text-bone transition-colors hover:border-ember hover:text-ember";

export function SocialSection() {
  return (
    <section className="mx-auto max-w-[1600px] px-5 py-28 sm:px-8 lg:px-14">
      <Reveal className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-end">
        <SectionHeading
          chapter="07"
          eyebrow="Follow Along"
          title="Studio Sessions & Snippets"
          description="Behind-the-scenes production, new beat previews, and mix breakdowns."
        />
        {/* The only decoding text in the section, and it's on the two things
            you can actually click. */}
        <div className="flex shrink-0 gap-3">
          <a
            href={SOCIAL_LINKS.beatstars}
            target="_blank"
            rel="noreferrer"
            className={CHIP}
          >
            <BeatstarsIcon aria-hidden className="size-4" />
            <GlitchText text="BeatStars" className="u-meta" />
          </a>
          <a
            href={SOCIAL_LINKS.youtube}
            target="_blank"
            rel="noreferrer"
            className={CHIP}
          >
            <YoutubeIcon aria-hidden className="size-4" />
            <GlitchText text="YouTube" className="u-meta" />
          </a>
        </div>
      </Reveal>

      <RevealGroup className="mt-16 grid grid-cols-2 items-start gap-4 sm:gap-5 lg:grid-cols-12">
        {/*
          `rise`, not the house `wipe`: the wipe settles on
          `clip-path: inset(0)`, which keeps clipping to the border box for the
          element's whole life. That would shave off the corner brackets (drawn
          1px outside the frame) and the top edge of the hover lift.
        */}
        {GALLERY.map((shot, index) => (
          <RevealItem key={shot.src} variant="rise" className={shot.cell}>
            <a
              href={SOCIAL_LINKS.beatstars}
              target="_blank"
              rel="noreferrer"
              // `edge-hot` already owns the transition shorthand (border,
              // shadow and transform); adding `transition-transform` here
              // would just be overridden by it.
              //
              // The clipping lives on the inner layer, not here: `hud-corners`
              // draws its brackets 1px *outside* the box, so an
              // `overflow-hidden` on this element would shave them away
              // entirely.
              className={`hud-corners edge-hot group relative block hover:-translate-y-1 ${shot.frame}`}
            >
              <div className="absolute inset-0 overflow-hidden">
                <Image
                  src={shot.src}
                  alt={`Lil Beats studio snapshot ${index + 1}`}
                  fill
                  sizes={shot.sizes}
                  className="grade-cinema object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* These are candid shots from wildly different sources — one is
                    a cyan-lit stage, another a blue street. The full grade alone
                    doesn't pull them into the palette, so a red tint takes the
                    hue while `mix-blend-color` preserves their luminance. */}
                <div
                  className="pointer-events-none absolute inset-0 bg-ember/45 mix-blend-color"
                  aria-hidden
                />
                <div className="vignette-frame pointer-events-none absolute inset-0" aria-hidden />
              </div>
              <span
                className="u-meta pointer-events-none absolute bottom-3 left-3 text-bone/55 transition-colors group-hover:text-ember"
                aria-hidden
              >
                {String(index + 1).padStart(2, "0")}
              </span>
            </a>
          </RevealItem>
        ))}

        <RevealItem variant="rise" className="col-span-2 lg:col-span-3 lg:mt-36">
          <a
            href={SOCIAL_LINKS.youtube}
            target="_blank"
            rel="noreferrer"
            className="hud-corners edge-hot group relative flex aspect-[16/9] flex-col items-center justify-center gap-5 bg-pitch text-center hover:-translate-y-1 lg:aspect-square"
          >
            <div className="spotlight pointer-events-none absolute inset-0 opacity-60" aria-hidden />
            <div className="scanlines pointer-events-none absolute inset-0 opacity-40" aria-hidden />
            <span className="relative flex size-14 items-center justify-center rounded-full bg-ember text-primary-foreground transition-all duration-300 group-hover:scale-110 group-hover:bg-ember-bright">
              <Play className="ml-0.5 size-5" fill="currentColor" />
            </span>
            <span className="u-meta relative px-4 text-bone">Watch on YouTube</span>
          </a>
        </RevealItem>
      </RevealGroup>
    </section>
  );
}
