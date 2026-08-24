import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { applications, jobs } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/require-admin";
import { ApplicationsClient } from "./applications-client";

export const dynamic = "force-dynamic";

export default async function AdminApplications() {
  await requireAdmin();

  const rows = await db
    .select({
      id: applications.id,
      firstName: applications.firstName,
      lastName: applications.lastName,
      email: applications.email,
      phone: applications.phone,
      status: applications.status,
      coverLetter: applications.coverLetter,
      createdAt: applications.createdAt,
      jobTitle: jobs.title,
    })
    .from(applications)
    .innerJoin(jobs, eq(applications.jobId, jobs.id))
    .orderBy(desc(applications.createdAt));

  return (
    <div className="adm-container">
      <div className="adm-page-header">
        <div className="adm-page-header__left">
          <h1>Job Applications</h1>
          <p>Review candidate submissions, inspect cover letters, and download resumes.</p>
        </div>
      </div>

      <ApplicationsClient initialApplications={rows} />
    </div>
  );
}