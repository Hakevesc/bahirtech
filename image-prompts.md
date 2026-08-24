# Bahir Tech — image generation prompts

Every image slot on the site, with a ready-to-paste generation prompt. Save each
file to `public/assets/Images/` using the **filename** given.

## Aspect ratios at a glance

Every slot uses `object-fit: cover`, so anything generated at the listed ratio
drops in without distortion. Where the CSS slot is a non-standard ratio, the
**Generate at** column gives the nearest ratio image generators actually offer —
`cover` trims the small difference. Keep the subject centred either way.

| # | Filename | Generate at | Pixels | CSS slot ratio |
|---|---|---|---|---|
| 1 | `blog_infra.jpg` | **4:3** | 1600 × 1200 | 4/3 |
| 2 | `blog_software.jpg` | **4:3** | 1600 × 1200 | 4/3 |
| 3 | `blog_security.jpg` | **4:3** | 1600 × 1200 | 4/3 |
| 4 | `blog_cloud.jpg` | **4:3** | 1600 × 1200 | 4/3 |
| 5 | `blog_team.jpg` | **4:3** | 1600 × 1200 | 4/3 |
| 6 | `Problems We Solve.jpg` | **3:4** | 1200 × 1600 | 5/7 desktop, 16/10 mobile |
| 7 | `Why Bahir Tech Team.jpg` | **16:9** | 1920 × 1080 | 16/10 |
| 8 | `Hero-Background.png` | **16:9** | 2560 × 1440 | full-bleed |
| 9–13 | `srv_*.jpg` (panel 0) | **4:3** | 1600 × 1200 | 4/3.2 desktop, 16/10 mobile |
| 14–18 | `srv_*.jpg` (panel 1) | **4:3** | 1600 × 1200 | 4/3.2 desktop, 16/10 mobile |
| 19–22 | `srv_sec_*.jpg` (panel 2) | **4:3** | 1600 × 1200 | 4/3.2 desktop, 16/10 mobile |

Only two ratios to generate: **4:3** for every card, **16:9** for the two wide
slots, and **3:4** for the single portrait. Nothing on the site needs 1:1, 9:16
or 4:5.

## Shared house style (append to any prompt)

> Photorealistic corporate photography, Ethiopian / East African subjects and
> setting, natural available light, shallow depth of field, muted cool palette
> anchored on deep navy (#0E1436, #232A60) with a single soft lemon-green
> accent (#AAC638) from a screen glow or signage. Calm and competent, never
> staged or stock-smiley. No text, no logos, no watermarks, no visible brand
> names on hardware.

---

## 1. Blog / Insights covers — 4:3, 1600 × 1200

Used by the Insights carousel on the home page and by the blog index. Seeded in
[scripts/seed-blog.mjs:19](scripts/seed-blog.mjs:19). The first card in the
carousel renders larger with a title overlaid across the lower third, so leave
that area uncluttered on `blog_infra.jpg`.

**`blog_infra.jpg`** — *How CBE's network stayed up during the busiest trading week in a decade*
> **4:3.** An Ethiopian network engineer standing in the cold aisle of a bank
> data centre, laptop balanced on one arm, reading link utilisation on the
> screen. Rows of server racks recede into the dark, status LEDs in blue and
> faint green. Late night, lit only by the racks and the laptop. Lower third
> kept dark and free of detail for an overlaid headline.

**`blog_software.jpg`** — *From idea to live system: a custom loan platform in 90 days*
> **4:3.** A small team of Ethiopian software developers at a shared desk in a
> bright Addis Ababa office, two of them looking at one monitor showing a loan
> application workflow, sticky notes on the glass wall behind. Daylight from a
> window on the left, plants on the desk.

**`blog_security.jpg`** — *Why endpoint detection stopped a ransomware attack before it spread*
> **4:3.** An Ethiopian security analyst at a three-monitor SOC desk at night,
> one screen showing an isolated-endpoint alert, the others showing quiet
> dashboards. Face lit by the screens, room otherwise dark navy.

**`blog_cloud.jpg`** — *Moving a government agency to cloud without a single hour of downtime*
> **4:3.** An Ethiopian cloud engineer working from a high-floor office at dusk,
> laptop and a second monitor showing a staged migration checklist, Addis Ababa
> skyline visible through the window behind. Warm interior light against cool
> blue evening outside.

**`blog_team.jpg`** — *Digital transformation is not a project — it is a discipline*
> **4:3.** An Ethiopian executive mid-presentation to a seated boardroom,
> gesturing at a wall screen showing a simple transformation roadmap. Modern
> meeting room, daylight, attentive colleagues in soft focus in the foreground.

---

## 2. Section photographs

**`Problems We Solve.jpg`** — **3:4 portrait, 1200 × 1600**
[components/home/Problems.tsx:87](components/home/Problems.tsx:87)
> **3:4 vertical portrait.** An Ethiopian systems engineer standing at a
> rack-mounted console in a server room, half-turned toward the camera, one hand
> on a KVM tray. Cabling and patch panels fill the frame behind. Cool blue light,
> a single green LED strip. Subject in the upper third, cabling filling the lower
> two thirds.

> Note: this slot flips to a wide 16:10 crop on mobile, so keep the subject
> horizontally centred — the top and bottom get trimmed on small screens.

**`Why Bahir Tech Team.jpg`** — **16:9, 1920 × 1080**
[components/home/CtaWhy.tsx:71](components/home/CtaWhy.tsx:71)
> **16:9.** A Bahir Tech delivery team of six Ethiopian engineers and project
> leads gathered around a table mid-review, laptops open, one person pointing at
> a shared screen. Bright modern Addis Ababa office, glass partitions, daylight.
> Candid working moment, nobody posing for the camera.

**`Hero-Background.png`** — **16:9, 2560 × 1440**
Hero backdrop behind the WebGL globe.
> **16:9.** Abstract deep-space field in near-black navy (#0E1436), fine
> scattered white star points of varying brightness, a faint lemon-green
> (#AAC638) atmospheric glow along the upper right. No planet, no horizon, no
> lens flare — this sits *behind* a 3D globe, so the centre must stay dark and
> empty.

---

## 3. Service panel photographs — 4:3, 1600 × 1200

Each service card has a photo slot. Panel 2 currently reuses one image for all
four cards — these replace it.

### Panel 0 — IT Infrastructure & Networking ([service-panel-0.ts](components/home/service-panel-0.ts))

**`srv_cloud_console.jpg`**
> **4:3.** An Ethiopian engineer at a two-monitor desk reviewing a cloud cost and
> capacity console, one hand on the mouse, notebook of migration waves beside
> the keyboard. Quiet office, evening, screens the main light source.

**`srv_datacenter.jpg`**
> **4:3.** The cold aisle of a well-kept data centre — symmetrical racks,
> contained aisle, clean vertical cable management, floor tiles. No people.
> Blue-white lighting, one perspective vanishing point down the middle.

**`srv_cabling.jpg`**
> **4:3.** Close crop of hands terminating structured cabling into a labelled
> patch panel, colour-coded Cat6 bundles combed neatly to the side, a label
> printer resting on the rack shelf. Sharp on the hands, rack soft behind.

**`srv_firewall.jpg`**
> **4:3.** An engineer kneeling at an open network cabinet configuring an edge
> firewall appliance, console cable running to a laptop on the floor beside
> them. Server room, low warm task light against cool ambient blue.

**`srv_helpdesk.jpg`**
> **4:3.** An Ethiopian IT support technician at a help desk wearing a headset,
> mid-call, ticket queue visible on the monitor, a colleague working in the
> background. Open-plan office, daylight.

### Panel 1 — Software Development ([service-panel-1.ts](components/home/service-panel-1.ts))

**`srv_devs.jpg`**
> **4:3.** Two Ethiopian developers pair-programming at one desk, code and a
> product UI side by side on a wide monitor, coffee cups and a notebook. Bright
> office, window light from the right.

**`srv_api.jpg`**
> **4:3.** A whiteboard covered in a hand-drawn system diagram — boxes, arrows,
> service names — with a developer's hand mid-marker-stroke, a laptop showing API
> documentation on the table below. Daylight, slight angle to the board.

**`srv_integration.jpg`**
> **4:3.** A working session at a meeting table: three people, a screen showing a
> data flow between ERP, HR and finance systems as connected nodes, printed field
> mappings spread out on the table. Daylight.

**`srv_mobile_field.jpg`**
> **4:3.** An Ethiopian field agent outdoors using a rugged smartphone app to
> record a delivery, van and rural road behind them, bright midday sun. The phone
> screen is legible but shows generic form fields, no readable text.

**`srv_pipeline.jpg`**
> **4:3.** A monitor filling most of the frame showing a green CI/CD pipeline
> with sequential build and deploy stages, a developer's shoulder and hand in
> soft focus at the edge. Dark room, screen-lit.

### Panel 2 — Cybersecurity Operations ([service-panel-2.ts](components/home/service-panel-2.ts))

**`srv_sec_network.jpg`**
> **4:3.** An Ethiopian security engineer reviewing live traffic on a laptop in a
> data centre at night, seated on a rack step, racks glowing blue on both sides.

**`srv_sec_endpoint.jpg`**
> **4:3.** A security engineer at a desk reviewing an endpoint inventory on
> screen — rows of device entries, one flagged — late evening, office dark behind
> them.

**`srv_sec_backup.jpg`**
> **4:3.** An engineer checking a backup and restore job on a console, tape or
> disk backup appliance visible in the rack beside them, small torch clipped to
> the rack door. Server room, night.

**`srv_sec_monitoring.jpg`**
> **4:3.** A lone Ethiopian security analyst in a 24/7 operations centre at 3am,
> wall of muted monitoring dashboards ahead, desk lamp off, only screen glow.
> Empty chairs either side to read as an overnight shift.

---

## 4. Existing images not currently referenced

These sit in `public/assets/Images/` but nothing links to them. Confirm whether
they are still wanted before regenerating: `Ape.jpg`, `Dog.jpg`, `Fox.jpg`,
`Lion.jpg`, `Guy in VR glass.jpg`, `Man using PC.jpg`,
`Globe & Hero man.jpg`, `Robot hands holding icons globe.jpg`,
`Enterprises & Corporations.jpg`, `Public Institutions.jpg`,
`SMEs & Growing Businesses.jpg`.

The three "Who We Serve" cards ([components/home/Serve.tsx:3](components/home/Serve.tsx:3))
are icon-only in the current design — the matching JPGs are unused.
