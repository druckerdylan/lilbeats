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
    if (error || !data) return BEATS;
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
 * Tiers that include the trackout stems resolve to the stems ZIP; the rest
 * resolve to their highest-quality single file. The fallback chain matters:
 * without it a tier whose file was never uploaded would silently hand the
 * buyer a lower-tier file than they paid for, so it steps *down* only when
 * the entitled file genuinely doesn't exist.
 *
 * Note this delivers ONE file per licence. "MP3 + WAV + Stems" tiers
 * therefore hand over the stems ZIP alone — see `getBeatFileLocation`'s
 * callers if that needs to become a multi-file download.
 */
function pathForLicense(
  licenseId: string,
  files: { mp3: string | null; wav: string | null; stems: string | null }
): string | null {
  switch (licenseId) {
    case "exclusive":
    case "unlimited":
      return files.stems ?? files.wav ?? files.mp3;
    case "wav":
      return files.wav ?? files.mp3;
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
      .select("full_mp3_path, wav_path, stems_path")
      .eq("id", beatId)
      .maybeSingle();
    if (!data) return null;

    const path = pathForLicense(licenseId, {
      mp3: data.full_mp3_path,
      wav: data.wav_path,
      stems: data.stems_path,
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
  });
  if (!path) return null;

  return { bucket: "local", path, isLocal: true };
}
