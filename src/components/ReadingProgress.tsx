"use client";
import { useEffect, useState } from "react";

/** Thin progress line tracking the <article data-progress> element. */
export default function ReadingProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const el = document.querySelector("[data-progress]") as HTMLElement | null;
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight * 0.6;
      const done = Math.min(Math.max(-r.top, 0), Math.max(total, 1));
      setP(total > 0 ? done / total : 1);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, []);
  return (
    <div className="fixed inset-x-0 top-0 z-[60] h-[2px] bg-transparent" role="progressbar" aria-label="Reading progress" aria-valuenow={Math.round(p * 100)} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full origin-left bg-accent" style={{ transform: `scaleX(${p})` }} />
    </div>
  );
}
