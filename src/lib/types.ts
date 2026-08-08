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

export interface PortfolioItem {
  id: string;
  title: string;
  artist: string;
  role: string;
  coverUrl: string;
  description: string;
  platform: "spotify" | "apple-music" | "youtube" | "soundcloud";
  platformUrl: string;
  previewAudioUrl: string;
  embedUrl?: string;
  year: number;
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
  serviceRequested: "mixing" | "mastering" | "mixing-mastering" | "vocal-tuning" | "other";
  numberOfSongs: number;
  referenceTracks: string;
  desiredSound: string;
  currentMixProblems: string;
  deadline: string;
  budget: string;
  needsVocalTuning: boolean;
  needsStemCleanup: boolean;
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
