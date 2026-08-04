"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const GLYPHS = "▚▞█▓▒░/\\<>[]{}#$%&*+=—01";

/**
 * Text that decodes into place — characters land left to right out of a
 * scramble, like a terminal resolving a signal.
 *
 * Accessibility: the scrambled glyphs are `aria-hidden` and the real string
 * is carried by `aria-label`, so assistive tech only ever hears the actual
 * words. Under `prefers-reduced-motion` it renders as plain text with no
 * scramble at all.
 */
export function GlitchText({
  text,
  className,
  trigger = "hover",
  speed = 28,
  as: Tag = "span",
}: {
  text: string;
  className?: string;
  /** `hover` decodes on pointer-enter; `view` decodes once on mount. */
  trigger?: "hover" | "view";
  /** ms per tick. Lower is faster. */
  speed?: number;
  as?: "span" | "div";
}) {
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(text);
  const [renderedFor, setRenderedFor] = useState(text);
  const frame = useRef(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  }, []);

  const run = useCallback(() => {
    if (reduced) return;
    stop();
    frame.current = 0;
    timer.current = setInterval(() => {
      frame.current += 1;
      // Each character resolves after its own index is passed, so the
      // string settles from the left rather than all at once.
      const settled = frame.current / 2;
      let out = "";
      let done = true;
      for (let i = 0; i < text.length; i++) {
        if (i < settled || text[i] === " ") {
          out += text[i];
        } else {
          done = false;
          out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
      }
      setDisplay(out);
      if (done) {
        setDisplay(text);
        stop();
      }
    }, speed);
  }, [reduced, speed, stop, text]);

  useEffect(() => {
    if (trigger === "view") run();
    return stop;
  }, [trigger, run, stop]);

  // Keep the label in sync if the text prop changes mid-life. Adjusting
  // state during render (rather than in an effect) avoids a cascading
  // second render with the stale string painted.
  if (renderedFor !== text) {
    setRenderedFor(text);
    setDisplay(text);
  }

  if (reduced) return <Tag className={className}>{text}</Tag>;

  return (
    <Tag
      className={cn("inline-block", className)}
      aria-label={text}
      onPointerEnter={trigger === "hover" ? run : undefined}
    >
      <span aria-hidden="true">{display}</span>
    </Tag>
  );
}
