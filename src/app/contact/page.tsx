import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactForm } from "@/components/contact/contact-form";
import { Kicker } from "@/components/shared/section-heading";
import { Reveal, SplitWords } from "@/components/shared/reveal";
import { GlitchText } from "@/components/visuals/glitch-text";
import { HudFrame } from "@/components/visuals/hud-frame";
import {
  InstagramIcon,
  YoutubeIcon,
  TiktokIcon,
  BeatstarsIcon,
} from "@/components/shared/social-icons";
import { BRAND, SOCIAL_LINKS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Lil Beats for licensing questions, custom production, or mixing & mastering inquiries.",
};

const SOCIAL_ROWS = [
  { label: "Instagram", href: SOCIAL_LINKS.instagram, Icon: InstagramIcon },
  { label: "YouTube", href: SOCIAL_LINKS.youtube, Icon: YoutubeIcon },
  { label: "TikTok", href: SOCIAL_LINKS.tiktok, Icon: TiktokIcon },
  { label: "BeatStars", href: SOCIAL_LINKS.beatstars, Icon: BeatstarsIcon },
];

/** The brand's contact block set as an end-credits spec sheet. */
const DETAIL_ROWS: { label: string; value: React.ReactNode }[] = [
  {
    label: "Email",
    value: (
      <a
        href={`mailto:${BRAND.email}`}
        className="transition-colors duration-300 hover:text-ember"
      >
        {BRAND.email}
      </a>
    ),
  },
  { label: "Location", value: BRAND.location },
  { label: "Hours", value: BRAND.hours },
  { label: "Response", value: BRAND.responseTime },
];

export default function ContactPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Key light pooling behind the form column. */}
      <div
        aria-hidden
        className="spotlight pointer-events-none absolute -top-40 right-[-14%] h-[620px] w-[620px] opacity-70"
      />

      <div className="relative mx-auto max-w-[1600px] px-5 py-24 sm:px-8 lg:px-14 lg:py-32">
        <div className="grid gap-16 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-20 xl:gap-28">
          {/* ── Left: title card + spec sheet ─────────────────────── */}
          <div>
            <Kicker>Contact</Kicker>

            {/* The page's single neon moment — a contact headline lit like a
               shopfront sign. Nothing else on this page glows. */}
            <h1 className="neon-text mt-6 font-display text-d1 uppercase">
              <SplitWords text="Get In Touch" />
            </h1>

            <p className="mt-8 max-w-md text-base leading-relaxed text-smoke sm:text-lg">
              Questions about licensing, custom production, or booking mixing &amp;
              mastering? Send a message and we&rsquo;ll get back to you.
            </p>

            <Reveal variant="fade" delay={0.25} className="mt-16">
              {/* Label + measuring scale, so the spec sheet reads as a
                 calibrated instrument rather than a definition list. */}
              <div className="flex items-center gap-5">
                <h2 className="u-meta shrink-0 text-smoke">Details</h2>
                <span className="hud-ticks flex-1 opacity-60" aria-hidden />
              </div>

              <div className="mt-6">
                {DETAIL_ROWS.map((row) => (
                  <div key={row.label}>
                    <div className="hairline-dim" aria-hidden />
                    <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-baseline gap-5 py-4 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-10">
                      <span className="u-meta text-smoke">{row.label}</span>
                      <span className="text-sm text-bone sm:text-base">
                        {row.value}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="hairline-dim" aria-hidden />
              </div>
            </Reveal>

            <Reveal variant="fade" delay={0.35} className="mt-14">
              <div className="flex items-center gap-5">
                <h2 className="u-meta shrink-0 text-smoke">Follow</h2>
                <span className="hud-ticks flex-1 opacity-60" aria-hidden />
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                {SOCIAL_ROWS.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    // Named on the anchor itself so the link's accessible name
                    // never depends on `GlitchText`'s inner `aria-label` being
                    // picked up during name computation.
                    aria-label={social.label}
                    className="inline-flex items-center gap-3 border border-bone/12 px-4 py-3 text-bone/85 transition-colors duration-300 hover:border-ember/50 hover:text-ember"
                  >
                    <social.Icon className="size-4" aria-hidden />
                    {/* Decode on hover only — the label is legible at rest and
                       `GlitchText` carries the real string in `aria-label`. */}
                    <GlitchText text={social.label} className="u-meta" />
                  </a>
                ))}
              </div>
            </Reveal>
          </div>

          {/* ── Right: the message panel ───────────────────────────── */}
          {/*
            `pt-7` is load-bearing: `wipe` settles on `clip-path: inset(0)`, so
            anything painted outside the revealed box stays clipped forever.
            `HudFrame` hangs its label/readout at `-top-6`, and without this
            headroom inside the clip the whole readout row would vanish.
          */}
          <Reveal variant="wipe" delay={0.15} className="pt-7">
            <HudFrame
              label="Channel / Direct"
              readout={BRAND.responseTime}
              live
              className="bg-pitch/60"
            >
              <div className="p-6 sm:p-9 lg:p-10">
                <h2 className="font-display text-d3 uppercase text-bone">
                  Send A Message
                </h2>
                {/* Stays a plain hairline: the frame around this panel is
                   already doing the instrumentation, and ticking the interior
                   rule too would be HUD on HUD. */}
                <div className="hairline-dim mt-6 mb-8" aria-hidden />
                <Suspense fallback={null}>
                  <ContactForm />
                </Suspense>
              </div>
            </HudFrame>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
