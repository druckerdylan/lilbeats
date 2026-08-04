"use client";

import { getAudioElement } from "@/lib/store/player-store";

/**
 * A single Web Audio analyser tapped off the site's shared `<audio>`
 * element, so visualisers can read the live spectrum of whatever preview
 * is playing.
 *
 * Three hard constraints shape this file:
 *
 * 1. `createMediaElementSource` may be called **once** per element, ever.
 *    Calling it twice throws, so the node is cached at module scope.
 * 2. Once an element is routed through a MediaElementSource, its audio no
 *    longer reaches the speakers on its own — the graph *must* terminate at
 *    `ctx.destination` or playback goes silent. The connection order below
 *    is not optional.
 * 3. An AudioContext starts suspended until a user gesture. Playback is
 *    that gesture, so `resume()` is called on every connect attempt.
 *
 * Every failure path is swallowed and reported as "no analyser". A browser
 * that won't give us a spectrum must still play the beat — the visualiser
 * falls back to its idle animation, and the user hears audio either way.
 */

let ctx: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let source: MediaElementAudioSourceNode | null = null;
let failed = false;

const FFT_SIZE = 256;

export interface SpectrumTap {
  analyser: AnalyserNode;
  /**
   * Explicitly backed by ArrayBuffer, not ArrayBufferLike: the DOM types
   * for `getByteFrequencyData` reject a possibly-shared buffer.
   */
  bins: Uint8Array<ArrayBuffer>;
}

/**
 * Attempts to wire up (or reuse) the analyser. Safe to call on every frame
 * — it short-circuits once connected, and once permanently after a failure.
 */
export function connectAnalyser(): SpectrumTap | null {
  if (failed) return null;
  if (analyser) {
    void ctx?.resume();
    return { analyser, bins: new Uint8Array(analyser.frequencyBinCount) };
  }

  const el = getAudioElement();
  if (!el) return null;

  try {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) {
      failed = true;
      return null;
    }

    ctx = new Ctor();
    source = ctx.createMediaElementSource(el);
    analyser = ctx.createAnalyser();
    analyser.fftSize = FFT_SIZE;
    // Without smoothing the bars strobe on every frame and read as noise
    // rather than as music.
    analyser.smoothingTimeConstant = 0.78;

    source.connect(analyser);
    // The leg that keeps the beat audible. Do not remove.
    analyser.connect(ctx.destination);

    void ctx.resume();
    return { analyser, bins: new Uint8Array(analyser.frequencyBinCount) };
  } catch {
    // Most likely another source already claimed the element, or the
    // browser blocked the context. Either way: no spectrum, but audio is
    // untouched.
    failed = true;
    ctx = null;
    analyser = null;
    source = null;
    return null;
  }
}
