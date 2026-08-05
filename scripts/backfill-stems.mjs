#!/usr/bin/env node
/**
 * Adds stems to beats that were imported without them.
 *
 *   pnpm backfill-stems
 *
 * The catalogue was first published with --skip-stems because Supabase caps
 * a single file at 50 MB by default and these archives are 105-243 MB. Once
 * the project's upload limit is raised, this uploads each stems archive and
 * unlocks the two tiers that ship trackouts.
 *
 * Re-running is safe: a beat that already has stems is skipped, and an
 * archive already in the bucket is reused rather than re-sent.
 */

import { readFileSync, existsSync, createReadStream, statSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const MANIFEST = join(process.cwd(), ".beats-staging", "beats-manifest.json");
const BUCKET = "beat-files";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Supabase env vars missing. Run via: pnpm backfill-stems");
  process.exit(1);
}
if (!existsSync(MANIFEST)) {
  console.error(`No manifest at ${MANIFEST}`);
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

const slugify = (t) =>
  t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60);
const mb = (n) => `${(n / 1048576).toFixed(0)}MB`;

// Fail early and loudly rather than part-way through several gigabytes.
const { data: bucketInfo, error: bucketErr } = await supabase.storage.getBucket(BUCKET);
if (bucketErr) {
  console.error(`Cannot read bucket "${BUCKET}": ${bucketErr.message}`);
  process.exit(1);
}
const largest = Math.max(...manifest.filter((b) => b.stems).map((b) => statSync(b.stems).size));
const limit = bucketInfo.file_size_limit ?? 0;
if (limit && largest > limit) {
  console.error(
    `Largest archive is ${mb(largest)} but the bucket allows ${mb(limit)}.\n` +
      "Raise Project Settings → Storage → Upload file size limit, then re-run."
  );
  process.exit(1);
}

const todo = manifest.filter((b) => b.stems && existsSync(b.stems));
const totalBytes = todo.reduce((s, b) => s + statSync(b.stems).size, 0);
console.log(`${todo.length} archive(s) · ${(totalBytes / 1e9).toFixed(2)} GB · bucket limit ${mb(limit)}\n`);

let added = 0, skipped = 0, failed = 0;

for (const [i, beat] of todo.entries()) {
  const label = `[${String(i + 1).padStart(2)}/${todo.length}] ${beat.title}`;

  const { data: row, error: rowErr } = await supabase
    .from("beats")
    .select("id, stems_path, license_availability")
    .eq("title", beat.title)
    .maybeSingle();

  if (rowErr || !row) {
    console.log(`${label} — not in catalogue, skipped`);
    skipped++;
    continue;
  }
  if (row.stems_path) {
    console.log(`${label} — already has stems`);
    skipped++;
    continue;
  }

  const stored = `${slugify(beat.title)}-stems.zip`;
  const size = statSync(beat.stems).size;
  process.stdout.write(`${label}  ${mb(size)}…`);

  try {
    const { data: existing } = await supabase.storage.from(BUCKET).list("", { search: stored });
    if (!existing?.some((f) => f.name === stored)) {
      const { error } = await supabase.storage.from(BUCKET).upload(stored, createReadStream(beat.stems), {
        contentType: "application/zip",
        upsert: false,
        duplex: "half",
      });
      if (error) throw new Error(error.message);
    }

    // Both tiers that include trackouts become available the moment the
    // archive exists — the same rule the importer and admin uploader use.
    const tiers = Array.from(new Set([...(row.license_availability ?? []), "unlimited", "exclusive"]));
    const { error: upErr } = await supabase
      .from("beats")
      .update({ stems_path: stored, license_availability: tiers })
      .eq("id", row.id);
    if (upErr) throw new Error(upErr.message);

    console.log(" ✓");
    added++;
  } catch (err) {
    console.log(` ✗ ${err.message}`);
    failed++;
  }
}

console.log(`\nAdded ${added}, skipped ${skipped}, failed ${failed}, of ${todo.length}.`);
if (failed) console.log("Re-run to retry — uploads already completed are reused.");
