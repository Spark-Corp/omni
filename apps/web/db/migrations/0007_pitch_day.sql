-- Omni Pitch Day migration
-- Adds freshness tracking, sponsorship, and demo-ready fields

ALTER TABLE facilities ADD COLUMN IF NOT EXISTS last_confirmed_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE facilities ADD COLUMN IF NOT EXISTS in_stock BOOLEAN DEFAULT true;

ALTER TABLE vendors ADD COLUMN IF NOT EXISTS sponsor_tier TEXT DEFAULT 'free' CHECK (sponsor_tier IN ('free', 'pro', 'premium'));

CREATE TABLE IF NOT EXISTS wishlist (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE TABLE IF NOT EXISTS coupons (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  discount_percent INTEGER NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
  valid_until TIMESTAMPTZ NOT NULL,
  max_uses INTEGER DEFAULT 100,
  current_uses INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id SERIAL PRIMARY KEY,
  coupon_id INTEGER NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(coupon_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_facilities_last_confirmed ON facilities(last_confirmed_at);
CREATE INDEX IF NOT EXISTS idx_vendors_sponsor_tier ON vendors(sponsor_tier);
CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_coupons_vendor ON coupons(vendor_id);
