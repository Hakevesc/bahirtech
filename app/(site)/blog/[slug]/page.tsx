import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import sanitizeHtml from "sanitize-html";
import "../../../styles/about.css";
import "../../../styles/blog.css";
import { getPostBySlug, getRelatedPosts } from "@/lib/blog";
import { SITE, absolute } from "@/lib/site";
import { BlogSidebar } from "@/components/blog/BlogSidebar";
import { BlogRelated } from "@/components/blog/BlogRelated";

function fmtDate(ts: Date | null | undefined) {
  if (!ts) return "";
  const d = new Date(ts);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post not found — Bahir Tech" };
  const url = `${SITE.url}/blog/${post.slug}`;
  return {
    title: `${post.metaTitle ?? post.title} — Bahir Tech Insights`,
    description: post.metaDescription ?? post.excerpt ?? undefined,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: post.metaTitle ?? post.title,
      description: post.metaDescription ?? post.excerpt ?? undefined,
      url,
      publishedTime: post.publishedAt?.toISOString(),
      images: post.cover ? [{ url: absolute(post.cover) }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.metaTitle ?? post.title,
      description: post.metaDescription ?? post.excerpt ?? undefined,
      images: post.cover ? [absolute(post.cover)] : undefined,
    },
  };
}

export const dynamic = "force-dynamic";

/** Parse <h2> elements, inject section IDs & numbered badges, build TOC array */
function processArticleContent(rawHtml: string) {
  const headings: { id: string; numStr: string; text: string }[] = [];
  let index = 0;

  const html = rawHtml.replace(/<h2([^>]*)>(.*?)<\/h2>/gi, (_, attrs, innerText) => {
    index++;
    const id = `section-${index}`;
    const numStr = index < 10 ? `0${index}` : `${index}`;
    const cleanText = innerText.replace(/<[^>]+>/g, "").trim();

    headings.push({ id, numStr, text: cleanText });

    return `<h2 id="${id}" ${attrs}><span class="bld-h2-num">${numStr}</span><span class="bld-h2-text">${innerText}</span></h2>`;
  });

  return { html, headings };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const relatedPosts = await getRelatedPosts(slug, 3);

  // Sanitize body HTML
  const rawBody = post.content
    ? sanitizeHtml(post.content, {
        allowedTags: [
          "p", "h2", "h3", "h4", "ul", "ol", "li", "strong", "em", "a",
          "blockquote", "br", "span", "div", "code", "pre", "img"
        ],
        allowedAttributes: {
          a: ["href", "target", "rel"],
          img: ["src", "alt", "width", "height"],
          div: ["class"],
          span: ["class", "style"],
        },
        allowedSchemes: ["http", "https", "mailto", "tel"],
      })
    : "";

  const { html: bodyHtml, headings } = processArticleContent(rawBody);

  // Calculate estimated reading time
  const plainText = (post.content ?? post.excerpt ?? "").replace(/<[^>]+>/g, " ");
  const wordCount = plainText.trim().split(/\s+/).filter(Boolean).length;
  const minRead = Math.max(1, Math.ceil(wordCount / 200));

  const pageUrl = `${SITE.url}/blog/${post.slug}`;
  const categoryTag = post.category || "BUSINESS • AI • FUTURE OF WORK";

  return (
    <>
      {/* HERO HEADER SECTION */}
      <header className="bld-hero">
        <div className="bld-hero__bg-grid" />
        <div className="container">
          <div className="bld-hero__grid">
            {/* Left Header Column */}
            <div>
              <div className="bld-hero__kicker">{categoryTag}</div>
              <h1 className="bld-hero__title">{post.title}</h1>
              {post.excerpt ? (
                <p className="bld-hero__lead">{post.excerpt}</p>
              ) : null}

              <div className="bld-hero__meta-bar">
                {post.publishedAt ? (
                  <div className="bld-hero__meta-item">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{fmtDate(post.publishedAt)}</span>
                  </div>
                ) : null}

                <div className="bld-hero__meta-item">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{minRead} min read</span>
                </div>

                <div className="bld-hero__meta-item">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span>{post.category || "AI"}</span>
                </div>
              </div>
            </div>

            {/* Right Header Featured Image Frame */}
            <div>
              <div className="bld-hero__frame">
                {post.cover ? (
                  <Image
                    src={post.cover}
                    alt={post.title}
                    fill
                    sizes="(min-width: 992px) 480px, 90vw"
                    style={{ objectFit: "cover" }}
                    priority
                  />
                ) : (
                  <div className="bld-hero__frame-empty">Bahir Tech Insights</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN BODY & SIDEBAR SECTION */}
      <section className="bld-section">
        <div className="container">
          <div className="bld-layout">
            {/* Left Main Article Column */}
            <article className="bld-article">
              <div
                className="bld-prose"
                dangerouslySetInnerHTML={{ __html: bodyHtml }}
              />

              {/* Dynamic Callout Box */}
              {(post.ctaText || post.ctaLabel || post.ctaLink) ? (
                <div className="bld-callout">
                  <div className="bld-callout__icon">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="bld-callout__text">
                    <span>{post.ctaText || "Talk to us before you automate the wrong thing —"}</span>
                    <a href={post.ctaLink || "/#contact"} className="bld-callout__link">
                      {post.ctaLabel || "Book A Call"}
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ width: 15, height: 15 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </a>
                  </div>
                </div>
              ) : null}

              {/* Editorial Author Team Card */}
              <div className="bld-author-card">
                <div className="bld-author-card__avatar">
                  <img src="/assets/logo/Bahirtech (B) logo icon white.svg" alt="Bahir Tech" />
                </div>
                <div className="bld-author-card__info">
                  <h4>{post.author ?? "Bahir Tech Editorial Team"}</h4>
                  <p>Technology, business, and ideas shaping what&apos;s next. We turn insights into impact.</p>
                </div>
              </div>
            </article>

            {/* Right Sticky Sidebar */}
            <BlogSidebar
              headings={headings}
              postTitle={post.title}
              postUrl={pageUrl}
            />
          </div>
        </div>
      </section>

      {/* KEEP READING (RELATED POSTS) SECTION */}
      <BlogRelated posts={relatedPosts} />

      {/* Article structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.excerpt ?? undefined,
            image: post.cover ? absolute(post.cover) : undefined,
            author: { "@type": "Organization", name: post.author ?? SITE.name },
            datePublished: post.publishedAt?.toISOString(),
            publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
            mainEntityOfPage: pageUrl,
          }),
        }}
      />
    </>
  );
}