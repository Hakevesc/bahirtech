import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminByToken, SESSION_COOKIE } from "@/lib/auth";
import type { Admin } from "@/lib/db/schema";

/**
 * Require an authenticated admin in a server component / route.
 * Redirects to /admin/login when there's no valid session.
 */
export async function requireAdmin(): Promise<Admin> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  const admin = await getAdminByToken(token);
  if (!admin) redirect("/admin/login");
  return admin;
}

/** Optional admin — returns null when unauthenticated (no redirect). */
export async function getOptionalAdmin(): Promise<Admin | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  return getAdminByToken(token);
}