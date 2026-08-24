import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { admins } from "@/lib/db/schema";
import {
  verifyPassword,
  createSession,
  sessionCookieValue,
} from "@/lib/auth";
import { rateLimit, getIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * POST /api/admin/login — email + password → session cookie.
 */
export async function POST(req: Request) {
  if (!rateLimit(getIp(req))) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a few minutes." },
      { status: 429 }
    );
  }

  let body: { email?: unknown; password?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 422 });
  }

  try {
    const rows = await db
      .select()
      .from(admins)
      .where(eq(admins.email, email))
      .limit(1);

    if (!rows.length || !(await verifyPassword(password, rows[0].passwordHash))) {
      // Never reveal whether the email or password was wrong
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const token = await createSession(rows[0].id);
    const cookie = sessionCookieValue(token);
    const res = NextResponse.json({ ok: true, name: rows[0].name }, { status: 200 });
    res.cookies.set(cookie.name, cookie.value, cookie.options);
    return res;
  } catch (e) {
    console.error("[admin/login] failed:", e);
    return NextResponse.json({ error: "Could not sign in." }, { status: 500 });
  }
}