import "server-only";
import { Resend } from "resend";
import { BRAND, SITE_NAME } from "@/lib/constants";

let resendClient: Resend | null = null;

function getResend(): Resend {
  if (!process.env.RESEND_API_KEY) {
    throw new Error(
      "RESEND_API_KEY is not set. Add it to your environment before sending email."
    );
  }
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

/*
  The From address must be on a domain verified with Resend — a free-mail
  address like the one in BRAND.email is rejected outright. So mail is SENT as
  orders@lilbeatsofficial.com and REPLIES are steered to BRAND.email below.
*/
const FROM_ADDRESS =
  process.env.RESEND_FROM_EMAIL ?? `${SITE_NAME} <orders@lilbeatsofficial.com>`;

/**
 * The bare address transactional email is sent from, pulled out of
 * `RESEND_FROM_EMAIL`'s `Name <addr>` form (which is what Resend wants, but
 * not what a reader can allowlist).
 *
 * Rendered on /thanks/free so someone waiting on the starter pack can add it
 * to their contacts before the mail arrives. Derived from the same constant
 * the send path uses, so the page can never quote an address the emails
 * don't actually come from.
 */
export function senderAddress(): string {
  return FROM_ADDRESS.match(/<([^>]+)>/)?.[1] ?? FROM_ADDRESS;
}

export async function sendEmail(params: {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn(
      `[resend] RESEND_API_KEY not configured — skipping email "${params.subject}" to ${params.to}`
    );
    return { skipped: true };
  }

  const resend = getResend();
  return resend.emails.send({
    from: FROM_ADDRESS,
    to: params.to,
    subject: params.subject,
    html: params.html,
    replyTo: params.replyTo ?? BRAND.email,
  });
}
