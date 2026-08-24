"use client";

import { useEffect } from "react";

/**
 * Scroll-reveal sweep, ported from public/assets/js/page-ui.js.
 *
 * This is a plain scroll sweep and deliberately NOT an IntersectionObserver,
 * for the same reason the original gives: the system hides real copy
 * (`[data-reveal]{opacity:0}`), so the one thing it must never do is leave a
 * section blank. A sweep re-checks on every scroll/resize/load — whatever is
 * on screen is always shown.
 *
 * Mount this once per page that carries `[data-reveal]` elements. It only
 * manages reveal state; the support panel (also in page-ui.js) is already a
 * React component (components/site/Support.tsx).
 */
export function RevealFx() {
  useEffect(() => {
    const reduce =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let targets = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]")
    );
    if (!targets.length) return;

    /* stagger siblings a little, the way index.html does */
    targets.forEach((el, i) => {
      if (!el.style.getPropertyValue("--d")) {
        el.style.setProperty("--d", Math.min(i, 3) * 70 + "ms");
      }
    });

    if (reduce) {
      targets.forEach((el) => el.classList.add("is-in"));
      return;
    }

    const sweep = () => {
      const limit = window.innerHeight - 60;
      targets = targets.filter((el) => {
        if (el.getBoundingClientRect().top < limit) {
          el.classList.add("is-in");
          return false; // done — drop from the working set
        }
        return true;
      });
      if (!targets.length) {
        window.removeEventListener("scroll", sweep);
        window.removeEventListener("resize", sweep);
        window.removeEventListener("load", sweep);
      }
    };

    window.addEventListener("scroll", sweep, { passive: true });
    window.addEventListener("resize", sweep);
    window.addEventListener("load", sweep);
    sweep();

    /* Last resort — uncover everything rather than leaving a blank page. */
    const t = window.setTimeout(() => {
      if (targets.length && window.pageYOffset === 0) sweep();
    }, 1200);

    return () => {
      window.removeEventListener("scroll", sweep);
      window.removeEventListener("resize", sweep);
      window.removeEventListener("load", sweep);
      window.clearTimeout(t);
    };
  }, []);

  return null;
}