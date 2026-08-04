import { LicenseTier } from "@/lib/types";

/**
 * Central pricing config — every beat card, product page, licensing page and
 * checkout flow reads from this file.
 *
 * Prices are absolute per tier and identical across the catalogue (this is
 * how the BeatStars storefront is priced), rather than multipliers applied
 * to a per-beat base. Change a number here and it changes everywhere.
 */
export const LICENSE_TIERS: LicenseTier[] = [
  {
    id: "mp3",
    name: "MP3 Lease",
    formatLabel: "MP3",
    description: "Instant MP3 download for demos, mixtapes, and independent releases.",
    features: [
      "Untagged MP3 (320kbps)",
      "Commercial use rights",
      "Instant digital delivery",
    ],
    distributionLimit: "Up to 2,500 units / copies",
    streamLimit: "Up to 250,000 audio streams",
    musicVideos: "1 official music video",
    radioBroadcast: "Non-commercial radio only",
    performances: "Non-profit live performances",
    price: 15,
  },
  {
    id: "wav",
    name: "MP3 + WAV",
    formatLabel: "MP3 + WAV",
    description: "Studio-quality WAV alongside the MP3, for higher-fidelity mixing and release.",
    features: [
      "Untagged WAV (24-bit) + MP3",
      "Commercial use rights",
      "Higher streaming & distribution limits",
      "Instant digital delivery",
    ],
    distributionLimit: "Up to 10,000 units / copies",
    streamLimit: "Up to 1,000,000 audio streams",
    musicVideos: "2 official music videos",
    radioBroadcast: "Limited commercial radio",
    performances: "For-profit live performances",
    price: 20,
  },
  {
    id: "unlimited",
    name: "Unlimited",
    formatLabel: "MP3 + WAV + Stems",
    description:
      "Every non-exclusive cap removed, with the trackout stems included — unlimited sales, streams, videos, and radio.",
    features: [
      "Untagged WAV (24-bit) + MP3",
      "Individual trackout stems (ZIP)",
      "Unlimited distribution & streaming",
      "Unlimited music videos",
      "For-profit live performances",
      "Instant digital delivery",
    ],
    distributionLimit: "Unlimited units / copies",
    streamLimit: "Unlimited audio streams",
    musicVideos: "Unlimited music videos",
    radioBroadcast: "Unlimited radio broadcasting",
    performances: "For-profit live performances",
    price: 40,
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
    distributionLimit: "Distribute up to UNLIMITED copies",
    streamLimit: "UNLIMITED online audio streams",
    musicVideos: "UNLIMITED music videos",
    radioBroadcast: "Radio broadcasting rights (UNLIMITED stations)",
    performances: "For-profit live performances",
    price: 140,
    exclusive: true,
  },
];

export function getLicenseTier(id: string): LicenseTier | undefined {
  return LICENSE_TIERS.find((tier) => tier.id === id);
}

/**
 * Price for a licence tier. Takes only the tier id — pricing is no longer
 * derived from a per-beat base price.
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
 * don't carry the exclusive tier. It must not imply exclusivity is
 * enquiry-only, because on most beats it is a normal $140 checkout.
 */
export const EXCLUSIVE_LICENSE_NOTE =
  "The exclusive licence transfers full rights, includes the trackout stems, and retires the beat from the store the moment it sells. Where it isn't listed on a beat, get in touch and we'll sort it out directly.";
