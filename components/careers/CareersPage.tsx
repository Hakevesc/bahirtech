"use client";

import { useState } from "react";
import { ApplyForm } from "./ApplyForm";

export type JobSummary = {
  id: number;
  slug: string;
  title: string;
  department: string | null;
  location: string;
  type: string;
  summary: string | null;
};

const TYPE_LABEL: Record<string, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  internship: "Internship",
};

/** Careers perks band — the dark block under the hero, matching About/Services. */
const PERKS = [
  {
    title: "Real systems, real impact",
    body: "You build infrastructure that Ethiopia's banks, agencies and the public rely on every day — not a demo, not a slide deck.",
    icon: <path d="M6 6h12v7H6zM18 11l-7 0-11 8h6" />,
  },
  {
    title: "Senior enough to matter",
    body: "Small enough that your work is known, senior enough that the standard is real. Clear scope, honest review, and ownership you can point at.",
    icon: <path d="M12 3l6 3 6 4-6 1-6 4" />,
  },
  {
    title: "Growth that stays",
    body: "Mentorship and a path that rewards depth. We would rather keep a colleague for years than churn through resumes.",
    icon: <path d="M4 12h15" />,
  },
];

function chipize(j: JobSummary) {
  const tags = [TYPE_LABEL[j.type] ?? j.type];
  if (j.department) tags.push(j.department);
  return tags;
}

export function CareersPage({ jobs }: { jobs: JobSummary[] }) {
  const [selected, setSelected] = useState<JobSummary | null>(jobs[0] ?? null);

  return (
    <>
      {/* HERO */}
      <section className="ab-hero ca-hero">
        <div className="ab-hero__bg" aria-hidden="true" />
        <div className="container ab-hero__inner">
          <span className="ab-eyebrow ab-hero__eyebrow">Careers</span>
          <h1 className="ab-hero__h1">
            Build the Digital Future
            <br />
            <span className="accent">From Addis Ababa</span>
          </h1>
          <p className="ab-hero__lead careers-sub">
            Join a team that engineers secure, reliable systems for Ethiopia&apos;s
            most important organizations. Work that matters, a culture of
            craftsmanship, and technology that ships.
          </p>
        </div>
      </section>

      {/* PERKS — dark band under the hero, matching the About/Services pages */}
      <section className="ab-section ab-section--dark" id="careers-perks">
        <div className="container">
          <span className="ab-eyebrow" data-reveal>
            Why Bahir Tech
          </span>
          <h2 className="ab-h2" data-reveal>
            A team that <span className="accent">ships</span>
          </h2>
          <p className="ab-lead" data-reveal>
            Small enough that your work is known, senior enough that the bar is
            real — and the systems you build are ones Ethiopia counts on.
          </p>
          <div className="career-perks" data-reveal>
            {PERKS.map((p) => (
              <article className="career-perk" key={p.title}>
                <span className="career-perk__ico">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {p.icon}
                  </svg>
                </span>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* JOBS */}
      <section className="ab-section" id="openings">
        <div className="container">
          <div className="jobs-head">
            <div>
              <span className="ab-eyebrow">Open Positions</span>
              <h2>
                We&apos;re hiring — <span className="jobs-count">{jobs.length}</span>{" "}
                {jobs.length === 1 ? "role" : "roles"}
              </h2>
            </div>
            <p>
              Don&apos;t see a fit? Email{" "}
              <a href="mailto:careers@bahirtech.com" style={{ color: "var(--green-ink,#AAC638)" }}>
                careers@bahirtech.com
              </a>{" "}
              — we keep strong candidates on file.
            </p>
          </div>

          {jobs.length === 0 ? (
            <div className="care-empty">
              <b>No open positions right now</b>
              <p>We&apos;re always glad to hear from great engineers. Drop us a line at careers@bahirtech.com.</p>
            </div>
          ) : (
            <>
              <div className="jobs-list">
                {jobs.map((j) => (
                  <article
                    className="job-card"
                    key={j.id}
                    style={{ borderColor: selected?.id === j.id ? "var(--green,#AAC638)" : undefined }}
                  >
                    <div className="job-card__main">
                      <h3 className="job-card__title">{j.title}</h3>
                      <div className="job-card__tags">
                        {chipize(j).map((t) => (
                          <span className="job-chip" key={t}>{t}</span>
                        ))}
                        {j.location ? <span className="job-chip job-chip--loc">{j.location}</span> : null}
                      </div>
                      <p className="job-card__summary">{j.summary}</p>
                    </div>
                    <div className="job-card__apply">
                      <a
                        href="#openings"
                        className="ring-btn ring-btn--green"
                        onClick={(e) => {
                          e.preventDefault();
                          setSelected(j);
                          document.getElementById("applyAnchor")?.scrollIntoView({ behavior: "smooth" });
                        }}
                      >
                        {selected?.id === j.id ? "Selected ✓" : "Apply"}
                      </a>
                    </div>
                  </article>
                ))}
              </div>

              {/* DETAIL + APPLY PANEL */}
              <div className="job-detail" id="applyAnchor">
                <div className="job-detail__head">
                  <div>
                    <span className="ab-eyebrow">{selected?.department ?? "Open Position"}</span>
                    <h3>{selected?.title}</h3>
                  </div>
                </div>
                <ApplyForm
                  key={selected?.id}
                  jobs={jobs.map((j) => ({ id: j.id, title: j.title }))}
                  selectedJobId={selected?.id ?? null}
                />
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}