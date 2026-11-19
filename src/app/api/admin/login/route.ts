import { NextResponse } from "next/server";
import { adminConfigured, passwordOk, makeToken, COOKIE_NAME, cookieMaxAge } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!adminConfigured()) return NextResponse.json({ error: "Admin belum dikonfigurasi di server." }, { status: 503 });
  const { password } = await req.json().catch(() => ({ password: "" }));
  if (typeof password !== "string" || !passwordOk(password)) {
    await new Promise((r) => setTimeout(r, 800)); // slow down guessing
    return NextResponse.json({ error: "Password salah." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, makeToken(), { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/", maxAge: cookieMaxAge });
  return res;
}
