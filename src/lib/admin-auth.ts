import crypto from "node:crypto";
import { cookies } from "next/headers";

export const COOKIE_NAME = "uh_admin";
const WEEK = 7 * 24 * 60 * 60 * 1000;

export const adminConfigured = () => Boolean(process.env.ADMIN_PASSWORD && process.env.GITHUB_TOKEN);

const key = () => crypto.createHash("sha256").update(`${process.env.ADMIN_PASSWORD}|${process.env.GITHUB_TOKEN}`).digest();
const sign = (v: string) => crypto.createHmac("sha256", key()).update(v).digest("hex");
const sha = (v: string) => crypto.createHash("sha256").update(v).digest();

export function passwordOk(pw: string) {
  return crypto.timingSafeEqual(sha(pw), sha(process.env.ADMIN_PASSWORD ?? ""));
}
export function makeToken() {
  const exp = String(Date.now() + WEEK);
  return `${exp}.${sign(exp)}`;
}
export function tokenOk(t?: string) {
  if (!t) return false;
  const [exp, sig] = t.split(".");
  if (!exp || !sig) return false;
  const good = sign(exp);
  if (sig.length !== good.length) return false;
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(good)) && Number(exp) > Date.now();
}
export async function isAuthed() {
  return adminConfigured() && tokenOk((await cookies()).get(COOKIE_NAME)?.value);
}
export const cookieMaxAge = WEEK / 1000;
