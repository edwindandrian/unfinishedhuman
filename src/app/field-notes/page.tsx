import type { Metadata } from "next";
import Link from "next/link";
import { getAll, formatDate } from "@/lib/content";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = { title: "Field Notes", description: "Personal experiences, travel reflections, and everyday observations." };

export default function FieldNotes() {
  const notes = getAll("field-notes");
  return (
    <>
      <PageHeader eyebrow="From the world" title="Field Notes" intro="Written on trains, in kitchens, and in the margins of ordinary days. Observation first; meaning, if it comes, later." />
      <section className="container-wide border-b border-rule">
        {notes.map((n) => (
          <Link key={n.slug} href={n.href} className="group grid gap-4 border-t border-rule py-10 md:grid-cols-12 md:gap-8">
            <div className="eyebrow md:col-span-3"><p className="text-ink">{n.place}</p><p className="mt-1">{formatDate(n.date)}</p></div>
            <div className="md:col-span-8">
              <h2 className="font-serif text-4xl font-light transition-colors group-hover:text-accent md:text-5xl">{n.title}</h2>
              <p className="mt-4 max-w-xl leading-relaxed text-muted">{n.excerpt}</p>
            </div>
          </Link>
        ))}
      </section>
    </>
  );
}
