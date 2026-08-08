import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Kicker } from "@/components/shared/section-heading";

/** Without this the 404 inherits the homepage title — wrong in tabs and SERPs. */
export const metadata: Metadata = {
  title: "Page Not Found",
};

/**
 * Without this, Next serves its built-in 404 — an unstyled white page, which
 * on a site this dark reads as a crash rather than a missing track. Reached
 * by `notFound()` on an unknown beat slug, which is exactly what an exclusive
 * sale produces once the beat is retired and its old link is shared around.
 */
export default function NotFound() {
  return (
    <section className="relative isolate flex min-h-[70vh] flex-col items-center justify-center overflow-hidden px-5 py-28 text-center sm:px-8">
      <div
        aria-hidden
        className="spotlight pointer-events-none absolute top-1/4 left-1/2 -z-10 size-[620px] max-w-full -translate-x-1/2 opacity-60"
      />

      <Kicker className="mb-8">Signal Lost</Kicker>

      <p aria-hidden className="font-display text-d0 leading-none text-outline">
        404
      </p>

      <h1 className="mt-6 font-display text-d2 uppercase text-bone">Track Not Found</h1>

      <p className="mt-6 max-w-md text-base leading-relaxed text-smoke">
        This page isn&rsquo;t here. If you followed a link to a beat, it may have
        sold exclusively and been retired from the catalogue.
      </p>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Button variant="cinema" size="cinema" render={<Link href="/beats" />}>
          Browse Beats
        </Button>
        <Button variant="cinemaGhost" size="cinema" render={<Link href="/" />}>
          Back Home
        </Button>
      </div>
    </section>
  );
}
