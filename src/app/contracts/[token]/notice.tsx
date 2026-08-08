import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Kicker } from "@/components/shared/section-heading";

/**
 * Shared dead-end shell for the contract route, so a failure still looks like
 * the site. Lives in its own file because both page.tsx and not-found.tsx
 * render it — a missing token 404s through the segment's not-found boundary
 * rather than soft-404ing with a 200, which search engines would index.
 */
export function Notice({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <section className="relative isolate flex min-h-[70vh] flex-col items-center justify-center overflow-hidden px-5 py-28 text-center sm:px-8">
      <div
        aria-hidden
        className="spotlight pointer-events-none absolute top-1/4 left-1/2 -z-10 size-[620px] max-w-full -translate-x-1/2 opacity-60"
      />
      <Kicker className="mb-8">{eyebrow}</Kicker>
      <h1 className="font-display text-d2 uppercase text-bone">{title}</h1>
      <p className="mt-6 max-w-md text-base leading-relaxed text-smoke">{body}</p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Button variant="cinemaGhost" size="cinema" render={<Link href="/contact" />}>
          Contact Support
        </Button>
      </div>
    </section>
  );
}
