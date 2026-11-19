import EntryRow from "./EntryRow";
import type { Entry } from "@/lib/content";

export default function Related({ items, title = "Continue reading" }: { items: Entry[]; title?: string }) {
  if (!items.length) return null;
  return (
    <section className="container-wide mt-28">
      <h2 className="eyebrow mb-6">{title}</h2>
      <div className="border-b border-rule">{items.map((e) => <EntryRow key={e.href} e={e} />)}</div>
    </section>
  );
}
