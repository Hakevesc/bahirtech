import { NextResponse } from "next/server";
import {
  destroySession,
  clearSessionCookieValue,
  parseCookie,
  SESSION_COOKIE,
} from "@/lib/auth";

export const runtime = "nodejs";

/**
 * POST /api/admin/logout — destroy the session row + clear the cookie.
 */
export async function POST(req: Request) {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const token = parseCookie(cookieHeader, SESSION_COOKIE);
  await destroySession(token);

  const clear = clearSessionCookieValue();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(clear.name, clear.value, clear.options);
  return res;
}