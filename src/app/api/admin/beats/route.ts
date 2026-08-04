import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { requireAdminUser } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { priceForLicense } from "@/lib/licensing";

/**
 * Metadata + storage paths only. The audio itself never passes through this
 * route: the browser uploads it straight to Supabase Storage via a signed
 * URL from /api/admin/uploads/sign, because Vercel rejects Serverless
 * Function request bodies over 4.5 MB and a single WAV blows past that.
 */
const schema = z.object({
  title: z.string().min(1),
  bpm: z.coerce.number().int().min(1),
  key: z.string().min(1),
  keyMode: z.enum(["Major", "Minor"]),
  genre: z.string().min(1),
  mood: z.string().optional().default(""),
  tags: z.string().optional().default(""),
  description: z.string().optional().default(""),
  durationSeconds: z.coerce.number().int().min(1),
  featured: z.coerce.boolean().default(false),
  artworkPath: z.string().min(1),
  previewAudioPath: z.string().min(1),
  fullMp3Path: z.string().min(1),
  wavPath: z.string().min(1),
  stemsPath: z.string().min(1).nullable().optional().default(null),
});

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}


export async function POST(req: NextRequest) {
  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid submission." },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const supabase = createAdminClient();

  try {
    const artworkPath = data.artworkPath;
    const previewPath = data.previewAudioPath;
    const fullMp3Path = data.fullMp3Path;
    const wavPath = data.wavPath;
    const stemsPath = data.stemsPath ?? null;

    const slug = `${slugify(data.title)}-${nanoid(6)}`;
    // Unlimited and Exclusive both ship the trackout stems, so neither can be
    // offered unless a stems ZIP was actually uploaded.
    const licenseAvailability = ["mp3", "wav", ...(stemsPath ? ["unlimited", "exclusive"] : [])];
    const mood = data.mood.split(",").map((m) => m.trim()).filter(Boolean);
    const description =
      data.description.trim() ||
      `${data.title} — a ${data.genre} instrumental at ${data.bpm} BPM in ${data.key} ${data.keyMode}.`;

    const { error } = await supabase.from("beats").insert({
      slug,
      title: data.title,
      artwork_path: artworkPath,
      preview_audio_path: previewPath,
      full_mp3_path: fullMp3Path,
      wav_path: wavPath,
      stems_path: stemsPath,
      bpm: data.bpm,
      key: data.key,
      key_mode: data.keyMode,
      genre: data.genre,
      mood: mood.length ? mood : [data.genre],
      tags: data.tags.split(",").map((t) => t.trim()).filter(Boolean),
      description,
      duration_seconds: data.durationSeconds,
      // Vestigial: licence pricing is flat per tier in `licensing.ts` and no
      // longer derives from a per-beat base. The column is NOT NULL, so it's
      // written with the MP3 tier price to stay consistent with what a buyer
      // is actually charged rather than a number nobody honours.
      base_price: priceForLicense("mp3"),
      plays: 0,
      favorites: 0,
      featured: data.featured,
      is_new: true,
      license_availability: licenseAvailability,
      published: true,
    });

    if (error) {
      return NextResponse.json({ error: `Could not save beat: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, slug });
  } catch (error) {
    console.error("[admin/beats] upload failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed." },
      { status: 500 }
    );
  }
}
