import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from "@shared/schema";

// Create SQLite database for development
const sqlite = new Database('./dev.db');
export const db = drizzle(sqlite, { schema });

console.log('Using SQLite database for development');