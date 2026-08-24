import "dotenv/config";
import { defineConfig } from "drizzle-kit";

/**
 * Drizzle Kit config — generates & applies migrations from lib/db/schema.ts.
 * DATABASE_URL is read from .env (copy .env.example).
 */
export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
  verbose: true,
  strict: true,
});