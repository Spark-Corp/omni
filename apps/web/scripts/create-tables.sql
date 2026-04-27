-- Activer l'extension PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- AUTH TABLES (required by @hono/auth-js)
-- ============================================

CREATE TABLE IF NOT EXISTS auth_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    email TEXT UNIQUE,
    "emailVerified" TIMESTAMP,
    image TEXT
);

CREATE TABLE IF NOT EXISTS auth_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    provider TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    access_token TEXT,
    expires_at BIGINT,
    refresh_token TEXT,
    id_token TEXT,
    scope TEXT,
    session_state TEXT,
    token_type TEXT,
    password TEXT
);

CREATE TABLE IF NOT EXISTS auth_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "sessionToken" TEXT NOT NULL UNIQUE,
    "userId" UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
    expires TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS auth_verification_token (
    identifier TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires TIMESTAMP NOT NULL,
    PRIMARY KEY (identifier, token)
);

-- ============================================
-- APP TABLES
-- ============================================

-- Table des utilisateurs (pour l'app)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL UNIQUE,
    lat DECIMAL(10, 8),
    lon DECIMAL(11, 8),
    preferred_language TEXT DEFAULT 'fr',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des vendeurs (avec PostGIS location)
CREATE TABLE IF NOT EXISTS vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    phone TEXT NOT NULL,
    email TEXT,
    location GEOGRAPHY(Point, 4326) NOT NULL,
    address TEXT,
    neighborhood TEXT,
    is_online BOOLEAN DEFAULT true,
    is_available BOOLEAN DEFAULT true,
    rating DECIMAL(3, 2),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des produits
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'XOF',
    image_url TEXT,
    unit TEXT DEFAULT 'pièce',
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des messages
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Créer index géospatial pour les vendeurs
CREATE INDEX IF NOT EXISTS idx_vendors_location ON vendors USING GIST (location);

-- Index pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_vendors_category ON vendors(category);
CREATE INDEX IF NOT EXISTS idx_vendors_online ON vendors(is_online);
CREATE INDEX IF NOT EXISTS idx_products_vendor ON products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_messages_users ON messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_auth_accounts_user ON auth_accounts("userId");
CREATE INDEX IF NOT EXISTS idx_auth_sessions_user ON auth_sessions("userId");
CREATE INDEX IF NOT EXISTS idx_auth_sessions_token ON auth_sessions("sessionToken");

-- Insérer des données de test
INSERT INTO users (name, email, phone, lat, lon, preferred_language) VALUES
('Kofi Vendor', 'kofi@vendor.omni', '+22812345678', 6.1319, 1.2228, 'fr'),
('Ama Market', 'ama@vendor.omni', '+22887654321', 6.1325, 1.2235, 'fr'),
('Mariam Shop', 'mariam@vendor.omni', '+22898765432', 6.1305, 1.2215, 'fr')
ON CONFLICT (phone) DO NOTHING;

INSERT INTO vendors (name, category, description, phone, location, address, neighborhood, user_id) VALUES
('Kofi Electronics', 'Électronique', 'Téléphones et accessoires', '+22812345678', ST_SetSRID(ST_Point(1.2228, 6.1319), 4326)::geography, 'Marché de Bè', 'Bè', (SELECT id FROM users WHERE phone = '+22812345678')),
('Ama Market Stand', 'Alimentation', 'Produits locaux et frais', '+22887654321', ST_SetSRID(ST_Point(1.2235, 6.1325), 4326)::geography, 'Marché de Lomé', 'Lomé', (SELECT id FROM users WHERE phone = '+22887654321')),
('Mariam Boutique', 'Vêtements', 'Pagnes et vêtements traditionnels', '+22898765432', ST_SetSRID(ST_Point(1.2215, 6.1305), 4326)::geography, 'Tokoin', 'Tokoin', (SELECT id FROM users WHERE phone = '+22898765432'))
ON CONFLICT (phone) DO NOTHING;

INSERT INTO products (vendor_id, name, description, price, currency, unit, is_available) VALUES
((SELECT id FROM vendors WHERE phone = '+22812345678'), 'iPhone 12', 'iPhone 12 64GB excellent état', 150000, 'XOF', 'pièce', true),
((SELECT id FROM vendors WHERE phone = '+22812345678'), 'Chargeur USB-C', 'Chargeur rapide 20W', 5000, 'XOF', 'pièce', true),
((SELECT id FROM vendors WHERE phone = '+22887654321'), 'Tomates fraîches', 'Tomates locales du jour', 500, 'XOF', 'kg', true),
((SELECT id FROM vendors WHERE phone = '+22887654321'), 'Pain local', 'Pain frais du matin', 250, 'XOF', 'pièce', true),
((SELECT id FROM vendors WHERE phone = '+22898765432'), 'Pagne wax', 'Pagne wax qualité premium', 8000, 'XOF', 'pièce', true),
((SELECT id FROM vendors WHERE phone = '+22898765432'), 'Boubou traditionnel', 'Boubou en bazin', 15000, 'XOF', 'pièce', true)
ON CONFLICT DO NOTHING;
