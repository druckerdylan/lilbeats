import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/beats-repo";
import { sendEmail } from "@/lib/resend";
import { contactAdminEmail } from "@/lib/email/templates";
import { BRAND } from "@/lib/constants";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().optional().default(""),
  message: z.string().min(10),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
  }

  const { name, email, subject, message } = parsed.data;

  if (isSupabaseConfigured()) {
    const supabase = createAdminClient();
    const { error } = await supabase.from("contact_messages").insert({
      name,
      email,
      subject: subject || null,
      message,
    });
    if (error) {
      console.error("[contact] failed to store message", error);
    }
  } else {
    console.warn("[contact] Supabase not configured — message was not persisted.");
  }

  const { subject: emailSubject, html } = contactAdminEmail({ name, email, subject, message });
  await sendEmail({ to: BRAND.email, subject: emailSubject, html, replyTo: email });

  return NextResponse.json({ success: true });
}
