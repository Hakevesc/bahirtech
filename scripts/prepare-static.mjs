/**
 * prepare-static.mjs — migration helper (Phase 2).
 *
 * Lifts the inline <style> block out of every archived static page and the
 * homepage's behaviour <script> blocks into the Next.js app, byte-for-byte.
 *
 *   1. For each legacy/*.html page: inline <style>      -> app/styles/<name>.css
 *   2. The shared chrome stylesheet                     -> app/styles/site-chrome.css
 *   3. Homepage behaviour <script> bodies               -> public/assets/js/index/home-fx.js
 *
 * The homepage's behaviour is a sequence of IIFEs that talk to each other
 * through window-scoped globals (window.HeroFX, window.THREE). They are bundled
 * in their ORIGINAL document order so ordering stays identical to the static
 * page. Website chrome (loader, support panel) also lived in these blocks but
 * is now React components (components/site/), so those are excluded:
 *   - the page-loader block (bt:loaderSeen) + dismissal   -> PageLoader.tsx
 *   - the support-panel block (spopSend)                  -> Support.tsx
 *
 * Run from the repo root:  npm run prepare:static
 */
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const STYLE_OUT_DIR = path.join(ROOT, "app", "styles");
const OUT_JS = path.join(ROOT, "public", "assets", "js", "index", "home-fx.js");
const OUT_CSS_CHROME = path.join(ROOT, "app", "styles", "site-chrome.css");
const CHROME_CSS_SRC = path.join(
  ROOT,
  "public",
  "assets",
  "css",
  "site-chrome.css"
);

/** pages whose inline <style> becomes app/styles/<name>.css */
const CSS_PAGES = ["index", "about", "service", "cybersecurity"];

async function extractStyles(html, outPath) {
  const m = html.match(/<style>([\s\S]*?)<\/style>/);
  if (!m) throw new Error("no <style> block in " + outPath);
  let css = m[1].trim() + "\n";
  // Under Next.js the CSS is served through the bundler, so `url("public/...")`
  // must become a root-relative `/assets/...` URL (public/ is the site root).
  css = css.replaceAll('url("public/assets/', 'url("/assets/');
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, css);
  console.log("wrote", path.relative(ROOT, outPath));
}

async function main() {
  // ---- 1. per-page inline CSS ----------------------------------------------
  for (const name of CSS_PAGES) {
    const src = path.join(ROOT, "legacy", name + ".html");
    const html = await fs.readFile(src, "utf8");
    const out = path.join(
      STYLE_OUT_DIR,
      name === "index" ? "home.css" : name + ".css"
    );
    await extractStyles(html, out);
  }

  // ---- 2. chrome css --------------------------------------------------------
  const chrome = await fs.readFile(CHROME_CSS_SRC, "utf8");
  await fs.writeFile(OUT_CSS_CHROME, chrome.trim() + "\n");
  console.log("wrote", path.relative(ROOT, OUT_CSS_CHROME));

  // ---- 3. homepage behaviour bundle -----------------------------------------
  const indexHtml = await fs.readFile(path.join(ROOT, "legacy", "index.html"), "utf8");
  const scriptBlocks = [
    ...indexHtml.matchAll(/<script(?:[^>]*)>([\s\S]*?)<\/script>/g),
  ].map((m) => m[1]);

  const keep = scriptBlocks.filter((body) => {
    if (body.includes("bt:loaderSeen")) return false; // loader init
    if (body.includes("pageLoader")) return false; // loader dismissal
    if (body.includes("spopSend")) return false; // support panel -> React component
    return body.trim().length > 0; // drop matched <script src=...> (empty)
  });

  const bundle = keep
    .map(
      (body) =>
        `/* extracted from legacy/index.html — do not hand-edit; re-run npm run prepare:static */\n` +
        body.trim() +
        "\n"
    )
    .join("\n");

  await fs.mkdir(path.dirname(OUT_JS), { recursive: true });
  await fs.writeFile(OUT_JS, bundle);
  console.log(
    "wrote",
    path.relative(ROOT, OUT_JS),
    `(${keep.length} script blocks)`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});