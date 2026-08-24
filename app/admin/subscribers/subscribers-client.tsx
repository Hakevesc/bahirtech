"use client";

import { useState } from "react";

type SubscriberItem = {
  id: number;
  email: string;
  createdAt: Date | string | null;
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}
function fmt(ts: Date | string | null | undefined) {
  if (!ts) return "—";
  const d = new Date(ts);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function SubscribersClient({ initialSubscribers }: { initialSubscribers: SubscriberItem[] }) {
  const [search, setSearch] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  function showToast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 3000);
  }

  const filtered = initialSubscribers.filter((s) =>
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  function exportCsv() {
    if (initialSubscribers.length === 0) return;
    const header = "ID,Email,SubscribedAt\n";
    const rows = initialSubscribers
      .map((s) => `${s.id},"${s.email}","${s.createdAt ? new Date(s.createdAt).toISOString() : ""}"`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `bahirtech-subscribers-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Downloaded subscribers CSV file.");
  }

  function copyAllEmails() {
    if (initialSubscribers.length === 0) return;
    const list = initialSubscribers.map((s) => s.email).join(", ");
    navigator.clipboard?.writeText(list).then(
      () => showToast(`Copied ${initialSubscribers.length} emails to clipboard.`),
      () => showToast("Failed to copy emails.")
    );
  }

  return (
    <div className="adm-panel">
      {/* Header & Actions */}
      <div className="adm-panel__header">
        <div className="adm-toolbar">
          <div className="adm-search-input">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search subscriber email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={copyAllEmails}
            className="adm-btn adm-btn--secondary adm-btn--sm"
            disabled={initialSubscribers.length === 0}
          >
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ width: 13, height: 13 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>Copy All</span>
          </button>
          <button
            type="button"
            onClick={exportCsv}
            className="adm-btn adm-btn--primary adm-btn--sm"
            disabled={initialSubscribers.length === 0}
          >
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ width: 13, height: 13 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="adm-empty">
          <svg className="adm-empty__icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <div className="adm-empty__text">
            {initialSubscribers.length === 0 ? "No subscribers yet." : "No subscribers matching your search."}
          </div>
        </div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Subscriber Email</th>
                <th>Channel</th>
                <th>Joined Date</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td>
                    <a href={`mailto:${s.email}`} style={{ color: "var(--adm-ink)", fontWeight: 600, textDecoration: "none" }}>
                      {s.email}
                    </a>
                  </td>
                  <td>
                    <span className="adm-badge adm-badge--neutral">Sea of Wisdom</span>
                  </td>
                  <td style={{ fontSize: "0.78125rem", color: "var(--adm-ink-subtle)" }}>
                    {fmt(s.createdAt)}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <a
                      href={`mailto:${s.email}`}
                      className="adm-btn adm-btn--ghost adm-btn--sm"
                      title="Send email"
                    >
                      Email ↗
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Animated Toast */}
      {toastMsg ? (
        <div className="adm-toast">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ width: 16, height: 16, color: "var(--adm-brand)" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span>{toastMsg}</span>
        </div>
      ) : null}
    </div>
  );
}
