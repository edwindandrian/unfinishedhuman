/**
 * Posts are plain Markdown, not JSX. In MDX a stray `{` or `<` is parsed as code and can
 * break the whole build, so escape them (outside code spans/blocks) before rendering.
 */
export function escapeMdx(src: string): string {
  return src
    .split(/(```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]*`)/g)
    .map((part, i) => (i % 2 === 1 ? part : part.replace(/(?<!\\)([{}])/g, "\\$1").replace(/(?<!\\)<(?!https?:\/\/)/g, "\\<")))
    .join("");
}
