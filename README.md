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

## Admin panel (Keystatic)

**Locally:** run `npm run dev` and open `/keystatic`. Edits write straight to the `.mdx` files; commit them as usual.

**On the live site** (edit from the browser, saved as commits to GitHub):

1. Locally, run `KEYSTATIC_STORAGE=github npm run dev` and open `http://localhost:3000/keystatic`.
2. Follow the prompt to create a GitHub App. It writes four variables to `.env.local`:
   `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET`, `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`.
3. Add those four variables in Vercel → Project → Settings → Environment Variables, then redeploy.
4. In GitHub → Settings → Developer settings → GitHub Apps → your app, add the callback URL
   `https://YOUR-DOMAIN/api/keystatic/github/oauth/callback`, and make sure the app is installed on this repository.
5. Open `https://YOUR-DOMAIN/keystatic` and log in with GitHub. Each Save becomes a commit and Vercel redeploys.

Also set `NEXT_PUBLIC_SITE_URL` to your domain so RSS and the sitemap use the right address.
