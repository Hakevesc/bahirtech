/**
 * create-admin.mjs — create or update the Bahir Tech admin account.
 *
 * Reads DATABASE_URL + ADMIN_EMAIL + ADMIN_PASSWORD from .env, hashes the
 * password with scrypt (same salt:hash format as lib/auth.ts), and upserts the
 * admin row. Run:  npm run db:admin
 */
import "dotenv/config";
import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";
import postgres from "postgres";

const scryptAsync = promisify(scrypt);
const KEY_LEN = 64;

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = await scryptAsync(password, salt, KEY_LEN);
  return `${salt}:${hash.toString("hex")}`;
}

const url = process.env.DATABASE_URL;
const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD ?? "";

if (!url) {
  console.error("✗ DATABASE_URL is not set in .env");
  process.exit(1);
}
if (!email || !password) {
  console.error("✗ ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
  process.exit(1);
}
if (password.length < 10) {
  console.error("✗ ADMIN_PASSWORD must be at least 10 characters");
  process.exit(1);
}

const sql = postgres(url, { max: 1 });
try {
  const passwordHash = await hashPassword(password);
  const name = (process.env.ADMIN_NAME ?? "Bahir Tech Admin").trim();

  const result = await sql`
    INSERT INTO admins (name, email, password_hash)
    VALUES (${name}, ${email}, ${passwordHash})
    ON CONFLICT (email) DO UPDATE
      SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash, updated_at = now()
    RETURNING id, email
  `;

  console.log("✓ Admin ready:", result[0].email, `(id ${result[0].id})`);
  console.log("  Password was re-hashed on this run.");
} catch (err) {
  console.error("✗ Could not create admin:");
  console.error("  ", err.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}