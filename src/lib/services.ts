export interface ServiceTier {
  id: string;
  name: string;
  price: number;
  unit: string;
  description: string;
  features: string[];
  turnaround: string;
  /** Max stems this tier accepts. Absent = no cap (or not stem-based, e.g. mastering). */
  stemLimit?: number;
  highlighted?: boolean;
}

/*
  Priced against the 2026 independent/freelance market, deliberately undercutting
  it — not against high-end mastering houses, which is a different business.

    Mastering only     entry-level $20–60, independent professional $60–100.
                       Typical competent-independent rate ≈ $75.
    Mixing + master    entry-level package $75–210, independent $260+.
                       Typical entry-to-independent rate ≈ $165.

  Mixing splits on stem count because that is what actually drives the work: a
  twelve-stem vocal session and a forty-stem session are not the same job, and
  charging one price for both either overcharges the first or underprices the
  second. Mastering is not tiered — it takes one stereo file, so there are no
  stems to count.
*/
export const SERVICE_TIERS: ServiceTier[] = [
  {
    id: "mastering",
    name: "Mastering",
    price: 60,
    unit: "per song",
    description: "Final polish for an already-mixed track — loudness, tone, and translation across every system.",
    features: [
      "Stereo mastering from a finished mix",
      "Loudness optimized for streaming (or vinyl on request)",
      "3 rounds of revisions included",
      "Up to 2 more on request — 5 total",
      "Delivered as WAV + MP3",
    ],
    turnaround: "2–3 business days",
  },
  {
    id: "mixing-mastering",
    name: "Mixing & Mastering",
    price: 100,
    unit: "per song",
    stemLimit: 12,
    description: "Full mix from raw stems through a final master, built to sit right next to any major release.",
    features: [
      "Up to 12 stems",
      "Full mix from raw vocal & instrumental stems",
      "Vocal tuning and stem cleanup included",
      "Mastering included",
      "3 rounds of revisions included",
      "Up to 2 more on request — 5 total",
      "Delivered as WAV + MP3 + mix session on request",
    ],
    turnaround: "3–5 business days",
    highlighted: true,
  },
  {
    id: "mixing-mastering-premium",
    name: "Mixing & Mastering Premium",
    price: 140,
    unit: "per song",
    description: "The same mix and master with no cap on stem count — for full band sessions, dense arrangements, and stacked vocal productions.",
    features: [
      "Unlimited stems",
      "Full mix from raw vocal & instrumental stems",
      "Vocal tuning and stem cleanup included",
      "Mastering included",
      "3 rounds of revisions included",
      "Up to 2 more on request — 5 total",
      "Delivered as WAV + MP3 + mix session on request",
    ],
    turnaround: "3–5 business days",
  },
];

/*
  Bounded on purpose. Three rounds cover almost every project, and the two on
  request cost little to honour while removing the hesitation to ask for the
  change someone actually wants — but the total is capped at five, so a single
  difficult client cannot draw unlimited hours against a one-off fee. No
  refunds: the deliverables are files, and they cannot be returned.
*/
export const REVISION_POLICY =
  "Every package includes three rounds of revisions after your first draft. If you still want changes, ask and you get up to two more — five rounds in total, at no extra cost. Rush delivery (24–48 hours) is available on request, based on current availability.";
