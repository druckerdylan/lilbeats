"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * A photograph treated as a film frame: graded cool-and-contrasty, tinted
 * red in the shadows, vignetted at the corners, and drifting on scroll.
 *
 * Every full-bleed image on the site goes through this so photography from
 * different sources reads as one shoot instead of a stock-photo collage.
 * The image is oversized and offset vertically because the parallax
 * translate would otherwise expose the container edge.
 */
export function FilmFrame({
  src,
  alt = "",
  className,
  overlayClassName,
  children,
  /** Scroll travel as a share of the frame height. 0 disables parallax. */
  intensity = 0.16,
  /** Set on the LCP image of a page. */
  eager = false,
  kenBurns = false,
  sizes = "100vw",
  grade = "cinema",
  vignette = true,
  wash = true,
  duotone = false,
  objectPosition,
}: {
  src: string;
  alt?: string;
  className?: string;
  overlayClassName?: string;
  children?: React.ReactNode;
  intensity?: number;
  eager?: boolean;
  kenBurns?: boolean;
  sizes?: string;
  grade?: "cinema" | "soft" | "none";
  vignette?: boolean;
  wash?: boolean;
  /**
   * Forces the photo's hue to the brand red while keeping its luminance.
   * Desaturation alone can't tame strongly coloured sources — neon signs,
   * RGB studio lighting, stage washes — so those need this to join the
   * palette. Leave off for photography that is already close to neutral.
   */
  duotone?: boolean;
  objectPosition?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const travel = reduced ? 0 : intensity * 100;
  const y = useTransform(scrollYProgress, [0, 1], [`${-travel / 2}%`, `${travel / 2}%`]);

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.div
        // Oversized so the parallax translate never drags the container's
        // background into frame.
        className="absolute inset-x-0 -inset-y-[12%]"
        style={{ y }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          {...(eager ? { preload: true } : {})}
          style={objectPosition ? { objectPosition } : undefined}
          className={cn(
            "object-cover",
            grade === "cinema" && "grade-cinema",
            grade === "soft" && "grade-cinema-soft",
            kenBurns && !reduced && "animate-kenburns"
          )}
        />
      </motion.div>

      {duotone && (
        <div className="pointer-events-none absolute inset-0 bg-ember/45 mix-blend-color" />
      )}
      {wash && <div className="pointer-events-none absolute inset-0 bg-red-wash" />}
      {vignette && <div className="pointer-events-none absolute inset-0 vignette-frame" />}
      {overlayClassName && (
        <div className={cn("pointer-events-none absolute inset-0", overlayClassName)} />
      )}

      {children}
    </div>
  );
}
