import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL);

await sql`
  CREATE TABLE IF NOT EXISTS delivery_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    id_type TEXT CHECK (id_type IN ('national_id', 'passport', 'driver_license')),
    id_number TEXT,
    id_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;
console.log('✓ delivery_profiles table created');

await sql`
  CREATE TABLE IF NOT EXISTS delivery_vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_profile_id UUID NOT NULL REFERENCES delivery_profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('pedestrian', 'bicycle', 'motorcycle', 'car', 'truck')),
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;
console.log('✓ delivery_vehicles table created');

// Ensure only one active vehicle per profile
await sql`
  CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_vehicle
  ON delivery_vehicles (delivery_profile_id) WHERE is_active = true
`;
console.log('✓ active vehicle index created');

await sql`
  CREATE TABLE IF NOT EXISTS delivery_planned_trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_profile_id UUID NOT NULL REFERENCES delivery_profiles(id) ON DELETE CASCADE,
    origin_lat DECIMAL(10,8) NOT NULL,
    origin_lon DECIMAL(11,8) NOT NULL,
    destination_lat DECIMAL(10,8) NOT NULL,
    destination_lon DECIMAL(11,8) NOT NULL,
    waypoints JSONB DEFAULT '[]',
    deviation_km DECIMAL(5,2) DEFAULT 2.0,
    departure_time TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;
console.log('✓ delivery_planned_trips table created');

await sql`
  CREATE INDEX IF NOT EXISTS idx_delivery_trips_active ON delivery_planned_trips(delivery_profile_id, is_active)
`;
console.log('✓ trip indexes created');

// Add delivery_tier to users for subscription limits
await sql`
  ALTER TABLE users ADD COLUMN IF NOT EXISTS delivery_tier TEXT DEFAULT 'free' CHECK (delivery_tier IN ('free', 'premium'))
`;
console.log('✓ delivery_tier column added to users');

process.exit(0);
