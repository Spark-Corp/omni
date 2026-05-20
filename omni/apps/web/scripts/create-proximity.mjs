import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL);

await sql`
  CREATE TABLE IF NOT EXISTS proximity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nearby_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    distance_meters DECIMAL(10,2),
    lat DECIMAL(10,8),
    lon DECIMAL(11,8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;
console.log('✓ proximity_log table created');

await sql`
  CREATE INDEX IF NOT EXISTS idx_proximity_user ON proximity_log(user_id, created_at)
`;
console.log('✓ proximity log index created');

process.exit(0);
