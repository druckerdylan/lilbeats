import { LicenseId } from "@/lib/types";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { getLicenseTier } from "@/lib/licensing";
import { formatPrice } from "@/lib/format";
import { PRODUCER_LEGAL, TIER_RIGHTS, TIER_CONTRACT_KIND } from "@/lib/contracts/config";
import {
  STANDARD_NON_EXCLUSIVE,
  UNLIMITED_NON_EXCLUSIVE,
  EXCLUSIVE_SALE,
} from "@/lib/contracts/templates";

/**
 * Fills a licence agreement for one purchased line item.
 *
 * The contract is generated at read time from the order, rather than stored
 * as a blob, so a buyer always sees the same terms the store was operating
 * under. It is NOT rendered on a best-effort basis: if any term is missing,
 * rendering fails and returns the list of what's absent. Emitting a legal
 * document containing a raw `{ROYALTY_AMOUNT}`, or silently dropping a
 * clause, would be worse than showing nothing.
 */

const BODIES = {
  standard: STANDARD_NON_EXCLUSIVE,
  unlimited: UNLIMITED_NON_EXCLUSIVE,
  exclusive: EXCLUSIVE_SALE,
} as const;

const ONES = [
  "Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
];
const TENS = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
];

/**
 * Whole dollars in words, for the exclusive agreement's "{PRODUCT_PRICE_WORD}
 * Dollars ($140.00)" construction. Only needs to cover licence fees, so it
 * handles 0–999 and falls back to digits above that rather than guessing.
 */
export function amountInWords(value: number): string {
  const n = Math.round(value);
  if (n < 0 || n > 999) return String(n);
  if (n < 20) return ONES[n];
  if (n < 100) {
    const t = TENS[Math.floor(n / 10)];
    const r = n % 10;
    return r ? `${t}-${ONES[r]}` : t;
  }
  const h = `${ONES[Math.floor(n / 100)]} Hundred`;
  const r = n % 100;
  return r ? `${h} ${amountInWords(r)}` : h;
}

export interface ContractSubject {
  licenseId: LicenseId;
  beatTitle: string;
  /** Price actually charged, in dollars. */
  price: number;
  customerName: string | null;
  customerAddress: string | null;
  /** Order date. Rendered long-form, e.g. "4 August 2026". */
  date: Date;
}

export type ContractResult =
  | { ok: true; title: string; body: string }
  | { ok: false; missing: string[] };

function formatContractDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function renderContract(subject: ContractSubject): ContractResult {
  const tier = getLicenseTier(subject.licenseId);
  const rights = TIER_RIGHTS[subject.licenseId];
  const kind = TIER_CONTRACT_KIND[subject.licenseId];
  if (!tier || !rights || !kind) return { ok: false, missing: ["licence tier"] };

  const price = formatPrice(subject.price);

  /*
    Every token any of the three bodies can contain. Unused keys are simply
    never matched; the two spellings of the non-monetized-streams token are
    both supplied because the standard and unlimited originals differ.
  */
  const values: Record<string, string | null> = {
    SITE_NAME,
    SITE_URL,
    LICENSE_NAME: tier.name,
    /*
      The bare tier, for the "Non-Exclusive ___ License Agreement" heading.
      Tier names already end in "License" ("MP3 License", "Unlimited
      License"), so interpolating the full name there produced "MP3 License
      License Agreement" on the face of every non-exclusive contract issued.
      The so-called-"{LICENSE_NAME}"-basis clause still wants the full name.
    */
    LICENSE_LABEL: tier.name.replace(/\s+License$/i, ""),
    FILE_TYPE: tier.formatLabel,
    PRODUCT_TITLE: subject.beatTitle,
    PRODUCT_PRICE: price,
    PRODUCT_PRICE_WORD: amountInWords(subject.price),
    CONTRACT_DATE: formatContractDate(subject.date),

    PRODUCT_OWNER_FULLNAME: PRODUCER_LEGAL.legalName,
    PRODUCER_ALIAS: PRODUCER_LEGAL.alias,
    STATE_PROVINCE_COUNTRY: PRODUCER_LEGAL.governingLaw,

    CUSTOMER_FULLNAME: subject.customerName,
    CUSTOMER_ADDRESS: subject.customerAddress,

    TERM_CLAUSE: rights.termClause,
    PERFORMANCES_FOR_PROFIT: rights.performancesForProfit,
    PERFORMANCES_NOT_FOR_PROFIT: rights.performancesNotForProfit,
    NUMBER_OF_RADIO_STATIONS: rights.radioStations,
    MONETIZED_MUSIC_VIDEOS_WORD: rights.musicVideosWord,
    MONETIZED_MUSIC_VIDEOS: rights.musicVideos,
    NON_MONETIZED_MUSIC_VIDEOS_WORD: rights.musicVideosWord,
    NON_MONETIZED_MUSIC_VIDEOS: rights.musicVideos,
    DISTRIBUTE_COPIES: rights.distributeCopies,
    AUDIO_STREAMS: rights.audioStreams,
    MONETIZED_VIDEO_STREAMS_ALLOWED: rights.monetizedVideoStreams,
    NONMONETIZED_VIDEO_STREAMS_ALLOWED: rights.nonMonetizedVideoStreams,
    NON_MONETIZED_VIDEO_STREAMS_ALLOWED: rights.nonMonetizedVideoStreams,
    FREE_DOWNLOADS: rights.freeDownloads,
    PUBLISHING_RIGHTS: rights.publishingShares,
    PUBLISHING_SHARES: rights.publishingShares,
    SAMPLES_DEFINITION: rights.samplesDefinition ?? null,
  };

  const template = BODIES[kind];

  // Only tokens this body actually uses can block it — the exclusive
  // agreement has no caps, so an unset stream limit must not stop it.
  const used = new Set(Array.from(template.matchAll(/\{([A-Z0-9_]+)\}/g), (m) => m[1]));

  const missing = [...used].filter((token) => {
    const v = values[token];
    return v === null || v === undefined || v.trim() === "";
  });
  if (missing.length > 0) return { ok: false, missing: missing.sort() };

  let body = template.replace(/\{([A-Z0-9_]+)\}/g, (whole, token: string) => {
    const v = values[token];
    return v ?? whole;
  });

  // Belt and braces: a token the map never knew about would survive the
  // replace above and ship a literal "{FOO}" into a signed agreement.
  const leftover = [...new Set(Array.from(body.matchAll(/\{([A-Z0-9_]+)\}/g), (m) => m[1]))];
  if (leftover.length > 0) return { ok: false, missing: leftover.sort() };

  body = body.trim();

  const title =
    kind === "exclusive"
      ? `Exclusive Track Sale Agreement — ${subject.beatTitle}`
      : // Tier names already end in "License" ("MP3 License", "Unlimited
        // License"), so appending the word again titled every non-exclusive
        // agreement "… License License Agreement".
        `Non-Exclusive ${tier.name.replace(/\s+License$/i, "")} License Agreement — ${subject.beatTitle}`;

  return { ok: true, title, body };
}

/**
 * Whether every tier can currently produce a contract. Used by the admin
 * readiness check so the outstanding terms are visible before launch rather
 * than at the moment a customer asks for their agreement.
 */
export function contractReadiness(): { licenseId: LicenseId; missing: string[] }[] {
  const sample: Omit<ContractSubject, "licenseId"> = {
    beatTitle: "Sample Beat",
    price: 0,
    customerName: "Sample Customer",
    customerAddress: "Sample Address",
    date: new Date(0),
  };

  return (Object.keys(TIER_CONTRACT_KIND) as LicenseId[]).map((licenseId) => {
    const result = renderContract({ ...sample, licenseId });
    return { licenseId, missing: result.ok ? [] : result.missing };
  });
}
