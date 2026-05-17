import { neon } from '@neondatabase/serverless';

// Configuration Neon
const sql = neon(process.env.DATABASE_URL);

async function setupDatabase() {
  try {
    console.log('🚀 Création des tables dans Neon...');
    
    // Activer PostGIS
    await sql`CREATE EXTENSION IF NOT EXISTS postgis;`;
    console.log('✅ PostGIS activé');
    
    // Table users
    await sql`
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
    `;
    console.log('✅ Table users créée');
    
    // Table vendors
    await sql`
      CREATE TABLE IF NOT EXISTS vendors (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          category TEXT NOT NULL,
          description TEXT,
          phone TEXT NOT NULL,
          email TEXT,
          lat DECIMAL(10, 8) NOT NULL,
          lon DECIMAL(11, 8) NOT NULL,
          address TEXT,
          neighborhood TEXT,
          is_online BOOLEAN DEFAULT true,
          rating DECIMAL(3, 2),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✅ Table vendors créée');
    
    // Table products
    await sql`
      CREATE TABLE IF NOT EXISTS products (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          description TEXT,
          price DECIMAL(10, 2) NOT NULL,
          currency TEXT DEFAULT 'XOF',
          image_url TEXT,
          in_stock BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✅ Table products créée');
    
    // Index simples (pas géospatial pour le moment)
    await sql`CREATE INDEX IF NOT EXISTS idx_vendors_category ON vendors(category);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_vendors_online ON vendors(is_online);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_products_vendor ON products(vendor_id);`;
    console.log('✅ Index créés');
    
    // Insérer données de test (sans conflits)
    try {
      await sql`
        INSERT INTO users (name, email, phone, lat, lon, preferred_language) VALUES
        ('Kofi Vendor', 'kofi@vendor.omni', '+22812345678', 6.1319, 1.2228, 'fr'),
        ('Ama Market', 'ama@vendor.omni', '+22887654321', 6.1325, 1.2235, 'fr'),
        ('Mariam Shop', 'mariam@vendor.omni', '+22898765432', 6.1305, 1.2215, 'fr');
      `;
      console.log('✅ Utilisateurs de test insérés');
    } catch (error) {
      console.log('ℹ️ Utilisateurs peut-être déjà présents');
    }
    
    try {
      await sql`
        INSERT INTO vendors (name, category, description, phone, lat, lon, address, neighborhood, user_id) VALUES
        ('Kofi Electronics', 'Électronique', 'Téléphones et accessoires', '+22812345678', 6.1319, 1.2228, 'Marché de Bè', 'Bè', (SELECT id FROM users WHERE phone = '+22812345678')),
        ('Ama Market Stand', 'Alimentation', 'Produits locaux et frais', '+22887654321', 6.1325, 1.2235, 'Marché de Lomé', 'Lomé', (SELECT id FROM users WHERE phone = '+22887654321')),
        ('Mariam Boutique', 'Vêtements', 'Pagnes et vêtements traditionnels', '+22898765432', 6.1305, 1.2215, 'Tokoin', 'Tokoin', (SELECT id FROM users WHERE phone = '+22898765432'));
      `;
      console.log('✅ Vendeurs de test insérés');
    } catch (error) {
      console.log('ℹ️ Vendeurs peut-être déjà présents');
    }
    
    // Insérer produits de test
    try {
      await sql`
        INSERT INTO products (vendor_id, name, description, price, currency, in_stock) VALUES
        ('1', 'iPhone 12', 'iPhone 12 64GB excellent état', 150000, 'XOF', true),
        ('1', 'Chargeur USB-C', 'Chargeur rapide 20W', 5000, 'XOF', true),
        ('2', 'Tomates fraîches', 'Tomates locales du jour', 500, 'XOF', true),
        ('2', 'Pain local', 'Pain frais du matin', 250, 'XOF', true),
        ('3', 'Pagne wax', 'Pagne wax qualité premium', 8000, 'XOF', true),
        ('3', 'Boubou traditionnel', 'Boubou en bazin', 15000, 'XOF', true)
      `;
      console.log('✅ Produits de test insérés');
    } catch (error) {
      console.log('ℹ️ Produits peut-être déjà présents');
    }
    
    console.log('🎉 Base de données prête !');
    
  } catch (error) {
    console.error('❌ Erreur création tables:', error);
    process.exit(1);
  }
}

// Exécuter le setup
setupDatabase();
