"use client";

import { useEffect } from "react";
import { PageLoader } from "@/components/site/PageLoader";

const THREE_CDN =
  "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
const HOME_FX = "/assets/js/index/home-fx.js";
const THREE_MARK = 'script[data-home-fx="three"]';
const FX_MARK = 'script[data-home-fx="fx"]';

/**
 * Loads the homepage's behaviour layer, which is the exact bundle extracted
 * from legacy/index.html (scripts/prepare-static.mjs) — no hand-editing.
 *
 * Script order is preserved from the static page: THREE is fetched from CDN
 * (matches the original `<script src=...>` tag) and the extracted IIFEs then
 * run against it. The bundle is a set of `(function (){})();` blocks that land
 * on window-scoped globals (window.HeroFX), so it never collides with React's
 * own render.
 *
 * The script tags are appended to document.body and intentionally survive
 * client-side navigation (they behave like per-document scripts did when every
 * page was a fresh document). A marker attribute guards against duplicate
 * injection if the user navigates away and back to `/`, which would otherwise
 * wire event handlers twice.
 */
export function HomeFx() {
  useEffect(() => {
    if (!document.querySelector(THREE_MARK)) {
      const three = document.createElement("script");
      three.src = THREE_CDN;
      three.async = true;
      three.setAttribute("data-home-fx", "three");
      document.body.appendChild(three);
    }

    if (!document.querySelector(FX_MARK)) {
      const fx = document.createElement("script");
      fx.src = HOME_FX;
      fx.async = true;
      fx.setAttribute("data-home-fx", "fx");
      document.body.appendChild(fx);
    }
  }, []);

  return <PageLoader />;
}