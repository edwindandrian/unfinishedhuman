# Unfinished Human

A personal editorial journal. Next.js (App Router) · TypeScript · Tailwind · MDX · Keystatic.

```bash
npm install
npm run dev     # site on http://localhost:3000, admin on /keystatic
```

## Content

All writing lives in `content/` as `.mdx` files with frontmatter:

| Folder | Fields |
| --- | --- |
| `essays/` | title, date, category, excerpt, featured, related |
| `fragments/` | title, date, category, excerpt |
| `reading-room/` | title, author, year, rating, date, category, excerpt, related |
| `field-notes/` | title, date, place, excerpt |

Categories: `the-self`, `the-human-condition`, `the-relationships`, `the-pursuit`, `the-inner-world`.

## Admin panel (`/admin`)

Write and edit from the browser: log in with one password, fill in the form, press **Simpan**.
Each save becomes a commit on `main` (via the GitHub API) and Vercel redeploys in about a minute.

### One-time setup (2 variables)

1. **Create a GitHub token** — github.com → Settings → Developer settings → Personal access tokens →
   *Fine-grained tokens* → Generate new token.
   Repository access: *Only select repositories* → `unfinishedhuman`.
   Permissions → Repository permissions → **Contents: Read and write**.
   Copy the token (`github_pat_...`).
2. **Add to Vercel** — Project → Settings → Environment Variables:
   - `ADMIN_PASSWORD` = a long password of your choice
   - `GITHUB_TOKEN` = the token from step 1
3. **Redeploy** (Deployments → ⋯ → Redeploy), then open `https://YOUR-DOMAIN/admin`.

To try it locally, put the same two variables in `.env.local` and run `npm run dev`.

Also set `NEXT_PUBLIC_SITE_URL` to your domain so RSS and the sitemap use the right address.
