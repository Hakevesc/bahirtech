import postgres from "postgres";

/**
 * db-check.mjs — verifies the PostgreSQL connection from .env and lists the
 * Bahir Tech tables. Run:  node scripts/db-check.mjs
 */
import "dotenv/config";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("✗ DATABASE_URL is not set. Copy .env.example to .env and fill it in.");
  process.exit(1);
}

let sql;
try {
  sql = postgres(url, { max: 1, connect_timeout: 10 });
} catch (err) {
  console.error("✗ Could not parse DATABASE_URL:");
  console.error(" ", err.message);
  process.exit(1);
}

try {
  const rows = await sql`
    SELECT version(), current_database() AS db, current_user AS usr
  `;
  const [{ version, db, usr }] = rows;
  console.log("✓ Connected to PostgreSQL");
  console.log("  database:", db);
  console.log("  user:    ", usr);
  console.log("  server:  ", version.split(" on ")[0]);

  const tables = await sql`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename
  `;
  if (tables.length) {
    console.log("  existing public tables:", tables.map((r) => r.tablename).join(", "));
  } else {
    console.log("  no public tables yet — run `npm run db:migrate` to create them.");
  }
} catch (err) {
  console.error("✗ Connection failed:");
  console.error("  ", err.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}