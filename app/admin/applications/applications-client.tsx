"use client";

import { useState } from "react";

type ApplicationItem = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  status: string;
  coverLetter: string | null;
  createdAt: Date | string | null;
  jobTitle: string;
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}
function fmt(ts: Date | string | null | undefined) {
  if (!ts) return "—";
  const d = new Date(ts);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function ApplicationsClient({ initialApplications }: { initialApplications: ApplicationItem[] }) {
  const [search, setSearch] = useState("");
  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null);

  const filtered = initialApplications.filter((a) => {
    const fullName = `${a.firstName} ${a.lastName}`.toLowerCase();
    return (
      fullName.includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      a.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
      (a.phone && a.phone.includes(search))
    );
  });

  return (
    <div className="adm-panel">
      {/* Header & Search */}
      <div className="adm-panel__header">
        <div className="adm-toolbar">
          <div className="adm-search-input">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search candidate or job…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div style={{ fontSize: "0.8125rem", color: "var(--adm-ink-muted)" }}>
          Showing <b>{filtered.length}</b> of {initialApplications.length} applications
        </div>
      </div>

      {/* Applications Table */}
      {filtered.length === 0 ? (
        <div className="adm-empty">
          <svg className="adm-empty__icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <div className="adm-empty__text">
            {initialApplications.length === 0 ? "No job applications received yet." : "No applications matching your search."}
          </div>
        </div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Target Position</th>
                <th>Contact</th>
                <th>Cover Letter</th>
                <th>Resume File</th>
                <th>Applied Date</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id}>
                  <td>
                    <b>{a.firstName} {a.lastName}</b>
                    <div>
                      <span className="adm-badge adm-badge--neutral" style={{ marginTop: "0.2rem" }}>
                        {a.status}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: "var(--adm-ink)" }}>{a.jobTitle}</span>
                  </td>
                  <td>
                    <a href={`mailto:${a.email}`} style={{ color: "var(--adm-green-ink)", textDecoration: "none", fontWeight: 600 }}>
                      {a.email}
                    </a>
                    {a.phone ? (
                      <div style={{ fontSize: "0.75rem", color: "var(--adm-ink-subtle)" }}>{a.phone}</div>
                    ) : null}
                  </td>
                  <td>
                    <div
                      style={{
                        maxWidth: 220,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontSize: "0.8125rem",
                        color: "var(--adm-ink-muted)",
                      }}
                    >
                      {a.coverLetter || "—"}
                    </div>
                  </td>
                  <td>
                    <a
                      href={`/api/applications/${a.id}/resume`}
                      download
                      className="adm-btn adm-btn--secondary adm-btn--sm"
                      style={{ gap: "0.3rem" }}
                    >
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ width: 13, height: 13, color: "var(--adm-primary)" }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Download</span>
                    </a>
                  </td>
                  <td style={{ fontSize: "0.78125rem", color: "var(--adm-ink-subtle)", whiteSpace: "nowrap" }}>
                    {fmt(a.createdAt)}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      onClick={() => setSelectedApp(a)}
                      className="adm-btn adm-btn--ghost adm-btn--sm"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Applicant Detail Modal */}
      {selectedApp ? (
        <div className="adm-modal-backdrop" onClick={() => setSelectedApp(null)}>
          <div className="adm-modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
              <div>
                <h3 style={{ margin: "0 0 0.25rem", fontSize: "1.25rem", color: "var(--adm-ink)" }}>
                  {selectedApp.firstName} {selectedApp.lastName}
                </h3>
                <div style={{ fontSize: "0.8125rem", color: "var(--adm-ink-muted)" }}>
                  Applied for <b>{selectedApp.jobTitle}</b> · {fmt(selectedApp.createdAt)}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="adm-btn adm-btn--ghost adm-btn--sm"
              >
                ✕ Close
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", background: "var(--adm-surface-alt)", padding: "0.85rem", borderRadius: "var(--adm-radius-sm)", marginBottom: "1.25rem", fontSize: "0.8125rem" }}>
              <div>
                <span style={{ color: "var(--adm-ink-subtle)", display: "block" }}>Email</span>
                <a href={`mailto:${selectedApp.email}`} style={{ color: "var(--adm-green-ink)", fontWeight: 600 }}>
                  {selectedApp.email}
                </a>
              </div>
              <div>
                <span style={{ color: "var(--adm-ink-subtle)", display: "block" }}>Phone</span>
                <span style={{ color: "var(--adm-ink)", fontWeight: 500 }}>
                  {selectedApp.phone ?? "Not provided"}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--adm-ink)", display: "block", marginBottom: "0.4rem" }}>
                Cover Letter
              </label>
              <div
                style={{
                  background: "#FFFFFF",
                  border: "1px solid var(--adm-border)",
                  borderRadius: "var(--adm-radius-sm)",
                  padding: "1rem",
                  fontSize: "0.875rem",
                  lineHeight: 1.6,
                  color: "var(--adm-ink)",
                  whiteSpace: "pre-wrap",
                  maxHeight: "220px",
                  overflowY: "auto",
                }}
              >
                {selectedApp.coverLetter || "No cover letter submitted."}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <a
                href={`/api/applications/${selectedApp.id}/resume`}
                download
                className="adm-btn adm-btn--primary adm-btn--sm"
              >
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ width: 14, height: 14 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Download Resume</span>
              </a>
              <a
                href={`mailto:${selectedApp.email}?subject=Bahir Tech Application - ${selectedApp.jobTitle}`}
                className="adm-btn adm-btn--secondary adm-btn--sm"
              >
                Send Email
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
