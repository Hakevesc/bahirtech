"use client";

import { useState, type FormEvent } from "react";

type JobOption = { id: number; title: string };

type ApplyFormProps = {
  jobs: JobOption[];
  /** preselect a job (e.g. from a card's Apply button) */
  selectedJobId?: number | null;
};

type State = "idle" | "submitting" | "done" | "error";

/**
 * Application form — posts multipart/form-data to /api/apply, which stores the
 * resume under storage/resumes/ and the application row in Postgres.
 */
export function ApplyForm({ jobs, selectedJobId = null }: ApplyFormProps) {
  // The component is re-keyed per selected job, so a plain value is fine.
  const jobId =
    selectedJobId && jobs.some((j) => j.id === selectedJobId) ? selectedJobId : (jobs[0]?.id ?? 0);
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "submitting") return;
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("jobId", String(jobId));
    setState("submitting");
    setError(null);

    try {
      const res = await fetch("/api/apply", { method: "POST", body: fd });
      const json = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;
      if (res.ok && json?.ok) {
        form.reset();
        setState("done");
        window.setTimeout(() => setState("idle"), 5000);
      } else {
        setState("error");
        setError(json?.error ?? "Could not submit your application.");
      }
    } catch {
      setState("error");
      setError("Network error. Please try again.");
    }
  }

  return (
    <div className="apply">
      {state === "done" ? (
        <div className="apply__note" role="status">
          ✓ Application received. We&apos;ll be in touch — thank you for applying
          to Bahir Tech.
        </div>
      ) : (
        <form onSubmit={onSubmit}>
          <h3>Apply for this position</h3>
          <div className="apply__grid">
            <div className="apply__field">
              <label htmlFor="apFirstName">First Name</label>
              <input id="apFirstName" name="firstName" type="text" autoComplete="given-name" required placeholder="Your first name" />
            </div>
            <div className="apply__field">
              <label htmlFor="apLastName">Last Name</label>
              <input id="apLastName" name="lastName" type="text" autoComplete="family-name" required placeholder="Your last name" />
            </div>
            <div className="apply__field">
              <label htmlFor="apEmail">Email</label>
              <input id="apEmail" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
            </div>
            <div className="apply__field">
              <label htmlFor="apPhone">Phone</label>
              <input id="apPhone" name="phone" type="tel" autoComplete="tel" placeholder="+251 …" />
            </div>
            <div className="apply__field apply__field--full">
              <label htmlFor="apResume">Resume (PDF, DOC or DOCX, max 5 MB)</label>
              <input id="apResume" name="resume" type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" required />
            </div>
            <div className="apply__field apply__field--full">
              <label htmlFor="apCover">Cover letter (optional)</label>
              <textarea id="apCover" name="coverLetter" rows={4} placeholder="Tell us why you'd be a great fit" />
            </div>
          </div>

          {state === "error" ? (
            <p className="apply__error" role="alert">{error}</p>
          ) : null}

          <button type="submit" className="ring-btn ring-btn--green" style={{ marginTop: 16 }} disabled={state === "submitting"}>
            {state === "submitting" ? "Submitting…" : "Submit Application"}
          </button>
          <p className="apply__note">
            We use your details only to process this application, in line with our
            privacy policy. Your resume is stored securely and never made public.
          </p>
        </form>
      )}
    </div>
  );
}