import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { authFromRequest } from "@/lib/auth";
import { slugify } from "@/lib/blog";
import { validName, validText } from "@/lib/forms";

export const runtime = "nodejs";

/** GET /api/admin/posts/[id] — one post (for editing). */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await authFromRequest(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ error: "Invalid post id." }, { status: 400 });
  }
  const rows = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  if (!rows.length) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }
  return NextResponse.json({ post: rows[0] });
}

/** PATCH /api/admin/posts/[id] — update a post. */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await authFromRequest(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ error: "Invalid post id." }, { status: 400 });
  }

  const existing = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  if (!existing.length) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }
  const prev = existing[0];

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const str = (k: string) => (typeof body[k] === "string" ? body[k].trim() : "");
  const title = str("title");
  const content = str("content");
  const err = validName(title, 200) ?? validText(content || null, true, 50000);
  if (err) return NextResponse.json({ error: err }, { status: 422 });

  const status = body.status === "published" ? "published" : "draft";
  const nextPublishedAt =
    status === "published" && !prev.publishedAt ? new Date() : prev.publishedAt;
  const coverImageId = Number(body.coverImageId) || null;

  try {
    const rows = await db
      .update(posts)
      .set({
        title,
        slug: str("slug") ? slugify(str("slug")) : slugify(title),
        excerpt: str("excerpt") || null,
        content,
        category: str("category") || null,
        coverImageId: Number.isInteger(coverImageId) ? coverImageId : null,
        status,
        metaTitle: str("metaTitle") || null,
        metaDescription: str("metaDescription") || null,
        ctaText: str("ctaText") || null,
        ctaLink: str("ctaLink") || null,
        ctaLabel: str("ctaLabel") || null,
        publishedAt: nextPublishedAt,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, id))
      .returning({ id: posts.id, slug: posts.slug });

    return NextResponse.json({ post: rows[0] });
  } catch (e) {
    console.error("[posts] update failed:", e);
    return NextResponse.json({ error: "Could not save the post." }, { status: 500 });
  }
}