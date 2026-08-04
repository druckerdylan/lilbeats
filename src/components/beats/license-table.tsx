"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LICENSE_TIERS } from "@/lib/licensing";
import { Beat, LicenseId, LicenseTier } from "@/lib/types";
import { useCartStore } from "@/lib/store/cart-store";
import { formatPrice } from "@/lib/format";
import { priceForLicense } from "@/lib/licensing";
import { cn } from "@/lib/utils";

const ROWS: { label: string; key: keyof LicenseTier }[] = [
  { label: "Distribution", key: "distributionLimit" },
  { label: "Audio streams", key: "streamLimit" },
  { label: "Music videos", key: "musicVideos" },
  { label: "Radio broadcast", key: "radioBroadcast" },
  { label: "Live performances", key: "performances" },
];

/**
 * The column that gets the key light. Everything else stays monochrome.
 * Unlimited rather than the cheapest paid tier: it's the one worth steering
 * people to, and Exclusive sells itself.
 */
const HIGHLIGHTED: LicenseId = "unlimited";

function FeatureList({ features }: { features: string[] }) {
  return (
    <ul className="space-y-2.5">
      {features.map((feature) => (
        <li key={feature} className="flex items-start gap-2.5 text-sm leading-relaxed text-bone/80">
          <Check aria-hidden className="mt-0.5 size-3.5 shrink-0 text-ember" />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  );
}

export function LicenseTable({ beat }: { beat: Beat }) {
  const addItem = useCartStore((s) => s.addItem);
  const hasLicense = useCartStore((s) => s.hasLicense);
  const availableTiers = LICENSE_TIERS.filter((tier) =>
    beat.licenseAvailability.includes(tier.id)
  );

  const add = (tier: LicenseTier, price: number) =>
    addItem({
      beatId: beat.id,
      beatSlug: beat.slug,
      beatTitle: beat.title,
      artworkUrl: beat.artworkUrl,
      licenseId: tier.id,
      licenseName: tier.name,
      price,
    });

  return (
    <>
      {/*
        Below `md` the comparison collapses into one stacked panel per tier.
        A five-row × three-column grid cannot be read at 390px — the previous
        version put the buy buttons behind a horizontal scroll, which is the
        one thing on a product page that must never be hidden.
      */}
      <ul className="md:hidden">
        {availableTiers.map((tier) => {
          const price = priceForLicense(tier.id);
          const inCart = hasLicense(beat.id, tier.id);
          const hot = tier.id === HIGHLIGHTED;
          return (
            <li
              key={tier.id}
              className={cn(
                "border-b border-bone/10 p-5 last:border-b-0 sm:p-6",
                // Brackets mark the recommended tier as the targeted option —
                // the same reticle the desktop grid puts on its column.
                hot && "hud-corners border-t-2 border-t-ember bg-ember/[0.06]"
              )}
            >
              {hot && <span className="u-meta mb-4 block text-ember">Recommended</span>}

              <div className="flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <p className={cn("u-meta", hot ? "text-bone" : "text-smoke")}>{tier.name}</p>
                  <p className="u-meta mt-2.5 text-bone/35">{tier.formatLabel}</p>
                </div>
                <p className="shrink-0 font-display text-d3 uppercase leading-none tabular-nums text-bone">
                  {formatPrice(price)}
                </p>
              </div>

              <Button
                variant={inCart ? "cinemaGhost" : "cinema"}
                size="cinema"
                disabled={inCart}
                onClick={() => add(tier, price)}
                className="mt-5 w-full px-4"
              >
                {inCart ? "In cart" : "Add to cart"}
              </Button>

              <dl className="mt-7">
                {ROWS.map((row, index) => (
                  <div
                    key={row.key}
                    className="border-t border-bone/[0.07] py-3.5 first:border-t-0 first:pt-0"
                  >
                    <dt className="u-meta flex items-baseline gap-3 text-smoke">
                      <span aria-hidden className="tabular-nums text-bone/20">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {row.label}
                    </dt>
                    <dd className="mt-2 text-sm leading-relaxed text-bone/80">
                      {String(tier[row.key])}
                    </dd>
                  </div>
                ))}
                <div className="border-t border-bone/[0.07] pt-3.5">
                  <dt className="u-meta flex items-baseline gap-3 text-smoke">
                    <span aria-hidden className="tabular-nums text-bone/20">
                      {String(ROWS.length + 1).padStart(2, "0")}
                    </span>
                    Includes
                  </dt>
                  <dd className="mt-3">
                    <FeatureList features={tier.features} />
                  </dd>
                </div>
              </dl>
            </li>
          );
        })}
      </ul>

      {/*
        From `md` up, the real comparison grid. It still scrolls inside its
        own container between 768px and the point the 720px table fits, so
        the page body never moves sideways.
      */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <caption className="sr-only">License comparison for {beat.title}</caption>
          <thead>
            <tr>
              <th scope="col" className="w-48 border-b border-bone/10 p-5 align-bottom sm:p-6">
                {/* A measuring scale leading into the row labels — the sheet
                    reads as an instrument panel rather than a price grid. */}
                <div aria-hidden className="hud-ticks mb-5 opacity-30" />
                <span className="u-meta text-bone/30">Spec</span>
              </th>
              {availableTiers.map((tier) => {
                const price = priceForLicense(tier.id);
                const inCart = hasLicense(beat.id, tier.id);
                const hot = tier.id === HIGHLIGHTED;
                return (
                  <th
                    key={tier.id}
                    scope="col"
                    className={cn(
                      "border-b border-bone/10 p-5 align-bottom font-normal sm:p-6",
                      hot && "hud-corners border-t-2 border-t-ember bg-ember/[0.06]"
                    )}
                  >
                    {hot && <span className="u-meta mb-4 block text-ember">Recommended</span>}
                    <span className={cn("u-meta block", hot ? "text-bone" : "text-smoke")}>
                      {tier.name}
                    </span>
                    <p className="mt-4 font-display text-d3 uppercase leading-none tabular-nums text-bone">
                      {formatPrice(price)}
                    </p>
                    <p className="u-meta mt-3 text-bone/35">{tier.formatLabel}</p>
                    <Button
                      variant={inCart ? "cinemaGhost" : "cinema"}
                      size="cinemaSm"
                      disabled={inCart}
                      onClick={() => add(tier, price)}
                      className="mt-6 w-full px-4"
                    >
                      {inCart ? "In cart" : "Add to cart"}
                    </Button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, index) => (
              <tr key={row.key}>
                <th
                  scope="row"
                  className="border-b border-bone/[0.07] p-5 align-top font-normal sm:p-6"
                >
                  <span className="u-meta flex items-baseline gap-3 text-smoke">
                    <span aria-hidden className="tabular-nums text-bone/20">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {row.label}
                  </span>
                </th>
                {availableTiers.map((tier) => (
                  <td
                    key={tier.id}
                    className={cn(
                      "border-b border-bone/[0.07] p-5 align-top text-sm leading-relaxed sm:p-6",
                      tier.id === HIGHLIGHTED ? "bg-ember/[0.06] text-bone" : "text-bone/80"
                    )}
                  >
                    {String(tier[row.key])}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <th scope="row" className="p-5 align-top font-normal sm:p-6">
                <span className="u-meta flex items-baseline gap-3 text-smoke">
                  <span aria-hidden className="tabular-nums text-bone/20">
                    {String(ROWS.length + 1).padStart(2, "0")}
                  </span>
                  Includes
                </span>
              </th>
              {availableTiers.map((tier) => (
                <td
                  key={tier.id}
                  className={cn(
                    "p-5 align-top sm:p-6",
                    tier.id === HIGHLIGHTED && "bg-ember/[0.06]"
                  )}
                >
                  <FeatureList features={tier.features} />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
