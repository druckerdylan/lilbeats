import type { Metadata } from "next";
import Link from "next/link";
import { CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Kicker } from "@/components/shared/section-heading";
import { Reveal, SplitWords } from "@/components/shared/reveal";
import { BRAND } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Request Received",
  robots: { index: false, follow: false },
};

const SLATE = [
  { label: "Status", value: "Received" },
  { label: "Response", value: BRAND.responseTime },
];

export default function MixingRequestConfirmationPage() {
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
            <SplitWords text="Request" />
          </span>
          <span className="block">
            <SplitWords
              text="Received"
              delay={0.14}
              className="text-gradient-ember"
              wordClassName="text-gradient-ember"
            />
          </span>
        </h1>

        <Reveal variant="rise" delay={0.3} className="mt-9 max-w-xl">
          <p className="text-base leading-relaxed text-smoke sm:text-lg">
            Thanks for booking with Lil Beats. We&rsquo;ll review your project and follow up at
            the email you provided within {BRAND.responseTime.toLowerCase()} to confirm scope
            and scheduling.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button variant="cinema" size="cinema" render={<Link href="/beats" />}>
              Browse Beats
            </Button>
            <Button variant="cinemaGhost" size="cinema" render={<Link href="/" />}>
              Back To Home
            </Button>
          </div>
        </Reveal>

        <Reveal variant="fade" delay={0.45} className="mt-16">
          <dl className="flex flex-col gap-7 border-t border-bone/12 pt-7 sm:flex-row sm:gap-14">
            {SLATE.map((item) => (
              <div key={item.label}>
                <dt className="u-meta text-smoke">{item.label}</dt>
                <dd className="mt-2.5 font-display text-d3 uppercase text-bone">{item.value}</dd>
              </div>
            ))}
            <div className="min-w-0">
              <dt className="u-meta text-smoke">Questions</dt>
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
