export const site = {
  name: "Unfinished Human",
  tagline: "A human being, never quite finished.",
  description:
    "A collection of thoughts, experiences, and reflections on what it means to be human.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://unfinishedhuman.com",
  author: "Edwin Andrian",
  github: { owner: "edwindandrian", repo: "unfinishedhuman", branch: "main" },
};

export const nav = [
  { href: "/essays", label: "Essays" },
  { href: "/fragments", label: "Fragments" },
  { href: "/reading-room", label: "Reading Room" },
  { href: "/field-notes", label: "Field Notes" },
  { href: "/about", label: "About" },
];
