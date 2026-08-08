#!/usr/bin/env node
/**
 * Builds the delivery bundles every paid tier above MP3 actually promises.
 *
 *   pnpm backup-catalog     # must run first — this works from its output
 *   pnpm build-bundles
 *   pnpm build-bundles --dry-run
 *   pnpm build-bundles --only=gta-future-x-metro-type-beat
 *
 * ─── WHY THIS EXISTS ───────────────────────────────────────────────────
 * A download link resolves to exactly one object, but the store sells
 * "MP3 + WAV" (Premium) and "MP3 + WAV + Stems" (Unlimited, Exclusive).
 * Delivery used to hand over the single highest file — the bare WAV, or the
 * stems ZIP — so buyers of all three tiers received less than they paid for.
 *
 * Two archives per beat:
 *
 *   {Title}-Premium.zip          {Title}/{Title}.mp3
 *                                {Title}/{Title}.wav
 *
 *   {Title}-Complete.zip         {Title}/{Title}.mp3
 *                                {Title}/{Title}.wav
 *                                {Title}/stems/*.wav
 *
 * The stems arrive as their own ZIP with one wrapper folder inside (e.g.
 * "NEBULA 136/"). That wrapper is stripped so the contents land directly in
 * `stems/` — otherwise a buyer opens two nested folders to reach a kick.
 * ───────────────────────────────────────────────────────────────────────
 *
 * Safe to re-run: it skips a beat whose bundles are already recorded and
 * present, so an interrupted run resumes rather than starting over.
 */

import { createReadStream, existsSync } from "node:fs";
import { mkdir, mkdtemp, readdir, rm, stat } from "node:fs/promises";
import { join, basename } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";

const BACKUP = process.env.BACKUP_DIR ?? join(process.cwd(), "catalog-backup");
const BUCKET = "beat-files";
const DRY = process.argv.includes("--dry-run");
const ONLY = process.argv.find((a) => a.startsWith("--only="))?.slice(7);

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Supabase env vars missing. Run via: pnpm build-bundles");
  process.exit(1);
}
if (!existsSync(BACKUP)) {
  console.error(`No backup at ${BACKUP}\nRun \`pnpm backup-catalog\` first — this builds from its output.`);
  process.exit(1);
}
for (const bin of ["zip", "unzip"]) {
  try {
    execFileSync(bin, ["-v"], { stdio: "ignore" });
  } catch {
    console.error(`\`${bin}\` not found on PATH.`);
    process.exit(1);
  }
}

const supabase = createClient(url, key, { auth: { persistSession: false } });
const mb = (n) => `${(n / 1048576).toFixed(1)}MB`;

const { data: beats, error } = await supabase
  .from("beats")
  .select("id, slug, title, full_mp3_path, wav_path, stems_path, premium_bundle_path, complete_bundle_path")
  .order("created_at", { ascending: true });

if (error) {
  console.error("Could not read the beats table:", error.message);
  process.exit(1);
}

const queue = ONLY ? beats.filter((b) => b.slug === ONLY) : beats;
if (!queue.length) {
  console.error(ONLY ? `No beat with slug "${ONLY}".` : "No beats.");
  process.exit(1);
}

console.log(
  `${DRY ? "[dry run] " : ""}Building bundles for ${queue.length} beat(s)\n` +
    `  source: ${BACKUP}\n`
);

/** The local file for a stored object, as `backup-catalog` laid it out. */
function local(slug, storagePath) {
  if (!storagePath) return null;
  const p = join(BACKUP, slug, basename(storagePath));
  return existsSync(p) ? p : null;
}

/**
 * A filename safe on every OS the buyer might unzip on. Windows rejects
 * \ / : * ? " < > | outright, and a trailing dot or space breaks Explorer.
 */
function safeName(title) {
  return title
    .replace(/[\\/:*?"<>|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[. ]+$/, "")
    .slice(0, 80);
}

let built = 0, skipped = 0, failed = 0, uploaded = 0;

for (const [i, beat] of queue.entries()) {
  const label = `[${String(i + 1).padStart(2)}/${queue.length}] ${beat.title.slice(0, 40)}`;
  const name = safeName(beat.title);

  const mp3 = local(beat.slug, beat.full_mp3_path);
  const wav = local(beat.slug, beat.wav_path);
  const stems = local(beat.slug, beat.stems_path);

  if (!mp3 || !wav) {
    console.log(`${label}  ✗ missing ${!mp3 ? "mp3" : "wav"} in the backup — skipped`);
    failed++;
    continue;
  }
  if (beat.premium_bundle_path && beat.complete_bundle_path) {
    console.log(`${label}  · already bundled`);
    skipped++;
    continue;
  }

  console.log(label);
  const work = await mkdtemp(join(tmpdir(), "lb-bundle-"));
  const root = join(work, name);

  try {
    await mkdir(root, { recursive: true });
    // Copied rather than linked: `zip` follows the real path, and the archive
    // must carry the buyer-facing name, not the storage slug.
    execFileSync("cp", [mp3, join(root, `${name}.mp3`)]);
    execFileSync("cp", [wav, join(root, `${name}.wav`)]);

    // ── Premium: MP3 + WAV ──────────────────────────────────────────
    const premiumZip = join(work, `${name}-Premium.zip`);
    if (!DRY) {
      // -r recurse, -q quiet, -X drop macOS resource forks. Run from `work`
      // so paths inside the archive start at the beat folder.
      execFileSync("zip", ["-rqX", premiumZip, name], { cwd: work });
    }

    // ── Complete: the same, plus stems/ ─────────────────────────────
    let completeZip = null;
    if (stems) {
      const staging = join(work, "_stems");
      await mkdir(staging, { recursive: true });
      execFileSync("unzip", ["-qq", "-o", stems, "-d", staging]);

      /*
        The archive wraps everything in one folder ("NEBULA 136/"). Strip it
        so the buyer gets stems/kick.wav, not stems/NEBULA 136/kick.wav. If
        the layout is ever flat instead, use the staging dir as-is.
      */
      const entries = (await readdir(staging, { withFileTypes: true })).filter(
        (e) => !e.name.startsWith(".") && e.name !== "__MACOSX"
      );
      const inner =
        entries.length === 1 && entries[0].isDirectory()
          ? join(staging, entries[0].name)
          : staging;

      execFileSync("cp", ["-R", inner, join(root, "stems")]);
      // macOS litters these through zipped folders; they are noise to a buyer.
      execFileSync("sh", ["-c", `find ${JSON.stringify(join(root, "stems"))} -name '.DS_Store' -delete`]);

      completeZip = join(work, `${name}-Complete.zip`);
      if (!DRY) execFileSync("zip", ["-rqX", completeZip, name], { cwd: work });
    } else {
      console.log("      ! no stems in the backup — complete bundle will equal premium");
    }

    if (DRY) {
      console.log(`      would upload ${name}-Premium.zip` + (stems ? ` and ${name}-Complete.zip` : ""));
      built++;
      continue;
    }

    const patch = {};
    for (const [file, column] of [
      [premiumZip, "premium_bundle_path"],
      [completeZip ?? premiumZip, "complete_bundle_path"],
    ]) {
      const stored = basename(file);
      if (patch[column]) continue;
      const size = (await stat(file)).size;
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(stored, createReadStream(file), {
        contentType: "application/zip",
        upsert: true,
        duplex: "half",
      });
      if (upErr) throw new Error(`${stored}: ${upErr.message}`);
      console.log(`      ✓ ${stored.padEnd(46)} ${mb(size)}`);
      patch[column] = stored;
      uploaded++;
    }

    const { error: dbErr } = await supabase.from("beats").update(patch).eq("id", beat.id);
    if (dbErr) throw new Error(`db update: ${dbErr.message}`);
    built++;
  } catch (err) {
    console.log(`      ✗ ${err.message}`);
    failed++;
  } finally {
    await rm(work, { recursive: true, force: true });
  }
}

console.log(
  `\nBundled ${built}, already done ${skipped}, failed ${failed}, of ${queue.length}.` +
    (uploaded ? `  ${uploaded} archive(s) uploaded.` : "")
);
if (failed) console.log("Re-run to retry the failures — completed beats are skipped.");
