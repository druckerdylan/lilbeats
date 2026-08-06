#!/usr/bin/env node
/**
 * Verifies the Stripe setup against what this codebase actually needs.
 *
 *   pnpm check-stripe
 *
 * Checks the things that fail quietly: a key from the wrong mode, an account
 * that cannot yet accept charges, a webhook pointed at the wrong URL, or one
 * subscribed to the wrong events — that last one loses orders silently, since
 * the charge succeeds and nothing is ever fulfilled.
 */

import Stripe from "stripe";
import { readFileSync } from "node:fs";

/**
 * Prices are read out of licensing.ts rather than imported — this is plain
 * Node and cannot load a TypeScript module. Parsing keeps the check honest:
 * it reports what the app will actually charge, not a copy that could drift.
 */
function tiersFromSource() {
  const src = readFileSync("src/lib/licensing.ts", "utf8");
  const out = [];
  const re = /name:\s*"([^"]+)"[\s\S]*?price:\s*(\d+(?:\.\d+)?)/g;
  let m;
  while ((m = re.exec(src))) out.push({ name: m[1], price: Number(m[2]) });
  return out;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "";
/** Both are required: the second is what the code fulfils delayed methods on. */
const NEEDED_EVENTS = [
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
];

const pass = (m) => console.log(`  ✓ ${m}`);
const fail = (m, hint) => { console.log(`  ✗ ${m}`); if (hint) console.log(`      → ${hint}`); failures++; };
const warn = (m, hint) => { console.log(`  ! ${m}`); if (hint) console.log(`      → ${hint}`); };
let failures = 0;

console.log("\nKeys");

const secret = process.env.STRIPE_SECRET_KEY;
const whsec = process.env.STRIPE_WEBHOOK_SECRET;

if (!secret) {
  fail("STRIPE_SECRET_KEY missing", "Stripe → Developers → API keys → Secret key");
} else if (!/^(sk|rk)_(test|live)_/.test(secret)) {
  fail("STRIPE_SECRET_KEY does not look like a secret key", "It should start sk_test_ or sk_live_ — a pk_ key is the publishable one");
} else {
  const live = secret.includes("_live_");
  pass(`STRIPE_SECRET_KEY (${live ? "LIVE — real money" : "test mode"})`);
  if (live) warn("live key in use", "Charges will be real. Confirm the contracts render before selling.");
}

whsec
  ? pass(`STRIPE_WEBHOOK_SECRET (${whsec.startsWith("whsec_") ? "ok" : "unexpected format"})`)
  : fail("STRIPE_WEBHOOK_SECRET missing", "Comes from the webhook endpoint you create, or from `stripe listen`");

if (!SITE_URL) {
  fail("NEXT_PUBLIC_SITE_URL missing", "Stripe redirects here after payment — a wrong value sends paid customers off-site");
} else if (SITE_URL.includes("localhost")) {
  warn(`NEXT_PUBLIC_SITE_URL is ${SITE_URL}`, "Fine locally. Production must be the real origin.");
} else {
  pass(`NEXT_PUBLIC_SITE_URL ${SITE_URL}`);
}

if (!secret) {
  console.log("\nCannot check the account without a secret key.\n");
  process.exit(1);
}

const stripe = new Stripe(secret, { apiVersion: "2026-07-29.dahlia" });

console.log("\nAccount");
let account;
try {
  account = await stripe.accounts.retrieve();
  pass(`connected as ${account.settings?.dashboard?.display_name ?? account.id}`);
} catch (err) {
  fail(`key rejected — ${err.message}`, "Check it was copied whole, and from the right mode");
  console.log(`\n${failures} problem(s).\n`);
  process.exit(1);
}

/*
  `charges_enabled` and `payouts_enabled` describe LIVE capability. A sandbox
  or unactivated account reports both false and still processes test payments
  through Checkout perfectly well, so treating them as failures in test mode
  sends you off to do business verification you do not yet need.
*/
const liveKey = secret.includes("_live_");
if (account.charges_enabled) {
  pass("charges enabled");
} else if (liveKey) {
  fail("account cannot accept charges", "Finish Stripe's business verification — live charges will fail");
} else {
  pass("test mode — Checkout works; live charges need activation later");
}

if (!account.payouts_enabled && liveKey) {
  warn("payouts not enabled", "You can take payments but not withdraw them yet");
}

console.log("\nPayment methods");
try {
  // The checkout session omits payment_method_types on purpose, so whatever is
  // active here is what buyers are offered.
  const methods = await stripe.paymentMethodConfigurations.list({ limit: 1 });
  const cfg = methods.data[0];
  if (!cfg) {
    warn("no payment method configuration found", "Cards are usually on by default");
  } else {
    const active = Object.entries(cfg)
      .filter(([, v]) => v && typeof v === "object" && "available" in v && v.available)
      .map(([k]) => k);
    active.length
      ? pass(`enabled: ${active.slice(0, 8).join(", ")}${active.length > 8 ? "…" : ""}`)
      : warn("no methods appear active", "Settings → Payment methods");
    if (!active.includes("card")) fail("cards are not enabled", "Settings → Payment methods → enable Card");
  }
} catch {
  warn("could not read payment methods", "Not fatal — check Settings → Payment methods by hand");
}

console.log("\nWebhook");
try {
  const endpoints = await stripe.webhookEndpoints.list({ limit: 20 });
  const wanted = SITE_URL ? `${SITE_URL}/api/webhooks/stripe` : null;
  const mine = endpoints.data.find((e) => e.url === wanted);

  if (!endpoints.data.length) {
    warn("no webhook endpoints registered",
      SITE_URL
        ? `For production add: ${wanted}\n      → For local testing use: stripe listen --forward-to localhost:3000/api/webhooks/stripe`
        : "Set NEXT_PUBLIC_SITE_URL first");
  } else if (!mine) {
    fail(`no endpoint matches ${wanted}`,
      `registered: ${endpoints.data.map((e) => e.url).join(", ")}`);
  } else {
    pass(`endpoint ${mine.url} (${mine.status})`);
    const missing = NEEDED_EVENTS.filter(
      (e) => !mine.enabled_events.includes(e) && !mine.enabled_events.includes("*")
    );
    missing.length
      ? fail(`endpoint is not subscribed to: ${missing.join(", ")}`,
          "Without these the charge succeeds and nothing is ever delivered")
      : pass("subscribed to both required events");
  }
} catch (err) {
  warn(`could not list webhooks — ${err.message}`);
}

console.log("\nPricing the buyer will be charged");
for (const t of tiersFromSource()) {
  console.log(`  ${t.name.padEnd(18)} $${t.price.toFixed(2).padStart(7)}  → ${t.price * 100} cents`);
}

console.log(
  failures === 0
    ? "\nReady. Test with card 4242 4242 4242 4242, any future expiry, any CVC.\n"
    : `\n${failures} problem(s) to fix first.\n`
);
process.exit(failures === 0 ? 0 : 1);
