-- Ajouter des vendeurs pour démo POC
-- Ces vendors n'ont pas de user_id (pour la démo)

-- Ajouter 5 vendors autour de Lomé
INSERT INTO vendors (name, category, description, phone, location, address, neighborhood, is_online, is_available, rating, created_at, updated_at) 
VALUES 
  ('Tech Store Lomé', 'Électronique', 'Téléphones, ordinateurs et accessoires', '+22890123456', ST_SetSRID(ST_MakePoint(1.2250, 6.1319), 4326), 'Avenue de la Gare', 'Centre', true, true, 4.5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Marché Fruits Frais', 'Alimentation', 'Fruits et légumes frais du jour', '+22890123457', ST_SetSRID(ST_MakePoint(1.2320, 6.1250), 4326), 'Marché Central', 'Centre', true, true, 4.8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Boutique Mode', 'Mode et Vêtements', 'Vêtements tendance et accessoires', '+22890123458', ST_SetSRID(ST_MakePoint(1.2200, 6.1350), 4326), 'Rue du Commerce', 'Bè', true, true, 4.2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Pharmacie du Quartier', 'Santé', 'Médicaments et produits de santé', '+22890123459', ST_SetSRID(ST_MakePoint(1.2280, 6.1280), 4326), 'Boulevard du 30Août', 'Kpalimé', true, true, 4.7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Restaurant Le Déjeuner', 'Restauration', 'Cuisine locale et internationale', '+22890123460', ST_SetSRID(ST_MakePoint(1.2350, 6.1300), 4326), 'Avenue de la Paix', 'Centre', true, true, 4.4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Ajouter des produits pour chaque vendor
INSERT INTO products (vendor_id, name, price, unit)
SELECT 
  v.id,
  CASE 
    WHEN v.category = 'Électronique' THEN unnest(ARRAY['Téléphone Samsung', 'Chargeur USB', 'Casque Audio'])
    WHEN v.category = 'Alimentation' THEN unnest(ARRAY['Bananes', 'Tomates', 'Oranges'])
    WHEN v.category = 'Mode et Vêtements' THEN unnest(ARRAY['Chemise Hommes', 'Robe Femmes', 'Chaussures'])
    WHEN v.category = 'Santé' THEN unnest(ARRAY['Paracétamol', 'Vitamines C', 'Pansements'])
    WHEN v.category = 'Restauration' THEN unnest(ARRAY['Attiekè', 'Riz sauce', 'Poulet rôti'])
  END,
  CASE 
    WHEN v.category = 'Électronique' THEN unnest(ARRAY[25000, 5000, 15000])
    WHEN v.category = 'Alimentation' THEN unnest(ARRAY[500, 300, 200])
    WHEN v.category = 'Mode et Vêtements' THEN unnest(ARRAY[15000, 12000, 18000])
    WHEN v.category = 'Santé' THEN unnest(ARRAY[500, 1500, 1000])
    WHEN v.category = 'Restauration' THEN unnest(ARRAY[1500, 2000, 2500])
  END,
  CASE 
    WHEN v.category = 'Électronique' THEN unnest(ARRAY['unité', 'unité', 'unité'])
    WHEN v.category = 'Alimentation' THEN unnest(ARRAY['kg', 'kg', 'pièce'])
    WHEN v.category = 'Mode et Vêtements' THEN unnest(ARRAY['unité', 'unité', 'unité'])
    WHEN v.category = 'Santé' THEN unnest(ARRAY['boîte', 'boîte', 'paquet'])
    WHEN v.category = 'Restauration' THEN unnest(ARRAY['portion', 'portion', 'portion'])
  END
FROM vendors v
WHERE v.name LIKE 'Tech Store%' 
   OR v.name LIKE 'Marché%' 
   OR v.name LIKE 'Boutique%' 
   OR v.name LIKE 'Pharmacie%' 
   OR v.name LIKE 'Restaurant%';

-- Afficher les vendors ajoutés
SELECT v.name, v.category, v.address, v.neighborhood, v.rating,
       (SELECT json_agg(json_build_object('name', p.name, 'price', p.price, 'unit', p.unit))
       FROM products p WHERE p.vendor_id = v.id) as products
FROM vendors v
WHERE v.created_at > CURRENT_TIMESTAMP - INTERVAL '1 hour'
ORDER BY v.created_at DESC;