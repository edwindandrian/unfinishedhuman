import Link from "next/link";
import { getAll, formatDate } from "@/lib/content";
import { categories, categoryName } from "@/lib/categories";
import { site } from "@/lib/site";
import EntryRow from "@/components/EntryRow";

export default function Home() {
  const essays = getAll("essays");
  const featured = essays.filter((e) => e.featured).slice(0, 3);
  const latest = essays.slice(0, 4);
  const fragments = getAll("fragments").slice(0, 4);
  const garden = getAll("garden").slice(0, 4);
  const books = getAll("reading-room").slice(0, 3);
  const note = getAll("field-notes")[0];

  return (
    <>
      {/* Hero */}
      <section className="container-wide pb-24 pt-20 md:pb-36 md:pt-32">
        <p className="eyebrow rise">A personal journal · Est. 2026</p>
        <h1 className="display rise rise-1 mt-8 max-w-5xl text-[3.6rem] sm:text-[5.5rem] md:text-[8.5rem]">
          A human being,<br /><em className="font-light italic text-accent">never quite</em> finished.
        </h1>
        <div className="rise rise-2 mt-14 grid gap-10 md:grid-cols-12">
          <p className="max-w-md font-serif text-2xl font-light leading-snug md:col-span-5 md:col-start-1">{site.description}</p>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4 md:col-span-6 md:col-start-7 md:justify-end">
            <Link href="/essays" className="border border-ink px-7 py-3 text-[0.78rem] uppercase tracking-[0.18em] transition-colors hover:bg-ink hover:text-paper">Read the essays</Link>
            <Link href="/about" className="link-line text-[0.78rem] uppercase tracking-[0.18em]">About this journal →</Link>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="border-t border-rule">
        <div className="container-wide grid gap-10 py-20 md:grid-cols-12 md:py-28">
          <p className="eyebrow md:col-span-3">Introduction</p>
          <div className="md:col-span-7">
            <p className="font-serif text-3xl font-light leading-[1.3] md:text-[2.6rem]">
              Unfinished Human is an ongoing attempt to understand oneself, other people, and the strange, ordinary business of being alive, through essays, fragments, books, and notes from the road.
            </p>
            <p className="mt-8 max-w-xl leading-relaxed text-muted">
              It is not a place for advice or answers. It is a place for thinking in public, slowly, with the drafts left visible. Everything here is, by design, a work still in progress.
            </p>
          </div>
        </div>
      </section>

      {/* Featured essays */}
      <section className="container-wide pb-8">
        <div className="flex items-baseline justify-between border-t border-ink pt-5">
          <h2 className="eyebrow text-ink">Featured essays</h2>
          <Link href="/essays" className="eyebrow link-line">All essays →</Link>
        </div>
        <div className="mt-10 grid gap-x-12 gap-y-14 md:grid-cols-12">
          {featured.map((e, i) => (
            <Link key={e.slug} href={e.href} className={`group block ${i === 0 ? "md:col-span-7" : "md:col-span-5"} ${i === 2 ? "md:col-start-6" : ""}`}>
              <p className="eyebrow">{categoryName(e.category!)} · {e.minutes} min</p>
              <h3 className={`mt-4 font-serif font-light leading-[1.05] transition-colors group-hover:text-accent ${i === 0 ? "text-5xl md:text-7xl" : "text-4xl md:text-5xl"}`}>{e.title}</h3>
              <p className="mt-5 max-w-lg leading-relaxed text-muted">{e.excerpt}</p>
              <p className="eyebrow mt-5 text-ink"><span className="link-line">Read essay →</span></p>
            </Link>
          ))}
        </div>
      </section>

      {/* Themes */}
      <section className="container-wide mt-28">
        <h2 className="eyebrow mb-6">Five rooms to wander</h2>
        <ul className="grid border-y border-rule md:grid-cols-5">
          {categories.map((c, i) => (
            <li key={c.slug} className={`${i > 0 ? "md:border-l" : ""} border-rule`}>
              <Link href={`/essays?category=${c.slug}`} className="group block p-6 transition-colors hover:bg-ink/[0.03] md:h-full">
                <span className="font-serif text-sm text-accent">0{i + 1}</span>
                <span className="mt-3 block font-serif text-2xl leading-tight">{c.name}</span>
                <span className="mt-3 block text-[0.82rem] leading-relaxed text-muted">{c.blurb}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Latest */}
      <section className="container-wide mt-28">
        <div className="flex items-baseline justify-between pb-5">
          <h2 className="eyebrow text-ink">Latest writings</h2>
          <Link href="/essays" className="eyebrow link-line">Archive →</Link>
        </div>
        <div className="border-b border-rule">{latest.map((e, i) => <EntryRow key={e.slug} e={e} n={i + 1} />)}</div>
      </section>

      {/* Garden */}
      <section className="container-wide mt-28">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <h2 className="eyebrow text-ink">The Garden</h2>
            <p className="mt-6 font-serif text-3xl font-light leading-snug">Small notes, linked to one another. Some are seedlings; some have been growing for years.</p>
            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
              <Link href="/garden" className="eyebrow link-line text-ink">Visit the garden →</Link>
              <Link href="/garden/graph" className="eyebrow link-line text-ink">See the graph →</Link>
            </div>
          </div>
          <ul className="border-t border-rule md:col-span-8">
            {garden.map((n) => (
              <li key={n.slug} className="border-b border-rule">
                <Link href={n.href} className="group flex items-baseline justify-between gap-6 py-5">
                  <span className="font-serif text-2xl transition-colors group-hover:text-accent">{n.title}</span>
                  <span className="eyebrow whitespace-nowrap">{n.status === "evergreen" ? "● Evergreen" : n.status === "growing" ? "◐ Growing" : "○ Seedling"}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Fragments */}
      <section className="mt-28 bg-ink text-paper">
        <div className="container-wide py-20 md:py-28">
          <div className="flex items-baseline justify-between pb-10">
            <h2 className="eyebrow !text-paper/60">Selected fragments</h2>
            <Link href="/fragments" className="eyebrow link-line !text-paper/80">All fragments →</Link>
          </div>
          <div className="grid gap-px bg-paper/15 md:grid-cols-2">
            {fragments.map((f) => (
              <Link key={f.slug} href={f.href} className="group block bg-ink p-8 transition-colors hover:bg-paper/[0.04] md:p-12">
                <p className="font-serif text-3xl font-light italic leading-snug md:text-[2.1rem]">“{f.excerpt.replace(/\*/g, "")}”</p>
                <p className="eyebrow mt-8 !text-paper/50">{f.title} · {formatDate(f.date)}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Reading room */}
      <section className="container-wide mt-28">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <h2 className="eyebrow text-ink">The Reading Room</h2>
            <p className="mt-6 font-serif text-3xl font-light leading-snug">Books that have stayed, with notes, reviews, and the passages worth copying out.</p>
            <Link href="/reading-room" className="eyebrow link-line mt-8 inline-block text-ink">Enter the reading room →</Link>
          </div>
          <ul className="grid gap-4 sm:grid-cols-3 md:col-span-8">
            {books.map((b) => (
              <li key={b.slug}>
                <Link href={b.href} className="group flex aspect-[2/3] flex-col justify-between border border-ink/70 p-5 transition-all duration-300 hover:-translate-y-1 hover:bg-ink hover:text-paper">
                  <span className="eyebrow !text-current opacity-60">{b.year}</span>
                  <span>
                    <span className="block font-serif text-2xl leading-tight">{b.title}</span>
                    <span className="mt-2 block text-[0.72rem] uppercase tracking-[0.16em] opacity-70">{b.author}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Field note */}
      {note && (
        <section className="container-wide mt-28">
          <Link href={note.href} className="group grid gap-6 border-y border-rule py-14 md:grid-cols-12">
            <p className="eyebrow md:col-span-3">Field notes · {note.place}</p>
            <div className="md:col-span-7">
              <h2 className="font-serif text-4xl font-light transition-colors group-hover:text-accent md:text-6xl">{note.title}</h2>
              <p className="mt-5 max-w-lg leading-relaxed text-muted">{note.excerpt}</p>
            </div>
            <p className="eyebrow md:col-span-2 md:text-right">Read note →</p>
          </Link>
        </section>
      )}
    </>
  );
}
