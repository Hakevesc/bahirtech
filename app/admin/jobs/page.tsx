import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { jobs } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/require-admin";
import { JobsClient } from "./jobs-client";

export const dynamic = "force-dynamic";

export default async function AdminJobs() {
  await requireAdmin();

  const rows = await db.select().from(jobs).orderBy(desc(jobs.createdAt));

  return (
    <div className="adm-container">
      <div className="adm-page-header">
        <div className="adm-page-header__left">
          <h1>Career Roles & Job Postings</h1>
          <p>Manage the open positions and requirements presented on the public /careers portal.</p>
        </div>
      </div>

      <JobsClient initialJobs={rows} />
    </div>
  );
}