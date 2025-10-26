// Support Postgres (cloud) when DATABASE_URL is provided, otherwise fall back to SQLite for local dev.
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

let db: any;

if (process.env.DATABASE_URL) {
	try {
		// use synchronous require so we don't rely on top-level await
		const { Pool } = require('pg');
		const { drizzle: pgDrizzle } = require('drizzle-orm/node-postgres');
		const pgSchema = require('../shared/schema');

		const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
		db = pgDrizzle(pool, { schema: pgSchema });
		console.log('Using Postgres database from DATABASE_URL');
	} catch (err) {
		console.error('Failed to initialize Postgres connection, falling back to SQLite:', err);
		const Database = require('better-sqlite3').default;
		const { drizzle: sqliteDrizzle } = require('drizzle-orm/better-sqlite3');
		const sqliteSchema = require('../shared/schema-sqlite');
		const sqlite = new Database('./dev.db');
		db = sqliteDrizzle(sqlite, { schema: sqliteSchema });
		console.log('Using SQLite database (fallback)');
	}
} else {
	// SQLite local dev
	const Database = require('better-sqlite3').default;
	const { drizzle: sqliteDrizzle } = require('drizzle-orm/better-sqlite3');
	const sqliteSchema = require('../shared/schema-sqlite');
	const sqlite = new Database('./dev.db');
	db = sqliteDrizzle(sqlite, { schema: sqliteSchema });
	console.log('Using SQLite database for development');
}

export { db };
