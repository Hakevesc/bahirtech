import "dotenv/config";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("No DATABASE_URL set");
  process.exit(1);
}

const sql = postgres(url, { max: 1 });
try {
  await sql`
    ALTER TABLE posts 
    ADD COLUMN IF NOT EXISTS cta_text text,
    ADD COLUMN IF NOT EXISTS cta_link text,
    ADD COLUMN IF NOT EXISTS cta_label text;
  `;
  console.log("✓ Added cta_text, cta_link, cta_label columns to posts table");
} catch (err) {
  console.error("Migration error:", err.message);
} finally {
  await sql.end();
}
