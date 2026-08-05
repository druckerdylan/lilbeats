#!/usr/bin/env node
/**
 * Regenerates the public preview clips and replaces them in storage.
 *
 *   pnpm refresh-previews              # full-length previews
 *   PREVIEW_SECONDS=90 pnpm refresh-previews
 *
 * `PREVIEW_SECONDS` unset (or 0) publishes the whole track.
 *
 * ─── NOTE ON FULL-LENGTH PREVIEWS ──────────────────────────────────────
 * The previews bucket is public — that is what lets the site stream without
 * a purchase. A full-length preview of an untagged master is therefore the
 * complete beat, free, to anyone who opens the network tab. The usual
 * protection is a producer tag over the preview; these masters do not carry
 * one. Shipping this is a deliberate business decision, not an oversight.
 * ───────────────────────────────────────────────────────────────────────
 */

import { readFileSync, existsSync, mkdirSync, createReadStream, statSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";

const STAGING = join(process.cwd(), ".beats-staging");
const MANIFEST = join(STAGING, "beats-manifest.json");
const OUT = join(STAGING, "previews-full");
const BUCKET = "beat-previews";

/** 0 or unset = whole track. */
const SECONDS = Number(process.env.PREVIEW_SECONDS ?? 0);

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Supabase env vars missing. Run via: pnpm refresh-previews");
  process.exit(1);
}
if (!existsSync(MANIFEST)) {
  console.error(`No manifest at ${MANIFEST}`);
  process.exit(1);
}

try {
  execFileSync("ffmpeg", ["-version"], { stdio: "ignore" });
} catch {
  console.error("ffmpeg not found on PATH.");
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
const supabase = createClient(url, key, { auth: { persistSession: false } });
mkdirSync(OUT, { recursive: true });

const slugify = (t) =>
  t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60);
const mb = (n) => `${(n / 1048576).toFixed(1)}MB`;

console.log(
  SECONDS > 0
    ? `Rebuilding ${manifest.length} previews at ${SECONDS}s\n`
    : `Rebuilding ${manifest.length} previews at FULL LENGTH — these stream publicly\n`
);

let done = 0, failed = 0;

for (const [i, beat] of manifest.entries()) {
  const stem = slugify(beat.title);
  const local = join(OUT, `${stem}.mp3`);
  const stored = `${stem}-preview.mp3`;
  process.stdout.write(`[${String(i + 1).padStart(2)}/${manifest.length}] ${beat.title.slice(0, 44)}`);

  try {
    if (!existsSync(local)) {
      // 192k keeps the stream light without audibly degrading a preview.
      const args = ["-y", "-loglevel", "error", "-i", beat.fullMp3];
      if (SECONDS > 0) {
        args.push("-t", String(SECONDS), "-af", `afade=t=out:st=${Math.max(0, SECONDS - 4)}:d=4`);
      }
      args.push("-codec:a", "libmp3lame", "-b:a", "192k", local);
      execFileSync("ffmpeg", args);
    }

    // upsert: these replace clips already in the bucket.
    const { error } = await supabase.storage.from(BUCKET).upload(stored, createReadStream(local), {
      contentType: "audio/mpeg",
      upsert: true,
      duplex: "half",
    });
    if (error) throw new Error(error.message);

    console.log(`  ${mb(statSync(local).size)} ✓`);
    done++;
  } catch (err) {
    console.log(`  ✗ ${err.message}`);
    failed++;
  }
}

console.log(`\nReplaced ${done}, failed ${failed}, of ${manifest.length}.`);
if (done) console.log("Live within 60s — the catalogue pages revalidate on that window.");
