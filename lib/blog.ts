import "server-only";

import { and, desc, eq, isNotNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { admins, media, posts } from "@/lib/db/schema";

/** Shape used by the homepage carousel + blog listings. */
export type PostCard = {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  author: string | null;
  cover: string | null; // public URL
  tag: string | null;
  publishedAt: Date | null;
  minRead: number;
};

export function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "post"
  );
}

/** Published posts, newest first, with cover + author resolved. */
export async function getPublishedPosts(): Promise<PostCard[]> {
  const rows = await db
    .select({
      id: posts.id,
      slug: posts.slug,
      title: posts.title,
      excerpt: posts.excerpt,
      content: posts.content,
      author: admins.name,
      cover: media.path,
      category: posts.category,
      publishedAt: posts.publishedAt,
    })
    .from(posts)
    .leftJoin(media, eq(posts.coverImageId, media.id))
    .leftJoin(admins, eq(posts.authorId, admins.id))
    .where(
      and(eq(posts.status, "published"), isNotNull(posts.publishedAt))
    )
    .orderBy(desc(posts.publishedAt));

  return rows.map((r) => {
    const text = (r.content ?? r.excerpt ?? "").replace(/<[^>]+>/g, " ");
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return {
      id: r.id,
      slug: r.slug,
      title: r.title,
      excerpt: r.excerpt,
      author: r.author ?? "Bahir Tech",
      cover: r.cover,
      tag: r.category,
      publishedAt: r.publishedAt,
      minRead: Math.max(1, Math.ceil(words / 200)),
    };
  });
}

/** A single post by slug with cover + author; null when missing/not published. */
export async function getPostBySlug(
  slug: string
): Promise<(typeof posts.$inferSelect) & { cover: string | null; author: string | null } | null> {
  const rows = await db
    .select({
      post: posts,
      cover: media.path,
      author: admins.name,
    })
    .from(posts)
    .leftJoin(media, eq(posts.coverImageId, media.id))
    .leftJoin(admins, eq(posts.authorId, admins.id))
    .where(
      and(eq(posts.slug, slug), eq(posts.status, "published"), isNotNull(posts.publishedAt))
    )
    .limit(1);

  if (!rows.length) return null;
  const r = rows[0];
  return { ...r.post, cover: r.cover, author: r.author };
}

/** Get related published posts, excluding current post slug. */
export async function getRelatedPosts(currentSlug: string, limit = 3): Promise<PostCard[]> {
  const all = await getPublishedPosts();
  return all.filter((p) => p.slug !== currentSlug).slice(0, limit);
}