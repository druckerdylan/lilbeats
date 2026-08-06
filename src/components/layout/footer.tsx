import Link from "next/link";
import { YoutubeIcon, BeatstarsIcon } from "@/components/shared/social-icons";
import { Logo } from "@/components/layout/logo";
import { NewsletterForm } from "@/components/marketing/newsletter-form";
import { Reveal } from "@/components/shared/reveal";
import { BRAND, FOOTER_LINKS, SITE_NAME, SOCIAL_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const SOCIALS = [
  { label: "YouTube", href: SOCIAL_LINKS.youtube, Icon: YoutubeIcon },
  { label: "BeatStars", href: SOCIAL_LINKS.beatstars, Icon: BeatstarsIcon },
];

/*
  The tagline broken back into its own sentences so it can be set as a
  stacked end-title card instead of one long line. Derived from BRAND rather
  than retyped, so the closing statement can never drift from the brand.
*/
const TAGLINE_LINES = (BRAND.tagline.match(/[^.]+\.?/g) ?? [BRAND.tagline])
  .map((line) => line.trim())
  .filter(Boolean);

/*
  Hollow → solid → lit. The eye walks down the block and lands on red, and
  the last line is the only thing on the page chrome that actually emits:
  `neon-text-hot` replaces the flat ember gradient so the closing statement
  reads as a tube burning in a dark room. One line, once — the moment it is
  applied to two of them the block turns to soup.
*/
const LINE_TREATMENT = ["text-outline", "text-bone", "neon-text-hot"];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative isolate overflow-hidden bg-ink">
      {/* Key light spilling over the seam so the footer reads as the bottom
          of a lit room, not a separate grey slab bolted to the page. */}
      <div
        aria-hidden
        className="spotlight pointer-events-none absolute -top-40 left-1/2 h-72 w-[80rem] max-w-[150vw] -translate-x-1/2 opacity-70"
      />
      <div aria-hidden className="hairline-dim absolute inset-x-0 top-0" />

      <div className="relative mx-auto max-w-[1600px] px-5 pt-28 pb-24 sm:px-8 sm:pt-36 sm:pb-28 lg:px-14">
        <Reveal variant="wipe">
          <p className="font-display text-d1 uppercase">
            {TAGLINE_LINES.map((line, i) => (
              <span
                key={line}
                className={cn(
                  "block",
                  LINE_TREATMENT[i % LINE_TREATMENT.length]
                )}
              >
                {line}
              </span>
            ))}
          </p>
        </Reveal>

        <div aria-hidden className="hairline-dim mt-16 sm:mt-24" />

        {/* 4 / 2 / 2 / 4 — deliberately not four equal columns. */}
        <div className="grid gap-x-10 gap-y-14 pt-14 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-4">
            <Logo />
            <p className="max-w-xs text-sm leading-relaxed text-smoke">
              Dark, cinematic production and professional mixing &amp; mastering
              for artists who need records that hit on any system.
            </p>
            <div className="flex gap-2 pt-1">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="edge-hot flex size-10 items-center justify-center text-smoke transition-colors hover:text-ember"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h3 className="u-meta mb-5 text-smoke">Explore</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.explore.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-block text-sm text-bone/80 transition-colors duration-300 hover:text-ember"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="u-meta mb-5 text-smoke">Legal</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-block text-sm text-bone/80 transition-colors duration-300 hover:text-ember"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4">
            <h3 className="u-meta mb-5 text-smoke">Stay in the loop</h3>
            <p className="mb-5 max-w-sm text-sm leading-relaxed text-smoke">
              New beat drops and studio updates, occasionally in your inbox.
            </p>
            <NewsletterForm />
            <p className="mt-7">
              <a
                href={`mailto:${BRAND.email}`}
                className="u-meta text-smoke transition-colors duration-300 hover:text-ember"
              >
                {BRAND.email}
              </a>
            </p>
          </div>
        </div>

        {/* Same tick scale as the navbar seam, mirrored — the page is
            bracketed top and bottom by the one instrument detail. */}
        <div aria-hidden className="mt-20">
          <div className="hud-ticks opacity-50 [mask-image:linear-gradient(90deg,transparent,#000_16%,#000_84%,transparent)]" />
          <div className="hairline-dim" />
        </div>

        {/* End credits, set as a station readout: who, where, when. Every
            cell is a real fact out of BRAND — no invented telemetry. The
            transport bar can dock over the bottom of the viewport, hence the
            generous padding under this row. */}
        <div className="flex flex-col gap-3 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="u-meta text-smoke">
            &copy; {year} {SITE_NAME} — All rights reserved
          </p>
          <div className="u-meta flex flex-wrap items-center gap-x-4 gap-y-2 text-smoke">
            <span>Produced in {BRAND.location}</span>
            <span aria-hidden className="h-3 w-px shrink-0 bg-bone/15" />
            <span>{BRAND.hours}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
