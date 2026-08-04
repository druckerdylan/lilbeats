#!/usr/bin/env node
/**
 * Imports the staged manifest into Supabase.
 *
 *   node --env-file=.env.local scripts/import-beats.mjs [--dry-run]
 *
 * Uploads straight from disk with the service-role key, so the 4.5 MB body
 * limit that governs the browser uploader does not apply — this catalogue is
 * several gigabytes and would be painful to push through a form.
 *
 * Safe to re-run: a beat whose title already exists is skipped, and each
 * file is only uploaded if it isn't already in the bucket. A part-way
 * failure can simply be run again.
 */

import { readFileSync, existsSync, createReadStream, statSync } from "node:fs";
import { join, basename, extname } from "node:path";
import { createClient } from "@supabase/supabase-js";

const DRY = process.argv.includes("--dry-run");
const STAGING = join(process.cwd(), ".beats-staging");
const MANIFEST = join(STAGING, "beats-manifest.json");

const BUCKETS = { artwork: "beat-artwork", previews: "beat-previews", files: "beat-files" };
/** MP3 tier price; the licence tiers are flat-priced and shared catalogue-wide. */
const BASE_PRICE = 15;

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!existsSync(MANIFEST)) {
  console.error(`No manifest at ${MANIFEST}. Run scripts/prepare-beats.mjs first.`);
  process.exit(1);
}
if (!DRY && (!url || !serviceKey)) {
  console.error(
    "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.\n" +
      "Run with:  node --env-file=.env.local scripts/import-beats.mjs"
  );
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));

/* ── Validation, before anything is written ─────────────────────────────── */

const errors = [];
for (const b of manifest) {
  if (!b.title?.trim()) errors.push(`${b.folder}: missing title`);
  if (!b.genre?.trim()) errors.push(`${b.folder}: missing genre`);
  if (!b.bpm) errors.push(`${b.folder}: missing bpm`);
  if (!b.key) errors.push(`${b.folder}: missing musical key — fill it in the manifest`);
  for (const f of ["artwork", "previewAudio", "fullMp3", "wav"]) {
    if (!b[f]) errors.push(`${b.folder}: missing ${f}`);
    else if (!existsSync(b[f])) errors.push(`${b.folder}: ${f} not found at ${b[f]}`);
  }
  if (b.stems && !existsSync(b.stems)) errors.push(`${b.folder}: stems not found at ${b.stems}`);
}

if (errors.length) {
  console.error(`${errors.length} problem(s) — nothing was imported:\n`);
  for (const e of errors) console.error("  ! " + e);
  process.exit(1);
}

const totalBytes = manifest.reduce(
  (sum, b) =>
    sum + [b.artwork, b.previewAudio, b.fullMp3, b.wav, b.stems]
      .filter(Boolean)
      .reduce((s, f) => s + statSync(f).size, 0),
  0
);
console.log(
  `${manifest.length} beat(s) validated · ${(totalBytes / 1e9).toFixed(2)} GB to upload\n`
);

if (DRY) {
  for (const b of manifest) {
    const tiers = b.stems ? "mp3, wav, unlimited, exclusive" : "mp3, wav";
    console.log(`  ${String(b.bpm).padStart(3)}bpm ${(b.key + " " + b.keyMode).padEnd(9)} ${b.genre.padEnd(14)} ${b.title}`);
    console.log(`        tiers: ${tiers}`);
  }
  console.log("\nDry run — nothing uploaded.");
  process.exit(0);
}

/* ── Import ─────────────────────────────────────────────────────────────── */

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

const slugify = (t) =>
  t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60);

async function uploadOnce(bucket, localPath, storedName) {
  const { data: existing } = await supabase.storage.from(bucket).list("", { search: storedName });
  if (existing?.some((f) => f.name === storedName)) return storedName;

  const body = createReadStream(localPath);
  const { error } = await supabase.storage.from(bucket).upload(storedName, body, {
    contentType:
      { ".mp3": "audio/mpeg", ".wav": "audio/wav", ".zip": "application/zip", ".jpg": "image/jpeg" }[
        extname(localPath).toLowerCase()
      ] ?? "application/octet-stream",
    upsert: false,
    duplex: "half",
  });
  if (error) throw new Error(`${bucket}/${storedName}: ${error.message}`);
  return storedName;
}

let imported = 0;
let skipped = 0;

for (const [i, beat] of manifest.entries()) {
  const label = `[${String(i + 1).padStart(2)}/${manifest.length}] ${beat.title}`;

  const { data: dupe } = await supabase
    .from("beats")
    .select("id")
    .eq("title", beat.title)
    .maybeSingle();
  if (dupe) {
    console.log(`${label} — already in catalogue, skipped`);
    skipped++;
    continue;
  }

  const stem = slugify(beat.title);
  process.stdout.write(`${label}\n`);

  try {
    process.stdout.write("        artwork…");
    const artworkPath = await uploadOnce(BUCKETS.artwork, beat.artwork, `${stem}.jpg`);
    process.stdout.write(" preview…");
    const previewPath = await uploadOnce(BUCKETS.previews, beat.previewAudio, `${stem}-preview.mp3`);
    process.stdout.write(" mp3…");
    const fullMp3Path = await uploadOnce(BUCKETS.files, beat.fullMp3, `${stem}.mp3`);
    process.stdout.write(" wav…");
    const wavPath = await uploadOnce(BUCKETS.files, beat.wav, `${stem}.wav`);
    let stemsPath = null;
    if (beat.stems) {
      process.stdout.write(" stems…");
      stemsPath = await uploadOnce(BUCKETS.files, beat.stems, `${stem}-stems.zip`);
    }

    // Unlimited and Exclusive both ship the trackouts, so neither is offered
    // without a stems archive.
    const licenseAvailability = ["mp3", "wav", ...(stemsPath ? ["unlimited", "exclusive"] : [])];

    const { error } = await supabase.from("beats").insert({
      slug: `${stem}-${Math.random().toString(36).slice(2, 8)}`,
      title: beat.title,
      artwork_path: artworkPath,
      preview_audio_path: previewPath,
      full_mp3_path: fullMp3Path,
      wav_path: wavPath,
      stems_path: stemsPath,
      bpm: beat.bpm,
      key: beat.key,
      key_mode: beat.keyMode,
      genre: beat.genre,
      mood: beat.mood ? beat.mood.split(",").map((m) => m.trim()).filter(Boolean) : [beat.genre],
      tags: beat.tags ?? [],
      description:
        beat.description?.trim() ||
        `${beat.title} — a ${beat.genre} instrumental at ${beat.bpm} BPM in ${beat.key} ${beat.keyMode}.`,
      duration_seconds: beat.durationSeconds || 0,
      base_price: BASE_PRICE,
      plays: 0,
      favorites: 0,
      featured: Boolean(beat.featured),
      is_new: true,
      license_availability: licenseAvailability,
      published: true,
    });
    if (error) throw new Error(error.message);

    console.log(" ✓");
    imported++;
  } catch (err) {
    console.log(` ✗\n        ${err.message}`);
    console.log("        (re-run to retry this beat; completed uploads are reused)");
  }
}

console.log(`\nImported ${imported}, skipped ${skipped}, of ${manifest.length}.`);
