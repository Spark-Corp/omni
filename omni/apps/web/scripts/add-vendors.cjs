import { neon } from '@neondatabase/serverless';

// Configuration Neon
const sql = neon(process.env.DATABASE_URL);

async function addVendors() {
  try {
    console.log('🚀 Ajout de vendeurs...');

    // SQL pour ajouter les vendeurs
    const sqlContent = `
      INSERT INTO vendors (id, name, category, description, phone, lat, lon, address, neighborhood, user_id, is_online, created_at, updated_at) VALUES 
      (gen_random_uuid(), 'Tech Store Plus', 'Électronique et Accessoires', 'Téléphones, ordinateurs et accessoires de haute technologie', '+22891234567', 6.1319, 1.2250, 'Aéroport de Lomé', 'Aéroport', (SELECT id FROM users WHERE phone = '+22890123456'), true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      (gen_random_uuid(), 'Fashion Hub', 'Mode et Vêtements', 'Vêtements tendance, chaussures et accessoires', '+22890234567', 6.1320, 1.2240, 'Centre Commercial de Lomé', 'Centre Commercial', (SELECT id FROM users WHERE phone = '+22890234567'), true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
    `;

    // Exécuter le SQL
    await sql(sqlContent);

    console.log('✅ Vendeurs ajoutés avec succès!');
    console.log(`📊 Total vendeurs: ${await sql('SELECT COUNT(*) as count FROM vendors')}`);

  } catch (error) {
    console.error('❌ Erreur ajout vendeurs:', error);
  }
}

addVendors();
