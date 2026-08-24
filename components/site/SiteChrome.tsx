"use client";

import { usePathname } from "next/navigation";
import { Header, type NavKey } from "./Header";
import { Support } from "./Support";
import { Footer } from "./Footer";

/**
 * Per-route chrome config. Every page opens on a dark hero (home: `.hero` with
 * a hide-until section; interior pages: `.ab-hero`), so every route uses the
 * transparent overlay header (variant 1) that turns frosted on scroll.
 */
function routeMeta(
  pathname: string
): { variant: "1" | "2"; active: NavKey; hero?: string; hideUntil?: string } {
  switch (pathname) {
    case "/":
      return { variant: "1", active: "home", hero: ".hero", hideUntil: ".serve" };
    case "/services":
      return { variant: "1", active: "services", hero: ".ab-hero" };
    case "/cybersecurity":
      return { variant: "1", active: "services", hero: ".ab-hero" };
    case "/about":
      return { variant: "1", active: "about", hero: ".ab-hero" };
    case "/careers":
      return { variant: "1", active: "careers", hero: ".ab-hero" };
    default:
      return { variant: "1", active: "home", hero: ".hero" };
  }
}

/**
 * Composes the shared site chrome (header, support dock, footer) around page
 * content. Being a client component lets the nav's active link and the header
 * variant follow the current route on client-side navigation.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { variant, active, hero, hideUntil } = routeMeta(pathname ?? "/");
  return (
    <>
      <Header
        variant={variant}
        active={active}
        hero={hero}
        hideUntil={hideUntil}
      />
      <Support />
      {children}
      <Footer />
    </>
  );
}