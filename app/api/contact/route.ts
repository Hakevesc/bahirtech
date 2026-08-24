import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contactMessages } from "@/lib/db/schema";
import { validEmail, validName, validText, cleanOptional } from "@/lib/forms";
import { rateLimit, getIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * POST /api/contact — store a contact form message.
 *
 * Returns the created row id so the client can confirm in place. Marked
 * `export const runtime = "nodejs"` (the postgres driver needs node, not the
 * edge runtime).
 */
export async function POST(req: Request) {
  if (!rateLimit(getIp(req))) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a few minutes and try again." },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const firstName = typeof body.firstName === "string" ? body.firstName : "";
  const lastName = typeof body.lastName === "string" ? body.lastName : "";
  const email = typeof body.email === "string" ? body.email : "";
  const phone = typeof body.phone === "string" ? body.phone : "";
  const company = typeof body.company === "string" ? body.company : "";
  const service = typeof body.service === "string" ? body.service : "";
  const message = typeof body.message === "string" ? body.message : "";

  const err = validName(firstName, 80) ?? validEmail(email) ?? validText(message, true, 5000);
  if (err) return NextResponse.json({ error: err }, { status: 422 });

  try {
    const rows = await db
      .insert(contactMessages)
      .values({
        firstName: firstName.trim(),
        lastName: cleanOptional(lastName),
        email: email.trim().toLowerCase(),
        phone: cleanOptional(phone),
        company: cleanOptional(company),
        service: cleanOptional(service),
        message: message.trim(),
      })
      .returning({ id: contactMessages.id });

    return NextResponse.json({ ok: true, id: rows[0].id }, { status: 201 });
  } catch (e) {
    console.error("[contact] insert failed:", e);
    return NextResponse.json({ error: "Could not save your message. Please try again." }, { status: 500 });
  }
}