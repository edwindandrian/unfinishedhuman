import type { MetadataRoute } from "next";
import { getAll } from "@/lib/content";
import { nav, site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", ...nav.map((n) => n.href)].map((p) => ({ url: site.url + p, changeFrequency: "weekly" as const }));
  const entries = (["essays", "fragments", "garden", "reading-room", "field-notes"] as const).flatMap((s) =>
    getAll(s).map((e) => ({ url: site.url + e.href, lastModified: e.date })));
  return [...pages, ...entries];
}
