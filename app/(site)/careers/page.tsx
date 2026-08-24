import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import "server-only";

import "../../styles/about.css";
import "../../styles/careers.css";
import { db } from "@/lib/db";
import { jobs } from "@/lib/db/schema";
import { CareersPage } from "@/components/careers/CareersPage";
import { RevealFx } from "@/components/site/RevealFx";

export const metadata: Metadata = {
  title: "Careers — Build the Digital Future from Addis Ababa",
  description:
    "Join Bahir Tech — engineering jobs in Addis Ababa for people who build secure, reliable systems for Ethiopia's most important organizations.",
};

export const dynamic = "force-dynamic";

/**
 * Careers listing. In development every active job is shown (so the page is
 * testable immediately); in production only published jobs (isActive + a
 * publishedAt date) appear.
 */
export default async function CareersRoute() {
  const rows = await db
    .select({
      id: jobs.id,
      slug: jobs.slug,
      title: jobs.title,
      department: jobs.department,
      location: jobs.location,
      type: jobs.type,
      summary: jobs.summary,
      isActive: jobs.isActive,
      publishedAt: jobs.publishedAt,
    })
    .from(jobs)
    .orderBy(desc(jobs.publishedAt))
    .catch(() => []);

  const list =
    process.env.NODE_ENV === "development"
      ? rows.filter((r) => r.isActive)
      : rows.filter(
          (r) => r.isActive && r.publishedAt != null && !Number.isNaN(r.publishedAt.getTime())
        );

  return (
    <>
      <CareersPage jobs={list} />
      <RevealFx />
    </>
  );
}