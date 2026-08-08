export interface ServiceTier {
  id: string;
  name: string;
  price: number;
  unit: string;
  description: string;
  features: string[];
  turnaround: string;
  highlighted?: boolean;
}

/*
  Priced against the 2026 independent/freelance market, deliberately undercutting
  it — not against high-end mastering houses, which is a different business.

    Mastering only     entry-level $20–60, independent professional $60–100.
                       Typical competent-independent rate ≈ $75.
    Mixing + master    entry-level package $75–210, independent $260+.
                       Typical entry-to-independent rate ≈ $165.

  Both tiers sit $15 under those midpoints. Note this is a raise, not a cut: the
  previous $30 / $75 sat at or below the absolute floor of the entry-level band,
  which reads as demo-grade work rather than as a discount.
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
    price: 150,
    unit: "per song",
    description: "Full mix from raw stems through a final master, built to sit right next to any major release.",
    features: [
      "Full mix from raw vocal & instrumental stems",
      "Mastering included",
      "Vocal tuning available as an add-on",
      "3 rounds of revisions included",
      "Up to 2 more on request — 5 total",
      "Delivered as WAV + MP3 + mix session on request",
    ],
    turnaround: "3–5 business days",
    highlighted: true,
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
