import { neon, neonConfig } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration Neon - require env
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('❌ DATABASE_URL not set');
  process.exit(1);
}

const sql = neon(dbUrl);

async function addVendors() {
  try {
    console.log('🚀 Ajout des vendors pour démo...');
    
    const sqlFile = readFileSync(join(__dirname, 'add-vendors-simple.sql'), 'utf8');
    
    // Diviser en statements par ;
    const statements = sqlFile
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`📋 ${statements.length} statements à exécuter`);
    
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      console.log(`\n📝 [${i + 1}/${statements.length}] Executing...`);
      try {
        const result = await sql([stmt]);
        console.log(`✅ [${i + 1}] OK`, result ? `(${JSON.stringify(result).substring(0, 100)})` : '');
      } catch (err) {
        console.error(`❌ [${i + 1}] Erreur:`, err.message?.substring(0, 200));
      }
    }
    
    console.log('\n✅ Vendors ajoutés!');
    
    // Vérifier
    const vendors = await sql('SELECT name, category FROM vendors ORDER BY created_at DESC LIMIT 10');
    console.log('\n📍 Vendors dans la DB:');
    console.table(vendors);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

addVendors();