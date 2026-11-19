import { MDXRemote } from "next-mdx-remote/rsc";

export default function Mdx({ source, dropcap = true }: { source: string; dropcap?: boolean }) {
  return (
    <div className={`prose-journal ${dropcap ? "" : "no-dropcap"}`}>
      <MDXRemote source={source} />
    </div>
  );
}
