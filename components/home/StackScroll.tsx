"use client";

import { useEffect } from "react";

/**
 * Measurement half of the stacked-section effect. The visual half is the
 * STACKED SECTIONS block at the end of app/styles/home.css; nothing here
 * animates anything itself, it only publishes the two numbers that block reads:
 *
 *   --pin-top  per layout, per section. min(0, fold - section height) — the
 *              sticky offset that pins a section when its foot reaches the fold
 *              instead of when its head reaches the top. CSS cannot express it
 *              because a percentage `top` resolves against the containing block
 *              rather than the element's own height.
 *   --sp       per frame, per section. 0 -> 1 as the NEXT section travels from
 *              the bottom of the viewport to the top of it.
 *
 * Keeping it to measurement is what lets `prefers-reduced-motion` switch the
 * whole thing off by simply never adding the class the CSS is scoped to.
 */

/**
 * Every member of the stack, in document order — the chain --sp walks. Each
 * entry is measured against the NEXT one, so the last entry is the one nothing
 * covers and it never gets an --sp of its own.
 *
 * The footer is absent on purpose: it closes the page in normal flow instead of
 * sliding over .contact. Ending the chain at .contact is what leaves .contact
 * without an --sp, and therefore without a scrub or a dim.
 */
const STACK = [
  ".hero",
  ".serve",
  ".problems",
  ".services",
  ".cta",
  ".why",
  ".blog",
  ".contact",
];

/** Matches the @media gate in home.css, and .services' own pin breakpoint. */
const MIN_WIDTH = 901;

export function StackScroll() {
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const wide = window.matchMedia(`(min-width:${MIN_WIDTH}px)`);

    const nodes = STACK.map((sel) =>
      document.querySelector<HTMLElement>(sel),
    ).filter((el): el is HTMLElement => el !== null);
    // The effect is a chain of handoffs. One missing link and every --sp after
    // it is measured against the wrong neighbour, so do nothing at all instead.
    if (nodes.length !== STACK.length) return;

    let raf = 0;
    let active = false;

    /**
     * --curve is a clamp(), and getPropertyValue() on a CUSTOM property hands
     * back the unresolved token stream — "clamp(28px,4.6vw,66px)" — not a
     * length, so parsing it directly yields NaN and silently drops the curve
     * out of every offset. Letting the engine resolve it against a throwaway
     * element is the only reading that cannot drift from the stylesheet.
     */
    function curvePx() {
      const probe = document.createElement("div");
      probe.style.cssText =
        "position:absolute;visibility:hidden;pointer-events:none;height:var(--curve)";
      document.body.appendChild(probe);
      const px = parseFloat(getComputedStyle(probe).height) || 0;
      probe.remove();
      return px;
    }

    function measure() {
      const fold = window.innerHeight + curvePx();
      for (const el of nodes) {
        // Clamped at 0: a positive offset would pin a section short of filling
        // the screen, leaving the one behind it showing along the top edge.
        el.style.setProperty(
          "--pin-top",
          `${Math.min(0, fold - el.offsetHeight)}px`,
        );
      }
    }

    function frame() {
      raf = 0;
      const v = window.innerHeight;
      for (let i = 0; i < nodes.length - 1; i++) {
        // The next section's border-box top IS the lip, negative margin included.
        const lip = nodes[i + 1].getBoundingClientRect().top;
        const sp = Math.min(1, Math.max(0, (v - lip) / v));
        nodes[i].style.setProperty("--sp", sp.toFixed(4));
        nodes[i].classList.toggle("is-scrubbing", sp > 0 && sp < 1);
      }
    }

    function schedule() {
      if (!raf) raf = requestAnimationFrame(frame);
    }

    /* Both the breakpoint decision and the re-measure, because a resize can be
       either: a crossing of 901px, or the same layout at a new size, and both
       arrive on this one event. Routing the decision through here rather than
       leaving it to the matchMedia listener alone means tearing down never
       depends on a second event firing. */
    function onResize() {
      if (!wide.matches || motion.matches) {
        disable();
        return;
      }
      if (!active) {
        enable(); // measures on the way in
        return;
      }
      measure();
      schedule();
    }

    function enable() {
      if (active) return;
      active = true;
      document.body.classList.add("is-stacked");
      // Synchronous, not deferred to a frame. The class is what applies the
      // min-height, but the offsetHeight read inside measure() flushes pending
      // style itself, so the heights are already correct here — and a rAF would
      // not run at all in a background tab, leaving --pin-top unset and every
      // section falling back to top:0, which pins it at its head instead of its
      // foot. That is the one failure mode worth designing out.
      measure();
      frame();
      window.addEventListener("scroll", schedule, { passive: true });
    }

    function disable() {
      if (!active) return;
      active = false;
      document.body.classList.remove("is-stacked");
      window.removeEventListener("scroll", schedule);
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
      for (const el of nodes) {
        el.style.removeProperty("--pin-top");
        el.style.removeProperty("--sp");
        el.classList.remove("is-scrubbing");
      }
    }

    // Sections grow after first paint — images decode, the blog list arrives,
    // ServicesScroll swaps its rail to the pinned layout — and every one of
    // those changes a height, which is exactly what --pin-top is derived from.
    const ro = new ResizeObserver(() => {
      if (!active) return;
      measure();
      schedule();
    });
    for (const el of nodes) ro.observe(el);

    /* Bound for the life of the effect, NOT inside enable(): below 901px the
       effect is disabled, and a listener torn down with it is one that cannot
       notice the window growing back past the breakpoint. Only `scroll` is
       worth scoping to the active state. */
    window.addEventListener("resize", onResize, { passive: true });
    motion.addEventListener("change", onResize);
    wide.addEventListener("change", onResize);
    onResize();

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onResize);
      motion.removeEventListener("change", onResize);
      wide.removeEventListener("change", onResize);
      disable();
    };
  }, []);

  return null;
}
