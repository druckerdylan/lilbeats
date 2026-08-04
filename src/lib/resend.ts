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

const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL ?? `${SITE_NAME} <orders@lilbeats.com>`;

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
