import { getAll, type Entry } from "./content";

export interface GNode { id: string; title: string; href: string; kind: "note" | "essay"; status?: string; degree: number }
export interface GEdge { source: string; target: string }

const WIKI = /\[\[([^\[\]|]+?)(?:\|([^\[\]]+?))?\]\]/g;
export const entryId = (e: Entry) => `${e.section}/${e.slug}`;

type Index = Map<string, Entry>;

/** Wikilinks resolve by title or slug (case-insensitive); notes win over essays. */
function buildIndex(): Index {
  const idx: Index = new Map();
  for (const e of [...getAll("essays"), ...getAll("garden")]) {
    idx.set(e.title.toLowerCase(), e);
    idx.set(e.slug.toLowerCase(), e);
  }
  return idx;
}

/** Turn [[Title]] / [[Title|label]] into normal markdown links; unresolved ones become plain text. */
export function linkify(body: string, idx: Index = buildIndex()): string {
  return body.replace(WIKI, (_m, target: string, label?: string) => {
    const hit = idx.get(target.trim().toLowerCase());
    const text = (label ?? target).trim();
    return hit ? `[${text}](${hit.href})` : text;
  });
}

export function outLinks(note: Entry, idx: Index = buildIndex()): Entry[] {
  const seen = new Map<string, Entry>();
  for (const m of note.body.matchAll(WIKI)) {
    const hit = idx.get(m[1].trim().toLowerCase());
    if (hit && entryId(hit) !== entryId(note)) seen.set(entryId(hit), hit);
  }
  return [...seen.values()];
}

export function backlinks(note: Entry): Entry[] {
  const idx = buildIndex();
  return getAll("garden").filter((n) => n.slug !== note.slug && outLinks(n, idx).some((t) => entryId(t) === entryId(note)));
}

export function getGraph(): { nodes: GNode[]; edges: GEdge[] } {
  const idx = buildIndex();
  const notes = getAll("garden");
  const nodes = new Map<string, GNode>();
  const edges: GEdge[] = [];
  const add = (e: Entry) => {
    if (!nodes.has(entryId(e)))
      nodes.set(entryId(e), { id: entryId(e), title: e.title, href: e.href, kind: e.section === "garden" ? "note" : "essay", status: e.status, degree: 0 });
  };
  for (const n of notes) {
    add(n);
    for (const t of outLinks(n, idx)) { add(t); edges.push({ source: entryId(n), target: entryId(t) }); }
  }
  for (const e of edges) { nodes.get(e.source)!.degree++; nodes.get(e.target)!.degree++; }
  return { nodes: [...nodes.values()], edges };
}

/** The note plus everything directly connected to it. */
export function localGraph(id: string) {
  const { nodes, edges } = getGraph();
  const keep = new Set([id]);
  for (const e of edges) { if (e.source === id) keep.add(e.target); if (e.target === id) keep.add(e.source); }
  return { nodes: nodes.filter((n) => keep.has(n.id)), edges: edges.filter((e) => keep.has(e.source) && keep.has(e.target)) };
}

export const statuses = [
  { value: "seedling", label: "Seedling", glyph: "○", note: "Rough and new" },
  { value: "growing", label: "Growing", glyph: "◐", note: "Taking shape" },
  { value: "evergreen", label: "Evergreen", glyph: "●", note: "Settled for now" },
] as const;
export const statusOf = (v?: string) => statuses.find((s) => s.value === v) ?? statuses[0];
