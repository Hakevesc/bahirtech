import { NextResponse } from "next/server";
import { stat, readFile } from "node:fs/promises";
import path from "node:path";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { applications } from "@/lib/db/schema";
import { authFromRequest } from "@/lib/auth";

export const runtime = "nodejs";

const RESUME_DIR = path.join(process.cwd(), "storage", "resumes");

export const dynamic = "force-dynamic";

/**
 * GET /api/applications/[id]/resume — guard: signed-in admin only (Phase 3).
 * The browser sends the httpOnly `bahir_admin` cookie with the request.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await authFromRequest(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const appId = Number(id);
  if (!Number.isInteger(appId) || appId < 1) {
    return NextResponse.json({ error: "Invalid application id." }, { status: 400 });
  }

  try {
    const rows = await db
      .select({ resumePath: applications.resumePath })
      .from(applications)
      .where(eq(applications.id, appId))
      .limit(1);
    if (!rows.length) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    const storedName = path.basename(rows[0].resumePath);
    const full = path.join(RESUME_DIR, storedName);
    await stat(full); // throws if missing

    const ext = path.extname(storedName).toLowerCase();
    const mime =
      ext === ".pdf"
        ? "application/pdf"
        : ext === ".doc"
          ? "application/msword"
          : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    const data = await readFile(full);
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": mime,
        "Content-Disposition": `attachment; filename="resume-${appId}${ext}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (e) {
    console.error("[applications] resume read failed:", e);
    return NextResponse.json({ error: "Resume not found." }, { status: 404 });
  }
}