import { NextResponse } from "next/server";
import { eq, and, desc, isNotNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { jobs } from "@/lib/db/schema";

export const runtime = "nodejs";

/**
 * GET /api/jobs — list active job postings (published), newest first.
 * Public endpoint; `isActive` + non-null publishedAt filter only.
 */
export async function GET() {
  try {
    const rows = await db
      .select({
        id: jobs.id,
        slug: jobs.slug,
        title: jobs.title,
        department: jobs.department,
        location: jobs.location,
        type: jobs.type,
        summary: jobs.summary,
        publishedAt: jobs.publishedAt,
      })
      .from(jobs)
      .where(and(eq(jobs.isActive, true), isNotNull(jobs.publishedAt)))
      .orderBy(desc(jobs.publishedAt));

    return NextResponse.json({ jobs: rows });
  } catch (e) {
    console.error("[jobs] list failed:", e);
    return NextResponse.json({ error: "Could not load jobs." }, { status: 500 });
  }
}