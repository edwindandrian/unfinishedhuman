"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { SearchItem } from "@/lib/content";

export default function SearchOverlay({ items }: { items: SearchItem[] }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen((o) => !o); }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) { setTimeout(() => input.current?.focus(), 20); document.body.style.overflow = "hidden"; }
    else { document.body.style.overflow = ""; setQ(""); }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return items.slice(0, 6);
    return items.filter((i) => (i.title + " " + i.excerpt).toLowerCase().includes(t)).slice(0, 10);
  }, [q, items]);

  return (
    <>
      <button onClick={() => setOpen(true)} aria-label="Search" title="Search (Ctrl/⌘ K)" className="grid h-9 w-9 place-items-center text-muted transition-colors hover:text-ink">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>
      </button>
      {open && (
        <div className="fixed inset-0 z-[70] bg-paper/95 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Search the journal" onClick={() => setOpen(false)}>
          <div className="container-wide max-w-2xl pt-[14vh]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center border-b border-ink/30 pb-3">
              <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search essays, fragments, books…" className="w-full bg-transparent font-serif text-3xl font-light outline-none placeholder:text-muted/60" />
              <button onClick={() => setOpen(false)} className="eyebrow pl-4 hover:text-ink">Esc</button>
            </div>
            <ul className="mt-6 max-h-[60vh] overflow-y-auto">
              {results.length === 0 && <li className="py-6 font-serif text-xl italic text-muted">Nothing found. Perhaps it is still unwritten.</li>}
              {results.map((r) => (
                <li key={r.href}>
                  <Link href={r.href} onClick={() => setOpen(false)} className="group block border-b border-rule py-4">
                    <span className="eyebrow">{r.type}</span>
                    <span className="mt-1 block font-serif text-2xl group-hover:text-accent">{r.title}</span>
                    <span className="mt-1 line-clamp-1 text-sm text-muted">{r.excerpt}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
