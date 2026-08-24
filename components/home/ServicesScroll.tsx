"use client";

import { useEffect } from "react";

/**
 * Drives the pinned "Our Services" runway.
 *
 * Two jobs, both of which used to live in the `.srv-cat` tablist inside
 * public/assets/js/index/home-fx.js. That block now bails on its own first line
 * (`if(!cats.length …) return;`) because the practice rail it wired no longer
 * exists, so the pill bars it also set up have to be rebuilt here.
 *
 *  1. PRACTICE — scroll position through `.services__runway` picks 01/02/03. The
 *     runway is `count` viewports tall and the sticky frame is one viewport, so
 *     the travel is `(count - 1)` viewports; progress across that maps onto the
 *     panels. It still dispatches `srv:change`, which is the contract the three.js
 *     icon listens on (home-fx.js:1533) — that is why the icon keeps swapping.
 *
 *  2. PILLS — the item tablist inside each panel: click, arrows, Home/End.
 *
 * Pinning is opt-in via `.is-pinned`, added here on mount, so a no-JS reader gets three
 * panels stacked in normal flow rather than an empty pinned frame with one panel in it.
 */
export function ServicesScroll({ count }: { count: number }) {
  useEffect(() => {
    const section = document.getElementById("services-section");
    const runway = section?.querySelector<HTMLElement>(".services__runway");
    if (!section || !runway) return;

    const panels = Array.from(section.querySelectorAll<HTMLElement>("[data-srv-panel]"));
    const nums = Array.from(section.querySelectorAll<HTMLElement>("[data-srv-num]"));
    const labels = Array.from(section.querySelectorAll<HTMLElement>("[data-srv-label]"));
    const asides = Array.from(section.querySelectorAll<HTMLElement>("[data-srv-aside]"));
    const prev = section.querySelector<HTMLButtonElement>("#srvPrev");
    const next = section.querySelector<HTMLButtonElement>("#srvNext");
    const steps = Array.from(section.querySelectorAll<HTMLElement>("[data-srv-step]"));
    if (panels.length !== count) return;

    /* One controller for EVERY listener below, window and element alike. The cleanup used
       to remove only the window ones, so the handlers bound to the arrows, the pills and
       the progress rail survived it — and React StrictMode runs an effect twice in dev,
       which left two of each. One arrow click then scrolled twice and a pill pick ran its
       handler twice. `signal` unbinds all of them in one call. */
    const ac = new AbortController();
    const { signal } = ac;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    /* Coarse gate only. Below 901px the card becomes one column with the photograph on
       top, which no pinned frame should try to hold; the 640px floor just avoids pinning
       something absurd. Whether it ACTUALLY fits is measured, not predicted — see `fits`.
       Keep the 901px in step with the CSS breakpoint. */
    const wide = window.matchMedia("(min-width: 901px) and (min-height: 640px)");
    const sticky = runway.querySelector<HTMLElement>(".services__sticky");
    const bodyEl = runway.querySelector<HTMLElement>(".services__body");

    /* The panel's height depends on how the card's copy happens to wrap, which depends on
       the viewport width — so no fixed height threshold is right at every width. Pin
       optimistically, measure the real laid-out height against the frame, and back out if
       it overruns. `overflow:hidden` on the sticky frame means anything that does not fit
       is silently cut off, so this has to be measured rather than estimated.
       Only ever called while `.is-pinned` is applied; unpinned the body is all three
       panels stacked and the number would be meaningless. */
    function fits() {
      if (!sticky || !bodyEl) return true;
      return bodyEl.getBoundingClientRect().height <= sticky.clientHeight;
    }

    /* ---- practice selection ---- */
    let current = -1;
    /* Whether the section ended up pinned. NOT the same as `wide.matches`: the media query
       is only the coarse gate, and `apply` can still refuse to pin when the content does
       not fit the frame. Everything downstream keys off this, so a refused pin behaves
       exactly like a narrow screen. Declared up here so the handlers below never touch it
       in its temporal dead zone. */
    let pinned = false;

    function show(i: number) {
      if (i === current) return;
      current = i;
      const mark = (els: HTMLElement[]) =>
        els.forEach((el, j) => el.classList.toggle("is-active", j === i));
      mark(panels);
      mark(nums);
      mark(labels);
      mark(asides);
      // the inactive asides are decorative duplicates, so keep them out of the a11y tree
      asides.forEach((el, j) => el.setAttribute("aria-hidden", j === i ? "false" : "true"));
      if (prev) prev.disabled = i === 0;
      if (next) next.disabled = i === count - 1;
      steps.forEach((s, j) => {
        s.classList.toggle("is-active", j === i);
        s.setAttribute("aria-selected", j === i ? "true" : "false");
        s.tabIndex = j === i ? 0 : -1;
      });
      document.dispatchEvent(new CustomEvent("srv:change", { detail: { index: i } }));
    }

    /* Which chapter the current scroll position lands in. Travel is the runway height
       minus the one viewport the sticky frame occupies; guard the divisor, since a runway
       shorter than the viewport would otherwise divide by zero. */
    function indexFromScroll() {
      const box = runway!.getBoundingClientRect();
      const travel = box.height - window.innerHeight;
      const p = travel > 0 ? -box.top / travel : 0;
      return Math.min(count - 1, Math.max(0, Math.floor(p * count)));
    }

    let frame = 0;
    function onScroll() {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (!pinned) return;
        show(indexFromScroll());
      });
    }

    /* ---- the progress rail, as a real tablist ---- */
    steps.forEach((step, i) => {
      step.addEventListener("click", () => goTo(i), { signal });
      step.addEventListener("keydown", (e) => {
        const last = steps.length - 1;
        let next = -1;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") next = i === last ? 0 : i + 1;
        else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = i === 0 ? last : i - 1;
        else if (e.key === "Home") next = 0;
        else if (e.key === "End") next = last;
        else return;
        e.preventDefault();
        goTo(next);
        steps[next].focus();
      }, { signal });
    });

    /* Clicking a step scrolls the page to that chapter, which then feeds back
       through onScroll — the scroll position stays the single source of truth,
       so the number can never disagree with where the reader actually is. */
    function goTo(i: number) {
      if (!pinned) {
        panels[i].scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
        show(i);
        return;
      }
      /* Document-absolute top, via the rect — NOT offsetTop. `.services` is
         `position:relative` (it has to be, to sit above the sticky hero), so it is the
         runway's offsetParent and offsetTop measures ~0 from it rather than from the
         page. That sent every step button to the top of the document. */
      const top = runway!.getBoundingClientRect().top + window.scrollY;
      const travel = runway!.offsetHeight - window.innerHeight;
      // aim at the middle of the chapter's band, so it lands clear of both edges
      const y = top + travel * ((i + 0.5) / count);
      window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
    }

    /* `current` is read at click time, not captured, so the arrows always step from
       wherever the reader actually is. The bounds check is deliberate belt-and-braces:
       the buttons are disabled at the ends, but a step that would leave the run must be
       a no-op rather than a scroll to a clamped position the reader is already at. */
    function step(delta: number) {
      const target = current + delta;
      if (target < 0 || target > count - 1) return;
      goTo(target);
    }
    prev?.addEventListener("click", () => step(-1), { signal });
    next?.addEventListener("click", () => step(1), { signal });

    /* ---- the pill bar inside each panel ---- */
    panels.forEach((panel) => {
      const tabs = Array.from(panel.querySelectorAll<HTMLElement>(".srv-tab"));
      const cards = Array.from(panel.querySelectorAll<HTMLElement>(".srv-card"));
      if (!tabs.length || tabs.length !== cards.length) return;
      const bar = panel.querySelector<HTMLElement>(".srv-tabs");

      const pick = (i: number, moveFocus?: boolean) => {
        tabs.forEach((t, j) => {
          const on = j === i;
          t.classList.toggle("is-active", on);
          t.setAttribute("aria-selected", on ? "true" : "false");
          t.tabIndex = on ? 0 : -1;
        });
        cards.forEach((c, j) => c.classList.toggle("is-active", j === i));
        if (moveFocus) tabs[i].focus();
        if (bar) {
          const t = tabs[i];
          const left = t.offsetLeft - (bar.clientWidth - t.offsetWidth) / 2;
          bar.scrollTo({ left, behavior: reduce ? "auto" : "smooth" });
        }
      };

      tabs.forEach((t, i) => {
        t.addEventListener("click", () => pick(i), { signal });
        t.addEventListener("keydown", (e) => {
          const last = tabs.length - 1;
          let next = -1;
          if (e.key === "ArrowRight" || e.key === "ArrowDown") next = i === last ? 0 : i + 1;
          else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = i === 0 ? last : i - 1;
          else if (e.key === "Home") next = 0;
          else if (e.key === "End") next = last;
          else return;
          e.preventDefault();
          pick(next, true);
        }, { signal });
      });

      pick(0);
    });

    /* ---- wiring ---- */
    runway.style.setProperty("--srv-steps", String(count));

    function apply() {
      /* Add the class first so the measurement below sees the pinned layout, then drop it
         again if the content overruns the frame. */
      section!.classList.toggle("is-pinned", wide.matches);
      if (wide.matches && !fits()) section!.classList.remove("is-pinned");
      pinned = section!.classList.contains("is-pinned");
      /* Synchronous, NOT via onScroll. onScroll defers into a requestAnimationFrame, so
         going through it would leave `current` at -1 until the next frame — and an arrow
         clicked in that window stepped from -1 instead of from the chapter on screen.
         Stacked, every panel is visible at once and a single "active" one is meaningless,
         so it resets to the first. */
      show(pinned ? indexFromScroll() : 0);
    }

    apply();
    window.addEventListener("scroll", onScroll, { passive: true, signal });
    window.addEventListener("resize", apply, { passive: true, signal });
    wide.addEventListener("change", apply, { signal });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      ac.abort();
      section.classList.remove("is-pinned");
    };
  }, [count]);

  return null;
}
