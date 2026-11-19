import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getAll } from "@/lib/content";
import { getGraph } from "@/lib/garden";
import PageHeader from "@/components/PageHeader";
import GardenExplorer from "@/components/GardenExplorer";

export const metadata: Metadata = { title: "Garden", description: "A digital garden of small, connected notes: seedlings, works in progress, and ideas that have settled." };

export default function GardenPage() {
  const { nodes } = getGraph();
  const degree = new Map(nodes.map((n) => [n.href, n.degree]));
  const items = getAll("garden").map((n) => ({ href: n.href, title: n.title, excerpt: n.excerpt, date: n.date, status: n.status ?? "seedling", tags: n.tags, links: degree.get(n.href) ?? 0 }));
  return (
    <>
      <PageHeader eyebrow="Digital garden" title="Garden" intro="Notes that are not essays: small, linked, and allowed to be rough. They grow over time, or they don't." />
      <div className="container-wide -mt-6 pb-10">
        <Link href="/garden/graph" className="inline-block border border-ink px-6 py-3 text-[0.78rem] uppercase tracking-[0.18em] transition-colors hover:bg-ink hover:text-paper">View the graph →</Link>
      </div>
      <Suspense fallback={null}><GardenExplorer items={items} /></Suspense>
    </>
  );
}
