import { LicenseTier } from "@/lib/types";
import { rightsRowsFor } from "@/lib/contracts/config";

/**
 * Central pricing config — every beat card, product page, licensing page and
 * checkout flow reads from this file.
 *
 * Prices are absolute per tier and identical across the catalogue, rather
 * than multipliers applied to a per-beat base. Names and amounts mirror the
 * producer's BeatStars storefront so a buyer sees the same four products in
 * both places.
 *
 * The rights rows (distribution, streams, videos, radio, performances) are
 * NOT written here. They come from `contracts/config.ts`, which is also what
 * generates the binding licence agreement — so the limits a buyer reads on
 * the pricing page are by construction the same ones their contract grants.
 * They previously diverged: this file shipped with invented caps.
 */
export const LICENSE_TIERS: LicenseTier[] = [
  {
    id: "mp3",
    name: "MP3 License",
    formatLabel: "MP3",
    description: "Instant MP3 download for demos, mixtapes, and independent releases.",
    features: [
      "Untagged MP3 (320kbps)",
      "Used for music recording",
      "For-profit live performances",
      "Instant digital delivery",
    ],
    ...rightsRowsFor("mp3"),
    price: 15,
  },
  {
    id: "wav",
    name: "Premium License",
    formatLabel: "MP3 + WAV",
    description: "Studio-quality WAV alongside the MP3, for higher-fidelity mixing and release.",
    features: [
      "Untagged WAV (24-bit) + MP3",
      "Used for music recording",
      "Five times the distribution limit of the MP3 licence",
      "For-profit live performances",
      "Instant digital delivery",
    ],
    ...rightsRowsFor("wav"),
    price: 20,
  },
  {
    id: "unlimited",
    name: "Unlimited License",
    formatLabel: "MP3 + WAV + Stems",
    description:
      "Every non-exclusive cap removed, with the trackout stems included — unlimited sales, streams, videos, and radio.",
    features: [
      "Untagged WAV (24-bit) + MP3",
      "Individual trackout stems (ZIP)",
      "Unlimited distribution & streaming",
      "Unlimited music videos",
      "Radio broadcasting on unlimited stations",
      "Instant digital delivery",
    ],
    ...rightsRowsFor("unlimited"),
    price: 35,
  },
  {
    id: "exclusive",
    name: "Exclusive License",
    formatLabel: "MP3 + WAV + Stems",
    description:
      "Full exclusive rights with trackout stems. The beat is retired from the store on purchase.",
    features: [
      "Untagged WAV (24-bit) + MP3",
      "Individual trackout stems (ZIP)",
      "Used for music recording",
      "Exclusive rights — beat removed from sale",
      "Instant digital delivery",
    ],
    ...rightsRowsFor("exclusive"),
    price: 140,
    exclusive: true,
  },
];

export function getLicenseTier(id: string): LicenseTier | undefined {
  return LICENSE_TIERS.find((tier) => tier.id === id);
}

/**
 * Price for a licence tier. Takes only the tier id — pricing is not derived
 * from a per-beat base price.
 */
export function priceForLicense(licenseId: string): number {
  return getLicenseTier(licenseId)?.price ?? 0;
}

/** Cheapest tier on offer for a beat — the "from" price on cards and listings. */
export function lowestPriceFor(licenseAvailability: string[]): number {
  const prices = LICENSE_TIERS.filter((t) => licenseAvailability.includes(t.id)).map(
    (t) => t.price
  );
  return prices.length ? Math.min(...prices) : 0;
}

/**
 * Shown where exclusive rights are discussed but not directly purchasable —
 * the licensing page's closing section, and the enquiry dialog on beats that
 * don't carry the exclusive tier.
 */
export const EXCLUSIVE_LICENSE_NOTE =
  "The exclusive licence transfers full rights, includes the trackout stems, and retires the beat from the store the moment it sells. Where it isn't listed on a beat, get in touch and we'll sort it out directly.";
