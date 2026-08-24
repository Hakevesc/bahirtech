"use client";

import { useEffect } from "react";
import Link from "next/link";

const LOGO_LIGHT = "/assets/logo/Bahir Tech Logo.svg";
const LOGO_DARK = "/assets/logo/Bahir Tech Logo color.svg";

export type NavKey = "home" | "services" | "industries" | "about" | "careers";

type HeaderProps = {
  /** Header 1 = overlay over a dark hero (transparent -> frosted on scroll). Header 2 = solid/frosted from the start. */
  variant?: "1" | "2";
  /** Which nav link is marked active. */
  active?: NavKey;
  /** CSS selector for the dark hero (header 1 only). */
  hero?: string;
  /** Section the bar stays hidden until (header 1 only — homepage). */
  hideUntil?: string;
};

const LINKS: { key: NavKey; href: string; label: string }[] = [
  { key: "home", href: "/", label: "Home" },
  { key: "services", href: "/services", label: "Services" },
  { key: "industries", href: "/#problems", label: "Industries" },
  { key: "about", href: "/about", label: "About" },
  { key: "careers", href: "/careers", label: "Careers" },
];

/**
 * Shared site header. Behaviour is ported from public/assets/js/site-chrome.js
 * into React so it survives client-side navigation between pages: the scroll
 * phase (transparent -> hidden -> frosted) governs body[data-nav], and the
 * logo swaps between the light and colour marks. Header 2 simply pins the
 * frosted state with the colour logo.
 */
export function Header({
  variant = "2",
  active = "home",
  hero = ".hero",
  hideUntil = ".serve",
}: HeaderProps) {
  useEffect(() => {
    const nav = document.getElementById("navbar");
    if (!nav) return;

    if (variant !== "1") {
      document.body.setAttribute("data-nav", "glass");
      return;
    }

    const heroEl = hero ? document.querySelector(hero) : null;
    const next = hideUntil ? document.querySelector(hideUntil) : null;
    const logo = nav.querySelector(".nav__logo img") as HTMLImageElement | null;
    let state: string | null = null;

    const apply = () => {
      const y = window.pageYOffset;
      let n: string;
      if (!heroEl) {
        n = y > 40 ? "glass" : "top";
      } else if (next) {
        const hideAt = (heroEl as HTMLElement).offsetHeight * 0.4;
        const showAt =
          (next as HTMLElement).offsetTop +
          Math.min(160, (next as HTMLElement).offsetHeight * 0.25);
        n = y < hideAt ? "top" : y < showAt ? "hide" : "glass";
      } else {
        const edge = Math.max(
          0,
          (heroEl as HTMLElement).offsetHeight - nav.offsetHeight - 20
        );
        n = y > edge ? "glass" : "top";
      }

      if (n === state) return;
      state = n;
      if (n === "top") document.body.removeAttribute("data-nav");
      else document.body.setAttribute("data-nav", n);
      if (logo) logo.src = n === "glass" ? LOGO_DARK : LOGO_LIGHT;
    };

    const onScroll = () => {
      if ("requestAnimationFrame" in window) requestAnimationFrame(apply);
      else apply();
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    window.addEventListener("load", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("load", onScroll);
      document.body.removeAttribute("data-nav");
    };
  }, [variant, hero, hideUntil]);

  return (
    <header
      className="nav"
      id="navbar"
      data-header={variant}
      data-hero={variant === "1" ? hero : undefined}
      data-hide-until={variant === "1" ? hideUntil : undefined}
    >
      <div className="container">
        <Link href="/" className="nav__logo" aria-label="Bahir Tech home">
          <img src={variant === "2" ? LOGO_DARK : LOGO_LIGHT} alt="BAHIR TECH" />
        </Link>
        <nav className="nav__menu" aria-label="Primary">
          {LINKS.map((l) => (
            <Link
              key={l.key}
              href={l.href}
              className={active === l.key ? "active" : undefined}
              aria-current={active === l.key ? "page" : undefined}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}