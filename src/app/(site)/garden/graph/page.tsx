import type { Metadata } from "next";
import Link from "next/link";
import { getGraph } from "@/lib/garden";
import PageHeader from "@/components/PageHeader";
import GraphView, { GraphLegend } from "@/components/GraphView";

export const metadata: Metadata = { title: "Garden graph", description: "A map of how the notes in the garden connect." };

export default function GraphPage() {
  const { nodes, edges } = getGraph();
  return (
    <>
      <PageHeader eyebrow="Digital garden" title="The graph" intro="Every line is a [[link]] from one note to another. Hover to follow a thread, click to open, drag to pan, scroll to zoom." />
      <section className="container-wide">
        <GraphView nodes={nodes} edges={edges} />
        <GraphLegend />
        <p className="mt-8"><Link href="/garden" className="eyebrow link-line text-ink">← Back to the garden</Link></p>
      </section>
    </>
  );
}
