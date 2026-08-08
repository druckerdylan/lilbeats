import "server-only";
import { BEATS } from "@/lib/mock-data";
import { Beat } from "@/lib/types";
import { createAdminClient, STORAGE_BUCKETS } from "@/lib/supabase/admin";
import { Database } from "@/lib/supabase/types";

/**
 * Reads beats from Supabase when the project is configured, and falls back
 * to the local mock catalog otherwise. This lets checkout, downloads, and
 * the admin dashboard run against the real database in production while
 * still working out of the box against `lib/mock-data.ts` in development.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

function publicStorageUrl(path: string, bucket: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}

function mapRowToBeat(row: Database["public"]["Tables"]["beats"]["Row"]): Beat {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    artworkUrl: publicStorageUrl(row.artwork_path, STORAGE_BUCKETS.artwork),
    previewAudioUrl: publicStorageUrl(row.preview_audio_path, STORAGE_BUCKETS.previews),
    fullMp3Url: row.full_mp3_path,
    wavUrl: row.wav_path,
    stemsUrl: row.stems_path,
    bpm: row.bpm,
    key: row.key as Beat["key"],
    keyMode: row.key_mode as Beat["keyMode"],
    genre: row.genre,
    mood: row.mood,
    tags: row.tags,
    description: row.description,
    durationSeconds: row.duration_seconds,
    basePrice: Number(row.base_price),
    plays: row.plays,
    favorites: row.favorites,
    featured: row.featured,
    isNew: row.is_new,
    licenseAvailability: row.license_availability as Beat["licenseAvailability"],
    createdAt: row.created_at,
  };
}

export async function getBeatById(id: string): Promise<Beat | null> {
  if (isSupabaseConfigured()) {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("beats")
      .select("*")
      .eq("id", id)
      .eq("published", true)
      .maybeSingle();
    return data ? mapRowToBeat(data) : null;
  }
  return BEATS.find((b) => b.id === id) ?? null;
}

export async function getBeatBySlug(slug: string): Promise<Beat | null> {
  if (isSupabaseConfigured()) {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("beats")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();
    return data ? mapRowToBeat(data) : null;
  }
  return BEATS.find((b) => b.slug === slug) ?? null;
}

export async function getAllBeats(): Promise<Beat[]> {
  if (isSupabaseConfigured()) {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("beats")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false });

    /*
      Fails CLOSED, and the distinction matters.

      Supabase not being configured at all (the branch below) means local
      development, where the mock catalogue is the intended fixture.

      Supabase being configured but erroring means production briefly lost
      its database. Falling back to `BEATS` there would repopulate a live
      storefront with invented beats — fabricated titles, fabricated play
      counts, and artwork and audio URLs pointing at files that do not
      exist — and quietly sell licences for them. An empty catalogue is a
      visibly broken store; a fake one is a store that lies. Every caller
      handles zero beats: /beats renders its empty state, the homepage's
      featured grid renders none, `generateStaticParams` yields no paths
      (`dynamicParams` is on, so slugs still resolve), and the sitemap
      simply omits beat entries.
    */
    if (error || !data) {
      console.error("[beats-repo] failed to load beats from Supabase", error);
      return [];
    }
    return data.map(mapRowToBeat);
  }
  return BEATS;
}

export interface BeatFileLocation {
  bucket: string;
  path: string;
  /** True when the path is a local /public file rather than a Supabase Storage object. */
  isLocal: boolean;
}

/**
 * The file a licence entitles the buyer to download.
 *
 * A download link resolves to exactly one object, but every tier above MP3
 * promises several files — Premium is "MP3 + WAV", Unlimited and Exclusive
 * are "MP3 + WAV + Stems". Those tiers therefore resolve to a pre-built
 * bundle (see `scripts/build-bundles.mjs`) rather than to a single file.
 *
 * Before the bundles existed this returned the stems ZIP for Unlimited and
 * Exclusive and the bare WAV for Premium — so buyers of all three tiers were
 * handed strictly less than the store advertised.
 *
 * The fallback chain steps *down* only when the entitled file genuinely does
 * not exist, so a beat that has not been bundled yet still delivers the best
 * single file it has instead of failing. That is a stopgap, not the intent:
 * `bundleReadiness()` reports which beats are still short.
 */
function pathForLicense(
  licenseId: string,
  files: {
    mp3: string | null;
    wav: string | null;
    stems: string | null;
    premiumBundle: string | null;
    completeBundle: string | null;
  }
): string | null {
  switch (licenseId) {
    case "exclusive":
    case "unlimited":
      return files.completeBundle ?? files.stems ?? files.wav ?? files.mp3;
    case "wav":
      return files.premiumBundle ?? files.wav ?? files.mp3;
    default:
      return files.mp3;
  }
}

export async function getBeatFileLocation(
  beatId: string,
  licenseId: string
): Promise<BeatFileLocation | null> {
  if (isSupabaseConfigured()) {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("beats")
      .select("full_mp3_path, wav_path, stems_path, premium_bundle_path, complete_bundle_path")
      .eq("id", beatId)
      .maybeSingle();
    if (!data) return null;

    const path = pathForLicense(licenseId, {
      mp3: data.full_mp3_path,
      wav: data.wav_path,
      stems: data.stems_path,
      premiumBundle: data.premium_bundle_path,
      completeBundle: data.complete_bundle_path,
    });
    if (!path) return null;

    return { bucket: STORAGE_BUCKETS.files, path, isLocal: false };
  }

  const beat = BEATS.find((b) => b.id === beatId);
  if (!beat) return null;

  const path = pathForLicense(licenseId, {
    mp3: beat.fullMp3Url,
    wav: beat.wavUrl,
    stems: beat.stemsUrl,
    // The local demo catalogue points every field at the same preview file;
    // there is nothing to bundle, so these are always absent.
    premiumBundle: null,
    completeBundle: null,
  });
  if (!path) return null;

  return { bucket: "local", path, isLocal: true };
}
