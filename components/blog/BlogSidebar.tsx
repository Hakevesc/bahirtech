"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { postJson } from "@/lib/client-forms";

interface TocHeading {
  id: string;
  numStr: string;
  text: string;
}

interface BlogSidebarProps {
  headings: TocHeading[];
  postTitle: string;
  postUrl: string;
}

export function BlogSidebar({ headings, postTitle, postUrl }: BlogSidebarProps) {
  const [email, setEmail] = useState("");
  const [subState, setSubState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [subMsg, setSubMsg] = useState("");
  const [copied, setCopied] = useState(false);

  async function onSubscribe(e: FormEvent) {
    e.preventDefault();
    if (!email || subState === "submitting") return;
    setSubState("submitting");
    setSubMsg("");

    const res = await postJson<{ ok: boolean; error?: string }>("/api/subscribe", { email });
    if (res.ok) {
      setSubState("success");
      setSubMsg("Subscribed! Thank you for joining.");
      setEmail("");
    } else {
      setSubState("error");
      setSubMsg(res.error ?? "Failed to subscribe. Please try again.");
    }
  }

  function copyLink() {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  const encodedUrl = encodeURIComponent(postUrl);
  const encodedTitle = encodeURIComponent(postTitle);

  return (
    <aside className="bld-sidebar">
      {/* 1. Table of Contents */}
      {headings.length > 0 && (
        <div className="bld-side-card">
          <div className="bld-side-card__header">
            <span className="bld-side-card__kicker">IN THIS ARTICLE</span>
          </div>
          <nav className="bld-toc">
            {headings.map((h) => (
              <a key={h.id} href={`#${h.id}`} className="bld-toc__link">
                <span className="bld-toc__num">{h.numStr}</span>
                <span className="bld-toc__dot">•</span>
                <span className="bld-toc__text">{h.text}</span>
              </a>
            ))}
          </nav>
        </div>
      )}

      {/* 2. Bahir Tech Insight Quote Card */}
      <div className="bld-side-card bld-quote-card">
        <div className="bld-quote-card__pattern" aria-hidden="true" />
        <span className="bld-quote-card__tag">BAHIR TECH INSIGHT</span>
        <div className="bld-quote-card__mark">“</div>
        <blockquote className="bld-quote-card__text">
          Technology should create capacity—not simply eliminate people.
        </blockquote>
      </div>

      {/* 3. Stay Updated Newsletter */}
      <div className="bld-side-card">
        <div className="bld-side-card__header">
          <h3 className="bld-side-card__title">Stay Updated</h3>
          <p className="bld-side-card__desc">
            Get the latest insights delivered to your inbox.
          </p>
        </div>

        {subState === "success" ? (
          <div className="bld-sub-success">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>{subMsg}</span>
          </div>
        ) : (
          <form onSubmit={onSubscribe} className="bld-sub-form">
            <input
              type="email"
              required
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bld-sub-input"
            />
            <button type="submit" disabled={subState === "submitting"} className="bld-sub-btn">
              {subState === "submitting" ? "Subscribing…" : "Subscribe →"}
            </button>
            {subState === "error" && <p className="bld-sub-error">{subMsg}</p>}
          </form>
        )}

        <p className="bld-sub-footnote">No spam. Unsubscribe anytime.</p>
      </div>

      {/* 4. Share Article */}
      <div className="bld-side-card">
        <span className="bld-side-card__label">Share this article</span>
        <div className="bld-share-btns">
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bld-share-btn"
            title="Share on LinkedIn"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
            </svg>
          </a>
          <a
            href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bld-share-btn"
            title="Share on X"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bld-share-btn"
            title="Share on Facebook"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H7.5v-3H10V9.5C10 7.01 11.49 5.65 13.75 5.65c1.08 0 2.22.19 2.22.19v2.44h-1.25c-1.24 0-1.62.77-1.62 1.56V12h2.77l-.44 3h-2.33v6.8c4.56-.93 8-4.96 8-9.8z" />
            </svg>
          </a>
          <button
            type="button"
            onClick={copyLink}
            className="bld-share-btn"
            title="Copy Link"
          >
            {copied ? (
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "var(--adm-success, #10B981)" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
