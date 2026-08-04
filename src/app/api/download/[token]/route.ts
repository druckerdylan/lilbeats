import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured, getBeatFileLocation } from "@/lib/beats-repo";

const SIGNED_URL_TTL_SECONDS = 60;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Downloads require Supabase to be configured." },
      { status: 501 }
    );
  }

  const supabase = createAdminClient();

  const { data: downloadToken } = await supabase
    .from("download_tokens")
    .select("*")
    .eq("token", token)
    .maybeSingle();

  if (!downloadToken) {
    return NextResponse.json({ error: "Invalid download link." }, { status: 404 });
  }

  if (new Date(downloadToken.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: "This download link has expired." }, { status: 410 });
  }

  if (downloadToken.download_count >= downloadToken.max_downloads) {
    return NextResponse.json(
      { error: "This download link has reached its download limit." },
      { status: 403 }
    );
  }

  const location = await getBeatFileLocation(downloadToken.beat_id, downloadToken.license_id);
  if (!location) {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }

  const tokenId = downloadToken.id;
  const nextDownloadCount = downloadToken.download_count + 1;

  async function recordDownload() {
    await supabase
      .from("download_tokens")
      .update({ download_count: nextDownloadCount })
      .eq("id", tokenId);
  }

  if (location.isLocal) {
    await recordDownload();
    return NextResponse.redirect(new URL(location.path, req.url));
  }

  const { data: signed, error } = await supabase.storage
    .from(location.bucket)
    .createSignedUrl(location.path, SIGNED_URL_TTL_SECONDS, { download: true });

  if (error || !signed) {
    return NextResponse.json({ error: "Could not generate download link." }, { status: 500 });
  }

  await recordDownload();
  return NextResponse.redirect(signed.signedUrl);
}
