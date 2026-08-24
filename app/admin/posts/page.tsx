import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { admins, media, posts } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/require-admin";
import { PostsManager } from "./components/PostsManager";

export const dynamic = "force-dynamic";

export default async function AdminPosts() {
  await requireAdmin();

  const rows = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      status: posts.status,
      category: posts.category,
      cover: media.path,
      author: admins.name,
      publishedAt: posts.publishedAt,
      createdAt: posts.createdAt,
    })
    .from(posts)
    .leftJoin(media, eq(posts.coverImageId, media.id))
    .leftJoin(admins, eq(posts.authorId, admins.id))
    .orderBy(desc(posts.createdAt));

  return (
    <div className="adm-container">
      <div className="adm-page-header">
        <div className="adm-page-header__left">
          <h1>Blog Articles & Content</h1>
          <p>Author, format, and publish company news, tech deep-dives, and updates.</p>
        </div>
        <div className="adm-page-header__actions">
          <Link href="/admin/posts/new" className="adm-btn">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ width: 15, height: 15 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>New Post</span>
          </Link>
        </div>
      </div>

      <PostsManager initialPosts={rows} />
    </div>
  );
}