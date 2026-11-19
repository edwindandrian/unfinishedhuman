import { NextResponse } from "next/server";
import { guard, bad, compileBody } from "@/lib/admin-api";
import { linkify } from "@/lib/garden";
import { escapeMdx } from "@/lib/mdx";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const denied = await guard(); if (denied) return denied;
  const { content } = await req.json().catch(() => ({}));
  if (typeof content !== "string") return bad("Permintaan tidak valid.");
  let source = content;
  try { source = linkify(content); } catch { /* preview still works without link resolution */ }
  try {
    return NextResponse.json(await compileBody(escapeMdx(source)));
  } catch (e) {
    return bad((e as Error).message, 422);
  }
}
