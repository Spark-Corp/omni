import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL);

await sql`
  CREATE TABLE IF NOT EXISTS carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    note TEXT,
    payment_method TEXT DEFAULT 'cash' CHECK (payment_method IN ('cash', 'escrow')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'partial', 'denied', 'completed', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '5 minutes'),
    responded_at TIMESTAMP,
    completed_at TIMESTAMP
  )
`;
console.log('✓ carts table created');

await sql`
  CREATE INDEX IF NOT EXISTS idx_carts_buyer ON carts(buyer_id)
`;
await sql`
  CREATE INDEX IF NOT EXISTS idx_carts_facility ON carts(facility_id)
`;
await sql`
  CREATE INDEX IF NOT EXISTS idx_carts_status ON carts(status)
`;
console.log('✓ cart indexes created');

await sql`
  ALTER TABLE availability_requests ADD COLUMN IF NOT EXISTS cart_id UUID REFERENCES carts(id) ON DELETE SET NULL
`;
console.log('✓ cart_id added to availability_requests');

await sql`
  CREATE INDEX IF NOT EXISTS idx_ar_cart ON availability_requests(cart_id)
`;
console.log('✓ cart index on availability_requests');

process.exit(0);
