import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import "../../styles/about.css";
import "../../styles/blog-index.css";
import { getPublishedPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Insights & Blog",
  description:
    "How Bahir Tech engineers secure, reliable systems for Ethiopian banks, institutions and growing businesses — plus news from the team.",
};

export const dynamic = "force-dynamic";

function fmtDate(ts: Date | null | undefined) {
  if (!ts) return "";
  const d = new Date(ts);
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export default async function BlogIndex() {
  const posts = await getPublishedPosts();

  return (
    <section className="blog-index">
      <div className="container">
        <div className="blog-index__head">
          <div>
            <span className="ab-eyebrow">Insights &amp; news</span>
            <h1>The Bahir Tech blog</h1>
          </div>
          <p>
            Engineering notes, lessons from the field and stories about systems we
            built and secured across Ethiopia.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="adm-panel" style={{ background: "#fff" }}>
            <p className="adm-empty">No articles published yet — check back soon.</p>
          </div>
        ) : (
          <div className="blog-grid">
            {posts.map((post) => (
              <article className="blog-grid__card" key={post.id}>
                <Link href={`/blog/${post.slug}`} style={{ display: "block" }}>
                  <div className="blog-grid__img-wrap">
                    {post.cover ? (
                      <Image
                        src={post.cover}
                        alt=""
                        fill
                        sizes="(min-width:1180px) 360px, (min-width:760px) 45vw, 90vw"
                        style={{ objectFit: "cover" }}
                        loading="lazy"
                      />
                    ) : (
                      <div className="blog-grid__img-empty">BAHIR TECH</div>
                    )}
                    {/* Category only. The "· BAHIR TECH" that used to trail it repeated
                        the publisher on every card of the Bahir Tech blog, which said
                        nothing and crowded out the one word that does. */}
                    <span className="blog-grid__badge">{post.tag ?? "Insights"}</span>
                  </div>
                  <div className="blog-grid__body">
                    <div className="blog-grid__meta">
                      {post.author ?? "Bahir Tech"} · {fmtDate(post.publishedAt)}
                    </div>
                    <h2 className="blog-grid__title">{post.title}</h2>
                    <p className="blog-grid__excerpt">{post.excerpt}</p>
                    <span className="blog-grid__more">Read article →</span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}