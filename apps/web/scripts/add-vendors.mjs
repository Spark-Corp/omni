import { neon } from '@neondatabase/serverless';

// Configuration Neon
const sql = neon(process.env.DATABASE_URL);

async function addVendors() {
  try {
    console.log('🚀 Ajout de vendeurs...');
    
    // Ajouter Tech Store Plus
    await sql('INSERT INTO vendors (id, name, category, description, phone, lat, lon, address, neighborhood, user_id, is_online, created_at, updated_at) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)', 
      ['Tech Store Plus', 'Électronique et Accessoires', 'Téléphones, ordinateurs et accessoires de haute technologie', '+22891234567', 6.1319, 1.2250, 'Aéroport de Lomé', 'Aéroport', 'c1201fbd-430a-47e0-a18c-d10615ea219f', true]);
    
    console.log('✅ Tech Store Plus ajouté');
    
    // Ajouter Fashion Hub
    await sql('INSERT INTO vendors (id, name, category, description, phone, lat, lon, address, neighborhood, user_id, is_online, created_at, updated_at) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)', 
      ['Fashion Hub', 'Mode et Vêtements', 'Vêtements tendance, chaussures et accessoires', '+22890234567', 6.1320, 1.2240, 'Centre Commercial de Lomé', 'Centre Commercial', '3ee49fd0-f5ef-4e1b-98e3-ed4865e12543', true]);
    
    console.log('✅ Fashion Hub ajouté');
    
    const result = await sql('SELECT COUNT(*) as count FROM vendors');
    console.log(`📊 Total vendeurs: ${result[0].count}`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

addVendors();
