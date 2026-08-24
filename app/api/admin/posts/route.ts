import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { admins, media, posts } from "@/lib/db/schema";
import { authFromRequest } from "@/lib/auth";
import { slugify } from "@/lib/blog";
import { validName, validText } from "@/lib/forms";

export const runtime = "nodejs";

/** GET /api/admin/posts — all posts (draft + published), newest first. */
export async function GET(req: Request) {
  const admin = await authFromRequest(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const rows = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      status: posts.status,
      cover: media.path,
      author: admins.name,
      publishedAt: posts.publishedAt,
      createdAt: posts.createdAt,
    })
    .from(posts)
    .leftJoin(media, eq(posts.coverImageId, media.id))
    .leftJoin(admins, eq(posts.authorId, admins.id))
    .orderBy(desc(posts.createdAt));

  return NextResponse.json({ posts: rows });
}

/** POST /api/admin/posts — create a post (draft by default). */
export async function POST(req: Request) {
  const admin = await authFromRequest(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const str = (k: string) => (typeof body[k] === "string" ? body[k].trim() : "");

  const title = str("title");
  const err = validName(title, 200) ?? validText(str("content") || null, true, 50000);
  if (err) return NextResponse.json({ error: err }, { status: 422 });

  const slug = str("slug") ? slugify(str("slug")) : slugify(title);
  const status = body.status === "published" ? "published" : "draft";
  const coverImageId = Number(body.coverImageId) || null;

  const now = new Date();
  try {
    const rows = await db
      .insert(posts)
      .values({
        title,
        slug,
        excerpt: str("excerpt") || null,
        content: str("content"),
        category: str("category") || null,
        coverImageId: coverImageId && Number.isInteger(coverImageId) ? coverImageId : null,
        status,
        metaTitle: str("metaTitle") || null,
        metaDescription: str("metaDescription") || null,
        ctaText: str("ctaText") || null,
        ctaLink: str("ctaLink") || null,
        ctaLabel: str("ctaLabel") || null,
        authorId: admin.id,
        publishedAt: status === "published" ? now : null,
      })
      .returning({ id: posts.id, slug: posts.slug });

    return NextResponse.json({ post: rows[0] }, { status: 201 });
  } catch (e) {
    console.error("[posts] create failed:", e);
    return NextResponse.json({ error: "Could not create the post." }, { status: 500 });
  }
}