import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/require-admin";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { PostForm } from "../components/PostForm";

export const dynamic = "force-dynamic";

export default async function EditPost({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const id = Number((await params).id);
  const rows = await (Number.isInteger(id)
    ? db.select().from(posts).where(eq(posts.id, id)).limit(1)
    : Promise.resolve([]));

  if (!rows.length) notFound();

  return (
    <div className="adm-container">
      <div className="adm-page-header">
        <div className="adm-page-header__left">
          <h1>Edit Article</h1>
          <p>Update article content, cover image, and metadata.</p>
        </div>
      </div>
      <PostForm post={rows[0]} />
    </div>
  );
}