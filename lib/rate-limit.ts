/**
 * Minimal in-memory rate limiter for public form endpoints.
 *
 * Not a distributed solution — it's a per-process guard against obvious abuse
 * (spam floods from one IP) that resets on restart. Real, persistent rate
 * limiting should sit behind the admin auth layer later.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX = 10; // per window per IP

export function rateLimit(ip: string | null): boolean {
  const key = ip ?? "unknown";
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  b.count += 1;
  return b.count <= MAX;
}

/** Best-effort client IP from a Request (works on Vercel + node). */
export function getIp(req: Request): string | null {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip");
}