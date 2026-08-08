import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Kicker } from "@/components/shared/section-heading";
import { Reveal } from "@/components/shared/reveal";
import { MixingRequestForm } from "@/components/mixing/mixing-request-form";
import { SERVICE_TIERS } from "@/lib/services";
import { BRAND } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Book Mixing & Mastering",
  description:
    "Submit your project details to book mixing & mastering with Lil Beats — send stems, references, and deadlines in one form.",
  alternates: { canonical: "/mixing-mastering/request" },
};

const FEATURED = SERVICE_TIERS.find((tier) => tier.highlighted) ?? SERVICE_TIERS[0];

const SLATE = [
  { label: "Response", value: BRAND.responseTime },
  { label: "Turnaround", value: FEATURED.turnaround },
];

/*
  The form is a client island (it reads `?service=` off the URL), so the
  prerendered HTML ships this in its place. Without it the page renders a
  title card sitting above nothing at all until hydration.
*/
function FormSkeleton() {
  return (
    <div className="space-y-6" aria-hidden>
      <div className="h-7 w-40 bg-charcoal/60" />
      {[0, 1, 2].map((row) => (
        <div key={row} className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="h-12 border border-bone/10 bg-charcoal/40" />
          <div className="h-12 border border-bone/10 bg-charcoal/40" />
        </div>
      ))}
    </div>
  );
}

export default function MixingRequestPage() {
  return (
    <>
      {/* Title card — the same slate/display treatment as the service page,
          so the booking flow doesn't drop out of the film. */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute -top-56 left-1/2 h-[560px] w-[900px] -translate-x-1/2 spotlight opacity-60"
          aria-hidden
        />

        <div className="relative mx-auto max-w-[1600px] px-5 pt-20 pb-14 sm:px-8 lg:px-14 lg:pt-28">
          <Reveal variant="fade" duration={0.7}>
            <Kicker>Book Now</Kicker>
          </Reveal>

          <Reveal className="mt-8">
            <h1 className="max-w-5xl font-display text-d1 uppercase text-bone">
              Mixing &amp; Mastering{" "}
              <span className="text-gradient-ember">Request</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-relaxed text-smoke sm:text-lg">
              Tell us about your project. We&rsquo;ll follow up within 24&ndash;48 hours to
              confirm scope and scheduling.
            </p>

            <dl className="mt-12 flex flex-col gap-7 border-t border-bone/12 pt-7 sm:flex-row sm:gap-14">
              {SLATE.map((item) => (
                <div key={item.label}>
                  <dt className="u-meta text-smoke">{item.label}</dt>
                  <dd className="mt-2.5 font-display text-d3 uppercase text-bone">
                    {item.value}
                  </dd>
                </div>
              ))}
              <div>
                <dt className="u-meta text-smoke">Pricing</dt>
                <dd className="mt-2.5">
                  <Link
                    href="/mixing-mastering#pricing"
                    className="font-display text-d3 uppercase text-bone transition-colors duration-300 hover:text-ember"
                  >
                    See Packages
                  </Link>
                </dd>
              </div>
            </dl>
          </Reveal>
        </div>

        <div className="hairline" aria-hidden />
      </section>

      {/*
        The intake sheet sits on the same editorial grid as the title card —
        centring it inside the page instead left its first field 200px inboard
        of the headline above it, which read as two unrelated layouts stacked.
        The deep bottom padding keeps the submit button clear of the
        now-playing transport bar when a preview is docked.
      */}
      <div className="mx-auto max-w-[1600px] px-5 pt-16 pb-28 sm:px-8 lg:px-14 lg:pt-24 lg:pb-36">
        <div className="max-w-3xl">
          <Suspense fallback={<FormSkeleton />}>
            <MixingRequestForm />
          </Suspense>
        </div>
      </div>
    </>
  );
}
