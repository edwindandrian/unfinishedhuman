import { Suspense } from "react";
import type { Metadata } from "next";
import { getAll } from "@/lib/content";
import PageHeader from "@/components/PageHeader";
import EssayExplorer from "@/components/EssayExplorer";

export const metadata: Metadata = { title: "Essays", description: "Long-form writing on the self, relationships, the pursuit of a life, and the inner world." };

export default function EssaysPage() {
  const essays = getAll("essays").map(({ href, title, excerpt, category, date, minutes }) => ({ href, title, excerpt, category, date, minutes }));
  return (
    <>
      <PageHeader eyebrow="Long-form" title="Essays" intro="Slower thinking, written down. Each piece begins as a question I could not put down." />
      <Suspense fallback={null}><EssayExplorer essays={essays} /></Suspense>
    </>
  );
}
