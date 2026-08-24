import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { subscribers } from "@/lib/db/schema";
import { validEmail } from "@/lib/forms";
import { rateLimit, getIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * POST /api/subscribe — add a newsletter subscriber.
 *
 * The `subscribers_email_uq` unique index makes duplicates a no-op
 * (onConflictDoNothing), so re-subscribing is safe and idempotent.
 * 201 = newly subscribed, 200 = already subscribed (still a success).
 */
export async function POST(req: Request) {
  if (!rateLimit(getIp(req))) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a few minutes and try again." },
      { status: 429 }
    );
  }

  let body: { email?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const err = validEmail(email);
  if (err) return NextResponse.json({ error: err }, { status: 422 });

  try {
    const rows = await db
      .insert(subscribers)
      .values({ email })
      .onConflictDoNothing({ target: subscribers.email })
      .returning({ id: subscribers.id });

    // rows empty → already subscribed
    const ok = rows.length === 1;
    return NextResponse.json(
      { ok: true, already: !ok },
      { status: ok ? 201 : 200 }
    );
  } catch (e) {
    console.error("[subscribe] insert failed:", e);
    return NextResponse.json({ error: "Could not subscribe you right now." }, { status: 500 });
  }
}