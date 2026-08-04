import type { Metadata } from "next";
import { Kicker } from "@/components/shared/section-heading";
import { Reveal, SplitWords } from "@/components/shared/reveal";
import { BRAND, SITE_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${SITE_NAME} collects, uses, and protects your information.`,
};

const LAST_UPDATED = "July 2026";

const LINK =
  "text-ember underline underline-offset-4 decoration-ember/40 transition-colors hover:decoration-ember";

const pad = (n: number) => String(n).padStart(2, "0");

type LegalClause = { id: string; title: string; body: React.ReactNode };

/**
 * The policy as data. The contents rail and the clause list are both
 * rendered from this one array, so the numbering, the anchor targets, and
 * the headings can never drift apart.
 */
const CLAUSES: LegalClause[] = [
  {
    id: "information-we-collect",
    title: "Information We Collect",
    body: (
      <p>
        When you browse {SITE_NAME}, we collect basic usage data through
        standard web analytics. When you purchase a beat license, submit
        a mixing &amp; mastering request, subscribe to our email list, or
        contact us, we collect the information you provide directly —
        typically your name, email address, phone number, and any
        project files or links you choose to share.
      </p>
    ),
  },
  {
    id: "payments",
    title: "How Payments Are Processed",
    body: (
      <p>
        All payments are processed securely through Stripe. {SITE_NAME}{" "}
        does not store your full credit card number, CVC, or banking
        details on our servers — that information is handled entirely by
        Stripe in accordance with their own privacy and security
        practices.
      </p>
    ),
  },
  {
    id: "how-we-use-information",
    title: "How We Use Your Information",
    body: (
      <ul className="list-disc space-y-2.5 pl-5 marker:text-ember/60">
        <li>To deliver purchased beat files and license agreements.</li>
        <li>To schedule and communicate about mixing &amp; mastering projects.</li>
        <li>To send order receipts, download links, and account-related email.</li>
        <li>To send catalog updates if you&rsquo;ve subscribed to our email list.</li>
        <li>To respond to support requests and general inquiries.</li>
      </ul>
    ),
  },
  {
    id: "cookies",
    title: "Cookies & Local Storage",
    body: (
      <p>
        {SITE_NAME} uses your browser&rsquo;s local storage to remember
        items in your cart and your favorited beats between visits. This
        data stays on your device and is not sold or shared with third
        parties.
      </p>
    ),
  },
  {
    id: "third-party-services",
    title: "Third-Party Services",
    body: (
      <p>
        We rely on trusted third-party providers to operate the site,
        including Stripe (payments), Supabase (database and file
        storage), and Resend (transactional email). Each provider
        processes your data only as needed to perform their respective
        service.
      </p>
    ),
  },
  {
    id: "your-rights",
    title: "Your Rights",
    body: (
      <p>
        You can request a copy of the personal information we hold about
        you, ask us to correct inaccurate information, or request
        deletion of your data (subject to legal and accounting
        requirements) by emailing{" "}
        <a href={`mailto:${BRAND.email}`} className={LINK}>
          {BRAND.email}
        </a>
        .
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to This Policy",
    body: (
      <p>
        We may update this policy from time to time. Material changes
        will be reflected by updating the date at the top of this page.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    body: (
      <p>
        Questions about this policy can be sent to{" "}
        <a href={`mailto:${BRAND.email}`} className={LINK}>
          {BRAND.email}
        </a>
        .
      </p>
    ),
  },
];

/** Fading rule — the only divider on the page. */
function Rule({ className }: { className?: string }) {
  return <div className={cn("hairline-dim", className)} aria-hidden />;
}

/**
 * Jump list, set as a credit block. It sticks beside the prose on desktop
 * and stacks above it on mobile, where a long legal document is otherwise
 * an undifferentiated scroll.
 */
function Contents({ items }: { items: LegalClause[] }) {
  return (
    <nav aria-label="On this page">
      <p className="u-meta text-bone/35">Contents</p>
      <ol className="mt-5">
        {items.map((item, i) => (
          <li key={item.id}>
            <Rule />
            <a
              href={`#${item.id}`}
              className="group flex items-baseline gap-4 py-3.5 transition-colors duration-300"
            >
              <span
                aria-hidden
                className="u-meta shrink-0 tabular-nums text-bone/30 transition-colors duration-300 group-hover:text-ember"
              >
                {pad(i + 1)}
              </span>
              <span className="font-mono text-xs leading-relaxed text-smoke transition-colors duration-300 group-hover:text-bone">
                {item.title}
              </span>
            </a>
          </li>
        ))}
      </ol>
      <Rule />
    </nav>
  );
}

/**
 * A legal clause set like a credit block: a hollow index number in the
 * gutter, the clause title in the display face, and the prose held to a
 * reading measure beside it.
 */
function Clause({
  id,
  index,
  title,
  children,
}: {
  id: string;
  index: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal variant="rise" duration={0.7}>
      <section
        id={id}
        className="grid scroll-mt-28 gap-x-10 gap-y-4 lg:grid-cols-[4rem_minmax(0,1fr)]"
      >
        <p aria-hidden className="u-meta tabular-nums text-bone/30 lg:pt-3">
          {pad(index)}
        </p>
        <div className="max-w-2xl">
          <h2 className="font-display text-d3 uppercase text-bone">{title}</h2>
          <div className="mt-5 space-y-4 text-base leading-relaxed text-bone/85">
            {children}
          </div>
        </div>
      </section>
    </Reveal>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <div className="relative">
      {/* Key light over the title card. It gets its own clipping frame so
         the page root can stay overflow-visible — an `overflow` on the root
         would make it a scroll container and kill the sticky rail below. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[400px] overflow-hidden"
      >
        <div className="spotlight absolute -top-56 left-1/2 h-[560px] w-[1000px] -translate-x-1/2 opacity-60" />
      </div>

      {/* ── Title card ──────────────────────────────────────────────── */}
      <header className="relative mx-auto max-w-[1600px] px-5 pt-24 sm:px-8 lg:px-14 lg:pt-32">
        <Kicker>Legal</Kicker>
        <h1 className="mt-7 font-display text-d0 uppercase text-bone">
          <SplitWords text="Privacy Policy" />
        </h1>
        {/*
          The only cyberpunk on this page, and deliberately colourless: a
          ticked scale under the title card and a document readout beside the
          date. Everything below it is legal prose and stays plain — no glow,
          no fringing, no decoding text.
        */}
        <div className="hud-ticks mt-10 opacity-70" aria-hidden />
        <div className="mt-5 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
          <p className="u-meta text-smoke">Last updated: {LAST_UPDATED}</p>
          <p className="u-meta text-smoke/70 tabular-nums">
            {pad(CLAUSES.length)} Clauses
          </p>
        </div>
      </header>

      {/* ── Contents rail + clauses ─────────────────────────────────── */}
      <div className="relative mx-auto max-w-[1600px] px-5 pb-28 sm:px-8 lg:px-14 lg:pb-40">
        <div className="grid gap-x-14 gap-y-14 pt-16 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:pt-24 xl:gap-x-24">
          <Reveal variant="fade" className="lg:sticky lg:top-28 lg:self-start">
            <Contents items={CLAUSES} />
          </Reveal>

          <div>
            {CLAUSES.map((clause, i) => (
              <div key={clause.id}>
                {i > 0 && <Rule className="my-12 lg:my-16" />}
                <Clause id={clause.id} index={i + 1} title={clause.title}>
                  {clause.body}
                </Clause>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
