"use client";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { categories } from "@/lib/categories";
import EntryRow from "./EntryRow";
import type { Entry } from "@/lib/content";

type Item = Pick<Entry, "href" | "title" | "excerpt" | "category" | "date" | "minutes">;

export default function EssayExplorer({ essays }: { essays: Item[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const active = params.get("category") ?? "all";
  const [q, setQ] = useState("");

  const setCategory = (slug: string) => {
    router.replace(slug === "all" ? pathname : `${pathname}?category=${slug}`, { scroll: false });
  };

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return essays.filter((e) => (active === "all" || e.category === active) && (!t || (e.title + " " + e.excerpt).toLowerCase().includes(t)));
  }, [essays, active, q]);

  const chip = (on: boolean) =>
    `whitespace-nowrap border-b pb-1 text-[0.78rem] uppercase tracking-[0.16em] transition-colors ${on ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink"}`;

  return (
    <section className="container-wide">
      <div className="flex flex-col gap-8 pb-8 md:flex-row md:items-end md:justify-between">
        <div role="tablist" aria-label="Filter by category" className="-mx-6 flex gap-6 overflow-x-auto px-6 md:mx-0 md:flex-wrap md:px-0">
          <button role="tab" aria-selected={active === "all"} onClick={() => setCategory("all")} className={chip(active === "all")}>All</button>
          {categories.map((c) => (
            <button key={c.slug} role="tab" aria-selected={active === c.slug} onClick={() => setCategory(c.slug)} className={chip(active === c.slug)}>{c.name}</button>
          ))}
        </div>
        <label className="relative block md:w-64">
          <span className="sr-only">Search essays</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search essays…" className="w-full border-b border-rule bg-transparent py-2 font-serif text-lg outline-none transition-colors placeholder:text-muted/60 focus:border-ink" />
        </label>
      </div>

      <p className="eyebrow pb-4" aria-live="polite">{list.length} {list.length === 1 ? "essay" : "essays"}</p>
      <div className="border-b border-rule">
        {list.map((e, i) => <EntryRow key={e.href} e={e} n={i + 1} />)}
        {list.length === 0 && (
          <p className="border-t border-rule py-16 font-serif text-2xl italic text-muted">
            Nothing here yet. <button className="link-line not-italic text-ink" onClick={() => { setQ(""); setCategory("all"); }}>Clear filters</button>
          </p>
        )}
      </div>
    </section>
  );
}
