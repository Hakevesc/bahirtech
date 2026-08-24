"use client";

import { useState } from "react";
import Link from "next/link";

type JobItem = {
  id: number;
  slug: string;
  title: string;
  department: string | null;
  location: string;
  type: string;
  isActive: boolean;
  publishedAt: Date | string | null;
  createdAt: Date | string | null;
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}
function fmt(ts: Date | string | null | undefined) {
  if (!ts) return "—";
  const d = new Date(ts);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function JobsClient({ initialJobs }: { initialJobs: JobItem[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = initialJobs.filter((j) => {
    const matchesSearch =
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      (j.department && j.department.toLowerCase().includes(search.toLowerCase())) ||
      j.location.toLowerCase().includes(search.toLowerCase()) ||
      j.type.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
        ? j.isActive
        : !j.isActive;

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
              placeholder="Search roles or departments…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="adm-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All statuses ({initialJobs.length})</option>
            <option value="active">Active (Open)</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div style={{ fontSize: "0.8125rem", color: "var(--adm-ink-muted)" }}>
          Showing <b>{filtered.length}</b> of {initialJobs.length} positions
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="adm-empty">
          <svg className="adm-empty__icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <div className="adm-empty__text">
            {initialJobs.length === 0 ? "No jobs listed yet." : "No jobs matching your filter."}
          </div>
        </div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Department</th>
                <th>Workplace & Type</th>
                <th>Status</th>
                <th>Published</th>
                <th>Created</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((j) => (
                <tr key={j.id}>
                  <td>
                    <b>{j.title}</b>
                    <div style={{ fontSize: "0.75rem", color: "var(--adm-ink-subtle)", fontFamily: "var(--adm-font-mono)" }}>
                      /careers#{j.slug}
                    </div>
                  </td>
                  <td>
                    <span className="adm-badge adm-badge--neutral">{j.department ?? "General"}</span>
                  </td>
                  <td>
                    <div style={{ color: "var(--adm-ink)", fontWeight: 500 }}>{j.location}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--adm-ink-subtle)" }}>{j.type}</div>
                  </td>
                  <td>
                    <span
                      className={
                        j.isActive
                          ? "adm-badge adm-badge--active"
                          : "adm-badge adm-badge--draft"
                      }
                    >
                      {j.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td style={{ fontSize: "0.78125rem", color: "var(--adm-ink-subtle)" }}>
                    {fmt(j.publishedAt)}
                  </td>
                  <td style={{ fontSize: "0.78125rem", color: "var(--adm-ink-subtle)" }}>
                    {fmt(j.createdAt)}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <Link
                      href="/careers"
                      target="_blank"
                      className="adm-btn adm-btn--ghost adm-btn--sm"
                      title="View on Careers page"
                    >
                      View ↗
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
