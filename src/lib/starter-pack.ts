import "server-only";
import { getAllBeats } from "@/lib/beats-repo";

/** How many beats the Artist Starter Pack promises. The /free page says five. */
export const STARTER_PACK_SIZE = 5;

/**
 * The curated Artist Starter Pack.
 *
 * List exactly {@link STARTER_PACK_SIZE} beat slugs here — the `slug` column
 * in Supabase, e.g. `"midnight-ritual"` — to choose which beats the free
 * pack sends, in the order they should appear in the email.
 *
 * Left empty, the pack falls back to the five most recently published beats,
 * so the email always has something real in it. That fallback is a safety
 * net, not the plan: a curated pack is the one chance to lead with the five
 * beats that best represent the catalogue.
 */
export const STARTER_PACK_SLUGS: string[] = [];

export interface StarterPackBeat {
  title: string;
  /** Public, unauthenticated download link. Never a private file URL. */
  url: string;
}

/**
 * Resolves the pack into title + download-link pairs for the email.
 *
 * ─── WHICH FILE THIS HANDS OUT ─────────────────────────────────────────
 * `beat.previewAudioUrl` — the object in the public `beat-previews` bucket,
 * the same file the site streams to anyone who presses play. It is public by
 * design and needs no signed URL, which is exactly what a free lead magnet
 * wants. The private `beat-files` bucket (full MP3, WAV, stems) is what
 * paying customers get through `/api/download/[token]`, and is deliberately
 * NOT touched here.
 *
 * TWO THINGS DYLAN MUST CONFIRM BEFORE PROMOTING /free:
 *
 * 1. **Length and bitrate.** `scripts/refresh-previews.mjs` publishes the
 *    whole track at 320kbps MP3 by default, but honours `PREVIEW_SECONDS`
 *    to cut a shorter clip. The /free page promises full-length 320kbps
 *    MP3s, so the previews currently in the bucket have to have been built
 *    at full length.
 * 2. **The producer tag.** That script's own header note says these masters
 *    do not carry one. An untagged full-length preview is the complete beat,
 *    given away free, and this email hands it over on purpose — verify that
 *    is still the intended trade before driving traffic here.
 * ───────────────────────────────────────────────────────────────────────
 *
 * Never throws: a catalogue that cannot be loaded returns an empty array and
 * logs, and `starterPackEmail` renders a graceful "reply and we'll send them
 * over" message instead. Someone who just handed over their email address
 * should get *something* back, not a 500.
 */
export async function getStarterPackBeats(): Promise<StarterPackBeat[]> {
  try {
    const beats = await getAllBeats();

    if (beats.length === 0) {
      console.error("[starter-pack] no beats available to build the pack from");
      return [];
    }

    const selected = STARTER_PACK_SLUGS.length
      ? // Curated order wins over catalogue order. A slug that no longer
        // resolves (renamed, unpublished) is dropped rather than sending a
        // dead link, so the pack can come back short — logged below.
        STARTER_PACK_SLUGS.map((slug) => beats.find((beat) => beat.slug === slug)).filter(
          (beat) => beat !== undefined
        )
      : // `getAllBeats` already orders newest first.
        beats.slice(0, STARTER_PACK_SIZE);

    if (selected.length !== STARTER_PACK_SIZE) {
      console.warn(
        `[starter-pack] expected ${STARTER_PACK_SIZE} beats, resolved ${selected.length}` +
          (STARTER_PACK_SLUGS.length
            ? " — check STARTER_PACK_SLUGS against the published catalogue"
            : " — the catalogue has fewer than five published beats")
      );
    }

    return selected.map((beat) => ({ title: beat.title, url: beat.previewAudioUrl }));
  } catch (error) {
    console.error("[starter-pack] failed to resolve pack beats", error);
    return [];
  }
}
