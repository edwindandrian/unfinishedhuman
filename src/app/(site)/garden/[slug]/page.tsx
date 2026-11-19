import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAll, getEntry, formatDate } from "@/lib/content";
import { backlinks, entryId, linkify, localGraph, outLinks, statusOf } from "@/lib/garden";
import Mdx from "@/components/Mdx";
import ReadingProgress from "@/components/ReadingProgress";
import GraphView, { GraphLegend } from "@/components/GraphView";

export const dynamicParams = false;
export const generateStaticParams = () => getAll("garden").map((e) => ({ slug: e.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const e = getEntry("garden", (await params).slug);
  return e ? { title: e.title, description: e.excerpt } : {};
}

export default async function NotePage({ params }: { params: Promise<{ slug: string }> }) {
  const n = getEntry("garden", (await params).slug);
  if (!n) notFound();
  const st = statusOf(n.status);
  const back = backlinks(n);
  const out = outLinks(n);
  const graph = localGraph(entryId(n));

  return (
    <>
      <ReadingProgress />
      <header className="container-wide pb-12 pt-14 md:pt-24">
        <div className="mx-auto max-w-3xl">
          <Link href="/garden" className="eyebrow link-line">← Garden</Link>
          <h1 className="display rise mt-8 text-[2.8rem] md:text-[4.8rem]">{n.title}</h1>
          <p className="eyebrow rise rise-1 mt-6 flex flex-wrap gap-x-5 gap-y-1">
            <span className="text-ink" title={st.note}><span className="mr-1.5">{st.glyph}</span>{st.label}</span>
            <span>Planted {formatDate(n.date)}</span>
            {n.tags.map((t) => <Link key={t} href={`/garden?tag=${encodeURIComponent(t)}`} className="link-line">#{t}</Link>)}
          </p>
        </div>
      </header>

      <article data-progress className="container-wide"><Mdx source={linkify(n.body)} dropcap={false} /></article>

      <section className="container-wide mt-24">
        <div className="mx-auto grid max-w-3xl gap-10 border-t border-rule pt-8 md:grid-cols-2">
          <div>
            <h2 className="eyebrow mb-4">Linked from</h2>
            {back.length ? <ul className="space-y-2">{back.map((b) => <li key={b.slug}><Link href={b.href} className="link-line font-serif text-xl">{b.title}</Link></li>)}</ul> : <p className="text-sm text-muted">Nothing links here yet.</p>}
          </div>
          <div>
            <h2 className="eyebrow mb-4">Links to</h2>
            {out.length ? <ul className="space-y-2">{out.map((o) => <li key={o.href}><Link href={o.href} className="link-line font-serif text-xl">{o.title}</Link>{o.section === "essays" && <span className="eyebrow ml-2">essay</span>}</li>)}</ul> : <p className="text-sm text-muted">No outgoing links.</p>}
          </div>
        </div>
      </section>

      {graph.nodes.length > 1 && (
        <section className="container-wide mt-20">
          <div className="mx-auto max-w-3xl">
            <h2 className="eyebrow mb-4">Around this note</h2>
            <GraphView nodes={graph.nodes} edges={graph.edges} focusId={entryId(n)} compact />
            <GraphLegend />
            <p className="mt-6"><Link href="/garden/graph" className="eyebrow link-line text-ink">Open the full graph →</Link></p>
          </div>
        </section>
      )}
    </>
  );
}
