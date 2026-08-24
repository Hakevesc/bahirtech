"use client";

import { useState } from "react";

type ContactMessage = {
  id: number;
  firstName: string;
  lastName: string | null;
  email: string;
  phone: string | null;
  company: string | null;
  service: string | null;
  message: string;
  status: string;
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

export function MessagesClient({ initialMessages }: { initialMessages: ContactMessage[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  const filtered = initialMessages.filter((m) => {
    const fullName = `${m.firstName} ${m.lastName ?? ""}`.toLowerCase();
    const matchesSearch =
      fullName.includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      (m.company && m.company.toLowerCase().includes(search.toLowerCase())) ||
      (m.service && m.service.toLowerCase().includes(search.toLowerCase())) ||
      m.message.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ? true : m.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="adm-panel">
      {/* Header & Filter Bar */}
      <div className="adm-panel__header">
        <div className="adm-toolbar">
          <div className="adm-search-input">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search sender, company, service…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="adm-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All statuses ({initialMessages.length})</option>
            <option value="new">New</option>
            <option value="read">Read / Processed</option>
          </select>
        </div>

        <div style={{ fontSize: "0.8125rem", color: "var(--adm-ink-muted)" }}>
          Showing <b>{filtered.length}</b> of {initialMessages.length} inquiries
        </div>
      </div>

      {/* Messages Table */}
      {filtered.length === 0 ? (
        <div className="adm-empty">
          <svg className="adm-empty__icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <div className="adm-empty__text">
            {initialMessages.length === 0 ? "No contact inquiries received yet." : "No messages matching your search filter."}
          </div>
        </div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Sender</th>
                <th>Contact</th>
                <th>Service Area</th>
                <th>Message Snippet</th>
                <th>Status</th>
                <th>Received</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id}>
                  <td>
                    <b>{m.firstName}{m.lastName ? ` ${m.lastName}` : ""}</b>
                    {m.company ? (
                      <div style={{ fontSize: "0.75rem", color: "var(--adm-ink-subtle)" }}>{m.company}</div>
                    ) : null}
                  </td>
                  <td>
                    <a href={`mailto:${m.email}`} style={{ color: "var(--adm-green-ink)", textDecoration: "none", fontWeight: 600 }}>
                      {m.email}
                    </a>
                    {m.phone ? (
                      <div style={{ fontSize: "0.75rem", color: "var(--adm-ink-subtle)" }}>{m.phone}</div>
                    ) : null}
                  </td>
                  <td>
                    <span className="adm-badge adm-badge--neutral">
                      {m.service ?? "General Inquiry"}
                    </span>
                  </td>
                  <td>
                    <div
                      style={{
                        maxWidth: 280,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        color: "var(--adm-ink-muted)",
                        fontSize: "0.8125rem",
                      }}
                    >
                      {m.message}
                    </div>
                  </td>
                  <td>
                    <span
                      className={
                        m.status === "new"
                          ? "adm-badge adm-badge--primary"
                          : "adm-badge"
                      }
                    >
                      {m.status}
                    </span>
                  </td>
                  <td style={{ fontSize: "0.78125rem", color: "var(--adm-ink-subtle)", whiteSpace: "nowrap" }}>
                    {fmt(m.createdAt)}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      onClick={() => setSelectedMessage(m)}
                      className="adm-btn adm-btn--secondary adm-btn--sm"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Message Detail Modal */}
      {selectedMessage ? (
        <div className="adm-modal-backdrop" onClick={() => setSelectedMessage(null)}>
          <div className="adm-modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
              <div>
                <h3 style={{ margin: "0 0 0.25rem", fontSize: "1.25rem", color: "var(--adm-ink)" }}>
                  {selectedMessage.firstName} {selectedMessage.lastName ?? ""}
                </h3>
                <div style={{ fontSize: "0.8125rem", color: "var(--adm-ink-muted)" }}>
                  {selectedMessage.company ? `${selectedMessage.company} · ` : ""}
                  Received {fmt(selectedMessage.createdAt)}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMessage(null)}
                className="adm-btn adm-btn--ghost adm-btn--sm"
              >
                ✕ Close
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", background: "var(--adm-surface-alt)", padding: "0.85rem", borderRadius: "var(--adm-radius-sm)", marginBottom: "1.25rem", fontSize: "0.8125rem" }}>
              <div>
                <span style={{ color: "var(--adm-ink-subtle)", display: "block" }}>Email Address</span>
                <a href={`mailto:${selectedMessage.email}`} style={{ color: "var(--adm-green-ink)", fontWeight: 600 }}>
                  {selectedMessage.email}
                </a>
              </div>
              <div>
                <span style={{ color: "var(--adm-ink-subtle)", display: "block" }}>Phone Number</span>
                <span style={{ color: "var(--adm-ink)", fontWeight: 500 }}>
                  {selectedMessage.phone ?? "Not provided"}
                </span>
              </div>
              <div>
                <span style={{ color: "var(--adm-ink-subtle)", display: "block" }}>Service Interest</span>
                <span style={{ color: "var(--adm-ink)", fontWeight: 500 }}>
                  {selectedMessage.service ?? "General Inquiry"}
                </span>
              </div>
              <div>
                <span style={{ color: "var(--adm-ink-subtle)", display: "block" }}>Current Status</span>
                <span className={selectedMessage.status === "new" ? "adm-badge adm-badge--primary" : "adm-badge"}>
                  {selectedMessage.status}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--adm-ink)", display: "block", marginBottom: "0.4rem" }}>
                Message Content
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
                }}
              >
                {selectedMessage.message}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
              <a
                href={`mailto:${selectedMessage.email}?subject=Re: Bahir Tech Inquiry - ${selectedMessage.service ?? "General"}`}
                className="adm-btn adm-btn--primary adm-btn--sm"
              >
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ width: 14, height: 14 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Reply via Email</span>
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
