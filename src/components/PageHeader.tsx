export default function PageHeader({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string }) {
  return (
    <section className="container-wide pb-14 pt-16 md:pb-20 md:pt-24">
      <p className="eyebrow rise">{eyebrow}</p>
      <h1 className="display rise rise-1 mt-5 text-[3.2rem] md:text-[5.5rem]">{title}</h1>
      {intro && <p className="rise rise-2 mt-8 max-w-xl font-serif text-xl font-light leading-relaxed text-muted md:text-2xl">{intro}</p>}
    </section>
  );
}
