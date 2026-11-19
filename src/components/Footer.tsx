import Link from "next/link";
import { nav, site } from "@/lib/site";
import { categories } from "@/lib/categories";

export default function Footer() {
  return (
    <footer className="mt-32 border-t border-rule">
      <div className="container-wide grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="font-serif text-3xl font-light italic leading-tight">{site.tagline}</p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">{site.description}</p>
        </div>
        <div className="md:col-span-3 md:col-start-7">
          <p className="eyebrow mb-4">Journal</p>
          <ul className="space-y-2 text-sm">
            {nav.map((n) => (<li key={n.href}><Link href={n.href} className="link-line">{n.label}</Link></li>))}
          </ul>
        </div>
        <div className="md:col-span-3">
          <p className="eyebrow mb-4">Themes</p>
          <ul className="space-y-2 text-sm">
            {categories.map((c) => (<li key={c.slug}><Link href={`/essays?category=${c.slug}`} className="link-line">{c.name}</Link></li>))}
            <li className="pt-2"><a href="/rss.xml" className="link-line text-muted">RSS feed</a></li>
          </ul>
        </div>
      </div>
      <div className="container-wide flex flex-col gap-2 border-t border-rule py-6 text-xs text-muted md:flex-row md:justify-between">
        <span>© {new Date().getFullYear()} {site.name}. Written slowly.</span>
        <span>Set in Cormorant Garamond &amp; Inter.</span>
      </div>
    </footer>
  );
}
