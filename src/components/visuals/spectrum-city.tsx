"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { connectAnalyser, type SpectrumTap } from "@/lib/audio-analyser";
import { useAudioPlayerStore } from "@/lib/store/player-store";
import { cn } from "@/lib/utils";

/**
 * The hero's centrepiece: a neon horizon whose skyline *is* the frequency
 * spectrum of whatever beat is currently playing.
 *
 * Idle, it runs a synthesised spectrum so the frame is never dead. The
 * moment a preview starts anywhere on the site, it taps the shared audio
 * element and the skyline becomes the actual track — which is the whole
 * point: on a beat store, the hero should be made of the music.
 *
 * Everything is drawn in 2D canvas rather than WebGL. At this bar count the
 * cost is trivial, it degrades safely, and it avoids shipping a 3D runtime
 * for one screen.
 */
export function SpectrumCity({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const isPlaying = useAudioPlayerStore((s) => s.isPlaying);
  // Read through a ref so the animation loop never re-subscribes.
  const playingRef = useRef(isPlaying);
  useEffect(() => {
    playingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let t = 0;
    let visible = true;
    let tap: SpectrumTap | null = null;

    // Cursor parallax, eased toward the pointer rather than snapped to it.
    let targetPX = 0;
    let px = 0;

    const BARS = 72;
    const levels = new Float32Array(BARS);

    function resize() {
      const parent = canvas!.parentElement;
      if (!parent) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = parent.clientWidth;
      h = parent.clientHeight;
      canvas!.width = Math.floor(w * dpr);
      canvas!.height = Math.floor(h * dpr);
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function onPointer(e: PointerEvent) {
      targetPX = (e.clientX / window.innerWidth - 0.5) * 2; // -1 … 1
    }

    /**
     * Fills `levels` with the current spectrum, 0…1 per bar.
     *
     * Live: averages the FFT bins into BARS buckets on a curve, so the bass
     * end isn't crammed into two bars the way a linear split would leave it.
     * Idle: layered sines that read as a slow, musical drift.
     */
    function sample() {
      if (playingRef.current) {
        tap ??= connectAnalyser();
        if (tap) {
          tap.analyser.getByteFrequencyData(tap.bins);
          /*
            Only the lower ~62% of bins are worth drawing. At fftSize 256 and
            44.1kHz each bin spans ~172Hz, so the full array reaches 22kHz —
            and an MP3 has essentially nothing above 13kHz. Mapping all 72
            bars across the whole array left the right-hand half of the
            skyline permanently flat.
          */
          const n = Math.floor(tap.bins.length * 0.62);
          for (let i = 0; i < BARS; i++) {
            const p = i / BARS;
            // More bars spent on the low end, but gentler than a true log
            // scale — at 1.7 the whole skyline collapsed into the first few
            // bars on bass-heavy trap.
            const lo = Math.floor(Math.pow(p, 1.3) * n);
            const hi = Math.max(lo + 1, Math.floor(Math.pow((i + 1) / BARS, 1.3) * n));
            let sum = 0;
            for (let j = lo; j < hi && j < n; j++) sum += tap.bins[j];
            const raw = sum / (hi - lo) / 255;
            /*
              Order matters here, and getting it wrong is what flattened this
              before: the gamma has to shape the raw 0..1 reading, and only
              then does the tilt lift the high end.

              Previously it was pow(raw * tilt, 0.62) with a tilt up to 4.2x.
              Anything above raw 0.24 therefore left the 0..1 range before the
              gamma saw it, and pow(x>1, 0.62) stays above 1 — so nearly every
              band clamped to full height and the skyline read as a solid block.
            */
            const tilt = 1 + p * 0.7; // gentle high-frequency compensation
            // Near-linear on purpose. Measuring a real track through this
            // analyser gives roughly 0.86 in the bass against 0.22 in the
            // highs — a 4x range that any meaningful gamma lift flattens into
            // a solid block. Scaling leaves peaks somewhere to go.
            const v = Math.max(0.02, Math.min(1, raw * tilt * 0.85));
            // Attack fast, release slow — matches how a level meter behaves.
            levels[i] += (v - levels[i]) * (v > levels[i] ? 0.6 : 0.2);
          }
          return;
        }
      }

      for (let i = 0; i < BARS; i++) {
        const p = i / BARS;
        const v =
          0.26 +
          0.2 * Math.sin(t * 0.9 + p * 7) +
          0.14 * Math.sin(t * 1.7 - p * 13) +
          0.1 * Math.sin(t * 0.4 + p * 23);
        levels[i] += (Math.max(0.04, v * (1 - p * 0.45)) - levels[i]) * 0.08;
      }
    }

    function draw() {
      raf = requestAnimationFrame(draw);
      if (!visible) return;

      t += 0.016;
      px += (targetPX - px) * 0.05;
      sample();

      const horizon = h * 0.58;
      const vpX = w / 2 + px * w * 0.06;
      // Low end drives the whole scene's energy.
      const bass = (levels[0] + levels[1] + levels[2] + levels[3]) / 4;

      ctx!.clearRect(0, 0, w, h);

      /* ── Ground grid, receding to the vanishing point ───────────── */
      ctx!.save();
      ctx!.lineWidth = 1;

      // Lines running toward the viewer. Spacing follows a power curve so
      // they bunch up at the horizon the way real perspective does, and the
      // scrolling offset makes the ground travel.
      const ROWS = 22;
      const scroll = (t * 0.22 + bass * 0.12) % 1;
      for (let i = 0; i < ROWS; i++) {
        const k = (i + scroll) / ROWS;
        const y = horizon + Math.pow(k, 2.6) * (h - horizon) * 1.15;
        if (y > h) continue;
        const fade = Math.pow(k, 0.55);
        ctx!.strokeStyle = `rgba(255, 45, 71, ${0.05 + fade * 0.55})`;
        ctx!.beginPath();
        ctx!.moveTo(0, y);
        ctx!.lineTo(w, y);
        ctx!.stroke();
      }

      // Rails converging on the vanishing point.
      const COLS = 26;
      for (let i = 0; i <= COLS; i++) {
        const spread = (i / COLS - 0.5) * 2;
        const xBottom = vpX + spread * w * 2.4;
        ctx!.strokeStyle = `rgba(255, 45, 71, ${0.06 + (1 - Math.abs(spread)) * 0.3})`;
        ctx!.beginPath();
        ctx!.moveTo(vpX, horizon);
        ctx!.lineTo(xBottom, h);
        ctx!.stroke();
      }
      ctx!.restore();

      /* ── Skyline: the spectrum itself ───────────────────────────── */
      const barW = w / BARS;
      const maxH = horizon * 0.82;

      // Mirrored reflection on the grid below, drawn first so the solid
      // skyline sits on top of it.
      ctx!.save();
      ctx!.globalAlpha = 0.18;
      for (let i = 0; i < BARS; i++) {
        const bh = levels[i] * maxH;
        const x = i * barW;
        const g = ctx!.createLinearGradient(0, horizon, 0, horizon + bh * 0.7);
        g.addColorStop(0, "rgba(255, 45, 71, 0.55)");
        g.addColorStop(1, "rgba(255, 45, 71, 0)");
        ctx!.fillStyle = g;
        ctx!.fillRect(x + 0.5, horizon, barW - 1.5, bh * 0.7);
      }
      ctx!.restore();

      for (let i = 0; i < BARS; i++) {
        const bh = levels[i] * maxH;
        const x = i * barW;
        const y = horizon - bh;

        const g = ctx!.createLinearGradient(0, y, 0, horizon);
        g.addColorStop(0, "rgba(255, 90, 120, 0.95)");
        g.addColorStop(0.45, "rgba(255, 10, 60, 0.72)");
        g.addColorStop(1, "rgba(120, 8, 30, 0.12)");
        ctx!.fillStyle = g;
        ctx!.fillRect(x + 0.5, y, barW - 1.5, bh);

        // Hot cap — the bit that actually reads as neon.
        ctx!.fillStyle = "rgba(255, 200, 210, 0.92)";
        ctx!.fillRect(x + 0.5, y, barW - 1.5, 2);
      }

      /* ── Horizon line + bloom ───────────────────────────────────── */
      const bloom = ctx!.createLinearGradient(0, horizon - 90, 0, horizon + 90);
      bloom.addColorStop(0, "rgba(255, 10, 60, 0)");
      bloom.addColorStop(0.5, `rgba(255, 10, 60, ${0.16 + bass * 0.3})`);
      bloom.addColorStop(1, "rgba(255, 10, 60, 0)");
      ctx!.fillStyle = bloom;
      ctx!.fillRect(0, horizon - 90, w, 180);

      ctx!.fillStyle = `rgba(255, 220, 228, ${0.5 + bass * 0.5})`;
      ctx!.fillRect(0, horizon - 1, w, 1.5);

      /* ── Cyan fringe on the horizon, the scene's only cold light ── */
      ctx!.fillStyle = `rgba(34, 211, 238, ${0.05 + bass * 0.12})`;
      ctx!.fillRect(0, horizon + 1.5, w, 1);
    }

    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    // Don't burn frames (or battery) while the hero is scrolled away.
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
      },
      { threshold: 0 }
    );
    io.observe(canvas);

    window.addEventListener("pointermove", onPointer, { passive: true });

    if (reduced) {
      // One static frame: the composition without the motion.
      for (let i = 0; i < BARS; i++) levels[i] = 0.2 + 0.18 * Math.sin(i * 0.7);
      draw();
      cancelAnimationFrame(raf);
    } else {
      raf = requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onPointer);
    };
  }, [reduced]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn("h-full w-full", className)}
    />
  );
}
