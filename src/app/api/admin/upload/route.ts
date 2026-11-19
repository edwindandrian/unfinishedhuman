import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { guard, fail, bad } from "@/lib/admin-api";
import { slugify } from "@/lib/admin-schema";
import { putBinary } from "@/lib/github";

export const dynamic = "force-dynamic";
const MAX = 4_000_000; // stays under the serverless request body limit

/** Identify the real format from magic bytes (never trust the filename or client MIME type). */
function sniff(b: Buffer): "jpg" | "png" | "webp" | "gif" | null {
  if (b.length > 12 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
  if (b.length > 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (b.length > 12 && b.subarray(0, 4).toString() === "RIFF" && b.subarray(8, 12).toString() === "WEBP") return "webp";
  if (b.length > 6 && b.subarray(0, 4).toString() === "GIF8") return "gif";
  return null;
}

export async function POST(req: Request) {
  const denied = await guard(); if (denied) return denied;
  try {
    const file = (await req.formData()).get("file");
    if (!(file instanceof File)) return bad("File gambar tidak ditemukan.");
    if (file.size > MAX) return bad("Gambar terlalu besar (maks 4 MB).");
    const buf = Buffer.from(await file.arrayBuffer());
    const ext = sniff(buf);
    if (!ext) return bad("Format tidak didukung. Gunakan JPG, PNG, WebP, atau GIF.");
    const base = slugify((file.name || "image").replace(/\.[^.]+$/, "")) || "image";
    const hash = crypto.createHash("sha1").update(buf).digest("hex").slice(0, 8);
    const month = new Date().toISOString().slice(0, 7);
    const path = `public/images/uploads/${month}/${base}-${hash}.${ext}`;
    await putBinary(path, buf.toString("base64"), `Upload image ${base}-${hash}.${ext} via admin`);
    return NextResponse.json({ url: "/" + path.replace(/^public\//, "") });
  } catch (e) { return fail(e); }
}
