import Link from "next/link";
import Image from "next/image";
import type { PostCard } from "@/lib/blog";

function fmtDate(ts: Date | null | undefined) {
  if (!ts) return "";
  const d = new Date(ts);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function BlogRelated({ posts }: { posts: PostCard[] }) {
  if (!posts || posts.length === 0) return null;

  return (
    <section className="bld-related">
      <div className="container">
        <div className="bld-related__header">
          <h2 className="bld-related__title">KEEP READING</h2>
          <Link href="/blog" className="bld-related__link">
            View all articles
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ width: 16, height: 16 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>

        <div className="bld-related__grid">
          {posts.map((post) => (
            <article key={post.id} className="bld-card">
              <Link href={`/blog/${post.slug}`} className="bld-card__media">
                {post.cover ? (
                  <Image
                    src={post.cover}
                    alt={post.title}
                    fill
                    sizes="(min-width: 900px) 380px, 90vw"
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <div className="bld-card__empty-cover">Bahir Tech</div>
                )}
                {post.tag ? (
                  <div className="bld-card__badge">
                    <span className="bld-card__badge-tag">{post.tag}</span>
                  </div>
                ) : null}
              </Link>

              <div className="bld-card__body">
                <h3 className="bld-card__title">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>

                {post.excerpt ? <p className="bld-card__excerpt">{post.excerpt}</p> : null}

                <div className="bld-card__footer">
                  <span className="bld-card__meta">
                    {post.publishedAt ? fmtDate(post.publishedAt) : ""} • {post.minRead} min read
                  </span>
                  <Link href={`/blog/${post.slug}`} className="bld-card__arrow" title="Read article">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
