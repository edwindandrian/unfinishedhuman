import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = { title: "About", description: "The author, the philosophy behind Unfinished Human, and a personal writing manifesto." };

const manifesto = [
  ["Write to find out.", "I do not write what I already know. I write to discover what I think."],
  ["Leave the seams visible.", "Doubt, revision, and contradiction are not defects. They are evidence of a mind at work."],
  ["Prefer the particular.", "One specific afternoon says more than a general claim about happiness."],
  ["Resist advice.", "I am in no position to tell you how to live. I can only tell you what I noticed."],
  ["Be slow, on purpose.", "Nothing here is timely. It should still be worth reading in ten years."],
  ["Stay unfinished.", "Any conclusion on this site is provisional, and I reserve the right to change my mind."],
];

export default function About() {
  return (
    <>
      <PageHeader eyebrow="About" title="The person behind the page" />
      <section className="container-wide">
        <div className="grid gap-12 md:grid-cols-12">
          <aside className="md:col-span-3"><p className="eyebrow">The author</p><p className="mt-3 font-serif text-2xl">{site.author}</p></aside>
          <div className="prose-journal md:col-span-7 md:mx-0">
            <p>I am a reader, a note-taker, and a chronic reviser of my own opinions. By training and temperament I am drawn to the questions that do not resolve: why people behave as they do, why relationships are both the hardest and the most worthwhile thing, why a single paragraph can change a week.</p>
            <p>Unfinished Human began as a private notebook. At some point it seemed more honest to think in the open, where the thinking can be corrected by anyone who happens to read it.</p>
            <h2>Why “unfinished”?</h2>
            <p>Because the alternative is a lie. Every person I have admired was still in the middle of something. Every idea I trust has needed amending. To call oneself finished is to stop paying attention.</p>
            <p>The name is not an apology. It is a position: that a human being is a process, not a product, and that this is good news.</p>
          </div>
        </div>
      </section>

      <section className="container-wide mt-28">
        <p className="eyebrow border-t border-ink pt-5">A writing manifesto</p>
        <ol className="mt-4">
          {manifesto.map(([h, b], i) => (
            <li key={h} className="grid gap-3 border-b border-rule py-8 md:grid-cols-12 md:gap-8">
              <span className="font-serif text-lg text-accent md:col-span-1">0{i + 1}</span>
              <h3 className="font-serif text-3xl font-light md:col-span-5">{h}</h3>
              <p className="leading-relaxed text-muted md:col-span-6">{b}</p>
            </li>
          ))}
        </ol>
        <p className="mt-14 text-center font-serif text-3xl font-light italic">{site.tagline}</p>
        <p className="mt-8 text-center"><Link href="/essays" className="eyebrow link-line text-ink">Begin with the essays →</Link></p>
      </section>
    </>
  );
}
