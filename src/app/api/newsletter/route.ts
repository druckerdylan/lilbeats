import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/beats-repo";
import { sendEmail } from "@/lib/resend";
import { newsletterWelcomeEmail, starterPackEmail } from "@/lib/email/templates";
import { getStarterPackBeats } from "@/lib/starter-pack";

const schema = z.object({
  email: z.string().email(),
  source: z.string().optional().default("website"),
});

/**
 * The one source that gets a different reply. Every source still lands in
 * `subscribers` — a free-pack signup is a subscriber like any other — but
 * this one is owed the download links rather than a welcome note.
 */
const STARTER_PACK_SOURCE = "free-starter-pack";

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const { email, source } = parsed.data;

  if (isSupabaseConfigured()) {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("subscribers")
      .upsert({ email, source }, { onConflict: "email" });
    if (error) {
      console.error("[newsletter] failed to store subscriber", error);
    }
  } else {
    console.warn("[newsletter] Supabase not configured — subscriber was not persisted:", email);
  }

  const { subject, html } =
    source === STARTER_PACK_SOURCE
      ? starterPackEmail({ beats: await getStarterPackBeats() })
      : newsletterWelcomeEmail();

  /*
    Resend's SDK reports failure as `{ error }` rather than throwing, and
    sendEmail returns `{ skipped: true }` when no API key is configured — so
    without these checks a signup whose email never went out would still be
    told "check your inbox" and routed to the thanks page.
  */
  const sent = await sendEmail({ to: email, subject, html });
  if ("skipped" in sent && sent.skipped) {
    console.error("[newsletter] email skipped — RESEND_API_KEY not configured");
    return NextResponse.json(
      { error: "We couldn't send the email just now. Please try again shortly." },
      { status: 500 }
    );
  }
  if ("error" in sent && sent.error) {
    console.error("[newsletter] send failed", sent.error);
    return NextResponse.json(
      { error: "We couldn't send the email just now. Please try again shortly." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
