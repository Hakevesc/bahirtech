import "server-only";

import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/lib/db";
import { admins, sessions } from "@/lib/db/schema";
import type { Admin } from "@/lib/db/schema";

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: string,
  keylen: number
) => Promise<Buffer>;

/** Cookie name for the admin session token. */
export const SESSION_COOKIE = "bahir_admin";
export const SESSION_DAYS = 7;
const KEY_LEN = 64;

type CookieOptions = {
  httpOnly: boolean;
  sameSite: "lax" | "strict" | "none";
  secure: boolean;
  path: string;
  maxAge: number;
};

/* ---- password hashing (scrypt, salt:hash) ------------------------------ */

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const hash = await scryptAsync(password, salt, KEY_LEN);
  return `${salt}:${hash.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  stored: string
): Promise<boolean> {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  try {
    const candidate = await scryptAsync(password, salt, KEY_LEN);
    const expected = Buffer.from(hash, "hex");
    return candidate.length === expected.length && timingSafeEqual(candidate, expected);
  } catch {
    return false;
  }
}

/* ---- sessions ------------------------------------------------------------- */

export async function createSession(adminId: number): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(sessions).values({ adminId, token, expiresAt });
  return token;
}

/** Returns the Admin for a valid (unexpired) token, or null. */
export async function getAdminByToken(token: string | undefined | null): Promise<Admin | null> {
  if (!token) return null;
  const rows = await db
    .select({ admin: admins })
    .from(sessions)
    .innerJoin(admins, eq(sessions.adminId, admins.id))
    .where(and(eq(sessions.token, token), gt(sessions.expiresAt, new Date())))
    .limit(1)
    .catch(() => []);
  return rows.length ? rows[0].admin : null;
}

export async function destroySession(token: string | undefined | null): Promise<void> {
  if (!token) return;
  await db.delete(sessions).where(eq(sessions.token, token)).catch(() => {});
}

/* ---- cookie helpers -------------------------------------------------------- */

/** Extract and validate the session from a Request, returning the Admin if valid. */
export async function authFromRequest(req: Request): Promise<Admin | null> {
  const cookie = req.headers.get("cookie") ?? "";
  const token = parseCookie(cookie, SESSION_COOKIE);
  return getAdminByToken(token);
}

export function parseCookie(header: string, name: string): string | null {
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    if (key === name) return part.slice(idx + 1).trim();
  }
  return null;
}

/** Set the admin httpOnly cookie from a route handler. */
export function sessionCookieValue(token: string): { name: string; value: string; options: CookieOptions } {
  return {
    name: SESSION_COOKIE,
    value: token,
    options: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_DAYS * 24 * 60 * 60,
    },
  };
}

export function clearSessionCookieValue(): { name: string; value: string; options: CookieOptions } {
  return {
    name: SESSION_COOKIE,
    value: "",
    options: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    },
  };
}