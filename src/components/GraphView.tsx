"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide, forceX, forceY, type SimulationNodeDatum } from "d3-force";
import type { GNode, GEdge } from "@/lib/garden";

type P = GNode & SimulationNodeDatum;
const W = 1000, H = 640;

export default function GraphView({ nodes, edges, focusId, compact = false }: { nodes: GNode[]; edges: GEdge[]; focusId?: string; compact?: boolean }) {
  const router = useRouter();
  const [pos, setPos] = useState<P[] | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [view, setView] = useState({ x: 0, y: 0, k: 1 });
  const drag = useRef<{ x: number; y: number; vx: number; vy: number } | null>(null);
  const svg = useRef<SVGSVGElement>(null);

  const radius = (n: GNode) => (compact ? 6 : 5) + Math.sqrt(n.degree) * (compact ? 1.5 : 2.2);

  useEffect(() => {
    const ns: P[] = nodes.map((n) => ({ ...n }));
    const ls = edges.map((e) => ({ source: e.source, target: e.target }));
    const sim = forceSimulation(ns)
      .force("link", forceLink<P, { source: string; target: string }>(ls).id((d) => d.id).distance(compact ? 110 : 120).strength(0.5))
      .force("charge", forceManyBody().strength(compact ? -520 : -520))
      .force("center", forceCenter(W / 2, H / 2))
      .force("x", forceX(W / 2).strength(0.02))
      .force("y", forceY(H / 2).strength(0.03))
      .force("collide", forceCollide<P>().radius((d) => radius(d) + 34))
      .stop();
    for (let i = 0; i < 400; i++) sim.tick();
    // Fit the settled layout to the frame so the map always fills the space.
    const xs = ns.map((n) => n.x ?? 0), ys = ns.map((n) => n.y ?? 0);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const padX = 110, padY = 60;
    const k = Math.min((W - 2 * padX) / Math.max(maxX - minX, 1), (H - 2 * padY) / Math.max(maxY - minY, 1), compact ? 1.4 : 2.4);
    const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
    for (const n of ns) { n.x = W / 2 + ((n.x ?? 0) - cx) * k; n.y = H / 2 + ((n.y ?? 0) - cy) * k; }
    setPos(ns);
    setView({ x: 0, y: 0, k: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges, compact]);

  const neighbors = useMemo(() => {
    const m = new Map<string, Set<string>>();
    for (const e of edges) {
      (m.get(e.source) ?? m.set(e.source, new Set()).get(e.source)!).add(e.target);
      (m.get(e.target) ?? m.set(e.target, new Set()).get(e.target)!).add(e.source);
    }
    return m;
  }, [edges]);

  if (!pos) return <div className="aspect-[1000/640] w-full border border-rule" aria-hidden />;
  const byId = new Map(pos.map((n) => [n.id, n]));
  const active = hover ?? focusId ?? null;
  const lit = (id: string) => !active || id === active || neighbors.get(active)?.has(id);

  const zoom = (f: number) => setView((v) => ({ ...v, k: Math.min(3, Math.max(0.5, v.k * f)) }));
  const toSvg = (e: React.PointerEvent) => { const r = svg.current!.getBoundingClientRect(); return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H }; };

  const fill = (n: P) => n.kind === "essay" ? "rgb(var(--accent))" : n.status === "evergreen" ? "rgb(var(--ink))" : n.status === "growing" ? "rgb(var(--ink) / .55)" : "rgb(var(--paper))";

  return (
    <div className="relative">
      <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Graph of connected notes" className={`w-full touch-none select-none border border-rule ${drag.current ? "cursor-grabbing" : "cursor-grab"}`}
        onWheel={(e) => { if (!compact) zoom(e.deltaY < 0 ? 1.1 : 0.9); }}
        onPointerDown={(e) => { if ((e.target as Element).closest("a")) return; const p = toSvg(e); drag.current = { x: p.x, y: p.y, vx: view.x, vy: view.y }; (e.currentTarget as Element).setPointerCapture(e.pointerId); }}
        onPointerMove={(e) => { if (!drag.current) return; const p = toSvg(e); setView((v) => ({ ...v, x: drag.current!.vx + p.x - drag.current!.x, y: drag.current!.vy + p.y - drag.current!.y })); }}
        onPointerUp={() => { drag.current = null; }}>
        <g transform={`translate(${view.x} ${view.y}) translate(${W / 2} ${H / 2}) scale(${view.k}) translate(${-W / 2} ${-H / 2})`}>
          {edges.map((e) => {
            const a = byId.get(e.source), b = byId.get(e.target);
            if (!a || !b) return null;
            const on = active && (e.source === active || e.target === active);
            return <line key={e.source + e.target} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="rgb(var(--ink))" strokeWidth={on ? 1.4 : 0.8} opacity={active ? (on ? 0.8 : 0.1) : 0.28} />;
          })}
          {pos.map((n) => {
            const r = radius(n);
            const dim = !lit(n.id);
            const showLabel = !compact || n.id === focusId || true;
            return (
              <a key={n.id} href={n.href} aria-label={`${n.title}${n.kind === "essay" ? " (essay)" : ""}`} onClick={(e) => { e.preventDefault(); router.push(n.href); }}
                onPointerEnter={() => setHover(n.id)} onPointerLeave={() => setHover(null)} onFocus={() => setHover(n.id)} onBlur={() => setHover(null)}
                style={{ cursor: "pointer", opacity: dim ? 0.18 : 1, transition: "opacity .2s" }}>
                <circle cx={n.x} cy={n.y} r={r} fill={fill(n)} stroke={n.kind === "essay" ? "rgb(var(--accent))" : "rgb(var(--ink))"} strokeWidth={n.id === focusId ? 3 : 1.4} />
                <circle cx={n.x} cy={n.y} r={r + 10} fill="transparent" />
                {showLabel && <text x={n.x} y={(n.y ?? 0) + r + 15} textAnchor="middle" fontSize={compact ? 17 : 15} style={{ fontFamily: "var(--font-serif)" }} fill="rgb(var(--ink))" fontWeight={n.id === active ? 600 : 400}>{n.title}</text>}
              </a>
            );
          })}
        </g>
      </svg>
      {!compact && (
        <div className="absolute right-3 top-3 flex flex-col border border-rule bg-paper/90 text-lg leading-none">
          <button onClick={() => zoom(1.25)} aria-label="Zoom in" className="h-9 w-9 hover:bg-ink/5">+</button>
          <button onClick={() => zoom(0.8)} aria-label="Zoom out" className="h-9 w-9 border-t border-rule hover:bg-ink/5">−</button>
          <button onClick={() => setView({ x: 0, y: 0, k: 1 })} aria-label="Reset view" className="h-9 w-9 border-t border-rule text-sm hover:bg-ink/5">⟲</button>
        </div>
      )}
    </div>
  );
}

export function GraphLegend() {
  return (
    <ul className="eyebrow mt-4 flex flex-wrap gap-x-6 gap-y-2">
      <li><span className="mr-2 inline-block h-2.5 w-2.5 rounded-full border border-ink bg-paper align-middle" />Seedling</li>
      <li><span className="mr-2 inline-block h-2.5 w-2.5 rounded-full border border-ink bg-ink/55 align-middle" />Growing</li>
      <li><span className="mr-2 inline-block h-2.5 w-2.5 rounded-full border border-ink bg-ink align-middle" />Evergreen</li>
      <li><span className="mr-2 inline-block h-2.5 w-2.5 rounded-full border border-accent bg-accent align-middle" />Essay</li>
    </ul>
  );
}
