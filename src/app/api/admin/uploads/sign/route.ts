import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { requireAdminUser } from "@/lib/admin-auth";
import { createAdminClient, STORAGE_BUCKETS } from "@/lib/supabase/admin";

/**
 * Mints a short-lived signed upload URL so the browser can PUT a beat's
 * audio straight into Supabase Storage.
 *
 * This exists because Vercel caps a Serverless Function's request body at
 * 4.5 MB. The old flow POSTed artwork + preview + full MP3 + WAV + stems
 * through the Next route, which works locally (no limit) and then fails
 * with a 413 in production on the first real WAV. Signing here keeps the
 * service-role key on the server while the bytes bypass Vercel entirely.
 *
 * Only the four beat buckets are signable, and the bucket name is matched
 * against that map rather than taken from the caller — otherwise this
 * endpoint would write anywhere in storage.
 */

const BUCKETS = {
  artwork: STORAGE_BUCKETS.artwork,
  previews: STORAGE_BUCKETS.previews,
  files: STORAGE_BUCKETS.files,
} as const;

const schema = z.object({
  bucket: z.enum(["artwork", "previews", "files"]),
  filename: z.string().min(1).max(200),
});

/** Strips path separators and anything else that could escape the bucket root. */
function safeName(filename: string): string {
  const base = filename.split(/[\\/]/).pop() ?? "file";
  return base.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 120);
}

export async function POST(req: NextRequest) {
  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid upload request." }, { status: 400 });
  }

  const bucket = BUCKETS[parsed.data.bucket];
  const path = `${nanoid()}-${safeName(parsed.data.filename)}`;

  const supabase = createAdminClient();
  const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(path);

  if (error || !data) {
    return NextResponse.json(
      { error: `Could not sign upload: ${error?.message ?? "unknown error"}` },
      { status: 500 }
    );
  }

  // `token` is what the browser hands back to uploadToSignedUrl; `path` is
  // what gets stored on the beat row.
  return NextResponse.json({ path: data.path, token: data.token, bucket });
}
