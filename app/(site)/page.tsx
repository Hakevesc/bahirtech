import "../styles/home.css";
import { Hero } from "@/components/home/Hero";
import { Serve } from "@/components/home/Serve";
import { Problems } from "@/components/home/Problems";
import { Services } from "@/components/home/Services";
import { Cta, Why } from "@/components/home/CtaWhy";
import { Blog } from "@/components/home/Blog";
import { Contact } from "@/components/home/Contact";
import { HomeFx } from "@/components/home/HomeFx";
import { StackScroll } from "@/components/home/StackScroll";
import { getPublishedPosts } from "@/lib/blog";

// Posts come from the database, so the homepage is server-rendered on demand.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const posts = await getPublishedPosts();

  return (
    <>
      <Hero />
      <Serve />
      <Problems />
      <Services />
      <Cta />
      <Why />
      <Blog posts={posts} />
      <Contact />
      {/* Boot animation overlay */}
      <HomeFx />
      {/* Publishes --pin-top / --sp for the stacked-section scroll (home.css) */}
      <StackScroll />
    </>
  );
}