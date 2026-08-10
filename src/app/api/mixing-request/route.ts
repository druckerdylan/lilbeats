import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { createAdminClient, STORAGE_BUCKETS } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/beats-repo";
import { sendEmail } from "@/lib/resend";
import { mixingRequestAdminEmail, mixingRequestCustomerEmail } from "@/lib/email/templates";
import { BRAND } from "@/lib/constants";
import { MixingRequestPayload } from "@/lib/types";

const schema = z.object({
  artistName: z.string().min(1),
  fullName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  songTitle: z.string().min(1),
  genre: z.string().min(1),
  serviceRequested: z.enum([
    "mixing",
    "mastering",
    "mixing-mastering",
    "mixing-mastering-premium",
    "vocal-tuning",
    "other",
  ]),
  numberOfSongs: z.coerce.number().int().min(1),
  referenceTracks: z.string().optional().default(""),
  desiredSound: z.string().optional().default(""),
  currentMixProblems: z.string().optional().default(""),
  deadline: z.string().optional().default(""),
  budget: z.string().optional().default(""),
  fileLink: z.string().optional().default(""),
  additionalNotes: z.string().optional().default(""),
  confirmsOwnership: z.stringbool().refine((v) => v === true, {
    message: "You must confirm ownership of these files.",
  }),
});

const MAX_FILE_BYTES = 100 * 1024 * 1024;
/** Ceiling across a whole submission, so 20 stems cannot become 2GB. */
const MAX_TOTAL_BYTES = 500 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const raw = Object.fromEntries(formData.entries());
  // Several files arrive under one key, so getAll — get() would silently keep
  // only the first and quietly drop the rest of someone's session.
  const projectFiles = formData
    .getAll("projectFile")
    .filter((f): f is File => f instanceof File && f.size > 0);

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid submission." },
      { status: 400 }
    );
  }

  const payload: MixingRequestPayload = parsed.data;
  let projectFilePath: string | null = null;

  if (projectFiles.length) {
    const oversized = projectFiles.find((f) => f.size > MAX_FILE_BYTES);
    if (oversized) {
      return NextResponse.json(
        { error: `"${oversized.name}" is too large (100MB max per file).` },
        { status: 400 }
      );
    }
    const total = projectFiles.reduce((n, f) => n + f.size, 0);
    if (total > MAX_TOTAL_BYTES) {
      return NextResponse.json(
        { error: "Those files come to more than 500MB in total. Send a Drive or Dropbox link instead." },
        { status: 400 }
      );
    }

    if (isSupabaseConfigured()) {
      const supabase = createAdminClient();
      const stored: string[] = [];

      for (const file of projectFiles) {
        /*
          The filename is attacker-controlled and becomes a storage key, so it
          is stripped to a leaf and reduced to a safe character set — a name
          carrying `../` would otherwise decide where the object lands.
        */
        const safe = file.name.split(/[\\/]/).pop()!.replace(/[^\w.\-]+/g, "_").slice(-120);
        const path = `${nanoid()}-${safe}`;
        const buffer = Buffer.from(await file.arrayBuffer());
        const { error } = await supabase.storage
          .from(STORAGE_BUCKETS.mixingUploads)
          .upload(path, buffer, { contentType: file.type || "application/octet-stream" });

        if (error) {
          console.error(`[mixing-request] upload failed for ${file.name}`, error);
        } else {
          stored.push(path);
        }
      }

      // Newline-separated: one text column, and the paths never contain one.
      projectFilePath = stored.length ? stored.join("\n") : null;
    } else {
      console.warn("[mixing-request] Supabase not configured — skipping file upload.");
    }
  }

  if (isSupabaseConfigured()) {
    const supabase = createAdminClient();
    const { error } = await supabase.from("mixing_requests").insert({
      artist_name: payload.artistName,
      full_name: payload.fullName,
      email: payload.email,
      phone: payload.phone,
      song_title: payload.songTitle,
      genre: payload.genre,
      service_requested: payload.serviceRequested,
      number_of_songs: payload.numberOfSongs,
      reference_tracks: payload.referenceTracks,
      desired_sound: payload.desiredSound,
      current_mix_problems: payload.currentMixProblems,
      deadline: payload.deadline,
      budget: payload.budget,
      file_link: payload.fileLink,
      project_file_path: projectFilePath,
      additional_notes: payload.additionalNotes,
      confirms_ownership: payload.confirmsOwnership,
      status: "new",
    });

    if (error) {
      console.error("[mixing-request] failed to store request", error);
      return NextResponse.json({ error: "Could not save your request. Try again." }, { status: 500 });
    }
  } else {
    console.warn(
      "[mixing-request] Supabase not configured — request was not persisted:",
      payload
    );
  }

  const customerEmail = mixingRequestCustomerEmail(payload);
  const adminEmail = mixingRequestAdminEmail(payload);

  await Promise.all([
    sendEmail({ to: payload.email, subject: customerEmail.subject, html: customerEmail.html }),
    sendEmail({ to: BRAND.email, subject: adminEmail.subject, html: adminEmail.html }),
  ]);

  return NextResponse.json({ success: true });
}
