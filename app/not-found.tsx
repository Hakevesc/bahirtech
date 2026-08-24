import Link from "next/link";
import "./styles/about.css";

/**
 * Global 404. Renders inside the root layout (which carries the site chrome via
 * app/(site)/layout.tsx for public URLs), so it stays on-brand.
 */
export default function NotFound() {
  return (
    <div
      className="container"
      style={{
        padding: "clamp(120px,16vw,160px) 0",
        textAlign: "center",
        maxWidth: 560,
        marginInline: "auto",
      }}
    >
      <span className="ab-eyebrow">404</span>
      <h1
        className="ab-h2"
        style={{ fontSize: "clamp(28px,4vw,40px)", marginTop: 8 }}
      >
        This page drifted out to sea.
      </h1>
      <p className="ab-lead" style={{ marginTop: 14 }}>
        The page you&apos;re looking for doesn&apos;t exist or has moved. Let&apos;s get
        you back on course.
      </p>
      <div
        style={{
          marginTop: 26,
          display: "inline-flex",
          gap: 12,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <Link href="/" className="ring-btn ring-btn--green">
          Return home
        </Link>
        <Link
          href="/blog"
          className="ring-btn ring-btn--white"
          style={{ color: "var(--ink,#232A60)", border: "1px solid var(--line,#E4E6EE)" }}
        >
          Read our insights
        </Link>
      </div>
    </div>
  );
}