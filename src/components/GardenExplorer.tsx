"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { formatDate } from "@/lib/format";

export interface GardenItem { href: string; title: string; excerpt: string; date: string; status: string; tags: string[]; links: number }
const STATUSES = [
  { value: "seedling", label: "Seedling", glyph: "○" },
  { value: "growing", label: "Growing", glyph: "◐" },
  { value: "evergreen", label: "Evergreen", glyph: "●" },
];

export default function GardenExplorer({ items }: { items: GardenItem[] }) {
  const params = useSearchParams(), router = useRouter(), pathname = usePathname();
  const tag = params.get("tag") ?? "";
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const tags = useMemo(() => [...new Set(items.flatMap((i) => i.tags))].sort(), [items]);

  const setTag = (t: string) => router.replace(t ? `${pathname}?tag=${encodeURIComponent(t)}` : pathname, { scroll: false });
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return items.filter((i) => (status === "all" || i.status === status) && (!tag || i.tags.includes(tag)) && (!t || (i.title + " " + i.excerpt).toLowerCase().includes(t)));
  }, [items, status, tag, q]);

  const chip = (on: boolean) => `whitespace-nowrap border-b pb-1 text-[0.78rem] uppercase tracking-[0.16em] transition-colors ${on ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink"}`;

  return (
    <section className="container-wide">
      <div className="flex flex-col gap-6 pb-6 md:flex-row md:items-end md:justify-between">
        <div className="-mx-6 flex gap-6 overflow-x-auto px-6 md:mx-0 md:px-0" role="tablist" aria-label="Filter by growth stage">
          <button role="tab" aria-selected={status === "all"} onClick={() => setStatus("all")} className={chip(status === "all")}>All</button>
          {STATUSES.map((s) => <button key={s.value} role="tab" aria-selected={status === s.value} onClick={() => setStatus(s.value)} className={chip(status === s.value)}><span className="mr-1.5">{s.glyph}</span>{s.label}</button>)}
        </div>
        <label className="block md:w-64"><span className="sr-only">Search the garden</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search notes…" className="w-full border-b border-rule bg-transparent py-2 font-serif text-lg outline-none transition-colors placeholder:text-muted/60 focus:border-ink" />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2 pb-8">
        <span className="eyebrow mr-2">Tags</span>
        {tags.map((t) => (
          <button key={t} onClick={() => setTag(tag === t ? "" : t)} aria-pressed={tag === t}
            className={`border px-3 py-1 text-xs transition-colors ${tag === t ? "border-ink bg-ink text-paper" : "border-rule text-muted hover:border-ink hover:text-ink"}`}>#{t}</button>
        ))}
      </div>

      <p className="eyebrow pb-4" aria-live="polite">{list.length} {list.length === 1 ? "note" : "notes"}</p>
      <ul className="grid gap-x-10 border-t border-rule md:grid-cols-2">
        {list.map((n) => {
          const s = STATUSES.find((x) => x.value === n.status) ?? STATUSES[0];
          return (
            <li key={n.href} className="border-b border-rule">
              <Link href={n.href} className="group block py-7">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-serif text-3xl font-normal leading-tight transition-colors group-hover:text-accent">{n.title}</h3>
                  <span className="eyebrow whitespace-nowrap" title={s.label}><span className="mr-1">{s.glyph}</span>{s.label}</span>
                </div>
                <p className="mt-3 line-clamp-2 text-[0.95rem] leading-relaxed text-muted">{n.excerpt}</p>
                <p className="eyebrow mt-4">{n.tags.map((t) => `#${t}`).join("  ")}{n.tags.length ? " · " : ""}{n.links} {n.links === 1 ? "link" : "links"} · {formatDate(n.date)}</p>
              </Link>
            </li>
          );
        })}
      </ul>
      {list.length === 0 && <p className="border-b border-rule py-14 font-serif text-2xl italic text-muted">Nothing growing here yet.</p>}
    </section>
  );
}
