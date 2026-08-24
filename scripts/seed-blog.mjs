/**
 * seed-blog.mjs â€” idempotent blog seed for local/dev.
 * Inserts media rows for the five existing blog images (public/assets/Images/)
 * and five published posts matching the original homepage cards â€” but from the
 * CMS, not hardcoded. Skips when posts already exist.
 *
 * Run:  npm run db:seed:blog
 */
import "dotenv/config";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("âœ— DATABASE_URL not set in .env");
  process.exit(1);
}
const sql = postgres(url, { max: 1 });

const IMAGES = [
  ["blog_infra.jpg", "infra.jpg", "/assets/Images/blog_infra.jpg", "Infrastructure Team", "Infrastructure"],
  ["blog_software.jpg", "software.jpg", "/assets/Images/blog_software.jpg", "Software Team", "Software"],
  ["blog_security.jpg", "security.jpg", "/assets/Images/blog_security.jpg", "Security Team", "Cybersecurity"],
  ["blog_cloud.jpg", "cloud.jpg", "/assets/Images/blog_cloud.jpg", "Cloud Team", "Cloud"],
  ["blog_team.jpg", "team.jpg", "/assets/Images/blog_team.jpg", "Leadership", "Leadership"],
];

const POSTS = [
  {
    title: "How CBE's network stayed up during the busiest trading week in a decade",
    category: 'Infrastructure',
    excerpt:
      "Capacity planning, segmented failover and a rehearsed runbook kept a bank's systems online when it mattered most.",
    content:
      "<p>When a bank's busiest trading week in a decade arrives, the network is not where you want surprises.</p>" +
      "<h2>Planning for the peak, not hoping for it</h2>" +
      "<p>We modelled the expected load against actual link utilisation, aged the firewall rules, and rehearsed the failover path twice before cutover.</p>" +
      "<ul><li>Segmented the trading floor from general traffic</li><li>Rehearsed the rollback path</li><li>Staffed through every trading hour</li></ul>" +
      "<p>The week ran at 96% utilisation on the busiest links â€” and zero outages.</p>",
  },
  {
    title: "From idea to live system: how we built a custom loan platform in 90 days",
    category: 'Software',
    excerpt: "A lending team needed end-to-end workflows, audit trails and integrations â€” delivered in one quarter.",
    content:
      "<p>Requirement workshops in week one, a working core in week six, and production by day ninety.</p>" +
      "<p>Small releases the team could actually use, and a handover that included source, documentation and on-site training.</p>",
  },
  {
    title: "Why endpoint detection stopped a ransomware attack before it spread",
    category: 'Cybersecurity',
    excerpt: "The difference between a monitored estate and a flat network shows up in the first five minutes.",
    content:
      "<p>An attacker landed on one laptop. Within minutes the endpoint agent isolated it, and the segment rules kept the rest of the estate unreachable.</p>" +
      "<blockquote>Stopping the spread comes ahead of understanding it.</blockquote>" +
      "<p>The incident report was written, the hole closed, and monitoring tightened â€” all before 9am.</p>",
  },
  {
    title: "Moving a government agency to cloud without a single hour of downtime",
    category: 'Cloud',
    excerpt: "Staged cutovers, data checksums and a rehearsed rollback moved an agency's core systems with no service break.",
    content:
      "<p>Public services cannot wait on a migration. We moved workloads in staged waves, outside business hours, verifying every subset against the source before advancing.</p>" +
      "<ul><li>Waves sized to the rollback window</li><li>Checksum-verified data sync</li><li>Read-only shadow runs first</li></ul>",
  },
  {
    title: "Digital transformation is not a project â€” it is a discipline",
    category: 'Leadership',
    excerpt: "The teams that treat transformation as a habit, not an event, are the ones that keep what they build.",
    content:
      "<p>Commissioning a platform is the easy part. The work is in the review cycles, the ownership, and the quiet discipline of keeping systems current.</p>" +
      "<p>That is the difference between digital transformation and digital theatre.</p>",
  },
];

try {
  const count = await sql`SELECT count(*)::int AS n FROM posts`;
  if (count[0].n > 0) {
    console.log("â†’ Posts already exist â€” skipping seed.");
  } else {
    const admin = await sql`SELECT id FROM admins ORDER BY id LIMIT 1`;
    const adminId = admin[0]?.id ?? null;

    const coverIds = [];
    for (const [name, dir, path] of IMAGES) {
      const existing = await sql`SELECT id FROM media WHERE path = ${path} LIMIT 1`;
      if (existing[0]) {
        coverIds.push(existing[0].id);
        continue;
      }
      const ins = await sql`
        INSERT INTO media (name, stored_name, path, mime_type, size_bytes)
        VALUES (${name}, ${dir}, ${path}, 'image/jpeg', 0) RETURNING id`;
      coverIds.push(ins[0].id);
    }

    for (let i = 0; i < POSTS.length; i++) {
      const p = POSTS[i];
      const slug = p.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      await sql`
        INSERT INTO posts
          (title, slug, excerpt, content, category, cover_image_id, status, author_id, published_at, created_at, updated_at)
        VALUES
          (${p.title}, ${slug}, ${p.excerpt}, ${p.content}, ${p.category}, ${coverIds[i]}, 'published', ${adminId},
           now() - (${i} * interval '1 day'), now() - (${i} * interval '1 day'), now())`;
    }
    console.log(`âœ“ Seeded ${POSTS.length} published posts + media rows.`);
  }
} catch (err) {
  console.error("âœ— Seed failed:", err.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
