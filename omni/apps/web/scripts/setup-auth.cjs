const { neon, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');

neonConfig.webSocketConstructor = ws;

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const sql = neon(dbUrl);

async function setup() {
  console.log('Creating auth_users table...');
  
  await sql(`CREATE TABLE IF NOT EXISTS auth_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
  
  console.log('Table created!');

  await sql(`CREATE INDEX IF NOT EXISTS idx_auth_users_email ON auth_users(email)`);
  console.log('Index created!');
  
  process.exit(0);
}

setup().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});