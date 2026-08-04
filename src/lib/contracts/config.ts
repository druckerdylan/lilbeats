import { LicenseId } from "@/lib/types";

/**
 * The canonical rights granted by each licence tier.
 *
 * This is the SINGLE SOURCE OF TRUTH. Both the customer-facing licence table
 * and the binding contract are generated from it, so the page a buyer reads
 * before paying and the agreement they receive after paying cannot drift
 * apart — which they previously had, because the marketing copy shipped with
 * placeholder caps that were never real terms.
 *
 * ─── VALUES LEFT `null` ARE UNKNOWN, NOT ZERO ───────────────────────────
 * A `null` is a term nobody has stated. The contract renderer refuses to
 * produce an agreement while one is outstanding rather than emitting a raw
 * `{TOKEN}` or inventing a number into a legal document.
 * ─────────────────────────────────────────────────────────────────────────
 */

export interface TierRights {
  /** {DISTRIBUTE_COPIES} — downloads / physical units. */
  distributeCopies: string;
  /** {AUDIO_STREAMS} — monetized audio streams. */
  audioStreams: string;
  /** Music-video allowance, spelled out and in digits: "one" / "1". */
  musicVideosWord: string;
  musicVideos: string;
  /** {NUMBER_OF_RADIO_STATIONS} */
  radioStations: string;
  /** Reads: "Licensee ___ perform the song publicly for-profit performances". */
  performancesForProfit: string;
  /** Reads: "and for an ___ non-profit performances". */
  performancesNotForProfit: string;
  /** {PUBLISHING_SHARES} / {PUBLISHING_RIGHTS} */
  publishingShares: string;
  /** {TERM_YEARS} — licence length. */
  termYears: string | null;

  // ── Not yet specified ──────────────────────────────────────────────────
  /** {MONETIZED_VIDEO_STREAMS_ALLOWED} */
  monetizedVideoStreams: string | null;
  /** {NON_MONETIZED_VIDEO_STREAMS_ALLOWED} */
  nonMonetizedVideoStreams: string | null;
  /** {FREE_DOWNLOADS} */
  freeDownloads: string | null;
  /** {SAMPLES_DEFINITION} — standard tiers only. */
  samplesDefinition?: string | null;
  /** {ROYALTY_AMOUNT} — exclusive only: producer's share of Net Receipts. */
  royaltyAmount?: string | null;
}

/**
 * 50/50 on every tier, as specified. Worded to match each contract body:
 * the standard and unlimited agreements speak of "the underlying
 * composition", the exclusive one of "the New Composition(s)".
 */
const PUBLISHING_50_50 =
  "The underlying composition shall be owned fifty percent (50%) by Producer and fifty percent (50%) by Licensee. Producer shall own, control, and administer Fifty Percent (50%) of the so-called “Publisher’s Share” of the underlying composition.";

const PUBLISHING_50_50_EXCLUSIVE =
  "The New Composition(s) shall be owned fifty percent (50%) by Producer and fifty percent (50%) by Purchaser. Producer shall own, control, and administer Fifty Percent (50%) of the so-called “Publisher’s Share” of the New Composition(s).";

/**
 * Both standard tiers permit for-profit performances and, being silent on
 * non-profit, do not restrict them. "unlimited" is therefore the reading
 * that matches the stated for-profit grant — it is derived from the terms
 * given, not independently invented.
 */
const PERFORMANCE_GRANT = {
  performancesForProfit: "may",
  performancesNotForProfit: "unlimited",
} as const;

export const TIER_RIGHTS: Record<LicenseId, TierRights> = {
  mp3: {
    distributeCopies: "100,000",
    audioStreams: "500,000",
    musicVideosWord: "one",
    musicVideos: "1",
    radioStations: "two (2)",
    ...PERFORMANCE_GRANT,
    publishingShares: PUBLISHING_50_50,
    termYears: "ten (10)",
    monetizedVideoStreams: null,
    nonMonetizedVideoStreams: null,
    freeDownloads: null,
    samplesDefinition: null,
  },
  wav: {
    distributeCopies: "500,000",
    audioStreams: "500,000",
    musicVideosWord: "one",
    musicVideos: "1",
    radioStations: "two (2)",
    ...PERFORMANCE_GRANT,
    publishingShares: PUBLISHING_50_50,
    termYears: "ten (10)",
    monetizedVideoStreams: null,
    nonMonetizedVideoStreams: null,
    freeDownloads: null,
    samplesDefinition: null,
  },
  unlimited: {
    distributeCopies: "unlimited",
    audioStreams: "unlimited",
    musicVideosWord: "unlimited",
    musicVideos: "unlimited",
    radioStations: "unlimited",
    ...PERFORMANCE_GRANT,
    publishingShares: PUBLISHING_50_50,
    termYears: null,
    monetizedVideoStreams: "unlimited",
    nonMonetizedVideoStreams: "unlimited",
    freeDownloads: "unlimited",
  },
  exclusive: {
    // The exclusive agreement assigns the master outright and in perpetuity,
    // so its body carries no cap, term or performance tokens at all. These
    // values exist only to drive the customer-facing rights table.
    distributeCopies: "unlimited",
    audioStreams: "unlimited",
    musicVideosWord: "unlimited",
    musicVideos: "unlimited",
    radioStations: "unlimited",
    ...PERFORMANCE_GRANT,
    publishingShares: PUBLISHING_50_50_EXCLUSIVE,
    termYears: null,
    monetizedVideoStreams: "unlimited",
    nonMonetizedVideoStreams: "unlimited",
    freeDownloads: "unlimited",
    royaltyAmount: null,
  },
};

/** The parties and jurisdiction, shared by all four contracts. */
export const PRODUCER_LEGAL = {
  /**
   * {PRODUCT_OWNER_FULLNAME} — the producer's full legal name as it would
   * appear on a contract, NOT the brand name. Unknown to this codebase.
   */
  legalName: null as string | null,

  /** {PRODUCER_ALIAS} — the professional name the beats are released under. */
  alias: "Lil Beats",

  /**
   * {STATE_PROVINCE_COUNTRY} — governing law and exclusive venue. Substituted
   * into both "the laws of the ___" and "courts located in the ___", so it
   * must read naturally in both (e.g. "District of Columbia"). Left unset
   * because choosing a jurisdiction is a legal decision, not an address —
   * the studio being in Washington, D.C. does not settle it.
   */
  governingLaw: null as string | null,
};

/** Which contract body a tier is issued under. */
export const TIER_CONTRACT_KIND: Record<LicenseId, "standard" | "unlimited" | "exclusive"> = {
  mp3: "standard",
  wav: "standard",
  unlimited: "unlimited",
  exclusive: "exclusive",
};

/** Human-readable rights rows, derived so the table can never contradict the contract. */
function copiesLabel(v: string) {
  return v === "unlimited" ? "Unlimited copies" : `Distribute up to ${v} copies`;
}
function streamsLabel(v: string) {
  return v === "unlimited" ? "Unlimited online audio streams" : `${v} online audio streams`;
}
function videosLabel(v: string) {
  return v === "unlimited" ? "Unlimited music videos" : `${v} music video${v === "1" ? "" : "s"}`;
}
function radioLabel(v: string) {
  if (v === "unlimited") return "Radio broadcasting rights (unlimited stations)";
  // The contract token is worded for prose ("played on two (2) stations"), so
  // the digits are pulled out for the table rather than printing "(two (2))".
  const digits = v.match(/\((\d+)\)/)?.[1] ?? v;
  return `Radio broadcasting rights (${digits} stations)`;
}

export function rightsRowsFor(licenseId: LicenseId) {
  const r = TIER_RIGHTS[licenseId];
  return {
    distributionLimit: copiesLabel(r.distributeCopies),
    streamLimit: streamsLabel(r.audioStreams),
    musicVideos: videosLabel(r.musicVideos),
    radioBroadcast: radioLabel(r.radioStations),
    performances: "For-profit live performances",
  };
}
