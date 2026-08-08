-- Omni Pitch Day Seed — Facilities Lomé, Togo
-- Prereqs: Run 0001_baseline.sql + 0007_pitch_day.sql first
-- Users must already exist (created via Neon Auth signup)

-- Upsert demo users (skip if email already exists)
INSERT INTO users (id, name, email, phone, preferred_language, created_at, updated_at)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Kofi Agbeko',  'demo-vendor@omni.tg', '+22890123456', 'fr', NOW(), NOW()),
  ('a0000000-0000-0000-0000-000000000002', 'Ama Dedé',     'demo-buyer@omni.tg',  '+22891234567', 'fr', NOW(), NOW()),
  ('a0000000-0000-0000-0000-000000000011', 'Kofi Junior',  'kofi@vendor.omni',    '+22812345678', 'fr', NOW(), NOW()),
  ('a0000000-0000-0000-0000-000000000012', 'Ama Sellers',  'ama@vendor.omni',     '+22887654321', 'fr', NOW(), NOW()),
  ('a0000000-0000-0000-0000-000000000013', 'Mariam Traoré','mariam@vendor.omni',  '+22898764432', 'fr', NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, phone = EXCLUDED.phone
WHERE users.name IS DISTINCT FROM EXCLUDED.name OR users.phone IS DISTINCT FROM EXCLUDED.phone;

-- Upsert vendors (match by name + user_id subquery)
-- Uses subqueries to resolve actual user IDs even if they differ from our fixed UUIDs
INSERT INTO vendors (user_id, name, category, description, phone, address, location, is_online, sponsor_tier, created_at, updated_at)
SELECT u.id, v.name, v.category, v.description, v.phone, v.address, v.loc, true, v.tier, NOW(), NOW()
FROM (VALUES
  ('demo-vendor@omni.tg', 'Boutique Kofi',    'Électronique', 'Phones, accessoires et recharges', '+22890123456', 'Bè, Lomé',      ST_SetSRID(ST_Point(1.2228, 6.1319), 4326)::geography, 'premium'),
  ('kofi@vendor.omni',    'Kofi Electronics', 'Électronique', 'Phones et accessoires',            '+22812345678', 'Marché de Bè',   ST_SetSRID(ST_Point(1.2228, 6.1319), 4326)::geography, 'pro'),
  ('ama@vendor.omni',     'Ama Market Stand',  'Alimentation',  'Fruits, légumes, produits frais', '+22887654321', 'Marché de Lomé', ST_SetSRID(ST_Point(1.2235, 6.1325), 4326)::geography, 'free'),
  ('mariam@vendor.omni',  'Mariam Boutique',  'Vêtements',     'Pagnes wax et prêt-à-porter',     '+22898764432', 'Tokoin',         ST_SetSRID(ST_Point(1.2215, 6.1305), 4326)::geography, 'free')
) AS v(email, name, category, description, phone, address, loc, tier)
JOIN users u ON u.email = v.email
ON CONFLICT (name) DO UPDATE SET
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  sponsor_tier = EXCLUDED.sponsor_tier;

-- Upsert facilities (match by name)
INSERT INTO facilities (vendor_id, name, type, category, description, address, location, is_online, last_confirmed_at, in_stock, created_at, updated_at)
SELECT v.id, f.name, f.type, f.category, f.desc, f.address, f.loc, true, NOW() - (random() * interval '3 days'), true, NOW(), NOW()
FROM vendors v
CROSS JOIN (VALUES
  ('Pharmacie du Centre',   'fixed', 'Pharmacie',   'Médicaments et parapharmacie', 'Agbalepedogan', ST_SetSRID(ST_Point(1.2250, 6.1380), 4326)::geography),
  ('Boulangerie Adidogomé', 'fixed', 'Boulangerie', 'Pain et pâtisseries fraîches',  'Adidogomé',     ST_SetSRID(ST_Point(1.2200, 6.1350), 4326)::geography),
  ('Marché de Agoènyivé',   'mobile','Alimentation', 'Fruits et légumes du marché',  'Agoènyivé',     ST_SetSRID(ST_Point(1.2280, 6.1400), 4326)::geography),
  ('Quincaillerie Kégué',   'fixed', 'Quincaillerie','Outillage et quincaillerie',   'Kégué',         ST_SetSRID(ST_Point(1.2190, 6.1280), 4326)::geography),
  ('Boutique Amoutivé',     'fixed', 'Vêtements',   'Mode et accessoires',          'Amoutivé',      ST_SetSRID(ST_Point(1.2300, 6.1360), 4326)::geography),
  ('Menuiserie Tokoin',     'fixed', 'Artisanat',   'Meubles et bois sur mesure',   'Tokoin',        ST_SetSRID(ST_Point(1.2210, 6.1310), 4326)::geography),
  ('Station Lomé Haute',    'fixed', 'Carburant',   'Essence et gasoil',            'Lomé Haute',    ST_SetSRID(ST_Point(1.2170, 6.1420), 4326)::geography),
  ('Cyber Café Bè',         'fixed', 'Services',    'Internet et impression',       'Bè',            ST_SetSRID(ST_Point(1.2235, 6.1315), 4326)::geography),
  ('Épicerie Agoè',         'fixed', 'Alimentation', 'Épicerie générale',            'Agoè',          ST_SetSRID(ST_Point(1.2260, 6.1390), 4326)::geography),
  ('Auto-Parts Adidogomé',  'fixed', 'Automobile',  'Pièces auto et accessoires',   'Adidogomé',     ST_SetSRID(ST_Point(1.2215, 6.1345), 4326)::geography),
  ('Marché de Ganhi',       'mobile','Alimentation', 'Produits frais en plein air',  'Ganhi',         ST_SetSRID(ST_Point(1.2245, 6.1370), 4326)::geography),
  ('Bijouterie Centre',     'fixed', 'Bijoux',      'Bijoux fantaisie et or',       'Centre-ville',  ST_SetSRID(ST_Point(1.2225, 6.1355), 4326)::geography)
) AS f(name, type, category, desc, address, loc)
WHERE v.name IN ('Kofi Electronics', 'Ama Market Stand', 'Mariam Boutique', 'Boutique Kofi')
  AND NOT EXISTS (SELECT 1 FROM facilities WHERE name = f.name);

-- Products (require vendor_id NOT NULL — join facilities back to vendors)
INSERT INTO products (vendor_id, facility_id, name, price, unit, description, is_available, created_at, updated_at)
SELECT f.vendor_id, f.id, p.name, p.price, p.unit, p.desc, true, NOW(), NOW()
FROM facilities f
CROSS JOIN (VALUES
  ('iPhone 12', 150000, 'pièce', 'Smartphone reconditionné'),
  ('Samsung Galaxy A54', 120000, 'pièce', 'Neuf en boîte'),
  ('Chargeur universel', 5000, 'pièce', 'USB-C rapide'),
  ('Écouteurs Bluetooth', 8000, 'pièce', 'Sans fil'),
  ('Tomates fraîches', 500, 'kg', 'Produit local'),
  ('Oignons', 300, 'kg', 'Frais du marché'),
  ('Piment vert', 1000, 'kg', 'Piment vert du pays'),
  ('Ignames', 800, 'kg', 'Igname blanche'),
  ('Pagne wax', 8000, 'pièce', 'Wax hollandais'),
  ('Robe wax', 15000, 'pièce', 'Couture locale'),
  ('Paracetamol', 500, 'boîte', '10 comprimés'),
  ('Vitamine C', 2000, 'flacon', '30 gélules'),
  ('Pain', 250, 'pièce', 'Pain baguette'),
  ('Croissant', 500, 'pièce', 'Beurre'),
  ('Ciment', 7000, 'sac', '50kg'),
  ('Clous', 3000, 'kg', 'Clous fer'),
  ('Essence', 750, 'litre', 'Super'),
  ('Gasoil', 650, 'litre', 'Diesel'),
  ('Ordinateur portable', 250000, 'pièce', 'Dell reconditionné'),
  ('Câble HDMI', 3000, 'pièce', '2 mètres'),
  ('Riz', 600, 'kg', 'Riz local'),
  ('Huile de palme', 2000, 'litre', 'Raffiné'),
  ('Savon local', 500, 'pièce', 'Savon de Marseille'),
  ('Chaussures', 12000, 'pièce', 'Cuir synthétique'),
  ('Ceinture', 3000, 'pièce', 'Cuir')
) AS p(name, price, unit, desc)
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = p.name);

-- Demo Wallets (use subquery to get actual user ID by email)
INSERT INTO wallets (user_id, balance, created_at, updated_at)
SELECT id, 25000, NOW(), NOW() FROM users WHERE email = 'demo-vendor@omni.tg'
  AND NOT EXISTS (SELECT 1 FROM wallets WHERE user_id = (SELECT id FROM users WHERE email = 'demo-vendor@omni.tg'));

INSERT INTO wallets (user_id, balance, created_at, updated_at)
SELECT id, 50000, NOW(), NOW() FROM users WHERE email = 'demo-buyer@omni.tg'
  AND NOT EXISTS (SELECT 1 FROM wallets WHERE user_id = (SELECT id FROM users WHERE email = 'demo-buyer@omni.tg'));

-- Coupons (vendor_id via subquery)
INSERT INTO coupons (vendor_id, code, discount_percent, valid_until, max_uses)
SELECT id, 'BIENVENUE10', 10, NOW() + interval '30 days', 100
FROM vendors WHERE name = 'Kofi Electronics'
  AND NOT EXISTS (SELECT 1 FROM coupons WHERE code = 'BIENVENUE10');

INSERT INTO coupons (vendor_id, code, discount_percent, valid_until, max_uses)
SELECT id, 'PITCH2026', 20, NOW() + interval '7 days', 50
FROM vendors WHERE name = 'Ama Market Stand'
  AND NOT EXISTS (SELECT 1 FROM coupons WHERE code = 'PITCH2026');

-- Sample carts for demo buyer (carts has no 'total' column)
INSERT INTO carts (buyer_id, facility_id, status, created_at, updated_at)
SELECT u.id, f.id, 'completed', NOW() - interval '2 days', NOW() - interval '2 days'
FROM users u, facilities f
WHERE u.email = 'demo-buyer@omni.tg' AND f.name = 'Pharmacie du Centre'
  AND NOT EXISTS (SELECT 1 FROM carts WHERE buyer_id = u.id AND facility_id = f.id);

INSERT INTO carts (buyer_id, facility_id, status, created_at, updated_at)
SELECT u.id, f.id, 'pending', NOW(), NOW()
FROM users u, facilities f
WHERE u.email = 'demo-buyer@omni.tg' AND f.name = 'Boulangerie Adidogomé'
  AND NOT EXISTS (SELECT 1 FROM carts WHERE buyer_id = u.id AND facility_id = f.id AND status = 'pending');
