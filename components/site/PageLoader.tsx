"use client";

import { useEffect, useState } from "react";

const KEY = "bt:loaderSeen";
const IFRAME_SRC = "/B-Logo-Icon-Web-loader.html";
const MIN_MS = 3200;
const MAX_MS = 12000;

type State = "waiting" | "seen" | "playing";

/**
 * Session-aware boot animation, ported from the static homepage's inline
 * loader script (legacy/index.html).
 *
 *  - Returning visitor in the same session (sessionStorage bt:loaderSeen)
 *    -> the overlay is never shown and scroll is never locked.
 *  - First visit in this session -> overlay plays the animation iframe,
 *    unlocks scrolling after ~3.2s or window.onload (12s hard cap).
 *
 * Mounting the read + one-time state advance inside a `requestAnimationFrame`
 * callback keeps the effect from mutating React state synchronously (the
 * linter's `set-state-in-effect` rule) while still running immediately.
 */
export function PageLoader() {
  const [state, setState] = useState<State>("waiting");

  useEffect(() => {
    const timers: number[] = [];
    let rafId = 0;

    const init = () => {
      let seen = false;
      try {
        seen = window.sessionStorage.getItem(KEY) === "1";
      } catch {
        /* privacy mode: fall through to showing the loader */
      }

      if (seen) {
        setState("seen");
        return;
      }

      try {
        window.sessionStorage.setItem(KEY, "1");
      } catch {
        /* ignore */
      }
      setState("playing");
      document.body.classList.add("is-loading");

      let ready = false;
      let elapsed = false;
      let dismissed = false;

      const dismiss = () => {
        if (dismissed || !ready || !elapsed) return;
        dismissed = true;
        const el = document.getElementById("pageLoader");
        if (el) {
          el.classList.add("is-hidden");
          document.body.classList.remove("is-loading");
          window.setTimeout(() => {
            if (el.parentNode) el.parentNode.removeChild(el);
          }, 700);
        }
      };
      const forceReady = () => {
        ready = true;
        dismiss();
      };

      window.addEventListener("load", forceReady);
      timers.push(window.setTimeout(() => {
        elapsed = true;
        dismiss();
      }, MIN_MS));
      timers.push(window.setTimeout(forceReady, MAX_MS));

      cleanup = () => {
        window.removeEventListener("load", forceReady);
        timers.forEach((t) => window.clearTimeout(t));
      };
    };

    let cleanup = () => {};
    rafId = requestAnimationFrame(init);

    return () => {
      cancelAnimationFrame(rafId);
      cleanup();
    };
  }, []);

  if (state === "seen") return null;
  if (state === "waiting") {
    /* first server/hydration pass: keep the anchor but fetch no iframe yet */
    return (
      <div id="pageLoader" className="page-loader" aria-label="Loading…" />
    );
  }
  return (
    <div id="pageLoader" className="page-loader" aria-label="Loading…">
      <iframe src={IFRAME_SRC} title="Loading animation" aria-hidden="true" />
    </div>
  );
}