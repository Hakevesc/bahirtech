import { redirect } from "next/navigation";
import { getOptionalAdmin } from "@/lib/require-admin";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

/** If already signed in, send to the dashboard. */
export default async function AdminLoginPage() {
  const admin = await getOptionalAdmin();
  if (admin) redirect("/admin");
  return <LoginForm />;
}