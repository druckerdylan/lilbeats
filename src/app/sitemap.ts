import type { MetadataRoute } from "next";
import { getAllBeats } from "@/lib/beats-repo";
import { SITE_URL } from "@/lib/constants";

/*
  Without this the sitemap is generated once at build and then frozen, so a
  beat that is unpublished — or retired automatically by an exclusive sale —
  keeps a live sitemap entry pointing at a 404 until the next deploy. Matching
  the catalogue's own window keeps the two in step.
*/
export const revalidate = 60;

// `/thanks/free` is deliberately absent — it carries `robots: noindex` and
// is only reachable after a form submission.
const STATIC_ROUTES = [
  "",
  "/beats",
  "/free",
  "/mixing-mastering",
  "/mixing-mastering/request",
  "/contact",
  "/privacy",
  "/terms",
  "/licensing",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const beats = await getAllBeats();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  const beatEntries: MetadataRoute.Sitemap = beats.map((beat) => ({
    url: `${SITE_URL}/beats/${beat.slug}`,
    lastModified: new Date(beat.createdAt),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticEntries, ...beatEntries];
}
