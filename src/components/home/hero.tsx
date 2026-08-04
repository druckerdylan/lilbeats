"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type Transition,
  type Variants,
} from "framer-motion";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SpectrumCity } from "@/components/visuals/spectrum-city";
import { GlitchText } from "@/components/visuals/glitch-text";
import { SplitWords } from "@/components/shared/reveal";
import { EqBars } from "@/components/shared/eq-bars";
import { useAudioPlayerStore } from "@/lib/store/player-store";
import { BRAND } from "@/lib/constants";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Spoken aloud by AT — the split words themselves are aria-hidden. */
const HEADLINE = "Dark Production. Clean Mixes. Records That Hit.";

/**
 * End-credits strip. Facts only: the brand's real base of operations and
 * the genres the catalogue is actually written in.
 */
const CREDITS = [
  { label: "Lil Beats Productions" },
  { label: BRAND.location },
  { label: "Trap · Drill · R&B · Boom Bap", className: "hidden md:flex" },
];

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const isPlaying = useAudioPlayerStore((s) => s.isPlaying);
  const track = useAudioPlayerStore((s) => s.currentTrack);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", reduced ? "0%" : "16%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.72], [1, 0]);
  // The horizon sinks slower than the type, so the two layers separate.
  const cityY = useTransform(scrollYProgress, [0, 1], ["0%", reduced ? "0%" : "8%"]);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const glowX = useSpring(mouseX, { stiffness: 60, damping: 20 });
  const glowY = useSpring(mouseY, { stiffness: 60, damping: 20 });

  const keyLight = useTransform(
    [glowX, glowY],
    ([x, y]) =>
      `radial-gradient(620px circle at ${(x as number) * 100}% ${(y as number) * 100}%, rgba(255,10,60,0.16), transparent 68%)`
  );

  function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  }

  const fadeUp: Variants = {
    hidden: reduced ? { opacity: 1 } : { opacity: 0, y: 22 },
    show: { opacity: 1, y: 0 },
  };

  const cue = (delay: number): Transition => ({
    duration: reduced ? 0 : 0.85,
    delay: reduced ? 0 : delay,
    ease: EASE,
  });

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="letterbox relative isolate flex min-h-[100svh] flex-col justify-center overflow-hidden bg-ink"
    >
      {/*
        The centrepiece. Idle it runs a synthesised spectrum; the moment a
        preview plays anywhere on the site the skyline becomes that track's
        actual frequency data.
      */}
      <motion.div
        style={{ y: cityY }}
        className="pointer-events-none absolute inset-x-0 bottom-0 top-[18%] sm:top-[12%]"
      >
        <SpectrumCity />
      </motion.div>

      {/* Floor fade so the grid dissolves into the page instead of ending on
          a hard edge. Kept shallow — at a third of the height it swallowed
          the perspective grid entirely. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink to-transparent"
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-vignette opacity-80" />

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden sm:block"
        style={{ background: keyLight }}
      />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 mx-auto w-full max-w-[1600px] px-5 pt-20 pb-28 sm:px-8 lg:px-14"
      >
        {/* Status line — reads as equipment, and doubles as a live readout
            of whatever is playing. */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={cue(0.05)}
          className="flex flex-wrap items-center gap-x-5 gap-y-2"
        >
          <span className="u-meta flex items-center gap-2 text-ember-bright [text-shadow:0_2px_12px_rgba(5,5,8,0.9)]">
            <span className="relative flex size-1.5">
              <span className="animate-pulse-glow absolute inset-0 rounded-full bg-ember-bright" />
              <span className="relative inline-flex size-1.5 rounded-full bg-ember-bright" />
            </span>
            <GlitchText text="Lil Beats Productions" trigger="view" />
          </span>

          <span aria-hidden="true" className="hidden h-3 w-px bg-bone/20 sm:block" />

          <span className="u-meta hidden items-center gap-2 text-smoke sm:flex">
            {isPlaying ? (
              <>
                <EqBars className="text-ember-bright" playing bars={4} />
                <span className="text-bone">
                  {track?.title ? `Now Playing — ${track.title}` : "Signal Live"}
                </span>
              </>
            ) : (
              <>
                <span className="text-signal">◈</span>
                Spectrum Idle — Play Any Beat
              </>
            )}
          </span>
        </motion.div>

        <h1
          aria-label={HEADLINE}
          className="mt-7 font-display text-d0 text-bone uppercase sm:mt-9"
        >
          <span className="block">
            <SplitWords text="Dark Production." delay={0.12} />
          </span>
          <span className="block">
            <SplitWords text="Clean Mixes." delay={0.26} />
          </span>
          <span className="block">
            <SplitWords text="Records That" delay={0.4} />{" "}
            <SplitWords
              text="Hit."
              delay={0.56}
              className="neon-text-hot"
              wordClassName="text-ember-bright"
            />
          </span>
        </h1>

        <div className="mt-9 flex flex-col gap-8 sm:mt-11 lg:flex-row lg:items-end lg:justify-between lg:gap-20">
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={cue(0.62)}
            className="max-w-xl text-base leading-relaxed text-smoke sm:text-lg"
          >
            Lil Beats produces original, cinematic instrumentals and delivers
            professional mixing &amp; mastering for artists who need their records
            to hit on any system — from AirPods to the club.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={cue(0.72)}
            className="flex flex-col gap-3 sm:flex-row lg:shrink-0"
          >
            <Button variant="cinema" size="cinema" render={<Link href="/beats" />}>
              Browse Beats
            </Button>
            <Button
              variant="cinemaGhost"
              size="cinema"
              render={<Link href="/mixing-mastering" />}
            >
              Book Mixing &amp; Mastering
            </Button>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        style={{ opacity: contentOpacity }}
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 mx-auto w-full max-w-[1600px] px-5 pb-10 sm:px-8 sm:pb-12 lg:px-14"
      >
        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={cue(0.9)}>
          <div className="hud-ticks mb-4 opacity-40" aria-hidden="true" />
          <div className="flex items-end justify-between gap-8">
            <ul className="u-meta flex flex-wrap items-center gap-x-4 gap-y-1.5 text-smoke sm:gap-x-5">
              {CREDITS.map(({ label, className }, i) => (
                <li key={label} className={cn("flex items-center gap-4 sm:gap-5", className)}>
                  {i > 0 && <span aria-hidden="true" className="h-2.5 w-px bg-bone/25" />}
                  {label}
                </li>
              ))}
            </ul>

            <div className="hidden shrink-0 items-center gap-3 text-smoke sm:flex">
              <span className="u-meta">Scroll</span>
              <ArrowDown
                aria-hidden="true"
                className={cn("size-3.5 text-ember", !reduced && "animate-bounce")}
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
