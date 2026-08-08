#!/usr/bin/env node
/**
 * Downloads every file in the catalogue out of Supabase Storage onto this
 * machine.
 *
 *   pnpm backup-catalog                      # -> ./catalog-backup
 *   BACKUP_DIR=/Volumes/Drive/lilbeats pnpm backup-catalog
 *
 * ─── WHY THIS EXISTS ───────────────────────────────────────────────────
 * The staging folder the importer read from is empty, so as of the last
 * audit the only copy of every master, stem pack and artwork file was the
 * Supabase project. A storage bucket is not a backup: projects get paused
 * on free tiers, buckets get their policies rewritten, and accounts get
 * locked. Losing that bucket loses the catalogue.
 *
 * The download runs with the service-role key because `beat-files` is
 * private — that is the bucket holding the untagged WAVs and the stems, and
 * it is the half that actually matters.
 * ───────────────────────────────────────────────────────────────────────
 *
 * Safe to re-run. A file already on disk at the right byte length is
 * skipped, so an interrupted run resumes instead of starting over.
 */
import { createWriteStream } from "node:fs";
import { mkdir, rename, rm, stat, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { createClient } from "@supabase/supabase-js";

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OUT = process.env.BACKUP_DIR ?? join(process.cwd(), "catalog-backup");

if (!URL_ || !KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Run via `pnpm backup-catalog`, which loads .env.local."
  );
  process.exit(1);
}

const supabase = createClient(URL_, KEY, { auth: { persistSession: false } });

/** Column -> bucket. Mirrors the layout import-beats.mjs writes. */
const FILES = [
  { column: "artwork_path", bucket: "beat-artwork" },
  { column: "preview_audio_path", bucket: "beat-previews" },
  { column: "full_mp3_path", bucket: "beat-files" },
  { column: "wav_path", bucket: "beat-files" },
  { column: "stems_path", bucket: "beat-files" },
];

function human(bytes) {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

async function sizeOnDisk(path) {
  try {
    return (await stat(path)).size;
  } catch {
    return -1;
  }
}

/**
 * Streams rather than buffering: a stems ZIP can be hundreds of megabytes
 * and 25 of them will not fit in memory comfortably.
 */
async function download(bucket, storagePath, destination) {
  const { data, error } = await supabase.storage.from(bucket).download(storagePath);
  if (error) throw new Error(error.message);
  await mkdir(dirname(destination), { recursive: true });
  /*
    Written to a .partial and renamed only on success. The resume check treats
    any nonzero file at the final name as done, so a stream that died mid-way
    (Ctrl-C, network drop) must never leave a truncated file there — it would
    be silently "skipped" as complete on every subsequent run.
  */
  const partial = `${destination}.partial`;
  try {
    await pipeline(Readable.fromWeb(data.stream()), createWriteStream(partial));
    await rename(partial, destination);
  } catch (err) {
    await rm(partial, { force: true });
    throw err;
  }
  return (await stat(destination)).size;
}

const { data: beats, error } = await supabase
  .from("beats")
  .select("slug, title, artwork_path, preview_audio_path, full_mp3_path, wav_path, stems_path")
  .order("created_at", { ascending: true });

if (error) {
  console.error("Could not read the beats table:", error.message);
  process.exit(1);
}
if (!beats?.length) {
  console.error("The beats table is empty — nothing to back up. Refusing to write an empty backup.");
  process.exit(1);
}

console.log(`Backing up ${beats.length} beats to ${OUT}\n`);

let downloaded = 0;
let skipped = 0;
let failed = 0;
let bytes = 0;
const manifest = [];

for (const [i, beat] of beats.entries()) {
  console.log(`[${i + 1}/${beats.length}] ${beat.title}`);
  const record = { slug: beat.slug, title: beat.title, files: {} };

  for (const { column, bucket } of FILES) {
    const storagePath = beat[column];
    // stems_path is nullable by schema; a beat without stems is not an error.
    if (!storagePath) continue;

    const destination = join(OUT, beat.slug, storagePath.split("/").pop());
    const existing = await sizeOnDisk(destination);
    if (existing > 0) {
      console.log(`    skip  ${column.padEnd(18)} ${human(existing)} already on disk`);
      record.files[column] = destination;
      bytes += existing;
      skipped++;
      continue;
    }

    try {
      const size = await download(bucket, storagePath, destination);
      console.log(`    ok    ${column.padEnd(18)} ${human(size)}`);
      record.files[column] = destination;
      bytes += size;
      downloaded++;
    } catch (e) {
      // Keep going: one missing stems ZIP should not abandon the other 24 beats.
      console.error(`    FAIL  ${column.padEnd(18)} ${e.message}`);
      record.files[column] = null;
      failed++;
    }
  }
  manifest.push(record);
}

await writeFile(join(OUT, "backup-manifest.json"), JSON.stringify(manifest, null, 2));

console.log(
  `\nDone. ${downloaded} downloaded, ${skipped} already present, ${failed} failed. ${human(bytes)} on disk.`
);
console.log(`Manifest: ${join(OUT, "backup-manifest.json")}`);
if (failed > 0) {
  console.log("\nSome files failed. Re-run to retry only those — completed files are skipped.");
  process.exit(1);
}
console.log("\nNow copy that folder somewhere that is not this laptop and not Supabase.");
