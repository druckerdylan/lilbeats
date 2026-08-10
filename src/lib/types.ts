export type LicenseId = "mp3" | "wav" | "unlimited" | "exclusive";

export type MusicalKey =
  | "C" | "C#" | "D" | "D#" | "E" | "F" | "F#" | "G" | "G#" | "A" | "A#" | "B";

export type KeyMode = "Major" | "Minor";

export interface LicenseTier {
  id: LicenseId;
  name: string;
  formatLabel: string;
  description: string;
  features: string[];
  distributionLimit: string;
  streamLimit: string;
  musicVideos: string;
  radioBroadcast: string;
  performances: string;
  /**
   * Absolute USD price for this tier, identical across the catalogue.
   * Replaced the old `priceMultiplier` — pricing here is per-licence, not
   * a factor applied to a per-beat base.
   */
  price: number;
  /** Removes the beat from sale on purchase. Exclusive only. */
  exclusive?: boolean;
}

export interface Beat {
  id: string;
  slug: string;
  title: string;
  artworkUrl: string;
  previewAudioUrl: string;
  fullMp3Url: string;
  wavUrl: string;
  stemsUrl: string | null;
  bpm: number;
  key: MusicalKey;
  keyMode: KeyMode;
  genre: string;
  mood: string[];
  tags: string[];
  description: string;
  durationSeconds: number;
  basePrice: number;
  plays: number;
  favorites: number;
  featured: boolean;
  isNew: boolean;
  licenseAvailability: LicenseId[];
  createdAt: string;
}

/**
 * The projection of `Beat` that is allowed to cross into client components.
 *
 * Everything passed to a `"use client"` component is serialized into the
 * page's flight payload, readable by any visitor in view-source. The full
 * `Beat` carries the storage paths of the paid deliverables (master MP3, WAV,
 * stems) — those buckets are private so the paths alone don't grant access,
 * but they have no business shipping to every browser, and dropping them plus
 * the other never-read fields also trims each serialized beat.
 */
export type CardBeat = Omit<
  Beat,
  "fullMp3Url" | "wavUrl" | "stemsUrl" | "basePrice" | "favorites"
>;

/** Apply at every server→client boundary; the type alone strips nothing. */
export function toCardBeat(beat: Beat): CardBeat {
  const { fullMp3Url, wavUrl, stemsUrl, basePrice, favorites, ...card } = beat;
  void fullMp3Url, void wavUrl, void stemsUrl, void basePrice, void favorites;
  return card;
}

export interface Review {
  id: string;
  beatId: string;
  authorName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  createdAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  avatarUrl?: string;
}

export interface CartLineItem {
  id: string;
  beatId: string;
  beatSlug: string;
  beatTitle: string;
  artworkUrl: string;
  licenseId: LicenseId;
  licenseName: string;
  price: number;
}

export interface MixingRequestPayload {
  artistName: string;
  fullName: string;
  email: string;
  phone: string;
  songTitle: string;
  genre: string;
  serviceRequested:
    | "mixing"
    | "mastering"
    | "mixing-mastering"
    | "mixing-mastering-premium"
    | "vocal-tuning"
    | "other";
  numberOfSongs: number;
  referenceTracks: string;
  desiredSound: string;
  currentMixProblems: string;
  deadline: string;
  budget: string;
  fileLink: string;
  additionalNotes: string;
  confirmsOwnership: boolean;
}

export interface OrderItemRecord {
  beatId: string;
  beatTitle: string;
  licenseId: LicenseId;
  licenseName: string;
  price: number;
}

export interface FaqItem {
  question: string;
  answer: string;
}
