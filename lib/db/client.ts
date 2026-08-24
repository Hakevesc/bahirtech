import "server-only";

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

import * as schema from "./schema";

/**
 * Singleton PostgreSQL client + Drizzle instance.
 *
 * `server-only` keeps this out of client bundles — the DB is only ever touched
 * from server components / route handlers. `DATABASE_URL` must be set in .env
 * (see .env.example). This module is lazy: the connection pool is created on
 * first import; pages that never touch the DB never pay for it.
 */
const globalForDb = globalThis as unknown as {
  sql?: ReturnType<typeof postgres>;
};

function client() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set — copy .env.example to .env and fill in your PostgreSQL connection string."
    );
  }
  const sql =
    globalForDb.sql ??
    postgres(url, {
      max: 10, // connection pool
      idle_timeout: 20,
      connect_timeout: 10,
    });
  if (process.env.NODE_ENV !== "production") globalForDb.sql = sql;
  return sql;
}

const sql = client();

/** Drizzle database handle — import * as db from "@/lib/db" and use db.db. */
export const db = drizzle(sql, { schema });

export { schema, sql };

export type DB = typeof db;