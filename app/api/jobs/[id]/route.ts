import { NextResponse } from "next/server";
import { eq, and, isNotNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { jobs } from "@/lib/db/schema";

export const runtime = "nodejs";

/**
 * GET /api/jobs/[id] — a single active job posting (full description).
 * Used by the careers page detail for server-rendered SEO.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const jobId = Number(id);
  if (!Number.isInteger(jobId) || jobId < 1) {
    return NextResponse.json({ error: "Invalid job id." }, { status: 400 });
  }

  try {
    const rows = await db
      .select()
      .from(jobs)
      .where(and(eq(jobs.id, jobId), eq(jobs.isActive, true), isNotNull(jobs.publishedAt)))
      .limit(1);

    if (!rows.length) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }
    return NextResponse.json({ job: rows[0] });
  } catch (e) {
    console.error("[jobs] get failed:", e);
    return NextResponse.json({ error: "Could not load the job." }, { status: 500 });
  }
}