"use client";

import { useState } from "react";
import Link from "next/link";

type PostItem = {
  id: number;
  title: string;
  slug: string;
  status: string;
  category: string | null;
  cover: string | null;
  author: string | null;
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

export function PostsManager({ initialPosts }: { initialPosts: PostItem[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = initialPosts.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" ? true : p.status === statusFilter;

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
              placeholder="Search posts or tags…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="adm-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All statuses ({initialPosts.length})</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        <div style={{ fontSize: "0.8125rem", color: "var(--adm-ink-muted)" }}>
          Showing <b>{filtered.length}</b> of {initialPosts.length} posts
        </div>
      </div>

      {/* Posts Table */}
      {filtered.length === 0 ? (
        <div className="adm-empty">
          <svg className="adm-empty__icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          <div className="adm-empty__text">
            {initialPosts.length === 0 ? "No blog posts yet. Click '+ New Post' to write your first article." : "No posts matching your search criteria."}
          </div>
        </div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Article</th>
                <th>Category</th>
                <th>Status</th>
                <th>Author</th>
                <th>Date</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      {p.cover ? (
                        <img
                          src={p.cover}
                          alt=""
                          style={{ width: 44, height: 44, borderRadius: "6px", objectFit: "cover", background: "#EFF1F6" }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: "6px",
                            background: "#F1F5F9",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#94A3B8",
                          }}
                        >
                          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ width: 20, height: 20 }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <div>
                        <b>{p.title}</b>
                        <div style={{ fontSize: "0.75rem", color: "var(--adm-ink-subtle)", fontFamily: "var(--adm-font-mono)" }}>
                          /blog/{p.slug}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    {p.category ? (
                      <span className="adm-badge adm-badge--neutral">{p.category}</span>
                    ) : (
                      <span style={{ color: "var(--adm-ink-subtle)", fontSize: "0.8125rem" }}>—</span>
                    )}
                  </td>
                  <td>
                    <span
                      className={
                        p.status === "published"
                          ? "adm-badge adm-badge--published"
                          : "adm-badge adm-badge--draft"
                      }
                    >
                      {p.status}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: "0.8125rem" }}>{p.author ?? "Admin"}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: "0.78125rem", color: "var(--adm-ink-subtle)" }}>
                      {fmt(p.publishedAt ?? p.createdAt)}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "0.4rem" }}>
                      <Link
                        href={`/admin/posts/${p.id}`}
                        className="adm-btn adm-btn--secondary adm-btn--sm"
                      >
                        Edit
                      </Link>
                      {p.status === "published" ? (
                        <a
                          href={`/blog/${p.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="adm-btn adm-btn--ghost adm-btn--sm"
                          title="Preview public page"
                        >
                          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ width: 13, height: 13 }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      ) : null}
                    </div>
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
