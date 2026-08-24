import { requireAdmin } from "@/lib/require-admin";
import { MediaManager } from "./media-manager";

export const dynamic = "force-dynamic";

export default async function AdminMedia() {
  await requireAdmin();
  return (
    <div className="adm-container">
      <div className="adm-page-header">
        <div className="adm-page-header__left">
          <h1>Media Asset Library</h1>
          <p>Upload, organize, and manage image assets and covers across the site.</p>
        </div>
      </div>
      <MediaManager />
    </div>
  );
}