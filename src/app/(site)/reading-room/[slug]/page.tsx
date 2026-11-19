import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAll, getEntry } from "@/lib/content";
import ArticleHead from "@/components/ArticleHead";
import Mdx from "@/components/Mdx";
import ReadingProgress from "@/components/ReadingProgress";
import Related from "@/components/Related";

export const dynamicParams = false;
export const generateStaticParams = () => getAll("reading-room").map((e) => ({ slug: e.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const e = getEntry("reading-room", (await params).slug);
  return e ? { title: `${e.title} — ${e.author}`, description: e.excerpt } : {};
}

export default async function BookPage({ params }: { params: Promise<{ slug: string }> }) {
  const b = getEntry("reading-room", (await params).slug);
  if (!b) notFound();
  const essays = getAll("essays");
  const related = b.related.map((s) => essays.find((e) => e.slug === s)).filter(Boolean) as typeof essays;
  return (
    <>
      <ReadingProgress />
      <ArticleHead back="Reading Room" backHref="/reading-room" title={b.title} date={b.date} extra={`by ${b.author} · ${b.year}`} />
      <article data-progress className="container-wide">
        <p className="mx-auto -mt-4 mb-12 max-w-prose text-center font-serif text-2xl font-light italic leading-snug text-muted">{b.excerpt}</p>
        <Mdx source={b.body} dropcap={false} />
      </article>
      <Related items={related} title="Related essays" />
    </>
  );
}
