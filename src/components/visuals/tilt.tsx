"use client";

import { useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Pointer-tracked 3D tilt with a specular sweep, for cards.
 *
 * The glare is a radial highlight that follows the cursor across the
 * surface — without it the rotation alone reads as a cheap CSS trick
 * rather than a lit object turning under a light.
 */
export function Tilt({
  children,
  className,
  /** Max rotation in degrees. Past ~10 it stops looking like a surface. */
  max = 7,
  glare = true,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
  glare?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const spring = { stiffness: 220, damping: 22, mass: 0.4 };
  const sx = useSpring(mx, spring);
  const sy = useSpring(my, spring);

  const rotateY = useTransform(sx, [0, 1], [-max, max]);
  const rotateX = useTransform(sy, [0, 1], [max, -max]);
  const glareBg = useTransform(
    [sx, sy],
    ([x, y]) =>
      `radial-gradient(420px circle at ${(x as number) * 100}% ${(y as number) * 100}%, rgba(255,120,145,0.18), transparent 60%)`
  );

  if (reduced) return <div className={className}>{children}</div>;

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  }

  function onLeave() {
    mx.set(0.5);
    my.set(0.5);
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        // `transformPerspective`, not the `perspective` property: perspective
        // set on the element being transformed has no effect — it has to
        // apply to the transform itself, which is what this maps to.
        transformPerspective: 1000,
      }}
      className={cn("group/tilt relative", className)}
    >
      {children}
      {glare && (
        <motion.span
          aria-hidden="true"
          style={{ background: glareBg }}
          className="pointer-events-none absolute inset-0 z-20 opacity-0 transition-opacity duration-300 group-hover/tilt:opacity-100"
        />
      )}
    </motion.div>
  );
}
