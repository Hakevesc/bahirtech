# Bahir Tech — Website

Static-marketing-site for **Bahir Tech PLC** (`bahirtech.com`), migrated onto
Next.js per [`bahirtech-implementation-plan.md`](./bahirtech-implementation-plan.md).

## Status — Phases 1–7 done (full plan)

The existing design was migrated *without redesign*; every phase of
[`bahirtech-implementation-plan.md`](./bahirtech-implementation-plan.md) is
implemented.

| Page / route              | What it provides |
| ------------------------- | ---------------- |
| `/` (home)                | 1:1 port — globe, tabs, carousel (now DB posts) |
| `/services` `/about` `/cybersecurity` | 1:1 port |
| `/blog` + `/blog/[slug]`  | Public blog index + CMS article pages |
| `/careers`                | Live jobs + apply flow (resume upload) |
| `/admin`                  | Login, dashboard, Posts, Media, Messages, Applications, Subscribers, Jobs |
| `/robots.txt`, `/sitemap.xml` | SEO crawler surface (routes auto-discovered) |
| Custom 404                | Branded "drifted out to sea" page |

Database-backed: **admin auth** (3), **blog CMS + media** (4), **careers/apply**
(5), **contact + newsletter** (6), and **SEO/perf** (7): `next/image` on blog
cards + covers, Open Graph/Twitter defaults, canonical + Article JSON-LD,
Organization JSON-LD, sitemap, robots, custom 404.

The original static pages are preserved unmodified under
[`legacy/`](./legacy/) — they are the source of truth for the remaining passes
and the SEO baseline.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # serve the production build
```

## Regenerating extracted static assets

The inline `<style>` and homepage behaviour `<script>` blocks were lifted
byte-for-byte out of the archived `legacy/*.html` pages by a helper:

```bash
npm run prepare:static
```

This writes:

- `app/styles/home.css`, `about.css`, `service.css`, `cybersecurity.css` —
  each page's inline CSS.
- `app/styles/site-chrome.css` — the shared header/footer stylesheet.
- `public/assets/js/index/home-fx.js` — the homepage behaviour IIFEs in original
  document order (globe, ocean, tabs, parallax, carousel).

Do not hand-edit the generated `app/styles/*.css` or `home-fx.js`; edit the
archived source (or the components) and re-run the extractor.

## Architecture notes

- `app/layout.tsx` loads the Ubuntu font and shared chrome CSS.
- `app/(site)/layout.tsx` wraps every page in the shared chrome
  (`components/site/SiteChrome.tsx`), which uses `usePathname()` to set the
  active nav link and header variant for client-side navigation.
- `components/site/`: `Header` (scroll-frost behaviour from `site-chrome.js`),
  `Footer` (newsletter), `Support` (WhatsApp panel), `PageLoader` (session-aware
  boot animation), `RevealFx` (scroll-reveal sweep from `page-ui.js`),
  `SiteChrome`.
- `components/home/`, `components/services/`, `components/about/`,
  `components/cybersecurity/`: the per-page section components. Content data
  lives in `content.(ts|tsx)` beside the page component.
- The public site lives under `public/`, served at `/assets/...` so every
  original image/logo URL keeps working unchanged.

## Database (PostgreSQL + Drizzle ORM)

The data layer is scaffolded and ready — one step remains: fill in the
connection string.

1. **Copy `.env.example` to `.env`** and set `DATABASE_URL` to your PostgreSQL
   connection string:
   ```
   DATABASE_URL=postgres://USER:PASSWORD@localhost:5432/bahirtech
   ```
2. **Create the tables** (migrations already generated):
   ```bash
   npm run db:migrate        # applies drizzle/ migrations
   ```
3. Verify:
   ```bash
   npm run db:check          # confirms the connection + lists tables
   npm run db:studio         # Drizzle Studio (browser UI) — migrate first
   ```

| Script          | What it does                                   |
| --------------- | ---------------------------------------------- |
| `db:check`      | Test the PostgreSQL connection                 |
| `db:generate`   | Diff `lib/db/schema.ts` → new SQL migration    |
| `db:migrate`    | Apply migrations to the database               |
| `db:push`       | Push schema directly (dev-only, no migration)  |
| `db:studio`     | Open Drizzle Studio                            |
| `db:admin`      | Create / reset the admin account (reads `ADMIN_*` from `.env`) |

Schema (`lib/db/schema.ts`) covers everything the implementation plan needs:

- `admins`, `sessions` — admin auth (Phase 3)
- `posts`, `media` — CMS blog + media library index (Phase 4)
- `jobs`, `applications` — careers + gated resume uploads (Phase 5)
- `contact_messages`, `subscribers` — contact + newsletter (Phase 6)

The DB client (`lib/db/client.ts`) is a lazy, `server-only` singleton pool so
pages that never touch data pay nothing. Uploaded files will live under
`storage/` (server filesystem, per the plan's zero-SaaS rule).

## Admin (Phase 3)

Custom credentials auth, no third-party SaaS:

- Passwords hashed with **scrypt** (Node built-in), sessions stored in Postgres
  (`sessions` table) with an httpOnly `bahir_admin` cookie.
- Create the admin account: set `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env`, then
  `npm run db:admin`.
- Sign in at `/admin/login` → dashboard → **Messages**, **Applications**,
  **Subscribers**, **Jobs**.
- Resume downloads in the Applications panel are session-protected (401 without
  a valid admin cookie).

## Features & API

| Endpoint | Purpose |
| -------- | ------- |
| `POST /api/admin/login` | Sign in → httpOnly session cookie |
| `POST /api/admin/logout` | Destroy the session |
| `GET /api/admin/posts` | List posts (admin) |
| `POST /api/admin/posts` | Create a post (admin) |
| `PATCH /api/admin/posts/[id]` | Update a post (admin) |
| `GET /api/admin/media` | List media (admin) |
| `POST /api/admin/media` | Upload an image (admin) |
| `DELETE /api/admin/media/[id]` | Delete an image (admin) |
| `POST /api/contact` | Store a contact message → `contact_messages` |
| `POST /api/subscribe` | Add newsletter subscriber → `subscribers` (idempotent) |
| `GET /api/jobs` | List open positions |
| `GET /api/jobs/[id]` | One position (full detail) |
| `POST /api/apply` | Submits an application (multipart resume → `storage/resumes/`) |
| `GET /api/applications/[id]/resume` | **Admin-only** resume download (session cookie) |

All public `POST` endpoints are rate-limited per IP (10 req / 10 min, in-memory).

**Blog CMS (Phase 4):** the homepage carousel and `/blog/[slug]` post pages are
now data-driven from the `posts` table. Admins write in the **Posts** editor
(title, slug, excerpt, category, cover, HTML content, SEO fields, publish
status) and manage uploads in the **Media library** (`/admin/media`,
`public/uploads/`). Post bodies are sanitized with `sanitize-html` before
rendering. Seed the original five articles with `npm run db:seed:blog`.

**Careers (Phase 5):** `/careers` lists live jobs from the database. In dev every
active job shows; in production only published (`is_active` + `published_at`)
jobs appear. Resumes are stored under `storage/resumes/<uuid>.<ext>` (git-ignored,
admin-only download).

## SEO & performance (Phase 7)

- `app/sitemap.ts` + `/sitemap.xml` — static routes + every published post.
- `app/robots.ts` + `/robots.txt` — allow public, disallow `/admin` + `/api`.
- `lib/site.ts` — single source of truth for URL/identity; drives `metadataBase`,
  Open Graph, Twitter and JSON-LD.
- `app/layout.tsx` — Organization JSON-LD + OG/Twitter defaults + keywords.
- `app/(site)/blog/[slug]/page.tsx` — per-post OG (`og:type=article` +
  `publishedTime`), canonical URL, Twitter `summary_large_image`, Article
  JSON-LD, and sanitized HTML body.
- `next/image` adopted on blog index cards + cover (with `fill`/`sizes`);
  assets remain native `<img>` where they are decorative (logos, icon marks).
- Branded 404 (`app/not-found.tsx`).

Set `NEXT_PUBLIC_SITE_URL` in `.env` to your real domain before deploying for
correct canonical / sitemap / OG URLs.