-- Omni Pitch Day Seed — Facilities Lomé, Togo
-- Prereqs: Run 0001_baseline.sql + 0007_pitch_day.sql first

-- Demo Users (UUIDs must match UUID PK type)
INSERT INTO users (id, name, email, phone, preferred_language, created_at, updated_at)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Kofi Agbeko',  'demo-vendor@omni.tg', '+22890123456', 'fr', NOW(), NOW()),
  ('a0000000-0000-0000-0000-000000000002', 'Ama Dedé',     'demo-buyer@omni.tg',  '+22891234567', 'fr', NOW(), NOW()),
  ('a0000000-0000-0000-0000-000000000011', 'Kofi Junior',  'kofi@vendor.omni',    '+22812345678', 'fr', NOW(), NOW()),
  ('a0000000-0000-0000-0000-000000000012', 'Ama Sellers',  'ama@vendor.omni',     '+22887654321', 'fr', NOW(), NOW()),
  ('a0000000-0000-0000-0000-000000000013', 'Mariam Traoré','mariam@vendor.omni',  '+22898764432', 'fr', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Vendors (4 vendeurs dans différents quartiers de Lomé)
INSERT INTO vendors (id, user_id, name, category, description, phone, address, location, is_online, sponsor_tier, created_at, updated_at)
VALUES
  ('b0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000011', 'Kofi Electronics', 'Électronique', 'Phones et accessoires', '+22812345678', 'Marché de Bè',   ST_SetSRID(ST_Point(1.2228, 6.1319), 4326)::geography, true, 'pro',      NOW(), NOW()),
  ('b0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000012', 'Ama Market Stand',  'Alimentation',  'Fruits, légumes, produits frais', '+22887654321', 'Marché de Lomé', ST_SetSRID(ST_Point(1.2235, 6.1325), 4326)::geography, true, 'free',     NOW(), NOW()),
  ('b0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000013', 'Mariam Boutique',  'Vêtements',     'Pagnes wax et prêt-à-porter',     '+22898764432', 'Tokoin',         ST_SetSRID(ST_Point(1.2215, 6.1305), 4326)::geography, true, 'free',     NOW(), NOW()),
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Boutique Kofi',    'Électronique', 'Phones, accessoires et recharges', '+22890123456', 'Bè, Lomé',      ST_SetSRID(ST_Point(1.2228, 6.1319), 4326)::geography, true, 'premium',  NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Facilities (12 dans différents quartiers de Lomé)
-- Each linked to a vendor via vendor_id
INSERT INTO facilities (vendor_id, name, type, category, description, address, location, is_online, last_confirmed_at, in_stock, created_at, updated_at)
VALUES
  ('b0000000-0000-0000-0000-000000000011', 'Pharmacie du Centre',   'fixed', 'Pharmacie',   'Médicaments et parapharmacie', 'Agbalepedogan', ST_SetSRID(ST_Point(1.2250, 6.1380), 4326)::geography, true, NOW() - (random() * interval '3 days'), true, NOW(), NOW()),
  ('b0000000-0000-0000-0000-000000000012', 'Boulangerie Adidogomé', 'fixed', 'Boulangerie', 'Pain et pâtisseries fraîches',  'Adidogomé',     ST_SetSRID(ST_Point(1.2200, 6.1350), 4326)::geography, true, NOW() - (random() * interval '3 days'), true, NOW(), NOW()),
  ('b0000000-0000-0000-0000-000000000012', 'Marché de Agoènyivé',   'mobile', 'Alimentation','Fruits et légumes du marché',   'Agoènyivé',     ST_SetSRID(ST_Point(1.2280, 6.1400), 4326)::geography, true, NOW() - (random() * interval '3 days'), true, NOW(), NOW()),
  ('b0000000-0000-0000-0000-000000000011', 'Quincaillerie Kégué',   'fixed', 'Quincaillerie','Outillage et quincaillerie',    'Kégué',         ST_SetSRID(ST_Point(1.2190, 6.1280), 4326)::geography, true, NOW() - (random() * interval '3 days'), true, NOW(), NOW()),
  ('b0000000-0000-0000-0000-000000000013', 'Boutique Amoutivé',     'fixed', 'Vêtements',   'Mode et accessoires',           'Amoutivé',      ST_SetSRID(ST_Point(1.2300, 6.1360), 4326)::geography, true, NOW() - (random() * interval '3 days'), true, NOW(), NOW()),
  ('b0000000-0000-0000-0000-000000000013', 'Menuiserie Tokoin',     'fixed', 'Artisanat',   'Meubles et bois sur mesure',    'Tokoin',        ST_SetSRID(ST_Point(1.2210, 6.1310), 4326)::geography, true, NOW() - (random() * interval '3 days'), true, NOW(), NOW()),
  ('b0000000-0000-0000-0000-000000000011', 'Station Lomé Haute',    'fixed', 'Carburant',   'Essence et gasoil',             'Lomé Haute',    ST_SetSRID(ST_Point(1.2170, 6.1420), 4326)::geography, true, NOW() - (random() * interval '3 days'), true, NOW(), NOW()),
  ('b0000000-0000-0000-0000-000000000011', 'Cyber Café Bè',         'fixed', 'Services',    'Internet et impression',        'Bè',            ST_SetSRID(ST_Point(1.2235, 6.1315), 4326)::geography, true, NOW() - (random() * interval '3 days'), true, NOW(), NOW()),
  ('b0000000-0000-0000-0000-000000000012', 'Épicerie Agoè',         'fixed', 'Alimentation','Épicerie générale',             'Agoè',          ST_SetSRID(ST_Point(1.2260, 6.1390), 4326)::geography, true, NOW() - (random() * interval '3 days'), true, NOW(), NOW()),
  ('b0000000-0000-0000-0000-000000000011', 'Auto-Parts Adidogomé',  'fixed', 'Automobile',  'Pièces auto et accessoires',    'Adidogomé',     ST_SetSRID(ST_Point(1.2215, 6.1345), 4326)::geography, true, NOW() - (random() * interval '3 days'), true, NOW(), NOW()),
  ('b0000000-0000-0000-0000-000000000012', 'Marché de Ganhi',       'mobile', 'Alimentation','Produits frais en plein air',   'Ganhi',         ST_SetSRID(ST_Point(1.2245, 6.1370), 4326)::geography, true, NOW() - (random() * interval '3 days'), true, NOW(), NOW()),
  ('b0000000-0000-0000-0000-000000000013', 'Bijouterie Centre',     'fixed', 'Bijoux',      'Bijoux fantaisie et or',        'Centre-ville',  ST_SetSRID(ST_Point(1.2225, 6.1355), 4326)::geography, true, NOW() - (random() * interval '3 days'), true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Products (25 produits variés, each tied to a facility + vendor)
-- Products require vendor_id (NOT NULL) and facility_id
INSERT INTO products (vendor_id, facility_id, name, price, unit, description, is_available, created_at, updated_at)
SELECT v.id, f.id, p.name, p.price, p.unit, p.desc, true, NOW(), NOW()
FROM vendors v
JOIN facilities f ON f.vendor_id = v.id
CROSS JOIN (VALUES
  -- Electronics (Kofi Electronics / Boutique Kofi — vendor b000...011 / b000...001)
  ('iPhone 12', 150000, 'pièce', 'Smartphone reconditionné'),
  ('Samsung Galaxy A54', 120000, 'pièce', 'Neuf en boîte'),
  ('Chargeur universel', 5000, 'pièce', 'USB-C rapide'),
  ('Écouteurs Bluetooth', 8000, 'pièce', 'Sans fil'),
  -- Alimentation (Ama Market Stand — vendor b000...012)
  ('Tomates fraîches', 500, 'kg', 'Produit local'),
  ('Oignons', 300, 'kg', 'Frais du marché'),
  ('Piment vert', 1000, 'kg', 'Piment vert du pays'),
  ('Ignames', 800, 'kg', 'Igname blanche'),
  -- Vêtements (Mariam Boutique — vendor b000...013)
  ('Pagne wax', 8000, 'pièce', 'Wax hollandais'),
  ('Robe wax', 15000, 'pièce', 'Couture locale'),
  -- Pharmacie
  ('Paracetamol', 500, 'boîte', '10 comprimés'),
  ('Vitamine C', 2000, 'flacon', '30 gélules'),
  -- Boulangerie
  ('Pain', 250, 'pièce', 'Pain baguette'),
  ('Croissant', 500, 'pièce', 'Beurre'),
  -- Quincaillerie
  ('Ciment', 7000, 'sac', '50kg'),
  ('Clous', 3000, 'kg', 'Clous fer'),
  -- Carburant
  ('Essence', 750, 'litre', 'Super'),
  ('Gasoil', 650, 'litre', 'Diesel'),
  -- Cyber / Électronique
  ('Ordinateur portable', 250000, 'pièce', 'Dell reconditionné'),
  ('Câble HDMI', 3000, 'pièce', '2 mètres'),
  -- Épicerie
  ('Riz', 600, 'kg', 'Riz local'),
  ('Huile de palme', 2000, 'litre', 'Raffiné'),
  -- Général
  ('Savon local', 500, 'pièce', 'Savon de Marseille'),
  ('Chaussures', 12000, 'pièce', 'Cuir synthétique'),
  ('Ceinture', 3000, 'pièce', 'Cuir')
) AS p(name, price, unit, desc)
WHERE v.name IN ('Kofi Electronics', 'Ama Market Stand', 'Mariam Boutique', 'Boutique Kofi')
  AND NOT EXISTS (SELECT 1 FROM products WHERE name = p.name);

-- Demo Wallets
INSERT INTO wallets (user_id, balance, created_at, updated_at)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 25000, NOW(), NOW()),
  ('a0000000-0000-0000-0000-000000000002', 50000, NOW(), NOW())
ON CONFLICT (user_id) DO NOTHING;

-- Coupons demo
INSERT INTO coupons (vendor_id, code, discount_percent, valid_until, max_uses)
SELECT id, 'BIENVENUE10', 10, NOW() + interval '30 days', 100
FROM vendors WHERE name = 'Kofi Electronics'
  AND NOT EXISTS (SELECT 1 FROM coupons WHERE code = 'BIENVENUE10');

INSERT INTO coupons (vendor_id, code, discount_percent, valid_until, max_uses)
SELECT id, 'PITCH2026', 20, NOW() + interval '7 days', 50
FROM vendors WHERE name = 'Ama Market Stand'
  AND NOT EXISTS (SELECT 1 FROM coupons WHERE code = 'PITCH2026');

-- Sample orders for demo buyer (carts table has no 'total' column)
INSERT INTO carts (buyer_id, facility_id, status, created_at, updated_at)
SELECT 'a0000000-0000-0000-0000-000000000002', f.id, 'completed', NOW() - interval '2 days', NOW() - interval '2 days'
FROM facilities f WHERE f.name = 'Pharmacie du Centre'
  AND NOT EXISTS (SELECT 1 FROM carts WHERE buyer_id = 'a0000000-0000-0000-0000-000000000002' AND facility_id = f.id);

INSERT INTO carts (buyer_id, facility_id, status, created_at, updated_at)
SELECT 'a0000000-0000-0000-0000-000000000002', f.id, 'pending', NOW(), NOW()
FROM facilities f WHERE f.name = 'Boulangerie Adidogomé'
  AND NOT EXISTS (SELECT 1 FROM carts WHERE buyer_id = 'a0000000-0000-0000-0000-000000000002' AND facility_id = f.id AND status = 'pending');
