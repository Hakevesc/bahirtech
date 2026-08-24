"use client";

import { useEffect, useRef, useState } from "react";

type MediaItem = { id: number; name: string; path: string; mimeType?: string; sizeBytes?: number };

type RichBlogEditorProps = {
  value: string;
  onChange: (content: string) => void;
  mediaItems: MediaItem[];
};

export function RichBlogEditor({ value, onChange, mediaItems }: RichBlogEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<"visual" | "preview">("visual");
  const [htmlContent, setHtmlContent] = useState(value);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [savedSelection, setSavedSelection] = useState<Range | null>(null);

  // Sync initial content to contentEditable on mount
  useEffect(() => {
    if (editorRef.current && viewMode === "visual") {
      if (editorRef.current.innerHTML !== htmlContent) {
        editorRef.current.innerHTML = htmlContent || "<p><br></p>";
      }
    }
  }, [viewMode]);

  function handleContentChange() {
    if (editorRef.current) {
      const newHtml = editorRef.current.innerHTML;
      setHtmlContent(newHtml);
      onChange(newHtml);
    }
  }

  // ExecCommand helper for visual WYSIWYG actions
  function executeCommand(command: string, arg: string | undefined = undefined) {
    if (viewMode !== "visual") return;
    editorRef.current?.focus();
    document.execCommand(command, false, arg);
    handleContentChange();
  }

  // Insert custom HTML snippet into WYSIWYG selection
  function insertCustomHtml(html: string) {
    if (viewMode !== "visual") return;
    editorRef.current?.focus();
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      const el = document.createElement("div");
      el.innerHTML = html;
      const frag = document.createDocumentFragment();
      let node;
      let lastNode;
      while ((node = el.firstChild)) {
        lastNode = frag.appendChild(node);
      }
      range.insertNode(frag);
      if (lastNode) {
        range.setStartAfter(lastNode);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    } else {
      document.execCommand("insertHTML", false, html);
    }
    handleContentChange();
  }

  function saveCurrentSelection() {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      setSavedSelection(sel.getRangeAt(0));
      setLinkText(sel.toString());
    }
  }

  function openLinkDialog() {
    saveCurrentSelection();
    setLinkModalOpen(true);
  }

  function applyLink() {
    if (!linkUrl) return;
    if (savedSelection) {
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(savedSelection);
    }
    if (linkText && savedSelection && savedSelection.collapsed) {
      insertCustomHtml(`<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`);
    } else {
      executeCommand("createLink", linkUrl);
    }
    setLinkModalOpen(false);
    setLinkUrl("");
    setLinkText("");
  }

  function insertCallout(type: "tip" | "warning" | "note") {
    let bg = "#F1F5DF";
    let border = "#AAC638";
    let icon = "💡";
    let title = "Key Insight";

    if (type === "warning") {
      bg = "#FFFBEB";
      border = "#F59E0B";
      icon = "⚠️";
      title = "Important Consideration";
    } else if (type === "note") {
      bg = "#F8FAFC";
      border = "#232A60";
      icon = "📌";
      title = "Takeaway Note";
    }

    const html = `
<div style="background:${bg}; border-left: 4px solid ${border}; border-radius: 6px; padding: 14px 18px; margin: 18px 0; font-size: 15px;">
  <strong style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px; color: #232A60;">
    <span>${icon}</span> ${title}
  </strong>
  <p style="margin: 0; color: #475569;">Add details or guidance here for your readers…</p>
</div><p><br></p>`;
    insertCustomHtml(html);
  }

  function insertTable() {
    const html = `
<table style="width: 100%; border-collapse: collapse; margin: 18px 0; font-size: 14px;">
  <thead>
    <tr style="background: #F8FAFC;">
      <th style="border: 1px solid #E2E8F0; padding: 10px; text-align: left; font-weight: 600; color: #232A60;">Feature / Metric</th>
      <th style="border: 1px solid #E2E8F0; padding: 10px; text-align: left; font-weight: 600; color: #232A60;">Description</th>
      <th style="border: 1px solid #E2E8F0; padding: 10px; text-align: left; font-weight: 600; color: #232A60;">Impact</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border: 1px solid #E2E8F0; padding: 10px;">Item 1</td>
      <td style="border: 1px solid #E2E8F0; padding: 10px;">Standard configuration</td>
      <td style="border: 1px solid #E2E8F0; padding: 10px;">High</td>
    </tr>
    <tr>
      <td style="border: 1px solid #E2E8F0; padding: 10px;">Item 2</td>
      <td style="border: 1px solid #E2E8F0; padding: 10px;">Advanced optimization</td>
      <td style="border: 1px solid #E2E8F0; padding: 10px;">Critical</td>
    </tr>
  </tbody>
</table><p><br></p>`;
    insertCustomHtml(html);
  }

  function insertCodeBlock() {
    const html = `
<pre style="background: #1B2144; color: #F8FAFC; padding: 16px; border-radius: 8px; font-family: monospace; font-size: 13.5px; overflow-x: auto; margin: 16px 0;"><code>// Example code snippet
const config = {
  service: "Cloud Infrastructure",
  region: "East Africa",
  status: "Active"
};</code></pre><p><br></p>`;
    insertCustomHtml(html);
  }

  function insertImageFromMedia(media: MediaItem) {
    const html = `
<figure style="margin: 20px 0; text-align: center;">
  <img src="${media.path}" alt="${media.name}" style="max-width: 100%; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); display: inline-block;" />
  <figcaption style="font-size: 13px; color: #64748B; margin-top: 6px; font-style: italic;">${media.name}</figcaption>
</figure><p><br></p>`;
    insertCustomHtml(html);
    setIsMediaModalOpen(false);
  }

  // Reading metrics
  const textOnly = htmlContent.replace(/<[^>]+>/g, " ").trim();
  const wordCount = textOnly ? textOnly.split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div style={{ border: "1px solid var(--adm-border)", borderRadius: "var(--adm-radius-sm)", background: "#FFFFFF", overflow: "hidden" }}>
      {/* Top Mode Switcher */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#F8FAFC",
          borderBottom: "1px solid var(--adm-border)",
          padding: "0 0.5rem",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex" }}>
          <button
            type="button"
            className={`adm-editor-tab ${viewMode === "visual" ? "is-active" : ""}`}
            onClick={() => setViewMode("visual")}
          >
            ✏️ Visual Editor
          </button>
          <button
            type="button"
            className={`adm-editor-tab ${viewMode === "preview" ? "is-active" : ""}`}
            onClick={() => setViewMode("preview")}
          >
            👁️ Article Preview
          </button>
        </div>

        <div style={{ fontSize: "0.75rem", color: "var(--adm-ink-muted)", padding: "0.4rem 0.5rem" }}>
          <span><b>{wordCount}</b> words</span>
          <span style={{ margin: "0 6px" }}>·</span>
          <span>~{readTime} min read</span>
        </div>
      </div>

      {/* Visual Formatting Toolbar (Shown in Visual Mode) */}
      {viewMode === "visual" ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
            padding: "0.45rem 0.6rem",
            background: "#FFFFFF",
            borderBottom: "1px solid var(--adm-border)",
            flexWrap: "wrap",
          }}
        >
          {/* Paragraph & Headings */}
          <select
            className="adm-select"
            style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem", height: "28px" }}
            onChange={(e) => {
              const val = e.target.value;
              if (val) executeCommand("formatBlock", val);
            }}
            defaultValue=""
          >
            <option value="" disabled>Format Style…</option>
            <option value="p">Paragraph</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="h4">Heading 4</option>
          </select>

          <span style={{ width: 1, height: 18, background: "var(--adm-border)", margin: "0 3px" }} />

          {/* Basic Text Styles */}
          <button
            type="button"
            className="adm-toolbar-btn"
            onClick={() => executeCommand("bold")}
            title="Bold (Ctrl+B)"
            style={{ fontWeight: 700 }}
          >
            B
          </button>
          <button
            type="button"
            className="adm-toolbar-btn"
            onClick={() => executeCommand("italic")}
            title="Italic (Ctrl+I)"
            style={{ fontStyle: "italic" }}
          >
            I
          </button>
          <button
            type="button"
            className="adm-toolbar-btn"
            onClick={() => executeCommand("underline")}
            title="Underline (Ctrl+U)"
            style={{ textDecoration: "underline" }}
          >
            U
          </button>
          <button
            type="button"
            className="adm-toolbar-btn"
            onClick={() => executeCommand("strikeThrough")}
            title="Strikethrough"
            style={{ textDecoration: "line-through" }}
          >
            S
          </button>

          <span style={{ width: 1, height: 18, background: "var(--adm-border)", margin: "0 3px" }} />

          {/* Lists & Indents */}
          <button
            type="button"
            className="adm-toolbar-btn"
            onClick={() => executeCommand("insertUnorderedList")}
            title="Bullet List"
          >
            • List
          </button>
          <button
            type="button"
            className="adm-toolbar-btn"
            onClick={() => executeCommand("insertOrderedList")}
            title="Numbered List"
          >
            1. List
          </button>
          <button
            type="button"
            className="adm-toolbar-btn"
            onClick={() => executeCommand("formatBlock", "blockquote")}
            title="Quote"
          >
            &ldquo; Quote
          </button>

          <span style={{ width: 1, height: 18, background: "var(--adm-border)", margin: "0 3px" }} />

          {/* Text Alignment */}
          <button
            type="button"
            className="adm-toolbar-btn"
            onClick={() => executeCommand("justifyLeft")}
            title="Align Left"
          >
            Left
          </button>
          <button
            type="button"
            className="adm-toolbar-btn"
            onClick={() => executeCommand("justifyCenter")}
            title="Align Center"
          >
            Center
          </button>
          <button
            type="button"
            className="adm-toolbar-btn"
            onClick={() => executeCommand("justifyRight")}
            title="Align Right"
          >
            Right
          </button>

          <span style={{ width: 1, height: 18, background: "var(--adm-border)", margin: "0 3px" }} />

          {/* Rich Media & Elements */}
          <button
            type="button"
            className="adm-toolbar-btn"
            onClick={openLinkDialog}
            title="Insert Hyperlink"
            style={{ color: "var(--adm-green-ink)" }}
          >
            🔗 Link
          </button>
          <button
            type="button"
            className="adm-toolbar-btn"
            onClick={() => setIsMediaModalOpen(true)}
            title="Insert Image from Library"
            style={{ color: "var(--adm-green-ink)" }}
          >
            🖼️ Image
          </button>
          <button
            type="button"
            className="adm-toolbar-btn"
            onClick={insertTable}
            title="Insert Table"
          >
            📊 Table
          </button>
          <button
            type="button"
            className="adm-toolbar-btn"
            onClick={insertCodeBlock}
            title="Insert Code Block"
          >
            &lt;/&gt; Code
          </button>

          {/* Callouts Dropdown */}
          <select
            className="adm-select"
            style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem", height: "28px" }}
            onChange={(e) => {
              const val = e.target.value as "tip" | "warning" | "note";
              if (val) {
                insertCallout(val);
                e.target.value = "";
              }
            }}
            defaultValue=""
          >
            <option value="" disabled>+ Callout Box…</option>
            <option value="tip">💡 Key Insight</option>
            <option value="warning">⚠️ Warning Box</option>
            <option value="note">📌 Note Box</option>
          </select>

          <button
            type="button"
            className="adm-toolbar-btn"
            onClick={() => executeCommand("insertHorizontalRule")}
            title="Divider Line"
          >
            — Divider
          </button>

          <span style={{ width: 1, height: 18, background: "var(--adm-border)", margin: "0 3px" }} />

          {/* History */}
          <button
            type="button"
            className="adm-toolbar-btn"
            onClick={() => executeCommand("undo")}
            title="Undo"
          >
            ↩
          </button>
          <button
            type="button"
            className="adm-toolbar-btn"
            onClick={() => executeCommand("redo")}
            title="Redo"
          >
            ↪
          </button>
          <button
            type="button"
            className="adm-toolbar-btn"
            onClick={() => executeCommand("removeFormat")}
            title="Clear Formatting"
            style={{ color: "var(--adm-danger-ink)" }}
          >
            ✕ Clear
          </button>
        </div>
      ) : null}

      {/* Editor Body */}
      {viewMode === "visual" ? (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleContentChange}
          onBlur={handleContentChange}
          style={{
            minHeight: "380px",
            maxHeight: "650px",
            overflowY: "auto",
            padding: "1.25rem",
            fontSize: "1rem",
            lineHeight: 1.7,
            color: "var(--adm-ink)",
            outline: "none",
            background: "#FFFFFF",
          }}
        />
      ) : (
        <div
          className="adm-preview-box"
          style={{
            padding: "2rem",
            minHeight: "380px",
            maxHeight: "650px",
            overflowY: "auto",
            background: "#FFFFFF",
          }}
        >
          {htmlContent ? (
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
          ) : (
            <div style={{ color: "var(--adm-ink-subtle)", fontStyle: "italic", textAlign: "center", padding: "3rem" }}>
              No content added yet. Switch to Visual Editor to draft your article.
            </div>
          )}
        </div>
      )}

      {/* Media Inserter Modal */}
      {isMediaModalOpen ? (
        <div className="adm-modal-backdrop" onClick={() => setIsMediaModalOpen(false)}>
          <div className="adm-modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ margin: 0, fontSize: "1.125rem", color: "var(--adm-ink)" }}>Insert Image from Media Library</h3>
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
                  No images in Media Library. Upload assets in the Media section first.
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
                {mediaItems.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => insertImageFromMedia(m)}
                    style={{
                      border: "1px solid var(--adm-border)",
                      borderRadius: "var(--adm-radius-sm)",
                      overflow: "hidden",
                      cursor: "pointer",
                      background: "#FFFFFF",
                      transition: "all 0.15s ease",
                    }}
                    title={`Click to insert ${m.name}`}
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
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Hyperlink Modal */}
      {linkModalOpen ? (
        <div className="adm-modal-backdrop" onClick={() => setLinkModalOpen(false)}>
          <div className="adm-modal-content" style={{ maxWidth: "440px" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 1rem", fontSize: "1.125rem", color: "var(--adm-ink)" }}>Insert Hyperlink</h3>
            <div className="adm-field">
              <label>Link Text</label>
              <input
                type="text"
                placeholder="Click here or anchor text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
              />
            </div>
            <div className="adm-field">
              <label>Destination URL</label>
              <input
                type="url"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1rem" }}>
              <button
                type="button"
                className="adm-btn adm-btn--ghost adm-btn--sm"
                onClick={() => setLinkModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="adm-btn adm-btn--primary adm-btn--sm"
                onClick={applyLink}
              >
                Insert Link
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
