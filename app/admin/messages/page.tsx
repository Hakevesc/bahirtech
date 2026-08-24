import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { contactMessages } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/require-admin";
import { MessagesClient } from "./messages-client";

export const dynamic = "force-dynamic";

export default async function AdminMessages() {
  await requireAdmin();

  const rows = await db
    .select()
    .from(contactMessages)
    .orderBy(desc(contactMessages.createdAt));

  return (
    <div className="adm-container">
      <div className="adm-page-header">
        <div className="adm-page-header__left">
          <h1>Contact Messages & Inquiries</h1>
          <p>Review customer and enterprise inquiries received from the contact form.</p>
        </div>
      </div>

      <MessagesClient initialMessages={rows} />
    </div>
  );
}