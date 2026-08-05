#!/usr/bin/env node
/**
 * Fills in .env.local by prompting for each value.
 *
 *   node scripts/configure.mjs
 *
 * Exists because editing a dot-file in TextEdit is awkward, and because
 * pasting a service-role key into a chat window or shell history is worse.
 * Values are read from stdin, written straight to disk, and never echoed.
 *
 * Re-runnable: anything already set is shown masked and kept if you press
 * Enter, so this can be used to change one value without retyping the rest.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

const FILE = ".env.local";

const FIELDS = [
  {
    key: "NEXT_PUBLIC_SUPABASE_URL",
    label: "Project URL",
    hint: "Connect dialog — looks like https://xxxx.supabase.co",
    secret: false,
    validate: (v) => /^https:\/\/[a-z0-9-]+\.supabase\.(co|in)$/i.test(v.trim()) || "should look like https://xxxx.supabase.co",
  },
  {
    key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    label: "Publishable key",
    hint: "Settings → API Keys — starts sb_publishable_ (or a long eyJ… anon key)",
    secret: true,
    validate: (v) => v.startsWith("sb_publishable_") || v.startsWith("eyJ") || "expected sb_publishable_… or a legacy eyJ… key",
  },
  {
    key: "SUPABASE_SERVICE_ROLE_KEY",
    label: "Secret key",
    hint: "Settings → API Keys — starts sb_secret_ (or a long eyJ… service_role key)",
    secret: true,
    validate: (v) => v.startsWith("sb_secret_") || v.startsWith("eyJ") || "expected sb_secret_… or a legacy eyJ… key",
  },
  {
    key: "ADMIN_EMAILS",
    label: "Your admin email",
    hint: "must match the Supabase auth user you create",
    secret: false,
    validate: (v) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.trim()) || "that doesn't look like an email address",
  },
];

const mask = (v) => (v.length <= 12 ? "•".repeat(v.length) : `${v.slice(0, 8)}…${"•".repeat(6)} (${v.length} chars)`);

let text = existsSync(FILE) ? readFileSync(FILE, "utf8") : "";

function currentValue(key) {
  const m = text.match(new RegExp(`^${key}=(.*)$`, "m"));
  return (m?.[1] ?? "").trim();
}

function setValue(key, value) {
  const line = `${key}=${value}`;
  if (new RegExp(`^${key}=.*$`, "m").test(text)) {
    text = text.replace(new RegExp(`^${key}=.*$`, "m"), line);
  } else {
    text += (text.endsWith("\n") || text === "" ? "" : "\n") + line + "\n";
  }
}

const rl = createInterface({ input: stdin, output: stdout });

console.log(`\nConfiguring ${FILE} — press Enter to keep an existing value.\n`);

for (const field of FIELDS) {
  const existing = currentValue(field.key);
  const shown = existing ? `  [current: ${field.secret ? mask(existing) : existing}]` : "";
  console.log(`${field.label}`);
  console.log(`  ${field.hint}${shown}`);

  for (;;) {
    const answer = (await rl.question("  > ")).trim();
    if (!answer) {
      if (existing) { console.log("  kept.\n"); break; }
      console.log("  required — paste the value.\n  ");
      continue;
    }
    const ok = field.validate(answer);
    if (ok !== true) { console.log(`  ✗ ${ok}\n  `); continue; }
    setValue(field.key, answer);
    console.log(`  ✓ saved${field.secret ? " (hidden)" : ""}\n`);
    break;
  }
}

rl.close();
writeFileSync(FILE, text, { mode: 0o600 });

console.log(`Written to ${FILE} (owner-only permissions).`);
console.log("Next: node --env-file=.env.local scripts/check-setup.mjs\n");
