import "server-only";

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

import * as schema from "./schema";

/**
 * Singleton PostgreSQL client + Drizzle instance.
 *
 * `server-only` keeps this out of client bundles — the DB is only ever touched
 * from server components / route handlers. `DATABASE_URL` must be set (see
 * .env.example).
 *
 * Genuinely lazy: nothing connects, and the missing-DATABASE_URL error is not
 * raised, until a caller actually reads something off `db` or `sql`.
 *
 * It used to call connect() at the top level, which meant the error fired on
 * IMPORT. That defeated callers written to survive a missing database —
 * app/sitemap.ts wraps its query in try/catch precisely so the static routes
 * still get served — because the throw happened while the module graph was
 * being evaluated, long before any try/catch existed. `next build` walks that
 * graph for every route to collect page data, so one unset variable failed the
 * entire build instead of degrading the one page that wanted the data.
 */
const globalForDb = globalThis as unknown as {
  sql?: ReturnType<typeof postgres>;
};

type Sql = ReturnType<typeof postgres>;

function create() {
  return drizzle(connect(), { schema });
}
type Drizzle = ReturnType<typeof create>;

let pool: Sql | undefined;
let handle: Drizzle | undefined;

function connect(): Sql {
  if (pool) return pool;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set — copy .env.example to .env and fill in your PostgreSQL connection string."
    );
  }
  pool =
    globalForDb.sql ??
    postgres(url, {
      max: 10, // connection pool
      idle_timeout: 20,
      connect_timeout: 10,
    });
  // Reused across HMR reloads in dev; in production the module evaluates once.
  if (process.env.NODE_ENV !== "production") globalForDb.sql = pool;
  return pool;
}

function instance(): Drizzle {
  handle ??= create();
  return handle;
}

/**
 * Methods are bound to the real handle rather than left to resolve `this`
 * against the Proxy — drizzle's builders hand `this` around internally, and
 * binding keeps them off the forwarding path entirely.
 */
function forward<T extends object>(resolve: () => T) {
  return (prop: PropertyKey) => {
    const target = resolve();
    const value = Reflect.get(target, prop) as unknown;
    return typeof value === "function" ? value.bind(target) : value;
  };
}

/** Drizzle database handle — `import { db } from "@/lib/db"`. */
export const db = new Proxy({} as Drizzle, {
  get: (_t, prop) => forward(instance)(prop),
  has: (_t, prop) => prop in instance(),
});

/**
 * Raw postgres-js tag. The Proxy target is a function so the tagged-template
 * call form — sql`select 1` — still works through it.
 */
export const sql = new Proxy(function () {} as unknown as Sql, {
  apply: (_t, thisArg, args) =>
    Reflect.apply(
      connect() as unknown as (...a: unknown[]) => unknown,
      thisArg,
      args
    ),
  get: (_t, prop) => forward(connect)(prop),
  has: (_t, prop) => prop in connect(),
});

export { schema };

export type DB = Drizzle;
