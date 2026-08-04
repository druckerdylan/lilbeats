# LilBeats

A production-ready storefront for an independent music production brand —
beat licensing (MP3/WAV/Stems), Stripe checkout with automatic file
delivery, mixing & mastering booking, a portfolio, and an admin dashboard
for uploading new beats. Built with Next.js 16, TypeScript, Tailwind CSS 4,
shadcn/ui, and Framer Motion.

## Tech stack

- **Next.js 16** (App Router, Turbopack, async `params`/`searchParams`)
- **TypeScript**, **Tailwind CSS v4**, **shadcn/ui** (Base UI primitives), **Framer Motion**
- **Supabase** — Postgres database, Auth (admin login), and Storage (artwork/audio/stems)
- **Stripe Checkout** — cards, Apple Pay, Google Pay, and PayPal in one flow
- **Resend** — transactional email (receipts, mixing request notifications, newsletter)
- **Zod + react-hook-form** for validated forms
- **Zustand** for cart/favorites/audio-player client state

## Getting started

```bash
pnpm install
pnpm dev
```

The site runs fully without any external services configured — it falls
back to the sample catalog in `src/lib/mock-data.ts`, checkout shows a
clear "Stripe isn't configured" error instead of crashing, and emails are
logged to the console instead of sent. This makes it possible to review
the entire UI before wiring up real infrastructure.

To go live, you need three things configured: **Supabase**, **Stripe**,
and **Resend**. Copy `.env.example` to `.env.local` and fill in each
section below as you go.

```bash
cp .env.example .env.local
```

## 1. Supabase (database, storage, and admin auth)

1. Create a free project at [supabase.com](https://supabase.com).
2. In **Project Settings → API**, copy the **Project URL**, **anon public**
   key, and **service_role** key into `.env.local` as `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.
3. Open the **SQL Editor** and run the entire contents of
   [`supabase/schema.sql`](./supabase/schema.sql). This creates every table
   (`beats`, `orders`, `order_items`, `download_tokens`, `mixing_requests`,
   `subscribers`, `contact_messages`) with Row Level Security enabled, plus
   the four storage buckets (`beat-artwork`, `beat-previews` public;
   `beat-files`, `mixing-uploads` private).
4. Create your admin login: **Authentication → Users → Add user**, enter
   your email and a password. That's the only account that can sign in at
   `/admin`. Delete/skip this step if you don't need file uploads via the
   dashboard yet.

**Security model:** every table has RLS enabled with *no* policies for the
`anon`/`authenticated` roles. The app never queries these tables from the
browser — all reads/writes happen server-side using the service role key
(see `src/lib/supabase/admin.ts`), so the catalog and order data stay
locked down from direct client access.

## 2. Stripe (checkout + automatic delivery)

1. Create a [Stripe](https://stripe.com) account (test mode is fine to start).
2. **Developers → API keys** → copy the **Secret key** into `STRIPE_SECRET_KEY`.
3. Enable **PayPal** as a payment method under **Settings → Payment methods**
   if you want it available at checkout (cards, Apple Pay, and Google Pay
   are enabled automatically).
4. **Developers → Webhooks → Add endpoint**, pointed at:
   `https://your-domain.com/api/webhooks/stripe`, listening for
   `checkout.session.completed`. Copy the **Signing secret** into
   `STRIPE_WEBHOOK_SECRET`.
5. For local testing, use the [Stripe CLI](https://docs.stripe.com/stripe-cli):
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

When a checkout session completes, the webhook creates the order + order
items in Supabase, generates a secure, expiring download token per file
(7 days / 5 downloads by default — see `src/lib/download-tokens.ts`), and
emails the customer a receipt with a link back to their download page.

## 3. Resend (transactional email)

1. Create a [Resend](https://resend.com) account and verify a sending
   domain (or use their test domain while developing).
2. Copy an API key into `RESEND_API_KEY`.
3. Set `RESEND_FROM_EMAIL` to an address on your verified domain, e.g.
   `"LilBeats <orders@yourdomain.com>"`.

Email templates live in `src/lib/email/templates.ts` — order receipts,
mixing request confirmations (customer + admin copies), contact form
notifications, and the newsletter welcome email.

## Uploading beats

Once Supabase is configured, sign in at `/admin` and go to **Beats → Upload
Beat**. Fill in the metadata, upload artwork, an MP3 preview, the full MP3,
WAV, and (optionally) a stems ZIP — the beat publishes immediately and
appears in `/beats` and the homepage's featured section. WAV and Stems
pricing are calculated automatically from the multipliers in
`src/lib/licensing.ts`; only the base MP3 price is set per beat.

### Importing an existing catalog (e.g. from BeatStars)

There's no public API for pulling a producer's catalog out of BeatStars
directly, so the path in is: **download your own audio files from your
BeatStars producer dashboard** (you already own them), then use
**Beats → Bulk Upload** (`/admin/beats/bulk`) instead of the single-beat
form. Drop in all your MP3/WAV files at once — each one becomes its own
row with a guessed title — fill in the remaining metadata and artwork per
row, and publish the whole batch in one pass. Every row goes through the
same upload/validation pipeline as the single-beat form.

## Editing pricing

- **Beat license multipliers**: `src/lib/licensing.ts`
- **Mixing & mastering package pricing**: `src/lib/services.ts`

## Project structure

```
src/
  app/                 Routes (App Router) — pages + API route handlers
    admin/             Auth-gated dashboard (beats, orders, mixing requests)
    api/                Route handlers (checkout, webhooks, downloads, forms)
    beats/              Beat store + beat product pages
    mixing-mastering/   Service page + request form
  components/
    ui/                 shadcn/ui primitives
    beats/ cart/ mixing/ admin/ home/ portfolio/ contact/ marketing/ layout/ shared/
  lib/
    supabase/           Browser/server/admin Supabase clients + generated-style types
    email/              Email templates
    store/               Zustand stores (cart, favorites, audio player)
    mock-data.ts         Sample catalog used when Supabase isn't configured
    beats-repo.ts        Reads beats from Supabase when configured, else mock data
    licensing.ts         License tier definitions + pricing
    services.ts          Mixing & mastering package definitions
  proxy.ts               Route protection for /admin/*
supabase/
  schema.sql             Full database schema, RLS, and storage buckets
```

## Deployment

Deploy to [Vercel](https://vercel.com/new) (or any Next.js-compatible
host). Set all variables from `.env.example` in your hosting provider's
environment settings, set `NEXT_PUBLIC_SITE_URL` to your real domain, and
point the Stripe webhook at your production URL.

## Before a real launch

- Have a lawyer review the Privacy Policy, Terms of Service, and Licensing
  pages — the copy is realistic but not a substitute for legal review.
- Replace the placeholder Unsplash photography and synthesized preview
  audio with real artwork and beats via the admin dashboard.
- Update social links, business email, and hours in `src/lib/constants.ts`.
