"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { nav, site } from "@/lib/site";
import ThemeToggle from "./ThemeToggle";
import SearchOverlay from "./SearchOverlay";
import type { SearchItem } from "@/lib/content";

export default function Header({ index }: { index: SearchItem[] }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => { window.removeEventListener("keydown", esc); document.body.style.overflow = ""; };
  }, [open]);

  const active = (href: string) => path === href || path.startsWith(href + "/");

  return (
    <header className={`sticky top-0 z-50 transition-colors duration-300 ${scrolled || open ? "bg-paper/90 backdrop-blur-md border-b border-rule" : "border-b border-transparent"}`}>
      <div className="container-wide flex h-16 items-center justify-between md:h-20">
        <Link href="/" className="font-serif text-[1.45rem] font-medium tracking-tight" onClick={() => setOpen(false)}>
          {site.name}
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} aria-current={active(n.href) ? "page" : undefined}
              className={`link-line pb-0.5 text-[0.8rem] uppercase tracking-[0.16em] ${active(n.href) ? "text-ink" : "text-muted hover:text-ink"}`}
              style={active(n.href) ? { backgroundSize: "100% 1px" } : undefined}>
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center">
          <SearchOverlay items={index} />
          <ThemeToggle />
          <button className="ml-1 grid h-9 w-9 place-items-center md:hidden" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((o) => !o)}>
            <span className="relative block h-3 w-5">
              <span className={`absolute left-0 top-0 h-px w-5 bg-ink transition-transform duration-300 ${open ? "translate-y-[6px] rotate-45" : ""}`} />
              <span className={`absolute left-0 bottom-0 h-px w-5 bg-ink transition-transform duration-300 ${open ? "-translate-y-[5px] -rotate-45" : ""}`} />
            </span>
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-menu" className="fixed inset-x-0 top-16 bottom-0 bg-paper md:hidden">
          <nav aria-label="Mobile" className="container-wide flex flex-col pt-8">
            {nav.map((n, i) => (
              <Link key={n.href} href={n.href} className="rise border-b border-rule py-5 font-serif text-4xl font-light" style={{ animationDelay: `${i * 50}ms` }}>
                <span className="eyebrow mr-4 align-middle">0{i + 1}</span>{n.label}
              </Link>
            ))}
            <p className="mt-10 font-serif text-lg italic text-muted">{site.tagline}</p>
          </nav>
        </div>
      )}
    </header>
  );
}
