"use client";

import { useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

export type RevealVariant = "wipe" | "rise" | "fade" | "blur";

/**
 * The site's entrance vocabulary.
 *
 * `wipe` is the default and the reason this exists: a clip-path mask that
 * uncovers the element from its bottom edge reads like a title card being
 * revealed, where a plain opacity fade reads like a web page loading.
 * Everything animates on a single easing curve so the whole site moves
 * with one hand.
 */
const VARIANTS: Record<RevealVariant, Variants> = {
  wipe: {
    /*
      The inset stops at 88%, not 100%, and that matters: `clip-path` is
      applied before IntersectionObserver computes a target's intersection
      rect, so a fully-inset element reports zero intersection and
      `whileInView` never fires — the reveal deadlocks itself and the
      content stays permanently invisible. Leaving a sliver unclipped keeps
      the element observable; `opacity: 0` is what actually hides it, and
      the two animate together so the wipe looks identical.
    */
    hidden: { opacity: 0, y: 30, clipPath: "inset(88% 0% 0% 0%)" },
    visible: { opacity: 1, y: 0, clipPath: "inset(0% 0% 0% 0%)" },
  },
  rise: {
    hidden: { opacity: 0, y: 36 },
    visible: { opacity: 1, y: 0 },
  },
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  blur: {
    hidden: { opacity: 0, y: 20, filter: "blur(14px)" },
    visible: { opacity: 1, y: 0, filter: "blur(0px)" },
  },
};

const STILL: Variants = { hidden: { opacity: 1 }, visible: { opacity: 1 } };

export function Reveal({
  children,
  className,
  delay = 0,
  duration = 0.9,
  variant = "wipe",
  y,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  variant?: RevealVariant;
  /** Overrides the variant's travel distance. */
  y?: number;
}) {
  const reduced = useReducedMotion();

  const variants = reduced
    ? STILL
    : y !== undefined
      ? { hidden: { opacity: 0, y }, visible: { opacity: 1, y: 0 } }
      : VARIANTS[variant];

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-90px" }}
      transition={{ duration: reduced ? 0 : duration, delay: reduced ? 0 : delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

export function RevealGroup({
  children,
  className,
  stagger = 0.09,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-90px" }}
      variants={{
        hidden: {},
        visible: {
          transition: reduced ? {} : { staggerChildren: stagger, delayChildren: delay },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className,
  variant = "wipe",
  duration = 0.8,
}: {
  children: React.ReactNode;
  className?: string;
  variant?: RevealVariant;
  duration?: number;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      variants={reduced ? STILL : VARIANTS[variant]}
      transition={{ duration: reduced ? 0 : duration, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Headline reveal: each word rides up from behind its own clipping mask.
 * Use for once-per-page titles only — it's loud by design, and applying it
 * to every heading turns the effect into noise.
 */
export function SplitWords({
  text,
  className,
  wordClassName,
  delay = 0,
  stagger = 0.055,
}: {
  text: string;
  className?: string;
  wordClassName?: string;
  delay?: number;
  stagger?: number;
}) {
  const reduced = useReducedMotion();
  const words = text.split(" ");
  /*
    The per-word mask has to clip during the reveal, but keeping it after the
    animation crops anything that paints outside the glyph box — a neon glow
    gets sheared into a hard rectangle. Released on completion.
  */
  const [revealed, setRevealed] = useState(false);

  if (reduced) return <span className={className}>{text}</span>;

  return (
    <motion.span
      className={cn("inline", className)}
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
      aria-label={text}
    >
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          aria-hidden
          // The padding/negative-margin pair gives descenders and the display
          // face's overshoot room inside the mask; without it the clip shaves
          // the bottom off the glyphs.
          className={cn(
            "inline-block pb-[0.12em] -mb-[0.12em] align-bottom",
            revealed ? "overflow-visible" : "overflow-hidden"
          )}
        >
          <motion.span
            className={cn("inline-block", wordClassName)}
            variants={{
              hidden: { y: "110%", opacity: 0 },
              visible: { y: "0%", opacity: 1 },
            }}
            transition={{ duration: 0.95, ease: EASE }}
            onAnimationComplete={() => setRevealed(true)}
          >
            {word}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}
