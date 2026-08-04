"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Kicker } from "@/components/shared/section-heading";

/**
 * Catches anything a server or client component throws below the root
 * layout. Without it a production error renders Next's default screen, which
 * tells a customer nothing and looks like the site is broken.
 *
 * The real message is intentionally not shown — in production Next redacts
 * it anyway, and an error string is no use to a buyer. It goes to the server
 * log via the effect below.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app-error]", error);
  }, [error]);

  return (
    <section className="relative isolate flex min-h-[70vh] flex-col items-center justify-center overflow-hidden px-5 py-28 text-center sm:px-8">
      <div
        aria-hidden
        className="spotlight pointer-events-none absolute top-1/4 left-1/2 -z-10 size-[620px] max-w-full -translate-x-1/2 opacity-60"
      />

      <Kicker className="mb-8">System Fault</Kicker>

      <h1 className="font-display text-d1 uppercase text-bone">Something Broke</h1>

      <p className="mt-6 max-w-md text-base leading-relaxed text-smoke">
        That&rsquo;s on us, not you. Try again — and if it keeps happening, get in
        touch and we&rsquo;ll sort it out.
      </p>

      {error.digest && (
        <p className="u-meta mt-6 text-smoke/60">Reference {error.digest}</p>
      )}

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Button variant="cinema" size="cinema" onClick={reset}>
          Try Again
        </Button>
        <Button variant="cinemaGhost" size="cinema" render={<Link href="/contact" />}>
          Contact Support
        </Button>
      </div>
    </section>
  );
}
