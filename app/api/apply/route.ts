import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { and, eq, isNotNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { applications, jobs } from "@/lib/db/schema";
import { validEmail, validName, validText, cleanOptional } from "@/lib/forms";
import { rateLimit, getIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

const RESUME_DIR = path.join(process.cwd(), "storage", "resumes");
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = new Set(["pdf", "doc", "docx"]);

/**
 * POST /api/apply — store a job application with resume upload.
 * multipart/form-data. Resume goes to storage/resumes/<uuid>.<ext> (git-ignored,
 * never in public/), the DB row stores just the stored filename.
 */
export async function POST(req: Request) {
  if (!rateLimit(getIp(req))) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a few minutes and try again." },
      { status: 429 }
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const str = (k: string) => {
    const v = form.get(k);
    return typeof v === "string" ? v : "";
  };

  const jobId = Number(form.get("jobId") ?? NaN);
  const firstName = str("firstName");
  const lastName = str("lastName");
  const email = str("email");
  const phone = str("phone");
  const coverLetter = str("coverLetter");
  const file = form.get("resume");

  // --- validate fields -----------------------------------------------------
  const fieldErr =
    validName(firstName, 80) ??
    validName(lastName, 80) ??
    validEmail(email) ??
    validText(coverLetter || null, false, 5000);
  if (fieldErr) return NextResponse.json({ error: fieldErr }, { status: 422 });
  if (!Number.isInteger(jobId) || jobId < 1) {
    return NextResponse.json({ error: "Invalid job." }, { status: 422 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Resume is required." }, { status: 422 });
  }

  const ext = (file.name.split(".").pop() ?? "").toLowerCase();
  if (!ALLOWED.has(ext)) {
    return NextResponse.json(
      { error: "Resume must be a PDF, DOC or DOCX file." },
      { status: 422 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Resume must be under 5 MB." },
      { status: 422 }
    );
  }

  // --- verify the job is open ---------------------------------------------
  try {
    const jobRows = await db
      .select({ id: jobs.id })
      .from(jobs)
      .where(and(eq(jobs.id, jobId), eq(jobs.isActive, true), isNotNull(jobs.publishedAt)))
      .limit(1);
    if (!jobRows.length) {
      return NextResponse.json({ error: "That position is no longer open." }, { status: 404 });
    }
  } catch (e) {
    console.error("[apply] job lookup failed:", e);
    return NextResponse.json({ error: "Could not submit your application." }, { status: 500 });
  }

  // --- write the resume -----------------------------------------------------
  const storedName = `${randomUUID()}.${ext}`;
  try {
    await mkdir(RESUME_DIR, { recursive: true });
    await writeFile(path.join(RESUME_DIR, storedName), Buffer.from(await file.arrayBuffer()));
  } catch (e) {
    console.error("[apply] resume write failed:", e);
    return NextResponse.json({ error: "Could not save your resume." }, { status: 500 });
  }

  // --- insert application row ------------------------------------------------
  try {
    const rows = await db
      .insert(applications)
      .values({
        jobId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: cleanOptional(phone),
        resumePath: storedName,
        coverLetter: cleanOptional(coverLetter),
      })
      .returning({ id: applications.id });

    return NextResponse.json({ ok: true, id: rows[0].id }, { status: 201 });
  } catch (e) {
    console.error("[apply] insert failed:", e);
    return NextResponse.json({ error: "Could not save your application." }, { status: 500 });
  }
}