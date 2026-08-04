"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/**
 * Hairline of red across the top of the viewport that fills as the page
 * scrolls — a film scrubber for the document. Sits above the sticky navbar.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 28,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-50 h-px origin-left bg-gradient-to-r from-ember via-ember-bright to-ember"
    />
  );
}
