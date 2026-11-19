import { site } from "./site";

const API = process.env.GITHUB_API_URL ?? "https://api.github.com";
const { owner, repo, branch } = site.github;

export class GhError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

async function gh(path: string, init: RequestInit = {}) {
  const res = await fetch(`${API}/repos/${owner}/${repo}/${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      "User-Agent": "unfinished-human-admin",
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new GhError(res.status, body.message ?? res.statusText);
  }
  return res.json();
}

const filePath = (section: string, slug: string) => `content/${section}/${slug}.mdx`;

export async function listFiles(section: string): Promise<string[]> {
  try {
    const items = await gh(`contents/content/${section}?ref=${branch}`);
    return (items as { name: string }[]).filter((i) => i.name.endsWith(".mdx")).map((i) => i.name.replace(/\.mdx$/, ""));
  } catch (e) {
    if (e instanceof GhError && e.status === 404) return [];
    throw e;
  }
}

export async function readFile(section: string, slug: string) {
  const f = await gh(`contents/${filePath(section, slug)}?ref=${branch}`);
  return { sha: f.sha as string, text: Buffer.from(f.content, "base64").toString("utf8") };
}

export async function writeFile(section: string, slug: string, text: string, sha: string | undefined, message: string) {
  const r = await gh(`contents/${filePath(section, slug)}`, {
    method: "PUT",
    body: JSON.stringify({ message, content: Buffer.from(text, "utf8").toString("base64"), branch, ...(sha ? { sha } : {}) }),
  });
  return r.content.sha as string;
}

export async function removeFile(section: string, slug: string, sha: string, message: string) {
  await gh(`contents/${filePath(section, slug)}`, { method: "DELETE", body: JSON.stringify({ message, sha, branch }) });
}
