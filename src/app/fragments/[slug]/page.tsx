import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAll, getEntry, formatDate } from "@/lib/content";
import { categoryName } from "@/lib/categories";
import Mdx from "@/components/Mdx";

export const dynamicParams = false;
export const generateStaticParams = () => getAll("fragments").map((e) => ({ slug: e.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const e = getEntry("fragments", (await params).slug);
  return e ? { title: e.title, description: e.excerpt.replace(/\*/g, "") } : {};
}

export default async function FragmentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const all = getAll("fragments");
  const i = all.findIndex((f) => f.slug === slug);
  if (i < 0) notFound();
  const f = all[i];
  const newer = all[i - 1], older = all[i + 1];
  return (
    <div className="container-wide">
      <div className="mx-auto max-w-2xl pb-8 pt-16 md:pt-28">
        <Link href="/fragments" className="eyebrow link-line">← Fragments</Link>
        <p className="eyebrow mt-14">{f.category ? categoryName(f.category) : ""} · {formatDate(f.date)}</p>
        <h1 className="display rise mt-5 text-5xl italic md:text-7xl">{f.title}</h1>
        <div className="mt-12 font-serif text-[1.6rem] font-light leading-[1.55]"><Mdx source={f.body} dropcap={false} /></div>
        <nav className="mt-24 flex justify-between border-t border-rule pt-6 text-sm" aria-label="More fragments">
          {older ? <Link href={older.href} className="link-line">← {older.title}</Link> : <span />}
          {newer ? <Link href={newer.href} className="link-line">{newer.title} →</Link> : <span />}
        </nav>
      </div>
    </div>
  );
}
