import "./admin.css";
import { getOptionalAdmin } from "@/lib/require-admin";
import { AdminNav } from "./admin-nav";

export const metadata = { title: "Admin Portal — Bahir Tech" };

/**
 * Admin area layout. Shows the modern top bar + nav when signed in; the login
 * page is rendered inside the same layout without the bar.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getOptionalAdmin();

  return (
    <div className="adm-shell">
      {admin ? <AdminNav admin={admin} /> : null}
      <main className={admin ? "adm-main" : undefined}>{children}</main>
      {admin ? (
        <footer className="adm-footer">
          Bahir Tech Enterprise Portal · Signed in as {admin.name} ({admin.email})
        </footer>
      ) : null}
    </div>
  );
}