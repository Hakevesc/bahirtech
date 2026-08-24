import type { NextConfig } from "next";

/**
 * Phase 1 of bahirtech-implementation-plan.md: the existing design is migrated
 * 1:1 (no redesign), so Next.js mostly serves hand-tuned CSS + JS that lived in
 * the static pages. Asset paths stay absolute under /assets (the repo's public/
 * folder), which keeps every <img>/CSS/JS URL working unchanged.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;