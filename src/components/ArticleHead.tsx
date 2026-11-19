import Link from "next/link";
import { categoryName } from "@/lib/categories";
import { formatDate } from "@/lib/format";

export default function ArticleHead({ back, backHref, title, date, category, extra, minutes }: {
  back: string; backHref: string; title: string; date: string; category?: string; extra?: string; minutes?: number;
}) {
  return (
    <header className="container-wide pb-14 pt-14 md:pt-24">
      <div className="mx-auto max-w-3xl text-center">
        <Link href={backHref} className="eyebrow link-line">← {back}</Link>
        <h1 className="display rise mt-8 text-[2.8rem] md:text-[4.8rem]">{title}</h1>
        <p className="eyebrow rise rise-1 mt-8 flex flex-wrap justify-center gap-x-4 gap-y-1">
          {category && <Link href={`/essays?category=${category}`} className="link-line text-ink">{categoryName(category)}</Link>}
          {extra && <span>{extra}</span>}
          <span>{formatDate(date)}</span>
          {minutes && <span>{minutes} min read</span>}
        </p>
      </div>
    </header>
  );
}
