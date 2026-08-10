import { BRAND, SITE_NAME, SITE_URL } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import { getLicenseTier } from "@/lib/licensing";
import { OrderItemRecord, MixingRequestPayload } from "@/lib/types";

/**
 * Escapes user input before it is interpolated into an email body.
 *
 * These templates build HTML by string concatenation, and several of them are
 * reachable by anyone: the mixing-request confirmation is sent to whatever
 * address the submitter typed, from a DKIM-signed address on this domain. Left
 * raw, a song title containing markup turns that route into a phishing relay —
 * an attacker composes the body, and it arrives authenticated as us.
 *
 * `esc` is for element content and quoted attribute values. `escSubject`
 * additionally strips CR/LF (which could otherwise inject mail headers) and
 * caps length.
 */
function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escSubject(value: unknown): string {
  return String(value ?? "")
    .replace(/[\r\n]+/g, " ")
    .trim()
    .slice(0, 150);
}

function shell(preheader: string, bodyHtml: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#07070a;font-family:Helvetica,Arial,sans-serif;">
    <span style="display:none;font-size:1px;color:#07070a;">${preheader}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#07070a;padding:32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#121214;border:1px solid rgba(243,239,231,0.08);border-radius:6px;overflow:hidden;">
            <tr>
              <td style="padding:28px 32px;border-bottom:1px solid rgba(243,239,231,0.08);">
                <span style="font-size:22px;letter-spacing:1px;color:#f3efe7;font-weight:700;">Lil<span style="color:#b3122b;">Beats</span></span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;color:#f3efe7;font-size:15px;line-height:1.6;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;border-top:1px solid rgba(243,239,231,0.08);color:#98979c;font-size:12px;">
                ${SITE_NAME} &middot; ${BRAND.location} &middot; <a href="mailto:${BRAND.email}" style="color:#98979c;">${BRAND.email}</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function orderReceiptEmail(params: {
  orderId: string;
  customerName?: string | null;
  items: (OrderItemRecord & { downloadHref?: string | null; contractHref?: string | null })[];
  amountTotal: number;
  downloadUrl: string;
}): { subject: string; html: string } {
  /*
    Files are linked, never attached. A stems archive is 150-200 MB and a WAV
    around 30 MB, well past the ~25 MB most mail providers accept — an
    attached receipt would bounce rather than deliver.
  */
  const rows = params.items
    .map(
      (item) => {
        /*
          Naming the contents matters: tiers above MP3 deliver a ZIP, and a
          buyer who expected a loose file needs to know the WAV and stems are
          inside it rather than missing.
        */
        const contents = getLicenseTier(item.licenseId)?.formatLabel;
        return `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid rgba(243,239,231,0.08);">
          <div style="font-weight:600;">${esc(item.beatTitle)}</div>
          <div style="color:#98979c;font-size:13px;padding-top:2px;">${esc(item.licenseName)}${
            contents ? ` &middot; ${contents}` : ""
          }</div>
          <div style="padding-top:8px;font-size:13px;">
            ${item.downloadHref ? `<a href="${item.downloadHref}" style="color:#ff2d47;text-decoration:none;font-weight:600;">Download files</a>` : ""}
            ${item.downloadHref && item.contractHref ? `<span style="color:#4a4a52;padding:0 8px;">&middot;</span>` : ""}
            ${item.contractHref ? `<a href="${item.contractHref}" style="color:#98979c;text-decoration:none;">Licence agreement</a>` : ""}
          </div>
        </td>
        <td align="right" valign="top" style="padding:12px 0;border-bottom:1px solid rgba(243,239,231,0.08);">${formatPrice(item.price)}</td>
      </tr>`;
      }
    )
    .join("");

  const body = `
    <p style="margin:0 0 16px;">Hey${params.customerName ? ` ${esc(params.customerName)}` : ""},</p>
    <p style="margin:0 0 24px;">Your order is confirmed and your files are ready. Order reference: <strong>${esc(params.orderId)}</strong></p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
      ${rows}
      <tr>
        <td style="padding:14px 0 0;"><strong>Total</strong></td>
        <td align="right" style="padding:14px 0 0;"><strong>${formatPrice(params.amountTotal)}</strong></td>
      </tr>
    </table>
    <div style="margin:28px 0;">
      <a href="${params.downloadUrl}" style="display:inline-block;background:#b3122b;color:#f3efe7;padding:12px 22px;border-radius:4px;text-decoration:none;font-weight:600;">Go to your downloads</a>
    </div>
    <p style="margin:0 0 8px;color:#98979c;font-size:13px;">Download links stay live for 30 days and allow 10 downloads per file — save your files locally once you have them.</p>
    <p style="margin:0;color:#98979c;font-size:13px;">Your licence agreement stays available permanently at the link beside each track. Questions? Just reply to this email.</p>
  `;

  return {
    subject: `Your ${SITE_NAME} order is ready — download your files`,
    html: shell("Your beat files are ready to download.", body),
  };
}

export function mixingRequestCustomerEmail(payload: MixingRequestPayload): {
  subject: string;
  html: string;
} {
  const body = `
    <p style="margin:0 0 16px;">Hey ${esc(payload.fullName.split(" ")[0])},</p>
    <p style="margin:0 0 16px;">Thanks for booking mixing & mastering with ${SITE_NAME}. Here's a copy of what you submitted for <strong>${esc(payload.songTitle)}</strong>:</p>
    <ul style="padding-left:18px;margin:0 0 20px;color:#c9c7c2;font-size:14px;line-height:1.8;">
      <li>Service: ${esc(payload.serviceRequested.replace(/-/g, " "))}</li>
      <li>Genre: ${esc(payload.genre)}</li>
      <li>Songs: ${esc(payload.numberOfSongs)}</li>
      <li>Deadline: ${esc(payload.deadline || "Flexible")}</li>
      <li>Budget: ${esc(payload.budget || "Not specified")}</li>
    </ul>
    <p style="margin:0 0 16px;">We'll review your files and reach out within ${BRAND.responseTime.toLowerCase()} to confirm scope and scheduling.</p>
    <p style="margin:0;color:#98979c;font-size:13px;">Reply to this email any time if you need to add reference tracks or notes.</p>
  `;

  return {
    subject: escSubject(`We received your mixing & mastering request — ${payload.songTitle}`),
    html: shell("We received your mixing & mastering request.", body),
  };
}

export function mixingRequestAdminEmail(payload: MixingRequestPayload): {
  subject: string;
  html: string;
} {
  const rows = Object.entries(payload)
    .map(
      ([key, value]) => `
      <tr>
        <td style="padding:6px 12px 6px 0;color:#98979c;vertical-align:top;white-space:nowrap;">${esc(key)}</td>
        <td style="padding:6px 0;">${esc(value)}</td>
      </tr>`
    )
    .join("");

  const body = `
    <p style="margin:0 0 16px;">New mixing & mastering request from <strong>${esc(payload.artistName)}</strong>.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:13px;">${rows}</table>
  `;

  return {
    subject: escSubject(`New mixing request: ${payload.songTitle} (${payload.artistName})`),
    html: shell("New mixing & mastering request.", body),
  };
}

export function contactAdminEmail(payload: {
  name: string;
  email: string;
  subject?: string;
  message: string;
}): { subject: string; html: string } {
  const body = `
    <p style="margin:0 0 16px;">New contact form submission.</p>
    <p style="margin:0 0 4px;"><strong>${esc(payload.name)}</strong> &lt;${esc(payload.email)}&gt;</p>
    <p style="margin:0 0 16px;color:#98979c;">${esc(payload.subject ?? "General inquiry")}</p>
    <p style="margin:0;white-space:pre-wrap;">${esc(payload.message)}</p>
  `;

  return {
    subject: escSubject(`New contact message: ${payload.subject ?? "General inquiry"}`),
    html: shell("New contact form submission.", body),
  };
}

/**
 * The Artist Starter Pack delivery email — the only thing /free promises.
 *
 * `beats` may legitimately arrive empty: `getStarterPackBeats` fails closed
 * rather than throwing, because someone who has just handed over their email
 * address must still receive a reply. In that case the email says so plainly
 * and asks them to reply, instead of shipping an empty list.
 */
export function starterPackEmail(params: {
  beats: Array<{ title: string; url: string }>;
}): { subject: string; html: string } {
  const rows = params.beats
    .map(
      (beat, i) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid rgba(243,239,231,0.08);">
          <span style="color:#4a4a52;font-size:13px;padding-right:10px;">${String(i + 1).padStart(2, "0")}</span>
          <span style="font-weight:600;">${beat.title}</span>
        </td>
        <td align="right" valign="middle" style="padding:12px 0;border-bottom:1px solid rgba(243,239,231,0.08);">
          <a href="${beat.url}" style="color:#ff2d47;text-decoration:none;font-weight:600;font-size:13px;">Download MP3</a>
        </td>
      </tr>`
    )
    .join("");

  const list = params.beats.length
    ? `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
      ${rows}
    </table>
    <p style="margin:20px 0 0;color:#98979c;font-size:13px;">Right-click &rarr; Save As if a link opens in your browser instead of downloading.</p>
  `
    : `
    <p style="margin:0 0 16px;">We hit a snag pulling your download links together — nothing you did. Reply to this email and we'll send the five tracks straight over.</p>
  `;

  const body = `
    <p style="margin:0 0 16px;">Here's your Artist Starter Pack.</p>
    <p style="margin:0 0 24px;">${params.beats.length ? "Five beats, full-length 320kbps MP3s. Load them in, write to them, see what sticks." : "Five beats, full-length 320kbps MP3s."}</p>
    ${list}
    <!--
      Deliberately says "demo MP3s", not "tagged demo MP3s": these files come
      from the public previews bucket, and scripts/refresh-previews.mjs states
      in its own header that these masters do not carry a producer tag. Add
      "tagged" back here the moment the previews genuinely do.
    -->
    <p style="margin:28px 0 0;color:#98979c;font-size:13px;">These are free demo MP3s for trying ideas out — releasing, distributing, or monetising a track built on one needs a paid licence, which you can read in full at <a href="${SITE_URL}/licensing" style="color:#98979c;">${SITE_URL}/licensing</a>.</p>
    <div style="margin:24px 0 0;">
      <a href="${SITE_URL}/beats" style="display:inline-block;background:#b3122b;color:#f3efe7;padding:12px 22px;border-radius:4px;text-decoration:none;font-weight:600;">Browse the full catalog</a>
    </div>
  `;

  return {
    subject: `Your Artist Starter Pack from ${SITE_NAME}`,
    html: shell("Five free beats — download links inside.", body),
  };
}

export function newsletterWelcomeEmail(): { subject: string; html: string } {
  const body = `
    <p style="margin:0 0 16px;">You're on the list.</p>
    <p style="margin:0 0 16px;">You'll be the first to hear about new beat drops, catalog updates, and occasional discounts on mixing & mastering. No spam — just the music.</p>
    <div style="margin:24px 0;">
      <a href="${SITE_URL}/beats" style="display:inline-block;background:#b3122b;color:#f3efe7;padding:12px 22px;border-radius:4px;text-decoration:none;font-weight:600;">Browse the catalog</a>
    </div>
  `;

  return {
    subject: `Welcome to ${SITE_NAME}`,
    html: shell(`Welcome to ${SITE_NAME}.`, body),
  };
}
