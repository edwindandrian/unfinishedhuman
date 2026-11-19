import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAll, getEntry } from "@/lib/content";
import ArticleHead from "@/components/ArticleHead";
import Mdx from "@/components/Mdx";
import ReadingProgress from "@/components/ReadingProgress";

export const dynamicParams = false;
export const generateStaticParams = () => getAll("field-notes").map((e) => ({ slug: e.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const e = getEntry("field-notes", (await params).slug);
  return e ? { title: e.title, description: e.excerpt } : {};
}

export default async function NotePage({ params }: { params: Promise<{ slug: string }> }) {
  const n = getEntry("field-notes", (await params).slug);
  if (!n) notFound();
  return (
    <>
      <ReadingProgress />
      <ArticleHead back="Field Notes" backHref="/field-notes" title={n.title} date={n.date} extra={n.place} minutes={n.minutes} />
      <article data-progress className="container-wide"><Mdx source={n.body} /></article>
    </>
  );
}
