import Link from "next/link";
export default function NotFound() {
  return (
    <section className="container-wide py-40 text-center">
      <p className="eyebrow">404</p>
      <h1 className="display mt-6 text-6xl italic md:text-8xl">Not yet written.</h1>
      <p className="mt-6 text-muted">This page does not exist, or has not been finished.</p>
      <Link href="/" className="eyebrow link-line mt-10 inline-block text-ink">← Return home</Link>
    </section>
  );
}
