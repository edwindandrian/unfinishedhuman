import { config, collection, fields } from "@keystatic/core";

// Local mode while developing (edits files on disk, no login).
// GitHub mode in production (edits are saved as commits to the repo).
// GitHub mode switches on only once the GitHub App variables are set (see README).
const useGitHub =
  process.env.KEYSTATIC_STORAGE === "github" || Boolean(process.env.KEYSTATIC_GITHUB_CLIENT_ID);

const category = fields.select({
  label: "Category",
  options: [
    { label: "The Self", value: "the-self" },
    { label: "The Human Condition", value: "the-human-condition" },
    { label: "The Relationships", value: "the-relationships" },
    { label: "The Pursuit", value: "the-pursuit" },
    { label: "The Inner World", value: "the-inner-world" },
  ],
  defaultValue: "the-self",
});
const date = fields.date({ label: "Date", validation: { isRequired: true } });
const body = fields.mdx({ label: "Content" });
const related = fields.array(fields.text({ label: "Essay slug" }), {
  label: "Related essays",
  description: "Slugs of related essays, e.g. on-being-unfinished",
  itemLabel: (p) => p.value,
});
const title = fields.slug({ name: { label: "Title" } });

export default config({
  storage: useGitHub
    ? { kind: "github", repo: { owner: "edwindandrian", name: "unfinishedhuman" } }
    : { kind: "local" },
  ui: { brand: { name: "Unfinished Human" } },
  collections: {
    essays: collection({
      label: "Essays",
      slugField: "title",
      path: "content/essays/*",
      format: { contentField: "content" },
      schema: {
        title,
        date,
        category,
        excerpt: fields.text({ label: "Excerpt", multiline: true, validation: { isRequired: true } }),
        featured: fields.checkbox({ label: "Featured on homepage", defaultValue: false }),
        related,
        content: body,
      },
    }),
    fragments: collection({
      label: "Fragments",
      slugField: "title",
      path: "content/fragments/*",
      format: { contentField: "content" },
      schema: {
        title,
        date,
        category,
        excerpt: fields.text({ label: "Short quote (shown in lists)", multiline: true, validation: { isRequired: true } }),
        content: body,
      },
    }),
    readingRoom: collection({
      label: "Reading Room (books)",
      slugField: "title",
      path: "content/reading-room/*",
      format: { contentField: "content" },
      schema: {
        title,
        author: fields.text({ label: "Author", validation: { isRequired: true } }),
        year: fields.integer({ label: "Year published" }),
        rating: fields.integer({ label: "Rating (1–5)", validation: { min: 1, max: 5 } }),
        date,
        category,
        excerpt: fields.text({ label: "Excerpt", multiline: true, validation: { isRequired: true } }),
        related,
        content: body,
      },
    }),
    fieldNotes: collection({
      label: "Field Notes",
      slugField: "title",
      path: "content/field-notes/*",
      format: { contentField: "content" },
      schema: {
        title,
        date,
        place: fields.text({ label: "Place" }),
        excerpt: fields.text({ label: "Excerpt", multiline: true, validation: { isRequired: true } }),
        content: body,
      },
    }),
  },
});
