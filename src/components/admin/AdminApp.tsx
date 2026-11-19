"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { MDXRemote, type MDXRemoteSerializeResult } from "next-mdx-remote";
import { sections, sectionKeys, slugify, type Field, type SectionKey } from "@/lib/admin-schema";

type Data = Record<string, unknown>;
interface Item { slug: string; title: string; date: string }
interface Editing { slug: string; isNew: boolean; sha?: string; data: Data; content: string }

async function api<T = Record<string, unknown>>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { "Content-Type": "application/json" } });
  const body = await res.json().catch(() => ({}));
  if (res.status === 401) { location.reload(); throw new Error(body.error); }
  if (!res.ok) throw new Error(body.error ?? "Terjadi kesalahan");
  return body as T;
}

/** Shrink big photos before upload (keeps the repo light and stays under the request size limit). */
async function prepareImage(file: File): Promise<Blob> {
  if (file.type === "image/gif") { if (file.size > 4_000_000) throw new Error("GIF terlalu besar (maks 4 MB)."); return file; }
  const bmp = await createImageBitmap(file).catch(() => { throw new Error("Browser tidak bisa membaca gambar ini (format HEIC/HEIF dari iPhone belum didukung). Ubah ke JPG atau PNG lalu coba lagi."); });
  const k = Math.min(1, 1800 / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  const toBlob = (type: string, q: number) => new Promise<Blob | null>((r) => c.toBlob(r, type, q));
  let out = await toBlob("image/webp", 0.85);
  if (!out || out.type !== "image/webp") out = await toBlob("image/jpeg", 0.88);
  if (!out) throw new Error("Gambar tidak bisa diproses.");
  if (out.size > 4_000_000) throw new Error("Gambar masih terlalu besar setelah dikecilkan.");
  return out;
}

const today = () => new Date().toISOString().slice(0, 10);
const input = "w-full border border-rule bg-transparent px-3 py-2 text-[0.95rem] outline-none transition-colors focus:border-ink";

export default function AdminApp() {
  const [section, setSection] = useState<SectionKey>("essays");
  const [items, setItems] = useState<Item[] | null>(null);
  const [editing, setEditing] = useState<Editing | null>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const area = useRef<HTMLTextAreaElement>(null);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const fileInput = useRef<HTMLInputElement>(null);
  const cursorTouched = useRef(false);
  const localImages = useRef(new Map<string, string>());
  const [preview, setPreview] = useState<{ src?: MDXRemoteSerializeResult; error?: string; loading: boolean }>({ loading: false });

  const body = editing?.content;
  useEffect(() => {
    if (tab !== "preview" || body == null) return;
    setPreview((p) => ({ ...p, loading: true }));
    const t = setTimeout(async () => {
      const res = await fetch("/api/admin/preview", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: body }) });
      const json = await res.json().catch(() => ({}));
      if (res.status === 401) return location.reload();
      setPreview(res.ok ? { src: json, loading: false } : { error: json.error ?? "Gagal membuat pratinjau.", loading: false });
    }, 350);
    return () => clearTimeout(t);
  }, [tab, body]);

  const loadList = useCallback(async (s: SectionKey) => {
    setItems(null);
    try { setItems((await api<{ items: Item[] }>(`/api/admin/entries?section=${s}`)).items); }
    catch (e) { setItems([]); setMsg({ type: "err", text: (e as Error).message }); }
  }, []);

  useEffect(() => { loadList(section); }, [section, loadList]);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (dirty) e.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const confirmLeave = () => !dirty || confirm("Ada perubahan yang belum disimpan. Tinggalkan?");

  const switchSection = (s: SectionKey) => {
    if (!confirmLeave()) return;
    setEditing(null); setDirty(false); setMsg(null); setSection(s);
  };

  const newEntry = () => {
    if (!confirmLeave()) return;
    const data: Data = {};
    for (const f of sections[section].fields) {
      if (f.type === "date") data[f.name] = today();
      if (f.type === "select") data[f.name] = f.options![0].value;
      if (f.type === "list") data[f.name] = [];
    }
    cursorTouched.current = false; setTab("write"); setSlugTouched(false); setDirty(false); setMsg(null);
    setEditing({ slug: "", isNew: true, data, content: "" });
  };

  const openEntry = async (slug: string) => {
    if (!confirmLeave()) return;
    setMsg(null); setBusy(true);
    try {
      const r = await api<{ sha: string; data: Data; content: string }>(`/api/admin/entry?section=${section}&slug=${slug}`);
      setEditing({ slug, isNew: false, sha: r.sha, data: r.data, content: r.content });
      setDirty(false); setTab("write"); cursorTouched.current = false;
    } catch (e) { setMsg({ type: "err", text: (e as Error).message }); }
    setBusy(false);
  };

  const setField = (name: string, value: unknown) => {
    setDirty(true);
    setEditing((ed) => {
      if (!ed) return ed;
      const next = { ...ed, data: { ...ed.data, [name]: value } };
      if (name === "title" && ed.isNew && !slugTouched) next.slug = slugify(String(value));
      return next;
    });
  };

  async function save() {
    if (!editing) return;
    setBusy(true); setMsg(null);
    try {
      const r = await api<{ sha: string }>("/api/admin/entry", { method: "PUT", body: JSON.stringify({ section, slug: editing.slug, data: editing.data, content: editing.content, sha: editing.sha, isNew: editing.isNew }) });
      setEditing({ ...editing, isNew: false, sha: r.sha });
      setDirty(false);
      setMsg({ type: "ok", text: "Tersimpan ke GitHub. Situs akan ter-update dalam ±1 menit." });
      loadList(section);
    } catch (e) { setMsg({ type: "err", text: (e as Error).message }); }
    setBusy(false);
  }

  async function remove() {
    if (!editing || editing.isNew || !editing.sha) return;
    if (!confirm(`Hapus "${String(editing.data.title ?? editing.slug)}" secara permanen?`)) return;
    setBusy(true); setMsg(null);
    try {
      await api("/api/admin/entry", { method: "DELETE", body: JSON.stringify({ section, slug: editing.slug, sha: editing.sha }) });
      setEditing(null); setDirty(false);
      setMsg({ type: "ok", text: "Terhapus. Situs akan ter-update dalam ±1 menit." });
      loadList(section);
    } catch (e) { setMsg({ type: "err", text: (e as Error).message }); }
    setBusy(false);
  }

  async function logout() {
    if (!confirmLeave()) return;
    await api("/api/admin/logout", { method: "POST" });
    location.reload();
  }

  /** Wrap the selected text in the body textarea with markdown syntax. */
  const format = (before: string, after = "", placeholder = "teks") => {
    const el = area.current; if (!el || !editing) return;
    const { selectionStart: a, selectionEnd: b, value } = el;
    const sel = value.slice(a, b) || placeholder;
    const text = value.slice(0, a) + before + sel + after + value.slice(b);
    setDirty(true); setEditing({ ...editing, content: text });
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(a + before.length, a + before.length + sel.length); });
  };
  const linePrefix = (prefix: string) => {
    const el = area.current; if (!el || !editing) return;
    const start = el.value.lastIndexOf("\n", el.selectionStart - 1) + 1;
    const text = el.value.slice(0, start) + prefix + el.value.slice(start);
    setDirty(true); setEditing({ ...editing, content: text });
    requestAnimationFrame(() => el.focus());
  };

  const insertText = (text: string) => {
    const el = area.current; if (!el || !editing) return;
    // Insert where the cursor is; if the box was never clicked, add to the end instead of the very top.
    const a = cursorTouched.current ? el.selectionStart : el.value.length;
    const b = cursorTouched.current ? el.selectionEnd : el.value.length;
    setDirty(true); setEditing({ ...editing, content: el.value.slice(0, a) + text + el.value.slice(b) });
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(a + text.length, a + text.length); });
  };

  const looksLikeImage = (f: File) => f.type.startsWith("image/") || /\.(jpe?g|png|webp|gif|heic|heif|avif|bmp)$/i.test(f.name);

  async function uploadImages(files: File[]) {
    const imgs = files.filter(looksLikeImage);
    if (!imgs.length) { if (files.length) setMsg({ type: "err", text: "File yang dipilih bukan gambar. Gunakan JPG, PNG, WebP, atau GIF." }); return; }
    for (const f of imgs) {
      setMsg({ type: "ok", text: `Mengunggah ${f.name || "gambar"}…` });
      try {
        const blob = await prepareImage(f);
        const fd = new FormData();
        fd.append("file", blob, f.name || "image");
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const json = await res.json().catch(() => ({}));
        if (res.status === 401) return location.reload();
        if (!res.ok) throw new Error(json.error ?? "Gagal mengunggah gambar.");
        localImages.current.set(json.url, URL.createObjectURL(blob));
        insertText(`\n\n![deskripsi gambar](${json.url})\n\n`);
        setMsg({ type: "ok", text: "Gambar terunggah ke GitHub dan disisipkan. Ganti teks \"deskripsi gambar\" (jadi keterangan di bawah foto), lalu Simpan. Gambar tampil di situs setelah deploy ±1 menit." });
      } catch (e) { setMsg({ type: "err", text: (e as Error).message }); }
    }
  }

  const tools: [string, string, () => void][] = [
    ["Sisipkan gambar", "🖼", () => fileInput.current?.click()],
    ["Judul bagian", "H2", () => linePrefix("## ")],
    ["Tebal", "B", () => format("**", "**")],
    ["Miring", "I", () => format("*", "*")],
    ["Kutipan", "❝", () => linePrefix("> ")],
    ["Daftar", "•", () => linePrefix("- ")],
    ["Tautan", "🔗", () => format("[", "](https://)", "teks tautan")],
    ["Tautan ke catatan/essay lain (wikilink)", "[[ ]]", () => format("[[", "]]", "Judul catatan")],
  ];

  const renderField = (f: Field) => {
    const v = editing!.data[f.name];
    const id = `f-${f.name}`;
    const label = <label htmlFor={id} className="eyebrow mb-1.5 block">{f.label}{f.required && " *"}</label>;
    const hint = f.hint && <p className="mt-1 text-xs text-muted">{f.hint}</p>;
    switch (f.type) {
      case "textarea": return <div key={f.name}>{label}<textarea id={id} rows={3} className={input} value={String(v ?? "")} onChange={(e) => setField(f.name, e.target.value)} />{hint}</div>;
      case "select": return <div key={f.name}>{label}<select id={id} className={input} value={String(v ?? "")} onChange={(e) => setField(f.name, e.target.value)}>{f.options!.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>;
      case "checkbox": return <label key={f.name} className="flex items-center gap-3 text-sm"><input type="checkbox" checked={v === true} onChange={(e) => setField(f.name, e.target.checked)} className="h-4 w-4 accent-[rgb(var(--accent))]" />{f.label}</label>;
      case "list": return <div key={f.name}>{label}<input id={id} className={input} defaultValue={Array.isArray(v) ? v.join(", ") : ""} key={editing!.slug + String(editing!.isNew)} onChange={(e) => setField(f.name, e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />{hint}</div>;
      case "number": return <div key={f.name}>{label}<input id={id} type="number" min={f.min} max={f.max} className={input} value={v == null ? "" : String(v)} onChange={(e) => setField(f.name, e.target.value === "" ? "" : Number(e.target.value))} />{hint}</div>;
      default: return <div key={f.name}>{label}<input id={id} type={f.type === "date" ? "date" : "text"} className={input} value={String(v ?? "")} onChange={(e) => setField(f.name, e.target.value)} />{hint}</div>;
    }
  };

  const sec = sections[section];

  return (
    <div className="min-h-screen">
      {msg && (
        <div role="status" aria-live="polite" className={`fixed inset-x-4 bottom-24 z-50 mx-auto flex max-w-xl items-start gap-4 border bg-paper px-4 py-3 text-sm shadow-lg ${msg.type === "ok" ? "border-green-700/50 text-green-800 dark:text-green-300" : "border-red-700/50 text-red-800 dark:text-red-300"}`}>
          <span className="flex-1">{msg.text}</span>
          <button type="button" onClick={() => setMsg(null)} aria-label="Tutup pesan" className="text-muted hover:text-ink">✕</button>
        </div>
      )}
      <header className="border-b border-rule">
        <div className="container-wide flex h-16 items-center justify-between">
          <span className="font-serif text-xl font-medium">Unfinished Human <span className="eyebrow ml-2">Admin</span></span>
          <div className="flex items-center gap-6 text-sm">
            <a href="/" target="_blank" rel="noreferrer" className="link-line">Lihat situs ↗</a>
            <button onClick={logout} className="link-line text-muted">Keluar</button>
          </div>
        </div>
      </header>

      <div className="container-wide py-8">
        <nav aria-label="Bagian" className="flex flex-wrap gap-x-8 gap-y-2 border-b border-rule pb-3">
          {sectionKeys.map((k) => (
            <button key={k} onClick={() => switchSection(k)} className={`border-b pb-1 text-[0.78rem] uppercase tracking-[0.16em] ${k === section ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink"}`}>{sections[k].label}</button>
          ))}
        </nav>



        <div className="mt-8 grid gap-10 md:grid-cols-[280px_1fr]">
          <aside>
            <button onClick={newEntry} className="w-full border border-ink px-4 py-3 text-[0.78rem] uppercase tracking-[0.16em] transition-colors hover:bg-ink hover:text-paper">+ Tulis {sec.singular} baru</button>
            <ul className="mt-4 border-t border-rule">
              {items === null && <li className="py-4 text-sm text-muted">Memuat…</li>}
              {items?.length === 0 && <li className="py-4 text-sm text-muted">Belum ada tulisan.</li>}
              {items?.map((i) => (
                <li key={i.slug} className="border-b border-rule">
                  <button onClick={() => openEntry(i.slug)} className={`block w-full py-3 text-left transition-colors hover:text-accent ${editing?.slug === i.slug && !editing.isNew ? "text-accent" : ""}`}>
                    <span className="block font-serif text-lg leading-snug">{i.title}</span>
                    <span className="eyebrow">{i.date}</span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <main>
            {!editing ? (
              <p className="font-serif text-2xl font-light italic text-muted">Pilih tulisan di kiri, atau mulai yang baru.</p>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); save(); }} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">{sec.fields.filter((f) => f.type !== "textarea" && f.type !== "checkbox" && f.type !== "list").map(renderField)}</div>
                {sec.fields.filter((f) => f.type === "textarea" || f.type === "list" || f.type === "checkbox").map(renderField)}

                <div>
                  <label htmlFor="slug" className="eyebrow mb-1.5 block">Slug (alamat URL){editing.isNew && " *"}</label>
                  <input id="slug" className={`${input} ${editing.isNew ? "" : "opacity-60"}`} value={editing.slug} disabled={!editing.isNew}
                    onChange={(e) => { setSlugTouched(true); setDirty(true); setEditing({ ...editing, slug: slugify(e.target.value) }); }} />
                  <p className="mt-1 text-xs text-muted">/{section}/{editing.slug || "…"} {editing.isNew ? "· terisi otomatis dari judul" : "· tidak bisa diubah setelah dibuat"}</p>
                </div>

                <div>
                  <div className="mb-2 flex items-end justify-between">
                    <p className="eyebrow">Isi tulisan *</p>
                    <div role="tablist" aria-label="Mode isi tulisan" className="flex gap-5">
                      {(["write", "preview"] as const).map((t) => (
                        <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
                          className={`border-b pb-0.5 text-[0.72rem] uppercase tracking-[0.16em] ${tab === t ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink"}`}>{t === "write" ? "Tulis" : "Pratinjau"}</button>
                      ))}
                    </div>
                  </div>

                  <input ref={fileInput} type="file" accept="image/*" multiple hidden onChange={(e) => { uploadImages([...(e.target.files ?? [])]); e.target.value = ""; }} />
                  {tab === "write" ? (
                    <>
                      <div className="flex flex-wrap gap-1 border border-b-0 border-rule p-1.5">
                        {tools.map(([title, label, fn]) => (
                          <button type="button" key={title} title={title} aria-label={title} onClick={fn} className="min-w-9 px-2 py-1 text-sm text-muted transition-colors hover:bg-ink/5 hover:text-ink">{label}</button>
                        ))}
                        <span className="ml-auto self-center pr-2 text-xs text-muted">Markdown · [[Judul]] menautkan catatan · tempel atau seret gambar ke sini</span>
                      </div>
                      <textarea ref={area} rows={22} value={editing.content} onFocus={() => { cursorTouched.current = true; }}
                        onPaste={(e) => { const imgs = [...e.clipboardData.files].filter(looksLikeImage); if (imgs.length) { e.preventDefault(); uploadImages(imgs); } }}
                        onDrop={(e) => { const imgs = [...e.dataTransfer.files].filter(looksLikeImage); if (imgs.length) { e.preventDefault(); uploadImages(imgs); } }} onChange={(e) => { setDirty(true); setEditing({ ...editing, content: e.target.value }); }}
                        className={`${input} font-mono text-[0.9rem] leading-relaxed`} placeholder="Mulai menulis di sini…" />
                    </>
                  ) : (
                    <div className="min-h-[28rem] border border-rule px-6 py-10 md:px-12" aria-live="polite">
                      <p className="eyebrow mb-6 text-center">Pratinjau · tampilan kira-kira seperti di situs</p>
                      <h2 className="display mb-10 text-center text-4xl md:text-5xl">{String(editing.data.title || "Tanpa judul")}</h2>
                      {preview.error ? (
                        <p role="alert" className="border border-red-700/40 px-4 py-3 text-sm text-red-800 dark:text-red-300">{preview.error}</p>
                      ) : preview.src ? (
                        <div className={`prose-journal ${section === "essays" || section === "field-notes" ? "" : "no-dropcap"} ${preview.loading ? "opacity-60" : ""}`}>
                          <MDXRemote {...preview.src} components={{
                            a: (p: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...p} target="_blank" rel="noreferrer" />,
                            img: (p: { src?: string | Blob; alt?: string }) => { const src = typeof p.src === "string" ? (localImages.current.get(p.src) ?? p.src) : undefined; return <span className="figure"><img src={src} alt={p.alt ?? ""} />{p.alt && <span className="figcaption">{p.alt}</span>}</span>; },
                          }} />
                        </div>
                      ) : <p className="text-sm text-muted">Membuat pratinjau…</p>}
                    </div>
                  )}
                </div>

                <div className="sticky bottom-0 -mx-1 flex items-center gap-6 border-t border-rule bg-paper/95 px-1 py-4 backdrop-blur">
                  <button disabled={busy} className="bg-ink px-8 py-3 text-[0.78rem] uppercase tracking-[0.18em] text-paper transition-opacity hover:opacity-85 disabled:opacity-50">{busy ? "Menyimpan…" : "Simpan"}</button>
                  {dirty && <span className="text-xs text-muted">Belum disimpan</span>}
                  {!editing.isNew && <button type="button" onClick={remove} disabled={busy} className="ml-auto text-sm text-red-700 hover:underline dark:text-red-400">Hapus</button>}
                </div>
              </form>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
