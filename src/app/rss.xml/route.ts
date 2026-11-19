import { getAll } from "@/lib/content";
import { site } from "@/lib/site";

export const dynamic = "force-static";
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function GET() {
  const items = [...getAll("essays"), ...getAll("fragments"), ...getAll("garden"), ...getAll("field-notes"), ...getAll("reading-room")]
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>
<title>${esc(site.name)}</title><link>${site.url}</link>
<description>${esc(site.description)}</description><language>en</language>
<atom:link href="${site.url}/rss.xml" rel="self" type="application/rss+xml"/>
${items.map((e) => `<item><title>${esc(e.title)}</title><link>${site.url}${e.href}</link><guid>${site.url}${e.href}</guid><pubDate>${new Date(e.date).toUTCString()}</pubDate><description>${esc(e.excerpt.replace(/\*/g, ""))}</description></item>`).join("\n")}
</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
