import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep module resolution inside this checkout: the parent directory also
  // holds a lockfile, which otherwise confuses Turbopack's root guessing.
  turbopack: { root: process.cwd() },
  // The embedded Postgres ships WASM glue that breaks when bundled, so it is
  // loaded from node_modules at runtime. It is only used when DATABASE_URL is
  // absent, which never happens on Vercel.
  serverExternalPackages: ["@electric-sql/pglite"],
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
