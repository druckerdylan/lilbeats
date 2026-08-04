import type { MetadataRoute } from "next";
import { getAllBeats } from "@/lib/beats-repo";
import { SITE_URL } from "@/lib/constants";

const STATIC_ROUTES = [
  "",
  "/beats",
  "/mixing-mastering",
  "/mixing-mastering/request",
  "/portfolio",
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
