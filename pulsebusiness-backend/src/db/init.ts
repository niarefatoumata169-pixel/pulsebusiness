import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'pulsebusiness',
  user: process.env.DB_USER || 'pulseuser',
  password: process.env.DB_PASSWORD || 'pulsepass',
});

async function initDatabase() {
  try {
    console.log('📦 Initialisation de la base de données...');
    
    // Créer les tables
    await pool.query(`
      -- Table utilisateurs
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        nom VARCHAR(100),
        prenom VARCHAR(100),
        entreprise VARCHAR(200),
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Table clients
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        nom VARCHAR(200) NOT NULL,
        email VARCHAR(255),
        telephone VARCHAR(50),
        adresse TEXT,
        ville VARCHAR(100),
        code_postal VARCHAR(20),
        pays VARCHAR(100) DEFAULT 'Mali',
        secteur VARCHAR(100),
        notes TEXT,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Table devis
      CREATE TABLE IF NOT EXISTS devis (
        id SERIAL PRIMARY KEY,
        numero VARCHAR(50) UNIQUE NOT NULL,
        client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
        date_creation DATE DEFAULT CURRENT_DATE,
        date_validite DATE,
        montant_ht DECIMAL(10,2),
        montant_ttc DECIMAL(10,2),
        statut VARCHAR(50) DEFAULT 'brouillon',
        notes TEXT,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Index pour améliorer les performances
      CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
      CREATE INDEX IF NOT EXISTS idx_devis_user_id ON devis(user_id);
      CREATE INDEX IF NOT EXISTS idx_devis_client_id ON devis(client_id);
    `);
    
    console.log('✅ Tables créées avec succès !');
    
    // Vérifier les tables
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('📋 Tables dans la base :');
    tables.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
    // Ajouter un utilisateur de test
    const testUser = await pool.query(
      `INSERT INTO users (email, password, nom, prenom, entreprise) 
       VALUES ($1, $2, $3, $4, $5) 
       ON CONFLICT (email) DO NOTHING 
       RETURNING id`,
      ['demo@pulsebusiness.com', '$2b$10$demo', 'Demo', 'User', 'PulseBusiness']
    );
    
    if (testUser.rows.length > 0) {
      console.log('👤 Utilisateur de test créé');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await pool.end();
  }
}

initDatabase();
