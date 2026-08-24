"use client";

import { useEffect, useState, useRef } from "react";

type MediaItem = {
  id: number;
  name: string;
  path: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
};

type State = "idle" | "uploading" | "error";

function fmtBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

async function fetchMedia(): Promise<MediaItem[]> {
  const res = await fetch("/api/admin/media", { cache: "no-store" });
  const json = (await res.json().catch(() => null)) as { media?: MediaItem[] } | null;
  return json?.media ?? [];
}

export function MediaManager() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [search, setSearch] = useState("");
  const [state, setState] = useState<State>("idle");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchMedia().then((list) => {
      if (!cancelled) setItems(list);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function showToast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 3000);
  }

  async function refresh() {
    setItems(await fetchMedia());
  }

  async function handleUpload(file: File) {
    if (!file) return;
    setState("uploading");
    const fd = new FormData();
    fd.set("file", file);
    const res = await fetch("/api/admin/media", { method: "POST", body: fd });
    const json = (await res.json().catch(() => null)) as { error?: string } | null;
    if (res.ok) {
      showToast(`Uploaded "${file.name}" successfully.`);
      await refresh();
    } else {
      setState("error");
      showToast(json?.error ?? "Upload failed.");
    }
    setState("idle");
  }

  async function onFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) {
      await handleUpload(file);
    }
  }

  async function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await handleUpload(file);
    }
  }

  async function del(item: MediaItem) {
    if (!window.confirm(`Are you sure you want to permanently delete "${item.name}"?`)) return;
    const res = await fetch(`/api/admin/media/${item.id}`, { method: "DELETE" });
    if (res.ok) {
      showToast(`Deleted "${item.name}".`);
      await refresh();
    } else {
      showToast("Delete failed.");
    }
  }

  function copyPath(path: string) {
    navigator.clipboard?.writeText(path).then(
      () => showToast(`Copied path: ${path}`),
      () => showToast("Copy to clipboard failed.")
    );
  }

  const filteredItems = items.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.path.toLowerCase().includes(search.toLowerCase())
  );

  const totalBytes = items.reduce((acc, curr) => acc + (curr.sizeBytes || 0), 0);

  return (
    <div>
      {/* Upload Dropzone */}
      <div
        className={`adm-dropzone ${isDragOver ? "is-active" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{ marginBottom: "1.75rem" }}
      >
        <svg className="adm-dropzone__icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <div style={{ fontSize: "1rem", fontWeight: 600, color: "var(--adm-ink)", marginBottom: "0.25rem" }}>
          {state === "uploading" ? "Uploading asset to storage…" : "Drag and drop images here, or click to browse"}
        </div>
        <div style={{ fontSize: "0.8125rem", color: "var(--adm-ink-muted)" }}>
          Supports JPG, PNG, GIF, WebP (Max 8 MB per file)
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          hidden
          onChange={onFileInputChange}
          disabled={state === "uploading"}
        />
      </div>

      {/* Media Management Panel */}
      <div className="adm-panel">
        <div className="adm-panel__header">
          <div className="adm-toolbar">
            <div className="adm-search-input">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search media files…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div style={{ fontSize: "0.8125rem", color: "var(--adm-ink-muted)", display: "flex", gap: "1rem" }}>
            <span>Total assets: <b>{items.length}</b></span>
            <span>Storage footprint: <b>{fmtBytes(totalBytes)}</b></span>
          </div>
        </div>

        <div className="adm-panel__body">
          {filteredItems.length === 0 ? (
            <div className="adm-empty">
              <svg className="adm-empty__icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div className="adm-empty__text">
                {items.length === 0 ? "No media uploaded yet. Drop files above to get started." : "No media files matching your search."}
              </div>
            </div>
          ) : (
            <div className="adm-media-grid">
              {filteredItems.map((m) => (
                <div key={m.id} className="adm-media-card">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={m.path}
                    alt={m.name}
                    className="adm-media-card__thumb"
                    onClick={() => setPreviewItem(m)}
                    style={{ cursor: "pointer" }}
                    title="Click to view full preview"
                  />
                  <div className="adm-media-card__body">
                    <div>
                      <div className="adm-media-card__name" title={m.name}>
                        {m.name}
                      </div>
                      <div className="adm-media-card__meta">
                        {fmtBytes(m.sizeBytes)} · {m.mimeType.split("/")[1]?.toUpperCase() || "IMG"}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.5rem" }}>
                      <button
                        type="button"
                        className="adm-btn adm-btn--secondary adm-btn--sm"
                        style={{ flex: 1, padding: "0.3rem 0.5rem" }}
                        onClick={() => copyPath(m.path)}
                        title="Copy file URL"
                      >
                        Copy URL
                      </button>
                      <button
                        type="button"
                        className="adm-btn adm-btn--ghost adm-btn--sm"
                        style={{ color: "var(--adm-ink-muted)", padding: "0.3rem 0.5rem" }}
                        onClick={() => setPreviewItem(m)}
                        title="Inspect full image"
                      >
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ width: 14, height: 14 }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="adm-btn adm-btn--ghost adm-btn--sm"
                        style={{ color: "var(--adm-danger-ink)", padding: "0.3rem 0.5rem" }}
                        onClick={() => del(m)}
                        title="Delete image"
                      >
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ width: 14, height: 14 }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {previewItem ? (
        <div className="adm-modal-backdrop" onClick={() => setPreviewItem(null)}>
          <div className="adm-modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.125rem", color: "var(--adm-ink)" }}>{previewItem.name}</h3>
                <span style={{ fontSize: "0.75rem", color: "var(--adm-ink-muted)", fontFamily: "var(--adm-font-mono)" }}>
                  {previewItem.path}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="adm-btn adm-btn--ghost adm-btn--sm"
              >
                ✕ Close
              </button>
            </div>

            <div style={{ textAlign: "center", background: "#F1F5F9", borderRadius: "var(--adm-radius-sm)", padding: "1rem", marginBottom: "1rem" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewItem.path}
                alt={previewItem.name}
                style={{ maxWidth: "100%", maxHeight: "60vh", objectFit: "contain", borderRadius: "var(--adm-radius-sm)" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
              <span style={{ fontSize: "0.8125rem", color: "var(--adm-ink-muted)" }}>
                Size: {fmtBytes(previewItem.sizeBytes)} · MIME: {previewItem.mimeType}
              </span>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="button"
                  className="adm-btn adm-btn--secondary adm-btn--sm"
                  onClick={() => copyPath(previewItem.path)}
                >
                  Copy URL
                </button>
                <a
                  href={previewItem.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="adm-btn adm-btn--primary adm-btn--sm"
                >
                  Open Original ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Animated Toast Feedback */}
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