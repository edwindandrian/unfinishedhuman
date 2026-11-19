import { NextResponse } from "next/server";
import { guard, fail, bad, parse } from "@/lib/admin-api";
import { isSection } from "@/lib/admin-schema";
import { listFiles, readFile } from "@/lib/github";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const denied = await guard(); if (denied) return denied;
  const section = new URL(req.url).searchParams.get("section");
  if (!isSection(section)) return bad("Bagian tidak valid.");
  try {
    const slugs = await listFiles(section);
    const items = await Promise.all(slugs.map(async (slug) => {
      const { data } = parse((await readFile(section, slug)).text);
      return { slug, title: String(data.title ?? slug), date: String(data.date ?? "") };
    }));
    items.sort((a, b) => (a.date < b.date ? 1 : -1));
    return NextResponse.json({ items });
  } catch (e) { return fail(e); }
}
