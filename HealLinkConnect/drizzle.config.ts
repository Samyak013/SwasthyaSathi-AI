import { defineConfig } from "drizzle-kit";

// Support both Postgres (cloud) and SQLite (local dev).
// If DATABASE_URL is set, use Postgres schema and credentials.
// Otherwise default to SQLite schema to let local development and CI run without a cloud DB.
const usePostgres = !!process.env.DATABASE_URL;

const config = usePostgres
  ? {
      out: "./migrations",
      schema: "./shared/schema.ts",
      dialect: "postgresql",
      // assertion: drizzle-kit expects a string here when using postgres
      dbCredentials: { url: process.env.DATABASE_URL as string },
    }
  : {
      out: "./migrations",
      schema: "./shared/schema-sqlite.ts",
      dialect: "sqlite",
      dbCredentials: { filepath: "./dev.db" },
    };

export default defineConfig(config as any);
