import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/beats-repo";
import { sendEmail } from "@/lib/resend";
import { newsletterWelcomeEmail } from "@/lib/email/templates";

const schema = z.object({
  email: z.string().email(),
  source: z.string().optional().default("website"),
});

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

  const { subject, html } = newsletterWelcomeEmail();
  await sendEmail({ to: email, subject, html });

  return NextResponse.json({ success: true });
}
