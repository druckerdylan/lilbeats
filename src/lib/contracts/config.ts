import { LicenseId } from "@/lib/types";

/**
 * Everything the licence contracts need that the app cannot derive.
 *
 * ─── READ THIS BEFORE LAUNCH ────────────────────────────────────────────
 * These are the variable terms of a legally binding agreement. Any value
 * left `null` is one nobody has supplied yet, and the renderer REFUSES to
 * produce a contract while one is missing — deliberately. A licence that
 * ships with an invented streaming cap or an invented royalty rate is worse
 * than no licence at all, so nothing here is guessed or defaulted.
 *
 * Fill every `null`, then re-check `/contracts/preview` in the admin area.
 * ─────────────────────────────────────────────────────────────────────────
 */

/** The parties and jurisdiction, shared by all four contracts. */
export const PRODUCER_LEGAL = {
  /**
   * {PRODUCT_OWNER_FULLNAME} — the producer's full legal name, as it would
   * appear on a contract. NOT the brand name. Unknown to this codebase.
   */
  legalName: null as string | null,

  /** {PRODUCER_ALIAS} — the professional name the beats are released under. */
  alias: "Lil Beats",

  /**
   * {STATE_PROVINCE_COUNTRY} — the governing law and exclusive venue for
   * disputes. Substituted into "the laws of the ___" and "courts located in
   * the ___", so it should read naturally in both (e.g. "District of
   * Columbia"). This is a legal choice, not a mailing address — left unset
   * on purpose even though the studio is in Washington, D.C.
   */
  governingLaw: null as string | null,
};

/**
 * The per-tier numbers that appear inside the contract body.
 *
 * `unlimited` and `exclusive` are filled: the producer specified those terms
 * directly ("Distribute up to UNLIMITED copies", "UNLIMITED Online Audio
 * Streams", "UNLIMITED Music Video", "For Profit Live Performances", "Radio
 * Broadcasting rights (UNLIMITED Stations)").
 *
 * `mp3` and `wav` are NOT filled. Their caps live in the producer's BeatStars
 * dashboard and have never been stated here. The numbers currently shown on
 * the marketing pages were placeholders written before those terms existed
 * and must not be treated as authoritative.
 */
export interface TierContractTerms {
  /** {TERM_YEARS} — licence length. The standard tiers hardcode ten (10). */
  termYears: string | null;
  /** {PERFORMANCES_FOR_PROFIT} — reads "Licensee ___ perform the song publicly". */
  performancesForProfit: string | null;
  /** {PERFORMANCES_NOT_FOR_PROFIT} — reads "and for an ___ non-profit performances". */
  performancesNotForProfit: string | null;
  /** {NUMBER_OF_RADIO_STATIONS} */
  radioStations: string | null;
  /** Music-video allowance, spelled out then in digits: "two (2)". */
  musicVideosWord: string | null;
  musicVideos: string | null;
  /** {DISTRIBUTE_COPIES} */
  distributeCopies: string | null;
  /** {AUDIO_STREAMS} */
  audioStreams: string | null;
  /** {MONETIZED_VIDEO_STREAMS_ALLOWED} */
  monetizedVideoStreams: string | null;
  /** {NON_MONETIZED_VIDEO_STREAMS_ALLOWED} */
  nonMonetizedVideoStreams: string | null;
  /** {FREE_DOWNLOADS} */
  freeDownloads: string | null;
  /** {PUBLISHING_RIGHTS} / {PUBLISHING_SHARES} — the split clause. */
  publishingShares: string | null;
  /** {SAMPLES_DEFINITION} — standard tiers only. */
  samplesDefinition?: string | null;
  /** {ROYALTY_AMOUNT} — exclusive only: producer's share of Net Receipts. */
  royaltyAmount?: string | null;
}

const UNLIMITED_TERMS: TierContractTerms = {
  termYears: "ten (10)",
  performancesForProfit: "may",
  performancesNotForProfit: "unlimited",
  radioStations: "unlimited",
  musicVideosWord: "unlimited",
  musicVideos: "unlimited",
  distributeCopies: "unlimited",
  audioStreams: "unlimited",
  monetizedVideoStreams: "unlimited",
  nonMonetizedVideoStreams: "unlimited",
  freeDownloads: "unlimited",
  publishingShares:
    "Producer shall own, control, and administer Fifty Percent (50%) of the so-called “Publisher’s Share” of the underlying composition.",
};

const EXCLUSIVE_TERMS: TierContractTerms = {
  // The exclusive agreement transfers the master in perpetuity, so the
  // template carries no term, performance, stream or video tokens at all.
  termYears: null,
  performancesForProfit: null,
  performancesNotForProfit: null,
  radioStations: null,
  musicVideosWord: null,
  musicVideos: null,
  distributeCopies: null,
  audioStreams: null,
  monetizedVideoStreams: null,
  nonMonetizedVideoStreams: null,
  freeDownloads: null,
  publishingShares:
    "Producer shall own, control, and administer Fifty Percent (50%) of the so-called “Publisher’s Share” of the New Composition(s).",
  /**
   * Producer's percentage of the Purchaser's Net Receipts, payable quarterly
   * under the Fee/Royalty clause. Never stated — and unlike a display price
   * this one is an ongoing obligation, so it must be decided explicitly.
   */
  royaltyAmount: null,
};

/** Placeholder shape for the two tiers whose caps are still unknown. */
const UNSET_STANDARD_TERMS: TierContractTerms = {
  termYears: "ten (10)",
  performancesForProfit: null,
  performancesNotForProfit: null,
  radioStations: null,
  musicVideosWord: null,
  musicVideos: null,
  distributeCopies: null,
  audioStreams: null,
  monetizedVideoStreams: null,
  nonMonetizedVideoStreams: null,
  freeDownloads: null,
  publishingShares:
    "Producer shall own, control, and administer Fifty Percent (50%) of the so-called “Publisher’s Share” of the underlying composition.",
  samplesDefinition: null,
};

export const TIER_CONTRACT_TERMS: Record<LicenseId, TierContractTerms> = {
  mp3: { ...UNSET_STANDARD_TERMS },
  wav: { ...UNSET_STANDARD_TERMS },
  unlimited: UNLIMITED_TERMS,
  exclusive: EXCLUSIVE_TERMS,
};

/** Which contract body a tier is issued under. */
export const TIER_CONTRACT_KIND: Record<LicenseId, "standard" | "unlimited" | "exclusive"> = {
  mp3: "standard",
  wav: "standard",
  unlimited: "unlimited",
  exclusive: "exclusive",
};
