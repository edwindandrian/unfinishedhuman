import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";

export type Section = "essays" | "fragments" | "reading-room" | "field-notes";

export interface Entry {
  section: Section;
  slug: string;
  href: string;
  title: string;
  date: string;
  excerpt: string;
  category?: string;
  featured: boolean;
  minutes: number;
  body: string;
  // reading room
  author?: string;
  rating?: number;
  year?: number;
  related: string[];
  // field notes
  place?: string;
}

const ROOT = path.join(process.cwd(), "content");

function load(section: Section): Entry[] {
  const dir = path.join(ROOT, section);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(dir, file), "utf8");
      const { data, content } = matter(raw);
      const date = data.date instanceof Date ? data.date.toISOString().slice(0, 10) : String(data.date);
      return {
        section,
        slug,
        href: `/${section}/${slug}`,
        title: String(data.title),
        date,
        excerpt: String(data.excerpt ?? ""),
        category: data.category,
        featured: Boolean(data.featured),
        minutes: Math.max(1, Math.round(readingTime(content).minutes)),
        body: content,
        author: data.author,
        rating: data.rating,
        year: data.year,
        related: (data.related as string[] | undefined) ?? [],
        place: data.place,
      } satisfies Entry;
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export const getAll = (s: Section) => load(s);
export const getEntry = (s: Section, slug: string) => load(s).find((e) => e.slug === slug);

/** Essays related by shared category first, then recency. */
export function relatedEssays(entry: Entry, limit = 3): Entry[] {
  const all = load("essays").filter((e) => e.slug !== entry.slug);
  const explicit = entry.related
    .map((s) => all.find((e) => e.slug === s))
    .filter(Boolean) as Entry[];
  const rest = all
    .filter((e) => !explicit.includes(e))
    .sort((a, b) => Number(b.category === entry.category) - Number(a.category === entry.category));
  return [...explicit, ...rest].slice(0, limit);
}

export interface SearchItem {
  title: string;
  href: string;
  type: string;
  excerpt: string;
  category?: string;
}

const typeLabel: Record<Section, string> = {
  essays: "Essay",
  fragments: "Fragment",
  "reading-room": "Book",
  "field-notes": "Field note",
};

export function searchIndex(): SearchItem[] {
  return (["essays", "fragments", "reading-room", "field-notes"] as Section[]).flatMap((s) =>
    load(s).map((e) => ({
      title: e.title,
      href: e.href,
      type: typeLabel[s],
      excerpt: e.excerpt || e.body.slice(0, 160),
      category: e.category,
    })),
  );
}

export { formatDate } from "./format";
