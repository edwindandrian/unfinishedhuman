import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAll, getEntry, relatedEssays } from "@/lib/content";
import { categoryName } from "@/lib/categories";
import ArticleHead from "@/components/ArticleHead";
import Mdx from "@/components/Mdx";
import ReadingProgress from "@/components/ReadingProgress";
import Related from "@/components/Related";
import { site } from "@/lib/site";

export const dynamicParams = false;
export const generateStaticParams = () => getAll("essays").map((e) => ({ slug: e.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const e = getEntry("essays", (await params).slug);
  if (!e) return {};
  return { title: e.title, description: e.excerpt, openGraph: { title: e.title, description: e.excerpt, type: "article", publishedTime: e.date } };
}

export default async function EssayPage({ params }: { params: Promise<{ slug: string }> }) {
  const e = getEntry("essays", (await params).slug);
  if (!e) notFound();
  const ld = { "@context": "https://schema.org", "@type": "Article", headline: e.title, datePublished: e.date, description: e.excerpt, author: { "@type": "Person", name: site.author }, articleSection: categoryName(e.category ?? ""), mainEntityOfPage: `${site.url}${e.href}` };
  return (
    <>
      <ReadingProgress />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <ArticleHead back="Essays" backHref="/essays" title={e.title} date={e.date} category={e.category} minutes={e.minutes} />
      <article data-progress className="container-wide"><Mdx source={e.body} /></article>
      <Related items={relatedEssays(e)} />
    </>
  );
}
