-- Lil Beats — Supabase schema
--
-- Run this once against a fresh Supabase project (SQL Editor, or
-- `supabase db push` if you're using the CLI with migrations).
--
-- Security model: every table below has Row Level Security enabled with
-- NO policies for the `anon` or `authenticated` roles. The Next.js app
-- never queries these tables directly from the browser — all reads and
-- writes go through server-side code using the service role key (see
-- src/lib/supabase/admin.ts), which bypasses RLS entirely. This keeps the
-- catalog, orders, and download tokens fully locked down from direct
-- client access while still being reachable from your own API routes.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- beats
-- ---------------------------------------------------------------------------
create table if not exists public.beats (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  artwork_path text not null,
  preview_audio_path text not null,
  full_mp3_path text not null,
  wav_path text not null,
  stems_path text,
  /*
    Delivery bundles, built by `pnpm build-bundles`.

    Every tier above MP3 advertises more than one file — Premium is "MP3 +
    WAV", Unlimited and Exclusive are "MP3 + WAV + Stems" — but a download
    link can only resolve to a single object. These are the pre-built archives
    that make the delivery match the offer, rather than handing over one file
    and calling it done.

    Nullable: a beat without one falls back to the single best file it has, so
    an un-bundled beat still delivers something rather than 404ing.
  */
  premium_bundle_path text,
  complete_bundle_path text,
  bpm integer not null,
  key text not null,
  key_mode text not null,
  genre text not null,
  mood text[] not null default '{}',
  tags text[] not null default '{}',
  description text not null,
  duration_seconds integer not null,
  base_price numeric(10, 2) not null,
  plays integer not null default 0,
  favorites integer not null default 0,
  featured boolean not null default false,
  is_new boolean not null default true,
  license_availability text[] not null default '{mp3,wav}',
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists beats_published_idx on public.beats (published, created_at desc);
create index if not exists beats_genre_idx on public.beats (genre);

alter table public.beats enable row level security;

-- ---------------------------------------------------------------------------
-- orders
-- ---------------------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text unique not null,
  customer_email text not null,
  customer_name text,
  -- Needed by the licence agreements, which name the Licensee's address on
  -- their first line ("residing at ..."). Collected by Stripe Checkout.
  customer_address text,
  amount_total numeric(10, 2) not null default 0,
  currency text not null default 'usd',
  status text not null default 'pending' check (status in ('pending', 'paid', 'refunded')),
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

-- ---------------------------------------------------------------------------
-- order_items
-- ---------------------------------------------------------------------------
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  beat_id uuid not null references public.beats (id) on delete restrict,
  beat_title text not null,
  license_id text not null check (license_id in ('mp3', 'wav', 'unlimited', 'exclusive')),
  license_name text not null,
  price numeric(10, 2) not null,
  -- Stripe delivers webhooks at-least-once and retries can overlap. The
  -- handler de-duplicates by reading existing items first, but a
  -- read-then-write cannot survive two deliveries that both read before
  -- either writes — which is how one $35 order came to hold two $35 line
  -- items. This constraint is the part that actually holds: the losing
  -- delivery fails, Stripe retries, and the retry correctly sees the item
  -- already recorded. Nobody can own the same licence for the same beat
  -- twice on one order.
  constraint order_items_unique_line unique (order_id, beat_id, license_id)
);

create index if not exists order_items_order_id_idx on public.order_items (order_id);

alter table public.order_items enable row level security;

-- ---------------------------------------------------------------------------
-- download_tokens
-- ---------------------------------------------------------------------------
create table if not exists public.download_tokens (
  id uuid primary key default gen_random_uuid(),
  token text unique not null,
  order_id uuid not null references public.orders (id) on delete cascade,
  order_item_id uuid not null references public.order_items (id) on delete cascade,
  beat_id uuid not null references public.beats (id) on delete restrict,
  license_id text not null check (license_id in ('mp3', 'wav', 'unlimited', 'exclusive')),
  expires_at timestamptz not null,
  download_count integer not null default 0,
  max_downloads integer not null default 5,
  created_at timestamptz not null default now()
);

create index if not exists download_tokens_token_idx on public.download_tokens (token);
create index if not exists download_tokens_order_id_idx on public.download_tokens (order_id);

alter table public.download_tokens enable row level security;

-- ---------------------------------------------------------------------------
-- mixing_requests
-- ---------------------------------------------------------------------------
create table if not exists public.mixing_requests (
  id uuid primary key default gen_random_uuid(),
  artist_name text not null,
  full_name text not null,
  email text not null,
  phone text,
  song_title text not null,
  genre text,
  service_requested text not null,
  number_of_songs integer not null default 1,
  reference_tracks text,
  desired_sound text,
  current_mix_problems text,
  deadline text,
  budget text,
  needs_vocal_tuning boolean not null default false,
  needs_stem_cleanup boolean not null default false,
  file_link text,
  project_file_path text,
  additional_notes text,
  confirms_ownership boolean not null default false,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

alter table public.mixing_requests enable row level security;

-- ---------------------------------------------------------------------------
-- subscribers
-- ---------------------------------------------------------------------------
create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  source text,
  created_at timestamptz not null default now()
);

alter table public.subscribers enable row level security;

-- ---------------------------------------------------------------------------
-- contact_messages
-- ---------------------------------------------------------------------------
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

-- ---------------------------------------------------------------------------
-- Storage buckets
-- ---------------------------------------------------------------------------
-- beat-artwork & beat-previews are public (served directly via the
-- storage public URL). beat-files & mixing-uploads are private — the app
-- reaches them only through the service role key or short-lived signed URLs.
insert into storage.buckets (id, name, public)
values
  ('beat-artwork', 'beat-artwork', true),
  ('beat-previews', 'beat-previews', true),
  ('beat-files', 'beat-files', false),
  ('mixing-uploads', 'mixing-uploads', false)
on conflict (id) do nothing;
