import { NextResponse } from "next/server";
import { unlink } from "node:fs/promises";
import path from "node:path";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";
import { authFromRequest } from "@/lib/auth";

export const runtime = "nodejs";

/** DELETE /api/admin/media/[id] — remove the index row + file (admin only).
 *  Seeded assets under /assets/ are never deleted from disk; only uploads
 *  under /uploads/ are removed. */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await authFromRequest(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ error: "Invalid media id." }, { status: 400 });
  }

  const rows = await db.select().from(media).where(eq(media.id, id)).limit(1);
  if (!rows.length) {
    return NextResponse.json({ error: "Media not found." }, { status: 404 });
  }

  await db.delete(media).where(eq(media.id, id));

  // Best-effort file removal for uploads only (never touch /assets/ seeds).
  if (rows[0].path.startsWith("/uploads/")) {
    try {
      await unlink(path.join(process.cwd(), "public", rows[0].path));
    } catch {
      /* file already gone */
    }
  }

  return NextResponse.json({ ok: true });
}