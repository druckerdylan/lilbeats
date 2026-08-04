import type { Metadata } from "next";
import { Fragment } from "react";
import Link from "next/link";
import Stripe from "stripe";
import { CircleCheck, Download, FileText } from "lucide-react";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured, getBeatFileLocation } from "@/lib/beats-repo";
import { ClearCartOnMount } from "@/components/cart/clear-cart-on-mount";
import { Button } from "@/components/ui/button";
import { Reveal, RevealGroup, RevealItem, SplitWords } from "@/components/shared/reveal";
import { Kicker } from "@/components/shared/section-heading";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Order Confirmed",
  robots: { index: false, follow: false },
};

interface PurchasedItem {
  beatId: string;
  beatTitle: string;
  licenseId: string;
  licenseName: string;
  price: number;
  downloadHref: string | null;
  /** The buyer's licence agreement. Null when no token exists yet. */
  contractHref: string | null;
}

/**
 * Resolves both links for a purchased line item. They share one token: the
 * download serves the file, the contract renders the agreement for the same
 * order item.
 */
async function getItemLinks(
  orderIdBySession: string | null,
  beatId: string,
  licenseId: string
): Promise<{ downloadHref: string | null; contractHref: string | null }> {
  if (isSupabaseConfigured() && orderIdBySession) {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("download_tokens")
      .select("token")
      .eq("order_id", orderIdBySession)
      .eq("beat_id", beatId)
      .eq("license_id", licenseId)
      .maybeSingle();
    return data
      ? { downloadHref: `/api/download/${data.token}`, contractHref: `/contracts/${data.token}` }
      : { downloadHref: null, contractHref: null };
  }

  // Unconfigured environment: the local sample file is servable, but there is
  // no order behind it, so no agreement can be issued.
  const location = await getBeatFileLocation(beatId, licenseId);
  return {
    downloadHref: location?.isLocal ? location.path : null,
    contractHref: null,
  };
}

/** Shared shell for the two dead-end states, so they still feel art-directed. */
function StatusScreen({
  eyebrow,
  title,
  body,
  action,
}: {
  eyebrow: string;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="relative mx-auto max-w-2xl px-5 py-32 text-center sm:px-8 lg:py-40">
      <div
        aria-hidden
        className="spotlight pointer-events-none absolute inset-x-0 top-24 mx-auto h-[420px] w-full max-w-[620px] opacity-60"
      />
      <div className="relative">
        <Kicker className="justify-center" tone="smoke">
          {eyebrow}
        </Kicker>
        <h1 className="mt-6 font-display text-d1 text-bone uppercase">{title}</h1>
        <p className="mx-auto mt-8 max-w-md text-base leading-relaxed text-smoke sm:text-lg">
          {body}
        </p>
        {action}
      </div>
    </div>
  );
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;

  if (!sessionId) {
    return (
      <StatusScreen
        eyebrow="No session"
        title="No Order Found"
        body="This page requires a valid checkout session."
        action={
          <Button
            variant="cinema"
            size="cinema"
            className="mt-10"
            render={<Link href="/beats" />}
          >
            Browse Beats
          </Button>
        }
      />
    );
  }

  const stripe = getStripe();
  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items.data.price.product"],
    });
  } catch {
    return (
      <StatusScreen
        eyebrow="Lookup failed"
        title="Order Not Found"
        body="We couldn’t find a checkout session with that ID."
        action={
          <Button
            variant="cinemaGhost"
            size="cinema"
            className="mt-10"
            render={<Link href="/beats" />}
          >
            Browse Beats
          </Button>
        }
      />
    );
  }

  let orderId: string | null = null;
  if (isSupabaseConfigured()) {
    const supabase = createAdminClient();
    const { data: order } = await supabase
      .from("orders")
      .select("id")
      .eq("stripe_session_id", session.id)
      .maybeSingle();
    orderId = order?.id ?? null;
  }

  const lines = session.line_items?.data ?? [];
  const items: PurchasedItem[] = await Promise.all(
    lines.map(async (line) => {
      const product = line.price?.product as Stripe.Product;
      const beatId = product.metadata.beatId;
      const licenseId = product.metadata.licenseId;
      return {
        beatId,
        beatTitle: product.metadata.beatTitle ?? line.description ?? "Beat",
        licenseId,
        licenseName: product.metadata.licenseName ?? "License",
        price: (line.amount_total ?? 0) / 100,
        ...(await getItemLinks(orderId, beatId, licenseId)),
      };
    })
  );

  const amountTotal = (session.amount_total ?? 0) / 100;
  const isPaid = session.payment_status === "paid";

  /* End-credit rows: every value here comes off the Stripe session. */
  const receiptRows: Array<{ label: string; value: string }> = [
    { label: "Status", value: isPaid ? "Paid" : "Processing" },
    { label: "Delivery", value: "Instant Download" },
    { label: "Currency", value: (session.currency ?? "usd").toUpperCase() },
  ];

  return (
    <div className="relative mx-auto max-w-6xl px-5 py-28 sm:px-8 lg:py-40">
      <ClearCartOnMount />

      <div
        aria-hidden
        className="spotlight pointer-events-none absolute inset-x-0 -top-24 mx-auto h-[620px] w-full max-w-[900px]"
      />

      <header className="relative text-center">
        {/* `neon-edge` rather than `glow-ember`: this badge is the moment the
           order lands, and it should read as a lit filament, not a soft
           shadow. It is the only glowing chip on the page. */}
        <div
          className="neon-edge mx-auto flex size-14 items-center justify-center border border-ember/40"
          aria-hidden
        >
          <CircleCheck className="size-6 text-ember-bright" />
        </div>
        <Kicker className="mt-8 justify-center">
          {isPaid ? "Payment Confirmed" : "Payment Received"}
        </Kicker>
        {/*
          The one `text-d0` on the page and the site's one earned neon
          headline — this is the payoff title card, so the glow lives here and
          nowhere else in the checkout flow.
        */}
        <h1 className="neon-text mt-6 font-display text-d0 uppercase">
          <SplitWords text={isPaid ? "Order Confirmed" : "Order Received"} />
        </h1>
        <p className="mx-auto mt-8 max-w-md text-base leading-relaxed text-smoke sm:text-lg">
          A receipt has been sent to{" "}
          <span className="break-all text-bone">
            {session.customer_details?.email ?? "your email"}
          </span>
          .
        </p>
      </header>

      <section className="relative mt-20 lg:mt-28" aria-labelledby="downloads-heading">
        <div className="flex items-end justify-between gap-6 pb-4">
          <h2 id="downloads-heading" className="u-meta text-smoke">
            Your Files
          </h2>
          <span className="u-meta shrink-0 text-smoke tabular-nums">
            {items.length} {items.length === 1 ? "File" : "Files"}
          </span>
        </div>
        {/* Same ticked scale that opens the checkout manifest — the delivery
           list is that manifest, fulfilled. */}
        <div className="hud-ticks opacity-70" aria-hidden />

        <RevealGroup stagger={0.08}>
          {items.map((item, index) => (
            <RevealItem key={index}>
              {index > 0 && <div className="hairline-dim" aria-hidden />}
              <div className="flex flex-col gap-5 py-7 sm:flex-row sm:items-center sm:justify-between sm:gap-10">
                <div className="min-w-0">
                  <p className="truncate font-display text-d3 text-bone uppercase">
                    {item.beatTitle}
                  </p>
                  <p className="u-meta mt-3 text-smoke">
                    {item.licenseName}
                    <span className="mx-2 text-bone/25">/</span>
                    <span className="tabular-nums">{formatPrice(item.price)}</span>
                  </p>
                </div>
                {item.downloadHref ? (
                  <Button
                    variant="cinema"
                    size="cinema"
                    className="w-full shrink-0 sm:w-auto"
                    render={<a href={item.downloadHref} download />}
                  >
                    <Download aria-hidden />
                    Download
                  </Button>
                ) : (
                  <span className="u-meta shrink-0 text-smoke">Preparing file…</span>
                )}
                {item.contractHref && (
                  <Button
                    variant="cinemaGhost"
                    size="cinemaSm"
                    className="w-full shrink-0 sm:w-auto"
                    render={<a href={item.contractHref} />}
                  >
                    <FileText aria-hidden />
                    Licence
                  </Button>
                )}
              </div>
            </RevealItem>
          ))}
        </RevealGroup>

        <div className="hairline" aria-hidden />

        <Reveal variant="fade">
          <dl className="mt-2">
            {receiptRows.map((row, index) => (
              <Fragment key={row.label}>
                {index > 0 && <div className="hairline-dim" aria-hidden />}
                <div className="flex items-baseline justify-between gap-6 py-3.5">
                  <dt className="u-meta shrink-0 text-smoke">{row.label}</dt>
                  <dd className="u-meta text-right text-bone">{row.value}</dd>
                </div>
              </Fragment>
            ))}
          </dl>

          <div className="hairline" aria-hidden />

          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 pt-8">
            <span className="u-meta shrink-0 text-smoke">Total Paid</span>
            <span className="font-display text-d2 text-bone tabular-nums">
              {formatPrice(amountTotal)}
            </span>
          </div>
        </Reveal>
      </section>

      <Reveal variant="fade" className="relative mt-20">
        <div className="hairline-dim" aria-hidden />
        <p className="u-meta mt-8 text-smoke">Fine Print</p>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-smoke">
          Download links expire after 7 days and are limited to 5 downloads per file. By
          downloading, you agree to the terms of your{" "}
          <Link
            href="/licensing"
            className="text-bone underline decoration-ember decoration-1 underline-offset-4 transition-colors hover:text-ember-bright"
          >
            license agreement
          </Link>
          .
        </p>
        <Button
          variant="cinemaGhost"
          size="cinema"
          className="mt-10 w-full sm:w-auto"
          render={<Link href="/beats" />}
        >
          Back To The Catalog
        </Button>
      </Reveal>
    </div>
  );
}
