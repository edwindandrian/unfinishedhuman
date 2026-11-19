import Header from "./Header";
import Footer from "./Footer";
import { searchIndex } from "@/lib/content";

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:bg-ink focus:px-3 focus:py-2 focus:text-paper">Skip to content</a>
      <Header index={searchIndex()} />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
