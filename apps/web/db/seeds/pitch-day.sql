-- Omni Pitch Day Seed — 12-15 facilities Lomé, Togo
-- Run AFTER development.sql

-- Demo Users
INSERT INTO users (id, name, email, phone, language, role, created_at, updated_at)
VALUES
  ('demo-vendor-omni', 'Kofi Agbeko', 'demo-vendor@omni.tg', '+22890123456', 'fr', 'vendor', NOW(), NOW()),
  ('demo-buyer-omni', 'Ama Dedé', 'demo-buyer@omni.tg', '+22891234567', 'fr', 'buyer', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Demo Wallets
INSERT INTO wallets (user_id, balance, created_at, updated_at)
VALUES
  ('demo-vendor-omni', 25000, NOW(), NOW()),
  ('demo-buyer-omni', 50000, NOW(), NOW())
ON CONFLICT (user_id) DO NOTHING;

-- Vendeurs variés
INSERT INTO vendors (user_id, name, category, description, phone, address, latitude, longitude, is_online, sponsor_tier, created_at, updated_at)
VALUES
  ('kofi@vendor.omni', 'Kofi Electronics', 'Électronique', 'Phones et accessoires', '+22812345678', 'Marché de Bè', 6.1319, 1.2228, true, 'pro', NOW(), NOW()),
  ('ama@vendor.omni', 'Ama Market Stand', 'Alimentation', 'Fruits, légumes, produits frais', '+22887654321', 'Marché de Lomé', 6.1325, 1.2235, true, 'free', NOW(), NOW()),
  ('mariam@vendor.omni', 'Mariam Boutique', 'Vêtements', 'Pagnes wax et prêt-à-porter', '+22898764432', 'Tokoin', 6.1305, 1.2215, true, 'free', NOW(), NOW()),
  ('demo-vendor-omni', 'Boutique Kofi', 'Électronique', 'Phones, accessoires et recharges', '+22890123456', 'Bè, Lomé', 6.1319, 1.2228, true, 'premium', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Facilities (12 dans différents quartiers de Lomé)
INSERT INTO facilities (vendor_id, name, type, category, address, latitude, longitude, is_open, last_confirmed_at, in_stock, created_at, updated_at)
SELECT v.id, f.name, f.type, f.category, f.address, f.lat, f.lon, true, NOW() - (random() * interval '3 days'), true, NOW(), NOW()
FROM vendors v, (VALUES
  ('Pharmacie du Centre', 'fixed', 'Pharmacie', 'Agbalepedogan', 6.1380, 1.2250),
  ('Boulangerie Adidogomé', 'fixed', 'Boulangerie', 'Adidogomé', 6.1350, 1.2200),
  ('Marché de Agoènyivé', 'mobile', 'Alimentation', 'Agoènyivé', 6.1400, 1.2280),
  ('Quincaillerie Kégué', 'fixed', 'Quincaillerie', 'Kégué', 6.1280, 1.2190),
  ('Boutique Amoutivé', 'fixed', 'Vêtements', 'Amoutivé', 6.1360, 1.2300),
  ('Menuiserie Tokoin', 'fixed', 'Artisanat', 'Tokoin', 6.1310, 1.2210),
  ('Station Lomé Haute', 'fixed', 'Carburant', 'Lomé Haute', 6.1420, 1.2170),
  ('Cyber Café Bè', 'fixed', 'Services', 'Bè', 6.1315, 1.2235),
  ('Épicerie Agoè', 'fixed', 'Alimentation', 'Agoè', 6.1390, 1.2260),
  ('Auto-Parts Adidogomé', 'fixed', 'Automobile', 'Adidogomé', 6.1345, 1.2215),
  ('Marché de Ganhi', 'mobile', 'Alimentation', 'Ganhi', 6.1370, 1.2245),
  ('Bijouterie Centre', 'fixed', 'Bijoux', 'Centre-ville', 6.1355, 1.2225)
) AS f(name, type, category, address, lat, lon)
WHERE v.name IN ('Kofi Electronics', 'Ama Market Stand', 'Mariam Boutique', 'Boutique Kofi')
AND NOT EXISTS (SELECT 1 FROM facilities WHERE name = f.name);

-- Products (25 produits variés)
INSERT INTO products (facility_id, name, price, unit, description, in_stock, created_at, updated_at)
SELECT fac.id, p.name, p.price, p.unit, p.desc, true, NOW(), NOW()
FROM facilities fac, (VALUES
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

-- Coupons demo
INSERT INTO coupons (vendor_id, code, discount_percent, valid_until, max_uses)
SELECT v.id, 'BIENVENUE10', 10, NOW() + interval '30 days', 100
FROM vendors v WHERE v.name = 'Kofi Electronics'
AND NOT EXISTS (SELECT 1 FROM coupons WHERE code = 'BIENVENUE10');

INSERT INTO coupons (vendor_id, code, discount_percent, valid_until, max_uses)
SELECT v.id, 'PITCH2026', 20, NOW() + interval '7 days', 50
FROM vendors v WHERE v.name = 'Ama Market Stand'
AND NOT EXISTS (SELECT 1 FROM coupons WHERE code = 'PITCH2026');

-- Sample orders for demo buyer
INSERT INTO carts (buyer_id, facility_id, status, total, created_at, updated_at)
SELECT 'demo-buyer-omni', fac.id, 'completed', 16500, NOW() - interval '2 days', NOW() - interval '2 days'
FROM facilities fac WHERE fac.name = 'Pharmacie du Centre'
AND NOT EXISTS (SELECT 1 FROM carts WHERE buyer_id = 'demo-buyer-omni' AND facility_id = fac.id);

INSERT INTO carts (buyer_id, facility_id, status, total, created_at, updated_at)
SELECT 'demo-buyer-omni', fac.id, 'pending', 3500, NOW(), NOW()
FROM facilities fac WHERE fac.name = 'Boulangerie Adidogomé'
AND NOT EXISTS (SELECT 1 FROM carts WHERE buyer_id = 'demo-buyer-omni' AND facility_id = fac.id AND status = 'pending');
