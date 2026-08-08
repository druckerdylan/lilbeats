import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/beats-repo";
import { renderContract } from "@/lib/contracts/render";
import { LicenseId } from "@/lib/types";
import { Kicker } from "@/components/shared/section-heading";
import { BRAND, SITE_NAME } from "@/lib/constants";
import { Notice } from "./notice";

export const metadata: Metadata = {
  title: "Licence Agreement",
  robots: { index: false, follow: false },
};

export default async function ContractPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  if (!isSupabaseConfigured()) {
    return (
      <Notice
        eyebrow="Unavailable"
        title="Agreement Not Available"
        body="Licence agreements aren't available on this environment. Get in touch and we'll send yours directly."
      />
    );
  }

  const supabase = createAdminClient();

  /*
    Keyed on the download token, which is unguessable (nanoid, 32 chars).
    Expiry and download count are deliberately NOT enforced here: those cap
    file downloads, whereas the agreement is the buyer's legal record and
    should stay readable indefinitely.
  */
  const { data: tokenRow } = await supabase
    .from("download_tokens")
    .select("order_id, order_item_id, license_id")
    .eq("token", token)
    .maybeSingle();

  // Real 404 via the segment's not-found boundary — a plain return of the
  // same UI would ship with HTTP 200, and search engines index soft-404s.
  if (!tokenRow) notFound();

  const [{ data: order }, { data: item }] = await Promise.all([
    supabase
      .from("orders")
      .select("customer_name, customer_address, created_at")
      .eq("id", tokenRow.order_id)
      .maybeSingle(),
    supabase
      .from("order_items")
      .select("beat_title, price, license_id")
      .eq("id", tokenRow.order_item_id)
      .maybeSingle(),
  ]);

  if (!order || !item) notFound();

  const result = renderContract({
    licenseId: item.license_id as LicenseId,
    beatTitle: item.beat_title,
    price: Number(item.price),
    customerName: order.customer_name,
    customerAddress: order.customer_address,
    date: new Date(order.created_at),
  });

  if (!result.ok) {
    // Never render a partial agreement. Logged loudly because this means a
    // term is unset in config and every buyer of this tier is affected.
    console.error(
      `[contracts] cannot render ${item.license_id} agreement — unset terms: ${result.missing.join(", ")}`
    );
    return (
      <Notice
        eyebrow="Pending"
        title="Agreement Being Finalised"
        body={`Your purchase and download are unaffected. Email ${BRAND.email} and we'll send your signed agreement directly.`}
      />
    );
  }

  return (
    <article className="mx-auto max-w-3xl px-5 pt-20 pb-28 sm:px-8 lg:pt-28">
      <Kicker className="mb-6">{SITE_NAME} — Licence Agreement</Kicker>

      <h1 className="font-display text-d3 uppercase text-bone">{result.title}</h1>

      <div aria-hidden className="hairline-dim mt-8 mb-10" />

      {/*
        Pre-wrapped rather than parsed into markup: this is a legal document,
        and re-flowing it through a formatter risks changing where clauses
        break. `whitespace-pre-wrap` preserves the text exactly as agreed.
      */}
      <div className="whitespace-pre-wrap text-[0.9375rem] leading-relaxed text-bone/85">
        {result.body}
      </div>

      <div aria-hidden className="hairline-dim mt-12 mb-8" />

      <p className="u-meta text-smoke">
        Retain this page for your records. Questions: {BRAND.email}
      </p>
    </article>
  );
}
