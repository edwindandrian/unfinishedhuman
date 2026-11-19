import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { escapeMdx } from "@/lib/mdx";

const components = {
  a: ({ href = "", children }: { href?: string; children?: React.ReactNode }) =>
    href.startsWith("/") ? <Link href={href}>{children}</Link> : <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>,
};

export default function Mdx({ source, dropcap = true }: { source: string; dropcap?: boolean }) {
  return (
    <div className={`prose-journal ${dropcap ? "" : "no-dropcap"}`}>
      <MDXRemote source={escapeMdx(source)} components={components} />
    </div>
  );
}
