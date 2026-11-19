"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr("");
    const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw }) });
    if (res.ok) router.refresh();
    else { setErr((await res.json().catch(() => ({}))).error ?? "Gagal login."); setBusy(false); }
  }

  return (
    <div className="container-wide max-w-sm py-32">
      <p className="eyebrow">Unfinished Human</p>
      <h1 className="display mt-4 text-5xl">Masuk</h1>
      <form onSubmit={submit} className="mt-10">
        <label className="eyebrow" htmlFor="pw">Password</label>
        <input id="pw" type="password" autoFocus autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)}
          className="mt-2 w-full border-b border-ink/40 bg-transparent py-2 text-lg outline-none focus:border-ink" />
        {err && <p role="alert" className="mt-3 text-sm text-red-700 dark:text-red-400">{err}</p>}
        <button disabled={busy || !pw} className="mt-8 w-full border border-ink px-6 py-3 text-[0.78rem] uppercase tracking-[0.18em] transition-colors hover:bg-ink hover:text-paper disabled:opacity-40">
          {busy ? "Memeriksa…" : "Masuk"}
        </button>
      </form>
    </div>
  );
}
