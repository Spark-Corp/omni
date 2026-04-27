import { neon, neonConfig } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration Neon
const sql = neon(process.env.DATABASE_URL);

async function setupDatabase() {
  try {
    console.log('🚀 Création des tables dans Neon...');
    
    // Lire le fichier SQL de reset
    const sqlFile = readFileSync(join(__dirname, 'reset-db.sql'), 'utf8');
    
    // Diviser en statements individuels en gérant correctement les commentaires
    const statements = sqlFile
      .split(';')
      .map(s => {
        // Garder seulement les lignes qui ne sont pas des commentaires purs
        const lines = s.split('\n').filter(line => {
          const trimmed = line.trim();
          return trimmed.length > 0 && !trimmed.startsWith('--');
        });
        return lines.join('\n').trim();
      })
      .filter(s => s.length > 0);
    
    console.log(`📋 ${statements.length} statements à exécuter`);
    console.log('⚠️  DROP puis CREATE des tables...');
    
    // Exécuter séquentiellement pour respecter les dépendances
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      console.log(`\n📝 [${i + 1}/${statements.length}] Executing...`);
      try {
        const result = await sql([stmt]);
        console.log(`✅ [${i + 1}] OK`, result ? `(${JSON.stringify(result).substring(0, 50)})` : '');
      } catch (err) {
        console.error(`❌ [${i + 1}] Erreur:`, err.message?.substring(0, 150));
      }
    }
    
    console.log('\n✅ Setup terminé!');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

// Exécuter le setup
setupDatabase();
