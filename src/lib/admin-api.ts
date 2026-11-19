import matter from "gray-matter";
import { serialize as compileMdx } from "next-mdx-remote/serialize";
import { NextResponse } from "next/server";
import { isAuthed } from "./admin-auth";
import { GhError } from "./github";
import { sections, type SectionKey } from "./admin-schema";

export const unauthorized = () => NextResponse.json({ error: "Sesi berakhir. Silakan login lagi." }, { status: 401 });
export const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });

export async function guard() {
  return (await isAuthed()) ? null : unauthorized();
}

export function fail(e: unknown) {
  if (e instanceof GhError) {
    const hint = e.status === 401 || e.status === 403 ? " (cek GITHUB_TOKEN dan izin Contents: Read and write)" : e.status === 422 ? " (file dengan slug ini mungkin sudah ada)" : "";
    return bad(`GitHub: ${e.message}${hint}`, e.status === 401 ? 502 : e.status);
  }
  return bad(e instanceof Error ? e.message : "Terjadi kesalahan", 500);
}

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/** Validate + normalise form data into clean frontmatter. */
export function cleanData(section: SectionKey, raw: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const f of sections[section].fields) {
    const v = raw[f.name];
    if (f.type === "checkbox") { if (v === true) out[f.name] = true; continue; }
    if (f.type === "number") {
      const n = Number(v);
      if (v !== "" && v != null && Number.isFinite(n)) out[f.name] = n;
    } else if (f.type === "list") {
      const arr = (Array.isArray(v) ? v : []).map(str).filter(Boolean);
      if (arr.length) out[f.name] = arr;
    } else if (str(v)) {
      out[f.name] = str(v);
    }
    if (f.required && out[f.name] === undefined) throw new Error(`"${f.label}" wajib diisi.`);
    if (f.type === "select" && out[f.name] && !f.options?.some((o) => o.value === out[f.name])) throw new Error(`"${f.label}" tidak valid.`);
    if (f.type === "date" && out[f.name] && !/^\d{4}-\d{2}-\d{2}$/.test(String(out[f.name]))) throw new Error(`"${f.label}" tidak valid.`);
  }
  return out;
}

export function serialize(data: Record<string, unknown>, content: string) {
  return matter.stringify(content.trim() + "\n", data);
}

export function parse(text: string) {
  const { data, content } = matter(text);
  if (data.date instanceof Date) data.date = data.date.toISOString().slice(0, 10);
  return { data, content: content.trim() };
}

/** Compile the body exactly like the site does, so a broken post is rejected before it is committed. */
export async function compileBody(source: string) {
  try {
    return await compileMdx(source);
  } catch (e) {
    const first = (e instanceof Error ? e.message : String(e)).split("\n")[0];
    throw new Error(`Format isi tidak valid: ${first}.`);
  }
}
