import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

// Configuration Neon
const sql = neon(process.env.DATABASE_URL);

// Export pour Drizzle ORM
export const db = drizzle(sql);

// Helper pour les requêtes directes
export const sqlQuery = (query, params = []) => {
  return sql.query(query, params);
};
