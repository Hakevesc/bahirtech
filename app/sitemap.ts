import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { getPublishedPosts } from "@/lib/blog";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static public pages (home, services, about, cybersecurity, careers, blog)
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE.url, lastModified: now },
    { url: `${SITE.url}/services`, lastModified: now },
    { url: `${SITE.url}/about`, lastModified: now },
    { url: `${SITE.url}/cybersecurity`, lastModified: now },
    { url: `${SITE.url}/careers`, lastModified: now },
    { url: `${SITE.url}/blog`, lastModified: now },
  ];

  // Published posts
  let posts: MetadataRoute.Sitemap = [];
  try {
    const list = await getPublishedPosts();
    posts = list.map((p) => ({
      url: `${SITE.url}/blog/${p.slug}`,
      lastModified: p.publishedAt ?? now,
    }));
  } catch {
    /* DB unavailable — still serve the static routes */
  }

  return [...staticRoutes, ...posts];
}