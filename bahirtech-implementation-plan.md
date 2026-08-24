# Bahir Tech Website Migration — Full Implementation Plan

**Core requirement:** No recurring paid third-party SaaS. The only ongoing costs are the **domain** and **hosting/server**. Everything else (framework, database, auth, storage, email transport) must run on infrastructure you already pay for.

---

## 1. Decision You Need to Make First

Before Phase 1 starts, confirm one thing with your hosting provider — it changes several downstream decisions:

> **Does your hosting plan support running a Node.js / Next.js application, PostgreSQL, and outbound SMTP?**

| Your hosting supports…            | What you do |
| ---------------------------------- | ----------- |
| Node.js/Next.js + PostgreSQL + SMTP | Deploy directly on existing hosting. No VPS needed. |
| Node.js/Next.js only (DB external)  | Use hosting for the app; use a free/self-hosted Postgres instance or the hosting's optional DB add-on. |
| Neither (shared/static hosting only)| You'll need a VPS (e.g. a basic Linux box) to run Next.js + PostgreSQL yourself. |

**Action item:** find out (a) whether Node.js apps are supported, (b) whether PostgreSQL is available, (c) whether SMTP sending is allowed and what the credentials/limits are. This determines whether Phase 8 is "deploy to existing hosting" or "provision and harden a VPS."

---

## 2. Recommended Stack

| Layer        | Choice                                          |
| ------------ | ------------------------------------------------ |
| Framework    | Next.js 15/16                                    |
| Language     | TypeScript                                        |
| Styling      | CSS Modules                                       |
| Database     | PostgreSQL (on hosting, or on your own server/VPS) |
| ORM          | Drizzle ORM                                       |
| Auth         | Auth.js / custom credentials auth (one admin role to start) |
| File storage | Server filesystem (`storage/`, `public/uploads/`) |
| Email        | Hosting provider's SMTP (`info@bahirtech.com` etc.), if the hosting supports it — otherwise no email transport initially |
| Rich text    | Tiptap                                            |
| Forms        | React Hook Form + Zod                             |
| Deployment   | Existing hosting if it supports Next.js/Node — otherwise a VPS |
| Images       | `next/image` over local files                     |
| Icons        | Lucide                                             |

**Recurring third-party SaaS cost: $0.** You pay for domain + hosting only.

---

## 3. Architecture

```text
                        BAHIR TECH
                            │
                            ▼
                     Hosting / Server
                            │
          ┌─────────────────┼─────────────────┐
          ▼                 ▼                 ▼
       Next.js           PostgreSQL          SMTP
     (Website + Admin)    (all data)     (hosting mailbox,
          │                                if supported —
          ├── Public Website                otherwise: none
          ├── Admin CMS                      initially)
          ├── Blog
          ├── Careers
          ├── Applications
          ├── Contact Messages
          ├── Subscribers
          └── Media Library
```

If SMTP isn't available or is restricted by the host, the system still works end-to-end — contact messages, applications, and subscribers are simply stored in PostgreSQL and reviewed in the Admin panel instead of triggering an email. SMTP can be turned on later with zero changes to the data model.

---

## 4. Database Schema

```text
users
posts
post_tags
jobs
applications
subscribers
contact_messages
media
settings
```

### `posts`
```text
id
slug
title
excerpt
body
cover_image
author_id
status
published_at
meta_title
meta_description
created_at
updated_at
```

### `applications`
```text
id
job_id
name
email
phone
cover_letter
resume_path        -- server file path, not an external URL
status
applied_at
```
Resumes live at e.g. `/uploads/resumes/application-8923.pdf` and are **not** publicly exposed. Access is gated:
```text
Admin → Auth check → /api/applications/:id/resume → streams PDF
```

### `contact_messages`
```text
id
name
email
phone
company
service
message
status
created_at
read_at
```

### `media`
```text
id
filename
original_name
path
mime_type
size
width
height
created_at
```

---

## 5. Folder Structure

```text
bahirtech/
│
├── app/
│   ├── (site)/
│   │   ├── page.tsx
│   │   ├── about/
│   │   ├── services/
│   │   ├── cybersecurity/
│   │   ├── blog/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/
│   │   └── careers/
│   │       ├── page.tsx
│   │       └── [id]/
│   │
│   ├── admin/
│   │   ├── page.tsx
│   │   ├── blog/
│   │   ├── careers/
│   │   ├── applications/
│   │   ├── messages/
│   │   ├── subscribers/
│   │   ├── media/
│   │   └── settings/
│   │
│   ├── api/
│   │   ├── auth/
│   │   ├── uploads/
│   │   ├── applications/
│   │   └── ...
│   │
│   └── layout.tsx
│
├── components/
│   ├── site/
│   ├── blog/
│   ├── careers/
│   ├── contact/
│   └── admin/
│
├── db/
│   ├── index.ts
│   └── schema.ts
│
├── lib/
│   ├── actions/
│   ├── auth/
│   ├── uploads/
│   ├── mail/            -- SMTP wrapper, no-op if not configured
│   ├── validation/
│   └── utils/
│
├── public/
│   ├── assets/
│   └── images/
│
├── storage/              -- kept OUTSIDE public/ for private files
│   ├── blog/
│   ├── careers/
│   └── resumes/
│
└── ...
```

---

## 6. Admin / CMS Structure

```text
/admin
│
├── Dashboard
├── Content
│   ├── Blog (All Posts / Drafts / New Post)
│   └── Media
├── Careers (Jobs / New Job / Applications)
├── Subscribers
├── Messages
└── Settings
```

Dashboard summary:
```text
┌─────────────────────────────────────────────┐
│ Dashboard                                    │
├────────────┬────────────┬──────────┬────────┤
│ 24 Posts   │ 3 Jobs     │ 12 Apps  │ 86 Subs│
└────────────┴────────────┴──────────┴────────┘
Recent Posts
Recent Applications
Recent Messages
```

---

## 7. Phased Implementation Plan

### Phase 1 — Architecture, Hosting Verification & Database
- Confirm hosting capabilities (Node.js/Next.js, PostgreSQL, SMTP) — see Section 1
- Next.js + TypeScript setup
- Drizzle + PostgreSQL connection (local dev now, real host/VPS credentials later)
- Environment configuration (`.env` for DB, SMTP if available, auth secrets)
- Auth foundation

### Phase 2 — Migrate Existing Website (1:1, no redesign)
- Convert current HTML into React/TSX + CSS Modules
- Preserve exactly: Three.js globe, sticky hero, scroll-driven animation, service tabs (with custom tab/keyboard behavior and auto-cycling), reveal animations, blog carousel, support/contact UI
- Goal: visually and behaviorally identical to the current site — no design changes yet

### Phase 3 — Admin Authentication
- `/admin/login`, `/admin`
- Login/logout, password hashing, sessions, protected routes
- Single admin role only (no RBAC yet)

### Phase 4 — CMS (Blog + Media)
- Blog CRUD, drafts, publish workflow, meta title/description fields
- Local media library (`/admin/media`):
  - Upload, list, copy/select, delete
  - Shows file size and dimensions
  - Insertable into blog body via Tiptap
- Remove all hardcoded blog content from the static HTML

### Phase 5 — Careers
- Jobs CRUD
- Applications with resume upload to `storage/resumes/`
- Gated resume download via authenticated API route
- Application status tracking

### Phase 6 — Contact + Subscribers
- Contact form → `contact_messages` table → Admin → Messages
- Newsletter subscribers → `subscribers` table
- **No email dependency required for this phase to function** — everything is visible in Admin
- If hosting SMTP is confirmed available: wire up notification emails (contact received, new application, etc.) through the hosting mailbox; otherwise leave as a stubbed `lib/mail/` module to enable later

### Phase 7 — SEO + Performance
- Static + dynamic metadata (especially per blog post)
- Open Graph, Twitter/X cards
- Sitemap, `robots.txt`, canonical URLs, JSON-LD
- `next/image`, semantic HTML, custom 404, redirects
- Preserve and extend the existing site's current title/meta description as the SEO baseline

### Phase 8 — Production Deployment
Branches depending on the Section 1 decision:

**If existing hosting supports Next.js/Node + PostgreSQL:**
```text
yourdomain.com → Hosting platform → Next.js app → PostgreSQL (hosting-provided or same host)
```
Configure per the hosting provider's deployment method (may be Git-based, a Node app manager panel, etc.)

**If a VPS is required instead:**
```text
Internet → Nginx → Next.js (:3000) → PostgreSQL (:5432)
```
Configure: HTTPS, firewall, PM2/systemd for process management, automated DB backups, log rotation.

**Either way:** SMTP is wired to the hosting mailbox if available and permitted by the provider; otherwise email stays deferred with no impact on functionality.

---

## 8. Cost Model

| Item                            |     Cost |
| -------------------------------- | -------: |
| Domain                            | Paid |
| Hosting / VPS                     | Paid |
| Next.js, React, TypeScript        | $0 |
| PostgreSQL                        | $0 |
| Drizzle, Auth.js, Tiptap          | $0 |
| React Hook Form, Zod, Lucide      | $0 |
| File storage (server filesystem)  | $0 |
| Email (hosting SMTP, if available)| $0 |
| Admin CMS, Blog, Careers, Applications, Newsletter | $0 |
| **Recurring third-party SaaS**    | **$0** |

**Philosophy: pay for infrastructure, not features.**

---

## 9. Sequencing Discipline

Migrate the current design 1:1 first → make it dynamic → add the admin CMS → then optimize (SEO/performance). Don't redesign and migrate at the same time — this is what keeps the existing site from breaking mid-project.
