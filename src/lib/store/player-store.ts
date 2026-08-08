"use client";

import { create } from "zustand";
import { track as trackEvent } from "@/lib/analytics";

/**
 * What the persistent transport bar needs to render the current track.
 * Optional everywhere — callers that only have an id and a src (the
 * portfolio players, for instance) simply don't pass it, and the bar stays
 * hidden for those.
 */
export interface NowPlayingTrack {
  title: string;
  subtitle?: string;
  artworkUrl?: string;
  href?: string;
  /**
   * Catalogue slug. Its presence is what marks this as a real beat rather
   * than a comparison clip, so it doubles as the gate on the `preview_play`
   * event — the portfolio players pass no track at all and are correctly
   * never counted as beat previews.
   */
  slug?: string;
}

interface PlayerState {
  currentBeatId: string | null;
  currentTrack: NowPlayingTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  toggle: (beatId: string, src: string, track?: NowPlayingTrack) => void;
  /** Play/pause whatever is already loaded, without needing its source URL. */
  playPause: () => void;
  pause: () => void;
  seek: (time: number) => void;
  stop: () => void;
}

let audioEl: HTMLAudioElement | null = null;

function getAudioEl(set: (partial: Partial<PlayerState>) => void): HTMLAudioElement {
  if (!audioEl && typeof window !== "undefined") {
    audioEl = new Audio();
    /*
      Required for the hero visualiser once audio is served from Supabase
      Storage rather than /public. Routing a cross-origin media element
      through Web Audio's createMediaElementSource taints the graph and the
      output goes SILENT unless the element opted into CORS. Supabase's
      public buckets send Access-Control-Allow-Origin, so this is all that's
      needed — but without it every preview would play nothing in production
      while working perfectly on localhost.
    */
    audioEl.crossOrigin = "anonymous";
    audioEl.preload = "metadata";
    audioEl.addEventListener("timeupdate", () => {
      set({ currentTime: audioEl?.currentTime ?? 0 });
    });
    audioEl.addEventListener("loadedmetadata", () => {
      set({ duration: audioEl?.duration ?? 0 });
    });
    audioEl.addEventListener("ended", () => {
      set({ isPlaying: false, currentTime: 0 });
    });
  }
  return audioEl!;
}

/**
 * The single `<audio>` element every player on the site shares.
 *
 * Exposed so the hero visualiser can tap it with a Web Audio AnalyserNode.
 * Returns null before any playback has been started — the element is
 * created lazily on first `toggle()`, so callers must handle its absence
 * and re-check rather than assuming it exists on mount.
 */
export function getAudioElement(): HTMLAudioElement | null {
  return audioEl;
}

export const useAudioPlayerStore = create<PlayerState>((set, get) => ({
  currentBeatId: null,
  currentTrack: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  toggle: (beatId, src, track) => {
    const el = getAudioEl(set);
    const { currentBeatId, isPlaying } = get();

    if (currentBeatId === beatId) {
      if (isPlaying) {
        el.pause();
        set({ isPlaying: false });
      } else {
        el.play();
        set({ isPlaying: true });
      }
      return;
    }

    /*
      `preview_play` fires here and only here — on the branch that loads a
      *new* source. Every play button on the site funnels through `toggle`,
      so one call covers the catalogue grid, the beat page, and the docked
      transport without any of them having to remember to instrument
      themselves. Resuming after a pause deliberately does not re-fire: the
      question the metric answers is "how many previews got started", and a
      pause/resume is one preview, not two.
    */
    if (track?.slug) trackEvent("preview_play", { beat: track.slug });

    el.src = src;
    el.currentTime = 0;
    el.play();
    set({
      currentBeatId: beatId,
      currentTrack: track ?? null,
      isPlaying: true,
      currentTime: 0,
      duration: 0,
    });
  },
  playPause: () => {
    if (!audioEl || !get().currentBeatId) return;
    if (get().isPlaying) {
      audioEl.pause();
      set({ isPlaying: false });
    } else {
      void audioEl.play();
      set({ isPlaying: true });
    }
  },
  pause: () => {
    audioEl?.pause();
    set({ isPlaying: false });
  },
  seek: (time) => {
    if (audioEl) audioEl.currentTime = time;
    set({ currentTime: time });
  },
  stop: () => {
    if (audioEl) {
      audioEl.pause();
      audioEl.currentTime = 0;
    }
    set({ currentBeatId: null, currentTrack: null, isPlaying: false, currentTime: 0 });
  },
}));
