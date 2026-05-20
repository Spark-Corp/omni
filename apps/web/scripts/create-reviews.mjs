import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL);

await sql`
  CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(facility_id, user_id)
  )
`;
console.log('✓ reviews table created');

await sql`
  CREATE INDEX IF NOT EXISTS idx_reviews_facility ON reviews(facility_id)
`;
await sql`
  CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id)
`;
console.log('✓ review indexes created');

// Recalculate ratings for all facilities
await sql`
  UPDATE facilities f
  SET rating = (
    SELECT ROUND(AVG(r.rating)::numeric, 1)
    FROM reviews r
    WHERE r.facility_id = f.id
  )
`;
console.log('✓ facility ratings recalculated');

process.exit(0);
