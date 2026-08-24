import { requireAdmin } from "@/lib/require-admin";
import { PostForm } from "../components/PostForm";

export const dynamic = "force-dynamic";

export default async function NewPost() {
  await requireAdmin();
  return (
    <div className="adm-container">
      <div className="adm-page-header">
        <div className="adm-page-header__left">
          <h1>New Article</h1>
          <p>Draft and publish a new article to the Bahir Tech blog.</p>
        </div>
      </div>
      <PostForm post={null} />
    </div>
  );
}