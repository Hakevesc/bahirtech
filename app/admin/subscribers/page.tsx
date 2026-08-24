import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { subscribers } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/require-admin";
import { SubscribersClient } from "./subscribers-client";

export const dynamic = "force-dynamic";

export default async function AdminSubscribers() {
  await requireAdmin();

  const rows = await db
    .select()
    .from(subscribers)
    .orderBy(asc(subscribers.createdAt));

  return (
    <div className="adm-container">
      <div className="adm-page-header">
        <div className="adm-page-header__left">
          <h1>Newsletter Subscribers</h1>
          <p>Audience who subscribed to Bahir Tech updates and the &quot;Sea of Wisdom&quot; newsletter.</p>
        </div>
      </div>

      <SubscribersClient initialSubscribers={rows} />
    </div>
  );
}