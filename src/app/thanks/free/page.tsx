import type { Metadata } from "next";
import Link from "next/link";
import { CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Kicker } from "@/components/shared/section-heading";
import { Reveal, SplitWords } from "@/components/shared/reveal";
import { BRAND } from "@/lib/constants";
import { senderAddress } from "@/lib/resend";
import { STARTER_PACK_SIZE } from "@/lib/starter-pack";

export const metadata: Metadata = {
  title: "Check Your Inbox",
  // A thank-you page is a dead end for a searcher — it has no offer on it,
  // only a receipt for one. Keeping it out of the index also keeps it from
  // outranking /free for the terms /free is actually written to win.
  robots: { index: false, follow: false },
  // Self-canonical: without this the page inherits the root canonical ("/")
  // and declares itself a duplicate of the homepage — inert next to noindex,
  // but wrong, and the same pattern already fixed on the booking confirmation.
  alternates: { canonical: "/thanks/free" },
};

export default function FreeStarterPackThanksPage() {
  const sender = senderAddress();

  const SLATE: { label: string; value: string }[] = [
    { label: "Status", value: "Sent" },
    { label: "Contains", value: `${String(STARTER_PACK_SIZE).padStart(2, "0")} MP3s` },
  ];

  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute -top-56 left-1/2 h-[560px] w-[900px] -translate-x-1/2 spotlight opacity-70"
        aria-hidden
      />

      <div className="relative mx-auto max-w-[1600px] px-5 py-28 sm:px-8 lg:px-14 lg:py-40">
        <Reveal variant="fade" duration={0.7}>
          <Kicker>
            <CircleCheck className="size-4" aria-hidden />
            Confirmation
          </Kicker>
        </Reveal>

        {/*
          The end of the funnel gets the page-opening `d0` title card — it is
          the only heading here, and a `d1` under a spotlight read like a
          section that had lost its page.
        */}
        <h1 className="mt-8 font-display text-d0 uppercase text-bone">
          <span className="block">
            <SplitWords text="Check Your" />
          </span>
          <span className="block">
            <SplitWords
              text="Inbox"
              delay={0.14}
              className="text-gradient-ember"
              wordClassName="text-gradient-ember"
            />
          </span>
        </h1>

        <Reveal variant="rise" delay={0.3} className="mt-9 max-w-xl">
          <p className="text-base leading-relaxed text-smoke sm:text-lg">
            Your Artist Starter Pack is on its way. If it isn&rsquo;t there in a couple of
            minutes, check spam or the Promotions tab — free downloads land there more
            often than they should.
          </p>

          {/*
            The allowlist address, set as a terminal readout rather than
            buried in the paragraph above. It is the one piece of information
            on this page someone might need to act on.
          */}
          <div className="mt-8 border border-bone/12 bg-pitch/60 p-5">
            <p className="u-meta text-smoke">Sending From</p>
            <p className="mt-3 font-mono text-sm break-all text-bone">{sender}</p>
            <p className="mt-4 text-sm leading-relaxed text-smoke">
              Add it to your contacts and the links will come straight through next time.
            </p>
          </div>

          {/*
            The one job this page has left. Someone who just asked for free
            beats is as warm as they will ever be — the catalogue is the next
            step, and it gets the solid button.
          */}
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button variant="cinema" size="cinema" render={<Link href="/beats" />}>
              Browse The Catalog
            </Button>
            <Button variant="cinemaGhost" size="cinema" render={<Link href="/licensing" />}>
              Licensing Terms
            </Button>
          </div>
        </Reveal>

        <Reveal variant="fade" delay={0.45} className="mt-16">
          <dl className="flex flex-col gap-7 border-t border-bone/12 pt-7 sm:flex-row sm:gap-14">
            {SLATE.map((item) => (
              <div key={item.label}>
                <dt className="u-meta text-smoke">{item.label}</dt>
                <dd className="mt-2.5 font-display text-d3 uppercase text-bone">
                  {item.value}
                </dd>
              </div>
            ))}
            <div className="min-w-0">
              <dt className="u-meta text-smoke">Nothing Arrived?</dt>
              <dd className="mt-3.5">
                <a
                  href={`mailto:${BRAND.email}`}
                  className="font-mono text-sm break-all text-bone transition-colors duration-300 hover:text-ember"
                >
                  {BRAND.email}
                </a>
              </dd>
            </div>
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
