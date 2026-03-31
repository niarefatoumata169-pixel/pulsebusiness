import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'pulsebusiness',
  user: process.env.DB_USER || 'mac',
  password: process.env.DB_PASSWORD || '',
});

async function initDatabase() {
  try {
    console.log('📦 Initialisation de toutes les tables...');
    
    const sql = fs.readFileSync(path.join(__dirname, 'init.sql')).toString();
    
    // Exécuter chaque requête individuellement pour mieux gérer les erreurs
    const statements = sql.split(';').filter(s => s.trim());
    
    for (const statement of statements) {
      try {
        await pool.query(statement);
      } catch (err: any) {
        // Ignorer les erreurs "already exists"
        if (err.code === '42P07') {
          console.log(`⚠️  Index déjà existant, ignoré`);
        } else {
          throw err;
        }
      }
    }
    
    console.log('✅ Toutes les tables ont été créées avec succès !');
    
    // Vérifier les tables
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('\n📋 Tables dans la base :');
    tables.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await pool.end();
  }
}

initDatabase();
