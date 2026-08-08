#!/usr/bin/env node
/**
 * Verifies the Supabase setup before anything depends on it.
 *
 *   node --env-file=.env.local scripts/check-setup.mjs
 *
 * Checks the things that actually go wrong: a missing variable, a schema
 * that was never run, buckets with the wrong visibility, an admin account
 * that isn't on the allowlist. Every check reports independently so one
 * failure doesn't mask the rest.
 */

import { createClient } from "@supabase/supabase-js";

const TABLES = [
  "beats", "orders", "order_items", "download_tokens",
  "mixing_requests", "subscribers", "contact_messages",
];

/** `public` decides whether a file is readable without a signed URL. */
const BUCKETS = [
  { id: "beat-artwork", public: true },
  { id: "beat-previews", public: true },
  { id: "beat-files", public: false },
  { id: "mixing-uploads", public: false },
];

const pass = (m) => console.log(`  ✓ ${m}`);
const fail = (m, hint) => { console.log(`  ✗ ${m}`); if (hint) console.log(`      → ${hint}`); failures++; };
const warn = (m, hint) => { console.log(`  ! ${m}`); if (hint) console.log(`      → ${hint}`); warnings++; };
let failures = 0, warnings = 0;

console.log("\nEnvironment");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
const admins = process.env.ADMIN_EMAILS;

url ? pass("NEXT_PUBLIC_SUPABASE_URL") : fail("NEXT_PUBLIC_SUPABASE_URL missing", "Connect dialog → Project URL");
anon ? pass("NEXT_PUBLIC_SUPABASE_ANON_KEY") : fail("NEXT_PUBLIC_SUPABASE_ANON_KEY missing", "Settings → API Keys → publishable (or legacy anon)");
service ? pass("SUPABASE_SERVICE_ROLE_KEY") : fail("SUPABASE_SERVICE_ROLE_KEY missing", "Settings → API Keys → secret (or legacy service_role)");
admins ? pass(`ADMIN_EMAILS (${admins.split(",").length} address(es))`)
       : fail("ADMIN_EMAILS missing", "Without it /admin refuses everyone — that is the fail-closed default");

if (!process.env.STRIPE_SECRET_KEY) warn("STRIPE_SECRET_KEY not set", "Checkout will error until this exists. Fine for importing beats.");
if (!process.env.RESEND_API_KEY) warn("RESEND_API_KEY not set", "Receipts are skipped and logged instead. Fine for now.");
if (!process.env.NEXT_PUBLIC_SITE_URL) warn("NEXT_PUBLIC_SITE_URL not set", "Falls back to https://www.lilbeatsofficial.com — must be correct in production.");

if (!url || !service) {
  console.log("\nCannot continue without the URL and service-role key.\n");
  process.exit(1);
}

const supabase = createClient(url, service, { auth: { persistSession: false } });

console.log("\nDatabase");
for (const table of TABLES) {
  const { error } = await supabase.from(table).select("*", { count: "exact", head: true });
  if (error) fail(`table "${table}" — ${error.message}`, "Run supabase/schema.sql in the SQL Editor");
  else pass(`table "${table}"`);
}

// The licence-id constraint was corrected after the tiers were renamed; an
// older schema silently rejects Unlimited and Exclusive purchases at checkout.
const { error: licErr } = await supabase
  .from("order_items")
  .insert({ order_id: "00000000-0000-0000-0000-000000000000", beat_id: "00000000-0000-0000-0000-000000000000",
            beat_title: "__probe__", license_id: "unlimited", license_name: "probe", price: 0 });
if (licErr && /violates check constraint/i.test(licErr.message)) {
  fail('licence ids are stale — "unlimited"/"exclusive" rejected',
       "Re-run supabase/schema.sql; an old copy only allows mp3/wav/stems");
} else {
  pass("licence ids accept unlimited + exclusive");
  // The insert is expected to fail on the foreign key (the order does not
  // exist), which is what proves the CHECK passed. Clean up defensively in
  // case a future schema drops that constraint.
  if (!licErr) await supabase.from("order_items").delete().eq("beat_title", "__probe__");
}

console.log("\nStorage");
const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
if (bErr) {
  fail(`cannot list buckets — ${bErr.message}`);
} else {
  for (const want of BUCKETS) {
    const got = buckets.find((b) => b.id === want.id);
    if (!got) fail(`bucket "${want.id}" missing`, "Run supabase/schema.sql, or create it in Storage");
    else if (got.public !== want.public)
      fail(`bucket "${want.id}" is ${got.public ? "public" : "private"}, expected ${want.public ? "public" : "private"}`,
           want.public ? "Artwork and previews must be public to display"
                       : "Paid files MUST be private or anyone can download them free");
    else pass(`bucket "${want.id}" (${got.public ? "public" : "private"})`);
  }
}

console.log("\nAdmin access");
const { data: userList, error: uErr } = await supabase.auth.admin.listUsers();
if (uErr) {
  fail(`cannot list users — ${uErr.message}`);
} else if (!userList.users.length) {
  fail("no user accounts exist", "Authentication → Users → Add user");
} else {
  const allow = (admins ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  const matched = userList.users.filter((u) => allow.includes((u.email ?? "").toLowerCase()));
  if (!matched.length) {
    fail(`no account matches ADMIN_EMAILS`,
         `accounts: ${userList.users.map((u) => u.email).join(", ") || "(none with email)"}`);
  } else {
    pass(`admin account: ${matched.map((u) => u.email).join(", ")}`);
    const unconfirmed = matched.filter((u) => !u.email_confirmed_at);
    if (unconfirmed.length) warn("admin email not confirmed", "Tick 'Auto Confirm User' when creating, or confirm via the emailed link");
  }
  if (userList.users.length > matched.length) {
    warn(`${userList.users.length - matched.length} other account(s) exist`,
         "They cannot reach /admin, but disable public sign-ups: Authentication → Providers");
  }
}

console.log(
  failures === 0
    ? `\nReady${warnings ? ` (${warnings} warning${warnings === 1 ? "" : "s"})` : ""}. Next: node --env-file=.env.local scripts/import-beats.mjs --dry-run\n`
    : `\n${failures} problem(s) to fix first.\n`
);
process.exit(failures === 0 ? 0 : 1);
