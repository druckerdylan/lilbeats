#!/usr/bin/env node
/**
 * Stages a folder of finished beats for import.
 *
 *   node scripts/prepare-beats.mjs "~/Downloads/Beats to upload"
 *
 * For each sub-folder (one per beat) it:
 *   1. matches the folder name to the producer's BeatStars catalogue, so the
 *      published title is byte-identical to the one already in market;
 *   2. pulls that track's artwork at 1200x1200 (the page only renders a 240px
 *      thumbnail, but the CDN takes a base64 imgix payload that can be
 *      re-encoded at any size);
 *   3. cuts a preview clip from the full MP3;
 *   4. writes `beats-manifest.json` describing every beat.
 *
 * Nothing is uploaded here and nothing in the source folder is modified —
 * the manifest is meant to be read, corrected by hand where the inferred
 * fields are wrong, and only then fed to `import-beats.mjs`.
 */

import { readdirSync, statSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { join, basename, extname } from "node:path";
import { execFileSync } from "node:child_process";
import { homedir } from "node:os";

const SRC = (process.argv[2] ?? join(homedir(), "Downloads", "Beats to upload")).replace(/^~/, homedir());
const OUT = join(process.cwd(), ".beats-staging");
const CATALOG_URL = "https://www.beatstars.com/lilbeatsofficial/tracks";

/** Seconds of the full track to publish as the public preview. See README note. */
const PREVIEW_SECONDS = Number(process.env.PREVIEW_SECONDS ?? 60);

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/* ── BeatStars catalogue ────────────────────────────────────────────────── */

async function loadCatalog() {
  const cached = join(OUT, "beatstars.json");
  if (existsSync(cached)) {
    console.log("· using cached BeatStars catalogue");
    return JSON.parse(await readFile(cached, "utf8"));
  }

  const { chromium } = await import("playwright-core");
  console.log("· reading BeatStars catalogue…");
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1500, height: 1300 },
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36",
  });
  await page.goto(CATALOG_URL, { waitUntil: "networkidle", timeout: 90000 }).catch(() => {});
  await page.waitForTimeout(7000);
  for (const label of ["Accept Cookies", "Reject Unnecessary", "Accept All"]) {
    const btn = page.locator(`button:has-text("${label}")`).first();
    if (await btn.count()) {
      await btn.click({ force: true }).catch(() => {});
      break;
    }
  }
  await page.waitForTimeout(2500);

  // The list is virtualised: rows outside the viewport are not in the DOM, so
  // it has to be harvested progressively while scrolling.
  const harvest = () =>
    page.evaluate(() =>
      [...document.querySelectorAll("mp-card-figure-track")].flatMap((el) => {
        const lines = (el.innerText || "").split("\n").map((s) => s.trim()).filter(Boolean);
        if (lines.length < 3) return [];
        const rest = /^\d+$/.test(lines[0]) ? lines.slice(1) : lines;
        const bpmLine = rest.find((s) => /\bBPM\b/i.test(s));
        const bpm = bpmLine ? Number(bpmLine.match(/(\d+)/)?.[1]) : null;
        if (!rest[0] || !bpm) return [];
        return [{
          title: rest[0],
          bpm,
          tags: rest.filter((s) => s.startsWith("#")).map((s) => s.slice(1)),
          artwork: el.querySelector("img")?.src ?? null,
        }];
      })
    );

  const seen = new Map();
  let stagnant = 0;
  for (let i = 0; i < 80; i++) {
    for (const row of await harvest()) if (!seen.has(row.title)) seen.set(row.title, row);
    const before = seen.size;
    await page.evaluate(() => window.scrollBy(0, 650));
    await page.waitForTimeout(600);
    stagnant = seen.size === before ? stagnant + 1 : 0;
    const atEnd = await page.evaluate(
      () => window.innerHeight + window.scrollY >= document.body.scrollHeight - 60
    );
    if (atEnd && stagnant >= 5) break;
  }
  await browser.close();

  const rows = [...seen.values()];
  mkdirSync(OUT, { recursive: true });
  writeFileSync(cached, JSON.stringify(rows, null, 2));
  console.log(`· catalogue: ${rows.length} tracks`);
  return rows;
}

/** Re-encodes the CDN's imgix payload to request full-resolution artwork. */
function fullSizeArtwork(url, size = 1200) {
  try {
    const [base, query] = url.split("?");
    const payload = JSON.parse(Buffer.from(base.split("/").pop(), "base64").toString());
    payload.edits = { ...payload.edits, resize: { fit: "fill", width: size, height: size }, toFormat: "jpeg" };
    const encoded = Buffer.from(JSON.stringify(payload)).toString("base64");
    return `${base.split("/").slice(0, -1).join("/")}/${encoded}${query ? `?${query}` : ""}`;
  } catch {
    return url;
  }
}

/* ── Local files ────────────────────────────────────────────────────────── */

function filesIn(dir) {
  const found = { mp3: null, wav: null, stems: null };
  const walk = (d, depth = 0) => {
    if (depth > 2) return;
    for (const entry of readdirSync(d)) {
      if (entry.startsWith(".")) continue;
      const p = join(d, entry);
      if (statSync(p).isDirectory()) { walk(p, depth + 1); continue; }
      const ext = extname(entry).toLowerCase();
      if (ext === ".mp3" && !found.mp3) found.mp3 = p;
      else if (ext === ".wav" && !found.wav) found.wav = p;
      else if (ext === ".zip" && !found.stems) found.stems = p;
    }
  };
  walk(dir);
  return found;
}

/**
 * Some stems archives encode the key, e.g. `villainz-152-bpm-e-min_stems.zip`.
 *
 * Treated as a WEAK hint only. Cross-checking all 25 against the published
 * BeatStars pages found 4 filenames disagreeing with the track's own listing
 * (bali reads f-min where the page says F#m; run reads e-min where the page
 * says Dm), so `fetch-keys.mjs` overwrites this from the live listing — that
 * is what buyers actually see.
 */
function keyFromFilename(path) {
  if (!path) return null;
  const m = basename(path).toLowerCase().match(/-([a-g])(#|b)?-?(min|maj)/);
  if (!m) return null;
  const letter = m[1].toUpperCase() + (m[2] === "#" ? "#" : "");
  return { key: letter, keyMode: m[3] === "maj" ? "Major" : "Minor" };
}

/**
 * Best-effort genre from the marketed title. Deliberately conservative: it
 * only fires on words the producer actually used, and everything else falls
 * back to Trap, which is what the bulk of this catalogue is.
 */
function inferGenre(title, tags) {
  const hay = `${title} ${tags.join(" ")}`.toLowerCase();
  if (/\bdrill\b/.test(hay)) return "Drill";
  if (/\bphonk\b/.test(hay)) return "Phonk";
  if (/synthwave|synth pop/.test(hay)) return "Synthwave";
  if (/\br&b\b|\brnb\b/.test(hay)) return "R&B / Trap Soul";
  if (/boom bap/.test(hay)) return "Boom Bap";
  if (/\bjerk\b/.test(hay)) return "Jersey / Jerk";
  if (/hip.?hop/.test(hay)) return "Hip-Hop";
  return "Trap";
}

/* ── Main ───────────────────────────────────────────────────────────────── */

if (!existsSync(SRC)) {
  console.error(`Source folder not found: ${SRC}`);
  process.exit(1);
}

let ffmpeg = "ffmpeg";
try {
  execFileSync(ffmpeg, ["-version"], { stdio: "ignore" });
} catch {
  console.error("ffmpeg is required to cut preview clips but was not found on PATH.");
  process.exit(1);
}

mkdirSync(join(OUT, "artwork"), { recursive: true });
mkdirSync(join(OUT, "previews"), { recursive: true });

const catalog = await loadCatalog();
const folders = readdirSync(SRC).filter((f) => !f.startsWith(".") && statSync(join(SRC, f)).isDirectory());

const manifest = [];
const problems = [];

for (const folder of folders) {
  const dir = join(SRC, folder);
  const key = norm(folder);
  const match =
    catalog.find((r) => norm(r.title.split("|")[0]) === key) ??
    catalog.find((r) => norm(r.title).startsWith(key));

  if (!match) { problems.push(`${folder}: no BeatStars track matched`); continue; }

  const files = filesIn(dir);
  const missing = ["mp3", "wav"].filter((k) => !files[k]);
  if (missing.length) { problems.push(`${folder}: missing ${missing.join(", ")}`); continue; }

  // Artwork
  const artPath = join(OUT, "artwork", `${key}.jpg`);
  if (!existsSync(artPath) && match.artwork) {
    const res = await fetch(fullSizeArtwork(match.artwork));
    if (res.ok) await writeFile(artPath, Buffer.from(await res.arrayBuffer()));
    else problems.push(`${folder}: artwork fetch failed (${res.status})`);
  }

  // Preview clip
  const prevPath = join(OUT, "previews", `${key}.mp3`);
  if (!existsSync(prevPath)) {
    execFileSync(ffmpeg, [
      "-y", "-loglevel", "error",
      "-i", files.mp3,
      "-t", String(PREVIEW_SECONDS),
      "-af", `afade=t=out:st=${Math.max(0, PREVIEW_SECONDS - 4)}:d=4`,
      "-codec:a", "libmp3lame", "-b:a", "192k",
      prevPath,
    ]);
  }

  const detectedKey = keyFromFilename(files.stems) ?? keyFromFilename(files.wav);

  // ffmpeg writes the duration to stderr and exits non-zero without an
  // output file, so the probe is wrapped rather than trusted to succeed.
  let durationSeconds = 0;
  try {
    execFileSync(ffmpeg, ["-i", files.mp3], { stdio: ["ignore", "ignore", "pipe"] });
  } catch (err) {
    const m = String(err.stderr ?? "").match(/Duration: (\d+):(\d+):(\d+)/);
    if (m) durationSeconds = +m[1] * 3600 + +m[2] * 60 + +m[3];
  }

  manifest.push({
    folder,
    title: match.title,               // exact BeatStars title
    bpm: match.bpm,
    tags: match.tags,
    genre: inferGenre(match.title, match.tags),   // INFERRED — review
    key: detectedKey?.key ?? null,               // null = needs filling
    keyMode: detectedKey?.keyMode ?? "Minor",
    mood: "",
    durationSeconds,
    artwork: existsSync(artPath) ? artPath : null,
    previewAudio: existsSync(prevPath) ? prevPath : null,
    fullMp3: files.mp3,
    wav: files.wav,
    stems: files.stems,
    featured: false,
  });
  process.stdout.write(`  ✓ ${match.title}\n`);
}

writeFileSync(join(OUT, "beats-manifest.json"), JSON.stringify(manifest, null, 2));

console.log(`\nStaged ${manifest.length} beat(s) -> ${join(OUT, "beats-manifest.json")}`);
const noKey = manifest.filter((m) => !m.key).length;
if (noKey) console.log(`· ${noKey} beat(s) have no musical key detected — fill "key" in the manifest`);
console.log(`· genre is INFERRED from each title; review before importing`);
console.log(`· previews are ${PREVIEW_SECONDS}s clips (PREVIEW_SECONDS=… to change)`);
if (problems.length) {
  console.log("\nProblems:");
  for (const p of problems) console.log("  ! " + p);
}
