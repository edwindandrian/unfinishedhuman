import Link from "next/link";
import { categoryName } from "@/lib/categories";
import { formatDate } from "@/lib/format";
import type { Entry } from "@/lib/content";

type Item = Pick<Entry, "href" | "title" | "excerpt" | "category" | "date" | "minutes">;

export default function EntryRow({ e, n }: { e: Item; n?: number }) {
  return (
    <article className="group border-t border-rule">
      <Link href={e.href} className="grid gap-3 py-8 md:grid-cols-12 md:gap-8 md:py-10">
        <div className="eyebrow md:col-span-3">
          {n !== undefined && <span className="mr-3 font-serif text-base normal-case tracking-normal">{String(n).padStart(2, "0")}</span>}
          {e.category ? categoryName(e.category) : ""}
        </div>
        <div className="md:col-span-7">
          <h3 className="font-serif text-3xl font-normal leading-tight transition-colors group-hover:text-accent md:text-[2.15rem]">{e.title}</h3>
          <p className="mt-3 max-w-xl leading-relaxed text-muted">{e.excerpt}</p>
        </div>
        <div className="eyebrow md:col-span-2 md:text-right">
          <div>{formatDate(e.date)}</div>
          <div className="mt-1">{e.minutes} min read</div>
        </div>
      </Link>
    </article>
  );
}
