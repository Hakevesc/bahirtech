import type { Metadata } from "next";
import "./styles/site-chrome.css";
import { SITE, absolute, organizationJsonLd } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — Connecting Ethiopia to the World, Again`,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    "Bahir Tech",
    "IT infrastructure",
    "cybersecurity",
    "software development",
    "digital transformation",
    "Ethiopia",
    "Addis Ababa",
  ],
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: `${SITE.name} — Connecting Ethiopia to the World, Again`,
    description: SITE.description,
    url: SITE.url,
    images: [{ url: absolute(SITE.ogImage), width: 1200, height: 630, alt: SITE.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — Connecting Ethiopia to the World, Again`,
    description: SITE.description,
    images: [absolute(SITE.ogImage)],
  },
  robots: { index: true, follow: true },
};

/**
 * Root layout — the single `<html>/<body>` document shell. Adds shared Open
 * Graph / Twitter defaults, the Ubuntu webfont, and Organization JSON-LD.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
        {children}
      </body>
    </html>
  );
}