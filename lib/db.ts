/**
 * Database access for lead storage.
 *
 * Production (Vercel): set DATABASE_URL to a Postgres connection string
 * (Neon/Supabase/Vercel Postgres pooled endpoint) and the `pg` driver is used.
 *
 * Local development: with no DATABASE_URL the embedded PGlite database
 * (a real Postgres compiled to WASM) is used, so the form and the admin panel
 * work without provisioning anything.
 */

export type Query = <T = Record<string, unknown>>(
  text: string,
  params?: unknown[],
) => Promise<T[]>;

export type Database = {
  query: Query;
  driver: "postgres" | "pglite";
};

/**
 * Schema statements are executed one at a time: the extended query protocol
 * used by both drivers rejects several commands in a single prepared statement.
 */
const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS leads (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    social TEXT NOT NULL DEFAULT '',
    method TEXT NOT NULL,
    rider TEXT NOT NULL DEFAULT '',
    size TEXT NOT NULL DEFAULT '',
    color TEXT NOT NULL DEFAULT '',
    comment TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'new',
    source_ip TEXT NOT NULL DEFAULT '',
    user_agent TEXT NOT NULL DEFAULT '',
    telegram_status TEXT NOT NULL DEFAULT 'pending'
  )`,
  `CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads (created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS leads_ip_created_at_idx ON leads (source_ip, created_at DESC)`,
];

let pending: Promise<Database | null> | null = null;

/**
 * The embedded database is a development convenience. Setting PGLITE_DIR
 * explicitly also enables it, which is how a production build is exercised
 * locally without provisioning Postgres. On Vercel the variable is unset.
 */
function pgliteDir(): string | undefined {
  return process.env.PGLITE_DIR;
}

export function databaseConfigured(): boolean {
  if (process.env.DATABASE_URL || pgliteDir()) return true;
  return process.env.NODE_ENV !== "production";
}

/** Notes whether the current environment can persist leads at all. */
export function databaseMode(): "postgres" | "pglite" | "unavailable" {
  if (process.env.DATABASE_URL) return "postgres";
  return databaseConfigured() ? "pglite" : "unavailable";
}

export function getDatabase(): Promise<Database | null> {
  pending ??= connect().catch((error) => {
    console.error("[db] connection failed", error);
    pending = null;
    return null;
  });
  return pending;
}

async function connect(): Promise<Database | null> {
  const url = process.env.DATABASE_URL;
  if (url) {
    const { Pool } = await import("pg");
    const globalPool = globalThis as typeof globalThis & { __kantPool?: InstanceType<typeof Pool> };
    const pool =
      globalPool.__kantPool ??
      new Pool({
        connectionString: url,
        max: 3,
        idleTimeoutMillis: 10_000,
        connectionTimeoutMillis: 5_000,
        ssl: needsSsl(url) ? { rejectUnauthorized: false } : undefined,
      });
    globalPool.__kantPool = pool;
    pool.on("error", (error) => console.error("[db] idle client error", error));
    const database: Database = {
      driver: "postgres",
      query: async <T,>(text: string, params?: unknown[]) => {
        const result = await pool.query(text, params as never[] | undefined);
        return result.rows as T[];
      },
    };
    await migrate(database);
    return database;
  }

  const directory = pgliteDir();
  if (!directory && process.env.NODE_ENV === "production") return null;

  const { PGlite } = await import("@electric-sql/pglite");
  const globalPglite = globalThis as typeof globalThis & { __kantPglite?: InstanceType<typeof PGlite> };
  const client = globalPglite.__kantPglite ?? new PGlite(directory ?? ".pglite");
  globalPglite.__kantPglite = client;
  await client.waitReady;
  const database: Database = {
    driver: "pglite",
    query: async <T,>(text: string, params?: unknown[]) => {
      const result = await client.query<T>(text, params);
      return result.rows;
    },
  };
  await migrate(database);
  return database;
}

async function migrate(database: Database): Promise<void> {
  for (const statement of SCHEMA_STATEMENTS) {
    await database.query(statement);
  }
}

function needsSsl(url: string): boolean {
  if (/sslmode=disable/.test(url)) return false;
  if (/localhost|127\.0\.0\.1/.test(url)) return false;
  return true;
}
