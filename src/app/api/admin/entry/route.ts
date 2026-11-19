import { NextResponse } from "next/server";
import { guard, fail, bad, parse, cleanData, serialize } from "@/lib/admin-api";
import { isSection } from "@/lib/admin-schema";
import { readFile, writeFile, removeFile } from "@/lib/github";

export const dynamic = "force-dynamic";
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export async function GET(req: Request) {
  const denied = await guard(); if (denied) return denied;
  const p = new URL(req.url).searchParams;
  const section = p.get("section"), slug = p.get("slug") ?? "";
  if (!isSection(section) || !SLUG.test(slug)) return bad("Permintaan tidak valid.");
  try {
    const { sha, text } = await readFile(section, slug);
    return NextResponse.json({ sha, ...parse(text) });
  } catch (e) { return fail(e); }
}

export async function PUT(req: Request) {
  const denied = await guard(); if (denied) return denied;
  const { section, slug, data, content, sha, isNew } = await req.json().catch(() => ({}));
  if (!isSection(section) || typeof slug !== "string" || !SLUG.test(slug)) return bad("Slug hanya boleh huruf kecil, angka, dan tanda hubung.");
  if (typeof content !== "string" || !content.trim()) return bad("Isi tulisan tidak boleh kosong.");
  try {
    const clean = cleanData(section, data ?? {});
    const message = `${isNew ? "Add" : "Update"} ${section}/${slug} via admin`;
    const newSha = await writeFile(section, slug, serialize(clean, content), isNew ? undefined : sha, message);
    return NextResponse.json({ sha: newSha });
  } catch (e) { return fail(e); }
}

export async function DELETE(req: Request) {
  const denied = await guard(); if (denied) return denied;
  const { section, slug, sha } = await req.json().catch(() => ({}));
  if (!isSection(section) || typeof slug !== "string" || !SLUG.test(slug) || typeof sha !== "string") return bad("Permintaan tidak valid.");
  try {
    await removeFile(section, slug, sha, `Delete ${section}/${slug} via admin`);
    return NextResponse.json({ ok: true });
  } catch (e) { return fail(e); }
}
