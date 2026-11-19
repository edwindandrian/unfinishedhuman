import { categories } from "./categories";

export type FieldType = "text" | "textarea" | "date" | "select" | "checkbox" | "number" | "list";
export interface Field {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  hint?: string;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
}

const title: Field = { name: "title", label: "Judul", type: "text", required: true };
const date: Field = { name: "date", label: "Tanggal", type: "date", required: true };
const category: Field = {
  name: "category", label: "Kategori", type: "select", required: true,
  options: categories.map((c) => ({ value: c.slug, label: c.name })),
};
const excerpt = (label = "Ringkasan", hint = "1–2 kalimat. Tampil di daftar dan di hasil Google."): Field =>
  ({ name: "excerpt", label, type: "textarea", required: true, hint });
const related: Field = { name: "related", label: "Essay terkait", type: "list", hint: "Isi slug essay, mis. on-being-unfinished. Pisahkan dengan koma." };

export const sections = {
  essays: { label: "Essays", singular: "essay", fields: [title, date, category, excerpt(), { name: "featured", label: "Tampilkan sebagai unggulan di beranda", type: "checkbox" }, related] as Field[] },
  fragments: { label: "Fragments", singular: "fragment", fields: [title, date, category, excerpt("Kutipan singkat", "Kalimat yang tampil di daftar fragments.")] as Field[] },
  "reading-room": { label: "Reading Room", singular: "buku", fields: [title, { name: "author", label: "Penulis buku", type: "text", required: true }, { name: "year", label: "Tahun terbit", type: "number" }, { name: "rating", label: "Rating (1–5)", type: "number", min: 1, max: 5 }, date, category, excerpt(), related] as Field[] },
  "field-notes": { label: "Field Notes", singular: "catatan", fields: [title, date, { name: "place", label: "Tempat", type: "text" }, excerpt()] as Field[] },
} as const;

export type SectionKey = keyof typeof sections;
export const sectionKeys = Object.keys(sections) as SectionKey[];
export const isSection = (s: unknown): s is SectionKey => typeof s === "string" && s in sections;
export const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
