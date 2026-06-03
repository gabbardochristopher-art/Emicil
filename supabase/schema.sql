-- =====================================================
--  EMICIL — Schéma Supabase
--  À exécuter dans : Supabase > SQL Editor > New query
-- =====================================================

-- TABLE : admin_users
-- Le mot de passe est stocké uniquement sous forme de hash bcrypt.
-- Ne jamais stocker de mot de passe en clair.
CREATE TABLE IF NOT EXISTS admin_users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE : products
CREATE TABLE IF NOT EXISTS products (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT '',
  price       NUMERIC(10,2) NOT NULL DEFAULT 0,
  old_price   NUMERIC(10,2),
  image       TEXT DEFAULT '',
  images      JSONB DEFAULT '[]',
  badge       TEXT,                          -- 'new' | 'sale' | null
  featured    BOOLEAN DEFAULT false,
  new_arrival BOOLEAN DEFAULT false,
  stock       INTEGER DEFAULT 0,
  description TEXT DEFAULT '',
  sizes       JSONB DEFAULT '[]',
  colors      JSONB DEFAULT '[]',
  sku         TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
--  Row Level Security
-- =====================================================

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products     ENABLE ROW LEVEL SECURITY;

-- Les produits sont lisibles par tout le monde (frontend public)
DROP POLICY IF EXISTS "Lecture publique produits" ON products;
CREATE POLICY "Lecture publique produits"
  ON products FOR SELECT USING (true);

-- Toutes les écritures passent par le service_role (API backend uniquement)
-- → aucune écriture directe depuis le navigateur

-- =====================================================
--  PREMIER ADMIN
--  Exécutez le script : node scripts/create-admin.js
--  OU insérez manuellement un hash bcrypt ici :
--
--  Hash exemple pour le mot de passe "changez-moi!" :
--  $2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCkQVB6T/V6Xa1F.ZzJVAFi
--
--  INSERT INTO admin_users (email, password_hash) VALUES
--    ('votre@email.com', '$2a$12$...');
-- =====================================================
