"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RichBlogEditor } from "./RichBlogEditor";

type MediaItem = { id: number; name: string; path: string; mimeType?: string; sizeBytes?: number };

type PostFormProps = {
  /** Existing post when editing; null when creating. */
  post?: {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string | null;
    status: string;
    category: string | null;
    coverImageId: number | null;
    metaTitle: string | null;
    metaDescription: string | null;
    ctaText?: string | null;
    ctaLink?: string | null;
    ctaLabel?: string | null;
  } | null;
};

type State = "idle" | "saving" | "error";

export function PostForm({ post }: PostFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [status, setStatus] = useState(post?.status ?? "draft");
  const [category, setCategory] = useState(post?.category ?? "");
  const [coverImageId, setCoverImageId] = useState<number | null>(post?.coverImageId ?? null);
  const [metaTitle, setMetaTitle] = useState(post?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(post?.metaDescription ?? "");
  const [ctaText, setCtaText] = useState(post?.ctaText ?? "Talk to us before you automate the wrong thing —");
  const [ctaLink, setCtaLink] = useState(post?.ctaLink ?? "/#contact");
  const [ctaLabel, setCtaLabel] = useState(post?.ctaLabel ?? "Book A Call");

  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/media", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setMediaItems((j as { media?: MediaItem[] }).media ?? []))
      .catch(() => {});
  }, []);

  function generateSlug(sourceTitle: string) {
    return sourceTitle
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function handleAutoSlug() {
    if (title) {
      setSlug(generateSlug(title));
    }
  }

  const selectedCover = mediaItems.find((m) => m.id === coverImageId);

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "saving") return;

    const finalSlug = slug.trim() || generateSlug(title);

    const payload = {
      title,
      slug: finalSlug,
      excerpt,
      content,
      category,
      status,
      coverImageId,
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || excerpt,
      ctaText: ctaText || null,
      ctaLink: ctaLink || null,
      ctaLabel: ctaLabel || null,
    };

    setState("saving");
    setError(null);

    const res = await fetch(
      post ? `/api/admin/posts/${post.id}` : "/api/admin/posts",
      {
        method: post ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const json = (await res.json().catch(() => null)) as { error?: string } | null;

    if (res.ok) {
      router.push("/admin/posts");
      router.refresh();
    } else {
      setState("error");
      setError(json?.error ?? "Could not save the post.");
      setState("idle");
    }
  }

  return (
    <form onSubmit={save}>
      <div className="adm-editor-grid">
        {/* Main Content Column */}
        <div>
          <div className="adm-panel">
            <div className="adm-panel__body">
              {/* Title */}
              <div className="adm-field">
                <label htmlFor="postTitle">Article Title</label>
                <input
                  id="postTitle"
                  type="text"
                  required
                  placeholder="e.g. Advancing Cloud & Network Infrastructure in East Africa"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (!slug && !post) {
                      setSlug(generateSlug(e.target.value));
                    }
                  }}
                  style={{ fontSize: "1.0625rem", fontWeight: 600 }}
                />
              </div>

              {/* Slug */}
              <div className="adm-field">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label htmlFor="postSlug">URL Slug</label>
                  <button
                    type="button"
                    onClick={handleAutoSlug}
                    className="adm-btn adm-btn--ghost adm-btn--sm"
                    style={{ padding: "1px 6px", fontSize: "0.75rem", color: "var(--adm-green-ink)" }}
                  >
                    Generate from title
                  </button>
                </div>
                <div style={{ display: "flex", alignItems: "stretch", width: "100%" }}>
                  <span
                    style={{
                      background: "var(--adm-surface-alt)",
                      border: "1px solid var(--adm-border)",
                      borderRight: "none",
                      borderTopLeftRadius: "var(--adm-radius-sm)",
                      borderBottomLeftRadius: "var(--adm-radius-sm)",
                      padding: "0.6rem 0.75rem",
                      fontSize: "0.8125rem",
                      color: "var(--adm-ink-subtle)",
                      fontFamily: "var(--adm-font-mono)",
                      display: "inline-flex",
                      alignItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    /blog/
                  </span>
                  <input
                    id="postSlug"
                    type="text"
                    required
                    placeholder="my-post-slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    style={{
                      flex: 1,
                      width: "100%",
                      borderTopLeftRadius: 0,
                      borderBottomLeftRadius: 0,
                      fontFamily: "var(--adm-font-mono)",
                    }}
                  />
                </div>
              </div>

              {/* Excerpt */}
              <div className="adm-field">
                <label htmlFor="postExcerpt">Summary / Excerpt</label>
                <textarea
                  id="postExcerpt"
                  rows={2}
                  placeholder="Brief synopsis shown on cards and in search previews…"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                />
              </div>

              {/* Category */}
              <div className="adm-field">
                <label htmlFor="postCategory">Category Tag</label>
                <input
                  id="postCategory"
                  type="text"
                  placeholder="e.g. Infrastructure, Cybersecurity, Telecom, AI"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Visual Rich Editor */}
          <div className="adm-panel">
            <div className="adm-panel__header">
              <div className="adm-panel__title">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ width: 16, height: 16, color: "var(--adm-green-ink)" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Article Body & Formatting</span>
              </div>
            </div>
            <div className="adm-panel__body" style={{ padding: "0.75rem" }}>
              <RichBlogEditor
                value={content}
                onChange={(newHtml) => setContent(newHtml)}
                mediaItems={mediaItems}
              />
            </div>
          </div>
        </div>

        {/* Sidebar Controls Column */}
        <div>
          {/* Publish Action Card */}
          <div className="adm-panel">
            <div className="adm-panel__header">
              <div className="adm-panel__title">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ width: 16, height: 16, color: "var(--adm-green-ink)" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                <span>Publishing</span>
              </div>
            </div>
            <div className="adm-panel__body">
              <div className="adm-field">
                <label htmlFor="postStatus">Status</label>
                <select
                  id="postStatus"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="draft">Draft (Private)</option>
                  <option value="published">Published (Live on site)</option>
                </select>
              </div>

              {error ? (
                <div
                  style={{
                    background: "var(--adm-danger-bg)",
                    color: "var(--adm-danger-ink)",
                    border: "1px solid var(--adm-danger-border)",
                    borderRadius: "var(--adm-radius-sm)",
                    padding: "0.6rem 0.75rem",
                    fontSize: "0.8125rem",
                    marginBottom: "1rem",
                  }}
                >
                  {error}
                </div>
              ) : null}

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <button
                  type="submit"
                  className="adm-btn"
                  disabled={state === "saving"}
                  style={{ width: "100%" }}
                >
                  {state === "saving"
                    ? "Saving Article…"
                    : post
                    ? "Save Changes"
                    : "Create Post"}
                </button>
                <Link
                  href="/admin/posts"
                  className="adm-btn adm-btn--secondary"
                  style={{ width: "100%" }}
                >
                  Cancel
                </Link>
              </div>
            </div>
          </div>

          {/* Callout / CTA Banner Settings Card */}
          <div className="adm-panel">
            <div className="adm-panel__header">
              <div className="adm-panel__title">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ width: 16, height: 16, color: "var(--adm-green-ink)" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.684A1.761 1.761 0 013 12V8c0-.972.788-1.762 1.76-1.762h.001M18 13.5v-7" />
                </svg>
                <span>Article Callout CTA Banner</span>
              </div>
            </div>
            <div className="adm-panel__body">
              <div className="adm-field">
                <label htmlFor="postCtaText">CTA Message / Prompt</label>
                <input
                  id="postCtaText"
                  type="text"
                  placeholder="e.g. Talk to us before you automate the wrong thing —"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                />
              </div>

              <div className="adm-field">
                <label htmlFor="postCtaLabel">Button Label</label>
                <input
                  id="postCtaLabel"
                  type="text"
                  placeholder="e.g. Book A Call"
                  value={ctaLabel}
                  onChange={(e) => setCtaLabel(e.target.value)}
                />
              </div>

              <div className="adm-field">
                <label htmlFor="postCtaLink">Target URL / Link</label>
                <input
                  id="postCtaLink"
                  type="text"
                  placeholder="e.g. /#contact"
                  value={ctaLink}
                  onChange={(e) => setCtaLink(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Cover Image Card */}
          <div className="adm-panel">
            <div className="adm-panel__header">
              <div className="adm-panel__title">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ width: 16, height: 16, color: "var(--adm-green-ink)" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Cover Image</span>
              </div>
            </div>
            <div className="adm-panel__body">
              {selectedCover ? (
                <div style={{ marginBottom: "0.75rem" }}>
                  <img
                    src={selectedCover.path}
                    alt={selectedCover.name}
                    style={{
                      width: "100%",
                      height: 140,
                      objectFit: "cover",
                      borderRadius: "var(--adm-radius-sm)",
                      border: "1px solid var(--adm-border)",
                      display: "block",
                    }}
                  />
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--adm-ink-muted)",
                      marginTop: "0.35rem",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {selectedCover.name}
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    height: 100,
                    border: "1px dashed var(--adm-border)",
                    borderRadius: "var(--adm-radius-sm)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--adm-ink-subtle)",
                    fontSize: "0.8125rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  No cover selected
                </div>
              )}

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setIsMediaModalOpen(true)}
                  className="adm-btn adm-btn--secondary adm-btn--sm"
                  style={{ flex: 1 }}
                >
                  {selectedCover ? "Change Cover" : "Choose Image"}
                </button>
                {selectedCover ? (
                  <button
                    type="button"
                    onClick={() => setCoverImageId(null)}
                    className="adm-btn adm-btn--ghost adm-btn--sm"
                    style={{ color: "var(--adm-danger-ink)" }}
                  >
                    Remove
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          {/* Search Engine Optimization (SEO) */}
          <div className="adm-panel">
            <div className="adm-panel__header">
              <div className="adm-panel__title">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ width: 16, height: 16, color: "var(--adm-green-ink)" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>SEO & Social Preview</span>
              </div>
            </div>
            <div className="adm-panel__body">
              <div className="adm-field">
                <label htmlFor="postMetaTitle">Meta Title</label>
                <input
                  id="postMetaTitle"
                  type="text"
                  placeholder="Defaults to Article Title"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                />
              </div>

              <div className="adm-field">
                <label htmlFor="postMetaDesc">Meta Description</label>
                <textarea
                  id="postMetaDesc"
                  rows={3}
                  placeholder="Defaults to Excerpt"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                />
              </div>

              <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--adm-ink-muted)", marginTop: "0.75rem" }}>
                Google Search Snippet Preview
              </div>

              <div className="adm-serp-card">
                <div className="adm-serp-url">
                  https://bahirtech.com › blog › {slug || "sample-slug"}
                </div>
                <div className="adm-serp-title">
                  {metaTitle || title || "Article Title Preview"} — Bahir Tech
                </div>
                <div className="adm-serp-desc">
                  {metaDescription || excerpt || "Article synopsis and preview will display here in Google search engine results."}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Media Picker Modal */}
      {isMediaModalOpen ? (
        <div className="adm-modal-backdrop" onClick={() => setIsMediaModalOpen(false)}>
          <div className="adm-modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ margin: 0, fontSize: "1.125rem", color: "var(--adm-ink)" }}>Select Cover Image</h3>
              <button
                type="button"
                onClick={() => setIsMediaModalOpen(false)}
                className="adm-btn adm-btn--ghost adm-btn--sm"
              >
                ✕ Close
              </button>
            </div>

            {mediaItems.length === 0 ? (
              <div className="adm-empty">
                <div className="adm-empty__text">
                  No media uploaded yet. Go to <Link href="/admin/media" target="_blank" style={{ color: "var(--adm-green-ink)", fontWeight: 600 }}>Media Library</Link> to upload images.
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
                  gap: "0.75rem",
                  maxHeight: "360px",
                  overflowY: "auto",
                  padding: "0.25rem",
                }}
              >
                {mediaItems.map((m) => {
                  const isSelected = coverImageId === m.id;
                  return (
                    <div
                      key={m.id}
                      onClick={() => {
                        setCoverImageId(m.id);
                        setIsMediaModalOpen(false);
                      }}
                      style={{
                        border: isSelected ? "2px solid var(--adm-primary)" : "1px solid var(--adm-border)",
                        borderRadius: "var(--adm-radius-sm)",
                        overflow: "hidden",
                        cursor: "pointer",
                        background: "#FFFFFF",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <img
                        src={m.path}
                        alt={m.name}
                        style={{ width: "100%", height: 85, objectFit: "cover", display: "block" }}
                      />
                      <div
                        style={{
                          padding: "4px 6px",
                          fontSize: "0.6875rem",
                          color: "var(--adm-ink)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {m.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </form>
  );
}