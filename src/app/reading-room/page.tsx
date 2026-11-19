import type { Metadata } from "next";
import Link from "next/link";
import { getAll } from "@/lib/content";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = { title: "Reading Room", description: "Books worth keeping: personal reviews, reading notes, and favorite passages." };

const stars = (n = 0) => "●".repeat(n) + "○".repeat(5 - n);

export default function ReadingRoom() {
  const books = getAll("reading-room");
  return (
    <>
      <PageHeader eyebrow="The library" title="Reading Room" intro="Not a list of everything I have read, only the books that stayed. Reviews, notes, and the sentences I copied by hand." />
      <section className="container-wide">
        <ul className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {books.map((b) => (
            <li key={b.slug}>
              <Link href={b.href} className="group block">
                <div className="flex aspect-[2/3] flex-col justify-between border border-ink/70 p-6 transition-all duration-300 group-hover:-translate-y-1 group-hover:bg-ink group-hover:text-paper">
                  <span className="eyebrow !text-current opacity-60">{b.year}</span>
                  <span>
                    <span className="block font-serif text-3xl leading-tight">{b.title}</span>
                    <span className="mt-3 block text-[0.72rem] uppercase tracking-[0.16em] opacity-70">{b.author}</span>
                  </span>
                </div>
                <p className="mt-4 text-xs tracking-[0.3em] text-accent" aria-label={`${b.rating} out of 5`}>{stars(b.rating)}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{b.excerpt}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
