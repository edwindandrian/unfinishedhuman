import type { Metadata } from "next";
import Link from "next/link";
import { getAll, formatDate } from "@/lib/content";
import { categoryName } from "@/lib/categories";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = { title: "Fragments", description: "Short thoughts, observations, and unfinished ideas." };

export default function FragmentsPage() {
  const items = getAll("fragments");
  return (
    <>
      <PageHeader eyebrow="Short thoughts" title="Fragments" intro="Observations too small for an essay and too stubborn to forget. Many of them are not finished. That is the point." />
      <section className="container-wide">
        <ul className="columns-1 gap-x-12 md:columns-2">
          {items.map((f) => (
            <li key={f.slug} className="mb-12 break-inside-avoid border-t border-rule pt-6">
              <Link href={f.href} className="group block">
                <p className="eyebrow">{f.category ? categoryName(f.category) : ""}</p>
                <p className="mt-4 font-serif text-[1.9rem] font-light italic leading-snug transition-colors group-hover:text-accent">{f.excerpt.replace(/\*/g, "")}</p>
                <p className="eyebrow mt-5">{formatDate(f.date)}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
