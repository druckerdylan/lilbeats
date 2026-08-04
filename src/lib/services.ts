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

/** Editable pricing placeholders for mixing & mastering services. */
export const SERVICE_TIERS: ServiceTier[] = [
  {
    id: "mastering",
    name: "Mastering",
    price: 30,
    unit: "per song",
    description: "Final polish for an already-mixed track — loudness, tone, and translation across every system.",
    features: [
      "Stereo mastering from a finished mix",
      "Loudness optimized for streaming (or vinyl on request)",
      "2 rounds of revisions",
      "Delivered as WAV + MP3",
    ],
    turnaround: "2–3 business days",
  },
  {
    id: "mixing-mastering",
    name: "Mixing & Mastering",
    price: 75,
    unit: "per song",
    description: "Full mix from raw stems through a final master, built to sit right next to any major release.",
    features: [
      "Full mix from raw vocal & instrumental stems",
      "Mastering included",
      "Vocal tuning available as an add-on",
      "2 rounds of revisions",
      "Delivered as WAV + MP3 + mix session on request",
    ],
    turnaround: "3–5 business days",
    highlighted: true,
  },
];

export const REVISION_POLICY =
  "Every package includes two rounds of revisions after your first draft. Additional revision rounds are available for a flat $25 fee per round. Rush delivery (24–48 hours) is available on request, based on current availability.";
