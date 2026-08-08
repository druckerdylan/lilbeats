import type { Metadata } from "next";

/**
 * Metadata-only segment layout — same reason as `portfolio/layout.tsx`. The
 * root layout's inherited `canonical: "/"` would otherwise make
 * `mixing-mastering/page.tsx`, which is owned by another branch right now,
 * declare itself a duplicate of the homepage.
 *
 * This value is inherited by the routes *below* this segment too, so
 * `/mixing-mastering/request` and its confirmation page each set their own
 * canonical rather than claiming to be this page.
 *
 * FOLD THIS IN once that branch lands: move `alternates` onto the page's own
 * `metadata` export and delete this file.
 */
export const metadata: Metadata = {
  alternates: { canonical: "/mixing-mastering" },
};

export default function MixingMasteringLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
