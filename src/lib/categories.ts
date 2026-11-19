export const categories = [
  { slug: "the-self", name: "The Self", blurb: "Identity, habit, and the person you keep becoming." },
  { slug: "the-human-condition", name: "The Human Condition", blurb: "Mortality, meaning, and the shared weather of being alive." },
  { slug: "the-relationships", name: "The Relationships", blurb: "Friendship, family, love, and the people who make us legible." },
  { slug: "the-pursuit", name: "The Pursuit", blurb: "Work, ambition, craft, and what we are actually chasing." },
  { slug: "the-inner-world", name: "The Inner World", blurb: "Attention, memory, solitude, and the rooms nobody sees." },
] as const;

export type CategorySlug = (typeof categories)[number]["slug"];

export const categoryName = (slug: string) =>
  categories.find((c) => c.slug === slug)?.name ?? slug;
