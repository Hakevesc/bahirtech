import Link from "next/link";
import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";
import type { PostCard } from "@/lib/blog";

/**
 * Insights carousel — now data-driven (Phase 4). The markup is identical to the
 * static version; the post source comes from the database (published posts,
 * newest first), and each card links to /blog/[slug].
 */
export function Blog({ posts }: { posts: PostCard[] }) {
  return (
    <section className="blog" id="insights">
      <div className="container blog__inner">
        <div className="blog__top">
          <div>
            <span className="eyebrow">Insights</span>
            <h2 className="blog__heading">
              How Bahir Tech powers
              <br />
              <span>the success of</span> our clients
            </h2>
          </div>
          <div className="blog__controls">
            <div className="blog__tabs" role="tablist" id="blogTabs">
              <button className="blog__tab blog__tab--active" role="tab" aria-selected="true" data-tab="insights">
                Insights
              </button>
              <button className="blog__tab blog__tab--inactive" role="tab" aria-selected="false" data-tab="cases">
                Case Studies
              </button>
              <button className="blog__tab blog__tab--inactive" role="tab" aria-selected="false" data-tab="news">
                News
              </button>
            </div>
            <div className="blog__arrows">
              <button className="blog__arrow" id="blogPrev" aria-label="Previous articles">
                <ChevronLeftIcon />
              </button>
              <button className="blog__arrow" id="blogNext" aria-label="Next articles">
                <ChevronRightIcon />
              </button>
            </div>
          </div>
        </div>

        <div className="blog__track-wrap">
          <div className="blog__track" id="blogTrack">
            {posts.length === 0 ? (
              <p className="care-empty">
                <b>Insights coming soon.</b>
                <span>We&apos;re publishing our first articles.</span>
              </p>
            ) : (
              posts.map((post) => {
                return (
                  <article
                    key={post.id}
                    className="bcard"
                  >
                    <Link href={`/blog/${post.slug}`} style={{ display: "block" }}>
                      <div className="bcard__img-wrap">
                        {post.cover ? (
                          <Image
                            src={post.cover}
                            alt=""
                            fill
                            sizes="300px"
                            style={{ objectFit: "cover" }}
                            loading="lazy"
                          />
                        ) : (
                          <div
                            style={{
                              height: 200,
                              background: "var(--bg-alt,#F7F8FA)",
                              display: "grid",
                              placeItems: "center",
                              color: "var(--muted,#676D82)",
                              fontSize: 13,
                            }}
                          >
                            BAHIR TECH
                          </div>
                        )}
                        <div className="bcard__overlay" />
                        {post.tag ? (
                          <div className="bcard__badge">
                            <span className="bcard__badge-tag">{post.tag}</span>
                          </div>
                        ) : null}
                      </div>
                      <div className="bcard__meta">
                        <span className="bcard__author">{post.author ?? "Bahir Tech"}</span>
                        <p className="bcard__title">{post.title}</p>
                        {post.publishedAt && (
                          <p className="bcard__subtitle">
                            {post.publishedAt.toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}{" "}
                            - {post.minRead} Min Read
                          </p>
                        )}
                      </div>
                    </Link>
                  </article>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
}