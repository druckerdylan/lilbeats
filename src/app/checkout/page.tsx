"use client";

import { Fragment, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal, RevealGroup, RevealItem, SplitWords } from "@/components/shared/reveal";
import { Kicker } from "@/components/shared/section-heading";
import { HudFrame } from "@/components/visuals/hud-frame";
import { useCartStore } from "@/lib/store/cart-store";
import { formatPrice } from "@/lib/format";

const PAYMENT_METHODS = ["Cards", "Apple Pay", "Google Pay", "PayPal"];

/** Manifest line numbers. */
const pad = (n: number) => String(n).padStart(2, "0");

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const [loading, setLoading] = useState(false);
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);

  async function handleCheckout() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({ beatId: item.beatId, licenseId: item.licenseId })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Something went wrong starting checkout.");
      }
      window.location.href = data.url;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Checkout failed.");
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="relative mx-auto max-w-2xl px-5 py-32 text-center sm:px-8 lg:py-40">
        <div
          aria-hidden
          className="spotlight pointer-events-none absolute inset-x-0 top-24 mx-auto h-[420px] w-full max-w-[620px] opacity-70"
        />
        <div className="relative">
          <Kicker className="justify-center">Nothing queued</Kicker>
          <h1 className="mt-6 font-display text-d1 text-bone uppercase">
            Empty
            <br />
            <span className="text-outline">Crate</span>
          </h1>
          <p className="mx-auto mt-8 max-w-md text-base leading-relaxed text-smoke sm:text-lg">
            There is nothing to pay for yet. Browse the catalog to find your next record.
          </p>
          <Button
            variant="cinema"
            size="cinema"
            className="mt-10"
            render={<Link href="/beats" />}
          >
            Browse Beats
          </Button>
        </div>
      </div>
    );
  }

  /*
    Spec-sheet rows for the summary panel. Mono labels on the left, mono
    values on the right, hairline between each — the same voice as a track
    listing on the back of a sleeve.
  */
  const summaryRows: Array<{ label: string; value: string }> = [
    { label: "Items", value: String(items.length) },
    { label: "Delivery", value: "Instant Download" },
    { label: "Currency", value: "USD" },
  ];

  return (
    <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-14 lg:py-28">
      <div
        aria-hidden
        className="spotlight pointer-events-none absolute inset-x-0 top-0 mx-auto h-[480px] w-full max-w-[820px] opacity-60"
      />

      <header className="relative">
        <Kicker>Secure Checkout</Kicker>
        <h1 className="mt-6 font-display text-d1 text-bone uppercase">
          <SplitWords text="Checkout" />
        </h1>
        <p className="mt-7 max-w-xl text-base leading-relaxed text-smoke sm:text-lg">
          Review the order below. Payment is handled by Stripe, and your files unlock the
          moment it clears.
        </p>
      </header>

      <div className="relative mt-16 grid gap-14 lg:mt-24 lg:grid-cols-12 lg:gap-16">
        <section className="lg:col-span-7" aria-labelledby="order-lines-heading">
          <div className="flex items-end justify-between gap-6 pb-4">
            <h2 id="order-lines-heading" className="u-meta text-smoke">
              Item / License
            </h2>
            <span className="u-meta shrink-0 text-smoke">Price</span>
          </div>
          {/* Ticked scale opens the manifest; the plain hairline closes it. */}
          <div className="hud-ticks opacity-70" aria-hidden />

          <RevealGroup stagger={0.07}>
            {items.map((item, index) => (
              <RevealItem key={item.id}>
                {index > 0 && <div className="hairline-dim" aria-hidden />}
                <div className="group flex items-start gap-4 py-6 sm:items-center sm:gap-6">
                  <div className="relative size-16 shrink-0 overflow-hidden sm:size-20">
                    <Image
                      src={item.artworkUrl}
                      alt={item.beatTitle}
                      fill
                      sizes="(min-width: 640px) 80px, 64px"
                      className="grade-cinema object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="vignette-frame pointer-events-none absolute inset-0" aria-hidden />
                  </div>
                  {/*
                    Title and price share a baseline row rather than sitting in
                    separate grid columns: at 390px a third column left the
                    title with ~150px and every beat name truncated to two
                    words.
                  */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-4">
                      <p className="truncate font-display text-2xl leading-none text-bone uppercase sm:text-3xl">
                        {item.beatTitle}
                      </p>
                      <p className="shrink-0 font-display text-2xl leading-none text-bone tabular-nums sm:text-3xl">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                    <p className="u-meta mt-3 truncate text-smoke">
                      <span className="tabular-nums text-bone/30">
                        {pad(index + 1)}
                      </span>
                      <span className="mx-2 text-bone/25">/</span>
                      {item.licenseName}
                      <span className="mx-2 text-bone/25">/</span>
                      Qty 1
                    </p>
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>

          <div className="hairline-dim" aria-hidden />
        </section>

        <aside className="lg:col-span-5">
          {/*
            `rise`, not `wipe`: the frame hangs its label above its own top
            edge, and a settled `clip-path: inset(0)` would cut that readout
            off permanently.
          */}
          <Reveal variant="rise" className="lg:sticky lg:top-28">
            <HudFrame
              label="Order / Manifest"
              readout={`${items.length} ${items.length === 1 ? "Line" : "Lines"}`}
              className="glass p-6 sm:p-10"
            >
              <p className="u-meta text-smoke">Order Total</p>
              <p className="mt-4 font-display text-d2 text-bone tabular-nums">
                {formatPrice(subtotal)}
              </p>

              <div className="hairline mt-8" aria-hidden />

              <dl>
                {summaryRows.map((row, index) => (
                  <Fragment key={row.label}>
                    {index > 0 && <div className="hairline-dim" aria-hidden />}
                    <div className="flex items-baseline justify-between gap-4 py-3.5">
                      <dt className="u-meta shrink-0 text-smoke">{row.label}</dt>
                      <dd className="u-meta text-right text-bone tabular-nums">
                        {row.value}
                      </dd>
                    </div>
                  </Fragment>
                ))}
              </dl>

              <div className="hairline-dim" aria-hidden />

              <Button
                onClick={handleCheckout}
                disabled={loading}
                aria-busy={loading}
                variant="cinema"
                size="cinema"
                className="mt-8 w-full"
              >
                {loading ? "Redirecting…" : "Pay Now"}
              </Button>

              <div className="mt-6 flex items-center justify-center gap-2 text-smoke">
                <ShieldCheck className="size-3.5 shrink-0" aria-hidden />
                <p className="u-meta">Secure checkout via Stripe</p>
              </div>
              <p className="u-meta mt-3 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-smoke">
                {PAYMENT_METHODS.map((method, index) => (
                  <Fragment key={method}>
                    {index > 0 && <span aria-hidden className="h-2.5 w-px bg-bone/25" />}
                    <span>{method}</span>
                  </Fragment>
                ))}
              </p>
            </HudFrame>
          </Reveal>
        </aside>
      </div>
    </div>
  );
}
