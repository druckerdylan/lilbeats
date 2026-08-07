import type { Metadata } from "next";

/**
 * Metadata-only segment layout. It exists for one reason: the root layout
 * sets `alternates: { canonical: "/" }`, which every page inherits unless it
 * overrides it, and `portfolio/page.tsx` is owned by another branch right
 * now — so without this the portfolio page would ship a canonical tag
 * declaring itself a duplicate of the homepage.
 *
 * Metadata merges down the route tree and the nearest definition of a key
 * wins, so this sets the right canonical without the page file changing.
 *
 * FOLD THIS IN once that branch lands: move `alternates` onto the page's own
 * `metadata` export and delete this file. A page's canonical belongs next to
 * the page.
 */
export const metadata: Metadata = {
  alternates: { canonical: "/portfolio" },
};

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
