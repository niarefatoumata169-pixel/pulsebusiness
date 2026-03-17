-- Supprimer les tables existantes
DROP TABLE IF EXISTS mouvement_caisse CASCADE;
DROP TABLE IF EXISTS caisse CASCADE;
DROP TABLE IF EXISTS devis_articles CASCADE;
DROP TABLE IF EXISTS devis CASCADE;
DROP TABLE IF EXISTS factures CASCADE;
DROP TABLE IF EXISTS contrats CASCADE;
DROP TABLE IF EXISTS articles CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS fournisseurs CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Table utilisateurs
CREATE TABLE users (
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
CREATE TABLE clients (
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
CREATE TABLE devis (
  id SERIAL PRIMARY KEY,
  numero VARCHAR(50) UNIQUE NOT NULL,
  client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
  client_nom VARCHAR(200),
  date_creation DATE DEFAULT CURRENT_DATE,
  date_validite DATE,
  montant_ht DECIMAL(10,2),
  montant_ttc DECIMAL(10,2),
  statut VARCHAR(50) DEFAULT 'brouillon',
  notes TEXT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table articles de devis
CREATE TABLE devis_articles (
  id SERIAL PRIMARY KEY,
  devis_id INTEGER REFERENCES devis(id) ON DELETE CASCADE,
  article_id INTEGER,
  article_nom VARCHAR(200),
  quantite INTEGER NOT NULL,
  prix_unitaire DECIMAL(10,2) NOT NULL,
  taux_tva DECIMAL(5,2) DEFAULT 18,
  montant_ht DECIMAL(10,2),
  montant_ttc DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table factures
CREATE TABLE factures (
  id SERIAL PRIMARY KEY,
  numero VARCHAR(50) UNIQUE NOT NULL,
  client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
  client_nom VARCHAR(200),
  date_facture DATE DEFAULT CURRENT_DATE,
  date_echeance DATE,
  montant_ht DECIMAL(10,2),
  montant_ttc DECIMAL(10,2),
  statut VARCHAR(50) DEFAULT 'brouillon',
  notes TEXT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table contrats
CREATE TABLE contrats (
  id SERIAL PRIMARY KEY,
  numero VARCHAR(50) UNIQUE NOT NULL,
  client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
  client_nom VARCHAR(200),
  type VARCHAR(50) NOT NULL,
  date_debut DATE NOT NULL,
  date_fin DATE NOT NULL,
  montant DECIMAL(10,2) NOT NULL,
  periodicite VARCHAR(20) DEFAULT 'mensuel',
  statut VARCHAR(50) DEFAULT 'en_negociation',
  renouvelable BOOLEAN DEFAULT false,
  conditions TEXT,
  notes TEXT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table caisses
CREATE TABLE caisse (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  type VARCHAR(50) DEFAULT 'principale',
  solde_initial DECIMAL(10,2) DEFAULT 0,
  solde_actuel DECIMAL(10,2) DEFAULT 0,
  devise VARCHAR(10) DEFAULT 'FCFA',
  responsable VARCHAR(100),
  notes TEXT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table mouvements de caisse
CREATE TABLE mouvement_caisse (
  id SERIAL PRIMARY KEY,
  caisse_id INTEGER REFERENCES caisse(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  type VARCHAR(20) NOT NULL,
  categorie VARCHAR(50),
  montant DECIMAL(10,2) NOT NULL,
  motif VARCHAR(200),
  mode_paiement VARCHAR(50) DEFAULT 'especes',
  reference VARCHAR(100),
  beneficiaire VARCHAR(200),
  valide BOOLEAN DEFAULT false,
  date_validation DATE,
  valide_par VARCHAR(100),
  notes TEXT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table catégories (stock)
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  description TEXT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table fournisseurs
CREATE TABLE fournisseurs (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(200) NOT NULL,
  email VARCHAR(255),
  telephone VARCHAR(50),
  adresse TEXT,
  ville VARCHAR(100),
  pays VARCHAR(100) DEFAULT 'Mali',
  notes TEXT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table articles (stock)
CREATE TABLE articles (
  id SERIAL PRIMARY KEY,
  reference VARCHAR(50) UNIQUE NOT NULL,
  nom VARCHAR(200) NOT NULL,
  description TEXT,
  categorie_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  categorie_nom VARCHAR(100),
  prix_achat DECIMAL(10,2) DEFAULT 0,
  prix_vente DECIMAL(10,2) DEFAULT 0,
  stock_actuel INTEGER DEFAULT 0,
  stock_mini INTEGER DEFAULT 5,
  stock_maxi INTEGER,
  emplacement VARCHAR(100),
  fournisseur_id INTEGER REFERENCES fournisseurs(id) ON DELETE SET NULL,
  fournisseur_nom VARCHAR(200),
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_devis_user_id ON devis(user_id);
CREATE INDEX idx_devis_client_id ON devis(client_id);
CREATE INDEX idx_factures_user_id ON factures(user_id);
CREATE INDEX idx_factures_client_id ON factures(client_id);
CREATE INDEX idx_contrats_user_id ON contrats(user_id);
CREATE INDEX idx_contrats_client_id ON contrats(client_id);
CREATE INDEX idx_caisse_user_id ON caisse(user_id);
CREATE INDEX idx_mouvement_caisse_caisse_id ON mouvement_caisse(caisse_id);
CREATE INDEX idx_articles_user_id ON articles(user_id);
CREATE INDEX idx_articles_categorie_id ON articles(categorie_id);
CREATE INDEX idx_articles_fournisseur_id ON articles(fournisseur_id);
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_fournisseurs_user_id ON fournisseurs(user_id);

-- Ajouter un utilisateur de test
INSERT INTO users (email, password, nom, prenom, entreprise) 
VALUES ('demo@pulsebusiness.com', 'demo123', 'Demo', 'User', 'PulseBusiness')
ON CONFLICT (email) DO NOTHING;

-- Ajouter des clients de test
INSERT INTO clients (nom, email, telephone, ville, pays, user_id) 
SELECT 'Entreprise A', 'contact@a.com', '70123456', 'Bamako', 'Mali', 1
WHERE NOT EXISTS (SELECT 1 FROM clients WHERE email = 'contact@a.com');

INSERT INTO clients (nom, email, telephone, ville, pays, user_id) 
SELECT 'Entreprise B', 'contact@b.com', '71234567', 'Ségou', 'Mali', 1
WHERE NOT EXISTS (SELECT 1 FROM clients WHERE email = 'contact@b.com');

INSERT INTO clients (nom, email, telephone, ville, pays, user_id) 
SELECT 'Entreprise C', 'contact@c.com', '72345678', 'Mopti', 'Mali', 1
WHERE NOT EXISTS (SELECT 1 FROM clients WHERE email = 'contact@c.com');

-- Table véhicules
CREATE TABLE IF NOT EXISTS vehicules (
  id SERIAL PRIMARY KEY,
  immatriculation VARCHAR(20) NOT NULL,
  marque VARCHAR(50) NOT NULL,
  modele VARCHAR(50) NOT NULL,
  annee INTEGER,
  type VARCHAR(20) DEFAULT 'camion',
  statut VARCHAR(20) DEFAULT 'disponible',
  kilometrage INTEGER DEFAULT 0,
  date_achat DATE,
  date_prochain_entretien DATE,
  notes TEXT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table chauffeurs
CREATE TABLE IF NOT EXISTS chauffeurs (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  telephone VARCHAR(20),
  email VARCHAR(255),
  permis VARCHAR(20),
  date_embauche DATE,
  statut VARCHAR(20) DEFAULT 'actif',
  notes TEXT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table trajets
CREATE TABLE IF NOT EXISTS trajets (
  id SERIAL PRIMARY KEY,
  vehicule_id INTEGER REFERENCES vehicules(id) ON DELETE SET NULL,
  chauffeur_id INTEGER REFERENCES chauffeurs(id) ON DELETE SET NULL,
  date_depart DATE NOT NULL,
  date_arrivee DATE,
  lieu_depart VARCHAR(200) NOT NULL,
  lieu_arrivee VARCHAR(200) NOT NULL,
  distance INTEGER,
  statut VARCHAR(20) DEFAULT 'planifie',
  notes TEXT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index
CREATE INDEX idx_vehicules_user_id ON vehicules(user_id);
CREATE INDEX idx_chauffeurs_user_id ON chauffeurs(user_id);
CREATE INDEX idx_trajets_user_id ON trajets(user_id);

-- Table véhicules
CREATE TABLE IF NOT EXISTS vehicules (
  id SERIAL PRIMARY KEY,
  immatriculation VARCHAR(20) NOT NULL,
  marque VARCHAR(50) NOT NULL,
  modele VARCHAR(50) NOT NULL,
  annee INTEGER,
  type VARCHAR(20) DEFAULT 'camion',
  statut VARCHAR(20) DEFAULT 'disponible',
  kilometrage INTEGER DEFAULT 0,
  date_achat DATE,
  date_prochain_entretien DATE,
  notes TEXT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table chauffeurs
CREATE TABLE IF NOT EXISTS chauffeurs (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  telephone VARCHAR(20),
  email VARCHAR(255),
  permis VARCHAR(20),
  date_embauche DATE,
  statut VARCHAR(20) DEFAULT 'actif',
  notes TEXT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table trajets
CREATE TABLE IF NOT EXISTS trajets (
  id SERIAL PRIMARY KEY,
  vehicule_id INTEGER REFERENCES vehicules(id) ON DELETE SET NULL,
  chauffeur_id INTEGER REFERENCES chauffeurs(id) ON DELETE SET NULL,
  date_depart DATE NOT NULL,
  date_arrivee DATE,
  lieu_depart VARCHAR(200) NOT NULL,
  lieu_arrivee VARCHAR(200) NOT NULL,
  distance INTEGER,
  statut VARCHAR(20) DEFAULT 'planifie',
  notes TEXT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index
CREATE INDEX idx_vehicules_user_id ON vehicules(user_id);
CREATE INDEX idx_chauffeurs_user_id ON chauffeurs(user_id);
CREATE INDEX idx_trajets_user_id ON trajets(user_id);

-- =====================================================
-- Tables RH (Ressources Humaines)
-- =====================================================

CREATE TABLE IF NOT EXISTS employes (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telephone VARCHAR(20),
    poste VARCHAR(100),
    date_embauche DATE,
    salaire DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS paie (
    id SERIAL PRIMARY KEY,
    employe_id INTEGER REFERENCES employes(id) ON DELETE CASCADE,
    periode DATE NOT NULL,
    salaire_brut DECIMAL(10,2),
    cotisations DECIMAL(10,2),
    salaire_net DECIMAL(10,2),
    date_paiement DATE,
    statut VARCHAR(50) DEFAULT 'en_attente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS candidatures (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telephone VARCHAR(20),
    poste VARCHAR(100),
    cv_url TEXT,
    lettre_motivation TEXT,
    statut VARCHAR(50) DEFAULT 'en_attente',
    date_candidature TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- Tables International
-- =====================================================

CREATE TABLE IF NOT EXISTS douanes (
    id SERIAL PRIMARY KEY,
    numero_declaration VARCHAR(50) UNIQUE NOT NULL,
    date_declaration DATE NOT NULL,
    type_marchandise VARCHAR(200),
    valeur DECIMAL(10,2),
    pays_origine VARCHAR(100),
    pays_destination VARCHAR(100),
    transporteur VARCHAR(200),
    statut VARCHAR(50) DEFAULT 'en_attente',
    documents JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transitaires (
    id SERIAL PRIMARY KEY,
    nom_entreprise VARCHAR(200) NOT NULL,
    contact_nom VARCHAR(100),
    contact_email VARCHAR(255),
    contact_telephone VARCHAR(20),
    adresse TEXT,
    agrement_number VARCHAR(50) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS incoterms (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,
    description TEXT,
    responsabilites TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reglements (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    titre VARCHAR(200),
    description TEXT,
    pays_concerne TEXT[],
    date_publication DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- Données de test
-- =====================================================

-- Incoterms de base
INSERT INTO incoterms (code, description) VALUES
('EXW', 'Ex Works - L''acheteur prend en charge tous les frais et risques dès la sortie des marchandises de l''usine'),
('FCA', 'Free Carrier - Le vendeur livre les marchandises dédouanées à l''exportation au transporteur désigné'),
('FAS', 'Free Alongside Ship - Le vendeur livre les marchandises à côté du navire au port d''embarquement'),
('FOB', 'Free On Board - Le vendeur livre les marchandises à bord du navire désigné'),
('CFR', 'Cost and Freight - Le vendeur paie le transport jusqu''au port de destination'),
('CIF', 'Cost Insurance and Freight - Le vendeur paie transport et assurance jusqu''au port de destination'),
('CPT', 'Carriage Paid To - Le vendeur paie le transport jusqu''au lieu de destination'),
('CIP', 'Carriage and Insurance Paid To - Le vendeur paie transport et assurance jusqu''au lieu de destination'),
('DPU', 'Delivered at Place Unloaded - Le vendeur livre en déchargeant au lieu convenu'),
('DAP', 'Delivered at Place - Le vendeur livre à disposition au lieu convenu'),
('DDP', 'Delivered Duty Paid - Le vendeur livre en dédouanant au lieu convenu')
ON CONFLICT (code) DO NOTHING;

-- Employés de test
INSERT INTO employes (nom, prenom, email, poste, date_embauche, salaire) VALUES
('Dupont', 'Jean', 'jean.dupont@pulsebusiness.com', 'Directeur Commercial', '2023-01-15', 65000),
('Martin', 'Marie', 'marie.martin@pulsebusiness.com', 'Responsable RH', '2023-02-01', 55000),
('Bernard', 'Pierre', 'pierre.bernard@pulsebusiness.com', 'Développeur Senior', '2023-03-10', 48000),
('Petit', 'Sophie', 'sophie.petit@pulsebusiness.com', 'Comptable', '2023-04-05', 42000),
('Moreau', 'Lucas', 'lucas.moreau@pulsebusiness.com', 'Commercial', '2023-05-20', 38000)
ON CONFLICT (email) DO NOTHING;

-- Candidatures de test
INSERT INTO candidatures (nom, prenom, email, poste, statut) VALUES
('Leroy', 'Thomas', 'thomas.leroy@email.com', 'Développeur Junior', 'en_attente'),
('Fournier', 'Julie', 'julie.fournier@email.com', 'Assistant Commercial', 'entretien_programme'),
('Girard', 'Nicolas', 'nicolas.girard@email.com', 'Comptable', 'refuse')
ON CONFLICT (email) DO NOTHING;

-- Déclarations douanes de test
INSERT INTO douanes (numero_declaration, date_declaration, type_marchandise, valeur, pays_origine, pays_destination, statut) VALUES
('DEC-2025-001', '2025-03-01', 'Matériel électronique', 25000.00, 'Chine', 'France', 'en_cours'),
('DEC-2025-002', '2025-03-05', 'Textiles', 15000.00, 'Inde', 'France', 'valide'),
('DEC-2025-003', '2025-03-10', 'Pièces automobiles', 45000.00, 'Allemagne', 'France', 'en_attente')
ON CONFLICT (numero_declaration) DO NOTHING;
