import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";
import { authFromRequest } from "@/lib/auth";

export const runtime = "nodejs";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);

function extFor(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/gif":
      return "gif";
    case "image/webp":
      return "webp";
    default:
      return "bin";
  }
}

/** GET /api/admin/media — list the media library (admin only). */
export async function GET(req: Request) {
  const admin = await authFromRequest(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const rows = await db.select().from(media).orderBy(desc(media.createdAt));
  return NextResponse.json({ media: rows });
}

/** POST /api/admin/media — upload an image to public/uploads + index it. */
export async function POST(req: Request) {
  const admin = await authFromRequest(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "A file is required." }, { status: 422 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: "Only JPG, PNG, GIF or WebP images are allowed." },
      { status: 422 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image must be under 8 MB." }, { status: 422 });
  }

  const storedName = `${randomUUID()}.${extFor(file.type)}`;
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(
      path.join(UPLOAD_DIR, storedName),
      Buffer.from(await file.arrayBuffer())
    );
    const rows = await db
      .insert(media)
      .values({
        name: file.name,
        storedName,
        path: `/uploads/${storedName}`,
        mimeType: file.type,
        sizeBytes: file.size,
      })
      .returning();
    return NextResponse.json({ media: rows[0] }, { status: 201 });
  } catch (e) {
    console.error("[media] upload failed:", e);
    return NextResponse.json({ error: "Could not save the image." }, { status: 500 });
  }
}