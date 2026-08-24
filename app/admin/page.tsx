import Link from "next/link";
import { desc, eq, count } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  applications,
  contactMessages,
  jobs,
  posts,
  subscribers,
} from "@/lib/db/schema";
import { requireAdmin } from "@/lib/require-admin";

export const dynamic = "force-dynamic";

function pad(n: number) {
  return String(n).padStart(2, "0");
}
function fmt(ts: Date | null | undefined) {
  if (!ts) return "—";
  const d = new Date(ts);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default async function AdminDashboard() {
  const admin = await requireAdmin();

  const [msgCount, newMsgCount, subCount, appCount, jobCount, openJobs, postCount] =
    await Promise.all([
      db.select({ v: count() }).from(contactMessages).then((r) => r[0].v),
      db
        .select({ v: count() })
        .from(contactMessages)
        .where(eq(contactMessages.status, "new"))
        .then((r) => r[0].v),
      db.select({ v: count() }).from(subscribers).then((r) => r[0].v),
      db.select({ v: count() }).from(applications).then((r) => r[0].v),
      db.select({ v: count() }).from(jobs).then((r) => r[0].v),
      db
        .select({ v: count() })
        .from(jobs)
        .where(eq(jobs.isActive, true))
        .then((r) => r[0].v),
      db.select({ v: count() }).from(posts).then((r) => r[0].v),
    ]);

  const recent = await db
    .select({
      id: contactMessages.id,
      firstName: contactMessages.firstName,
      lastName: contactMessages.lastName,
      email: contactMessages.email,
      service: contactMessages.service,
      message: contactMessages.message,
      status: contactMessages.status,
      createdAt: contactMessages.createdAt,
    })
    .from(contactMessages)
    .orderBy(desc(contactMessages.createdAt))
    .limit(6);

  const firstName = admin.name ? admin.name.split(" ")[0] : "Admin";

  return (
    <div className="adm-container">
      {/* Page Header */}
      <div className="adm-page-header">
        <div className="adm-page-header__left">
          <h1>Welcome back, {firstName}</h1>
          <p>Here is an overview of Bahir Tech platform activity and content status.</p>
        </div>
        <div className="adm-page-header__actions">
          <Link href="/admin/posts/new" className="adm-btn">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ width: 15, height: 15 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>New Post</span>
          </Link>
          <Link href="/admin/media" className="adm-btn adm-btn--secondary">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ width: 15, height: 15 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Media Library</span>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="adm-stats-grid">
        <Link href="/admin/messages" className="adm-stat-card">
          <div className="adm-stat-card__top">
            <div className="adm-stat-card__icon adm-stat-card__icon--brand">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            {newMsgCount > 0 ? (
              <span className="adm-stat-card__badge adm-stat-card__badge--new">{newMsgCount} new</span>
            ) : null}
          </div>
          <div>
            <div className="adm-stat-card__val">{String(msgCount)}</div>
            <div className="adm-stat-card__label">Messages & Inquiries</div>
          </div>
        </Link>

        <Link href="/admin/applications" className="adm-stat-card">
          <div className="adm-stat-card__top">
            <div className="adm-stat-card__icon adm-stat-card__icon--purple">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <div>
            <div className="adm-stat-card__val">{String(appCount)}</div>
            <div className="adm-stat-card__label">Job Applications</div>
          </div>
        </Link>

        <Link href="/admin/subscribers" className="adm-stat-card">
          <div className="adm-stat-card__top">
            <div className="adm-stat-card__icon adm-stat-card__icon--green">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div>
            <div className="adm-stat-card__val">{String(subCount)}</div>
            <div className="adm-stat-card__label">Newsletter Subscribers</div>
          </div>
        </Link>

        <Link href="/admin/jobs" className="adm-stat-card">
          <div className="adm-stat-card__top">
            <div className="adm-stat-card__icon adm-stat-card__icon--amber">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div>
            <div className="adm-stat-card__val">{String(openJobs)}</div>
            <div className="adm-stat-card__label">Open Roles ({jobCount} total)</div>
          </div>
        </Link>

        <Link href="/admin/posts" className="adm-stat-card">
          <div className="adm-stat-card__top">
            <div className="adm-stat-card__icon adm-stat-card__icon--cyan">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
          </div>
          <div>
            <div className="adm-stat-card__val">{String(postCount)}</div>
            <div className="adm-stat-card__label">Published & Draft Posts</div>
          </div>
        </Link>
      </div>

      {/* Main Grid: Recent Activity & Quick Controls */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem", alignItems: "start" }}>
        {/* Recent Messages Table */}
        <div className="adm-panel">
          <div className="adm-panel__header">
            <div className="adm-panel__title">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ width: 18, height: 18, color: "var(--adm-primary)" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Recent Contact Inquiries</span>
            </div>
            <Link href="/admin/messages" className="adm-btn adm-btn--ghost adm-btn--sm">
              <span>View all messages →</span>
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="adm-empty">
              <svg className="adm-empty__icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <div className="adm-empty__text">No contact messages received yet.</div>
            </div>
          ) : (
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Sender</th>
                    <th>Service</th>
                    <th>Status</th>
                    <th>Received</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <b>{m.firstName}{m.lastName ? ` ${m.lastName}` : ""}</b>
                        <div style={{ fontSize: "0.75rem", color: "var(--adm-ink-subtle)" }}>{m.email}</div>
                      </td>
                      <td>
                        <span style={{ fontSize: "0.8125rem" }}>{m.service ?? "General"}</span>
                      </td>
                      <td>
                        <span className={m.status === "new" ? "adm-badge adm-badge--primary" : "adm-badge"}>
                          {m.status}
                        </span>
                      </td>
                      <td style={{ fontSize: "0.78125rem", color: "var(--adm-ink-subtle)", whiteSpace: "nowrap" }}>
                        {fmt(m.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Launch & System Status */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Quick Actions Panel */}
          <div className="adm-panel">
            <div className="adm-panel__header">
              <div className="adm-panel__title">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ width: 18, height: 18, color: "var(--adm-primary)" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Quick Actions</span>
              </div>
            </div>
            <div className="adm-panel__body" style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              <Link
                href="/admin/posts/new"
                className="adm-btn adm-btn--secondary"
                style={{ justifyContent: "flex-start", padding: "0.65rem 0.85rem" }}
              >
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ width: 16, height: 16, color: "var(--adm-primary)" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Create Blog Article</span>
              </Link>
              <Link
                href="/admin/media"
                className="adm-btn adm-btn--secondary"
                style={{ justifyContent: "flex-start", padding: "0.65rem 0.85rem" }}
              >
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ width: 16, height: 16, color: "#10B981" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Upload Media Assets</span>
              </Link>
              <Link
                href="/admin/applications"
                className="adm-btn adm-btn--secondary"
                style={{ justifyContent: "flex-start", padding: "0.65rem 0.85rem" }}
              >
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ width: 16, height: 16, color: "#9333EA" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Review Job Applications</span>
              </Link>
            </div>
          </div>

          {/* System Health / Status */}
          <div className="adm-panel">
            <div className="adm-panel__header">
              <div className="adm-panel__title">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ width: 18, height: 18, color: "#10B981" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>System & Infrastructure</span>
              </div>
            </div>
            <div className="adm-panel__body" style={{ fontSize: "0.8125rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--adm-ink-muted)" }}>Database:</span>
                <span className="adm-badge adm-badge--success">Connected (PostgreSQL)</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--adm-ink-muted)" }}>Storage Engine:</span>
                <span className="adm-badge adm-badge--neutral">Local Filesystem</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--adm-ink-muted)" }}>Auth Protocol:</span>
                <span className="adm-badge adm-badge--neutral">Scrypt + HttpOnly</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--adm-ink-muted)" }}>Public Routing:</span>
                <span className="adm-badge adm-badge--success">Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}