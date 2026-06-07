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
  options     JSONB DEFAULT '{}',             -- ex. { "Courbure": ["C","CC","D"], "Longueur": ["8mm","9mm"] }
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Pour une base déjà existante (la création ci-dessus ne modifie pas une table déjà créée) :
ALTER TABLE products ADD COLUMN IF NOT EXISTS options JSONB DEFAULT '{}';

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
--  TABLE : profiles (clients inscrits)
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT DEFAULT '',
  last_name  TEXT DEFAULT '',
  points     INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lecture profil propre" ON profiles;
DROP POLICY IF EXISTS "Mise à jour profil propre" ON profiles;
CREATE POLICY "Lecture profil propre"     ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Mise à jour profil propre" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Crée automatiquement le profil à l'inscription
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, first_name, last_name)
  VALUES (NEW.id,
          NEW.raw_user_meta_data->>'firstName',
          NEW.raw_user_meta_data->>'lastName')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
--  TABLE : orders (commandes clients)
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
  id             TEXT PRIMARY KEY,
  user_id        UUID REFERENCES auth.users(id),
  user_email     TEXT NOT NULL DEFAULT '',
  user_name      TEXT DEFAULT '',
  items          JSONB NOT NULL DEFAULT '[]',
  total          NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping_cost  NUMERIC(10,2) DEFAULT 0,
  shipping_mode  TEXT DEFAULT 'collect',
  payment_method TEXT DEFAULT 'card',
  status         TEXT DEFAULT 'pending',
  points_to_award INTEGER DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lecture commandes propres" ON orders;
CREATE POLICY "Lecture commandes propres"
  ON orders FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
--  TABLE : formations
-- =====================================================
CREATE TABLE IF NOT EXISTS formations (
  id          SERIAL PRIMARY KEY,
  titre       TEXT NOT NULL,
  duree       TEXT DEFAULT '',
  niveau      TEXT DEFAULT 'Tous niveaux',
  prix        NUMERIC(10,2) NOT NULL DEFAULT 0,
  description TEXT DEFAULT '',
  points      JSONB DEFAULT '[]',
  places_max  INTEGER DEFAULT 4,
  actif       BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE formations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lecture publique formations" ON formations;
CREATE POLICY "Lecture publique formations" ON formations FOR SELECT USING (true);

-- =====================================================
--  TABLE : formation_bookings (réservations)
-- =====================================================
CREATE TABLE IF NOT EXISTS formation_bookings (
  id            SERIAL PRIMARY KEY,
  formation_id  INTEGER REFERENCES formations(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES auth.users(id),
  user_email    TEXT NOT NULL,
  user_name     TEXT DEFAULT '',
  user_phone    TEXT DEFAULT '',
  message       TEXT DEFAULT '',
  status        TEXT DEFAULT 'pending',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE formation_bookings ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut créer une réservation (formulaire public)
DROP POLICY IF EXISTS "Insert public formation_bookings" ON formation_bookings;
CREATE POLICY "Insert public formation_bookings"
  ON formation_bookings FOR INSERT WITH CHECK (true);

-- =====================================================
--  TABLE : reviews (avis clients sur les produits)
--  Modération obligatoire : un avis n'est visible publiquement
--  qu'une fois passé en statut "approved" depuis l'admin.
-- =====================================================
CREATE TABLE IF NOT EXISTS reviews (
  id          SERIAL PRIMARY KEY,
  product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES auth.users(id),
  user_name   TEXT DEFAULT '',
  rating      INTEGER NOT NULL DEFAULT 5,
  comment     TEXT DEFAULT '',
  status      TEXT NOT NULL DEFAULT 'pending',   -- 'pending' | 'approved' | 'rejected'
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Seuls les avis validés sont visibles publiquement (lecture directe Supabase)
DROP POLICY IF EXISTS "Lecture avis publiés" ON reviews;
CREATE POLICY "Lecture avis publiés"
  ON reviews FOR SELECT USING (status = 'approved');

-- Écritures (création + modération) via service_role uniquement (API backend)
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews (product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status  ON reviews (status);

-- Seed initial : 4 formations par défaut
INSERT INTO formations (titre, duree, niveau, prix, description, points, places_max) VALUES
  ('Formation Pose Classique',  '1 jour · 7 h',  'Débutant',      290, 'Apprenez les bases de la pose cil à cil : préparation, isolation, collage, séchage. Vous repartez avec votre kit de démarrage.',
    '["Anatomie de l''œil & sécurité","Choix des cils & colle","Technique d''isolation","Pose sur mannequin + modèle réel"]', 4),
  ('Formation Volume Russe',    '2 jours · 14 h','Intermédiaire', 490, 'Maîtrisez la confection de bouquets volume et méga-volume. Prérequis : maîtrise de la pose classique.',
    '["Confection des bouquets 2D à 10D","Courbures & longueurs adaptées","Gestion du temps en cabine","Suivi clientèle & remplissage"]', 4),
  ('Formation Rehaussement & Teinture','1 jour · 6 h','Tous niveaux',250,'Lash lift + teinture : tout pour sublimer le cil naturel sans extensions. Technique rapide et rentable.',
    '["Bâtonnets & colle lash lift","Application de la teinture","Timing & neutralisation","Protocole client & contre-indications"]', 4),
  ('Perfectionnement & Business','1 jour · 7 h','Avancé',        320, 'Affinez votre technique, optimisez votre cabine et développez votre clientèle. Coaching personnalisé.',
    '["Correction des erreurs courantes","Tarification & positionnement","Réseaux sociaux & avant/après","Fidélisation & panier moyen"]', 4)
ON CONFLICT DO NOTHING;

-- =====================================================
--  TABLE : rate_limits (anti-brute-force login admin)
-- =====================================================
CREATE TABLE IF NOT EXISTS rate_limits (
  id            SERIAL PRIMARY KEY,
  identifier    TEXT NOT NULL,
  attempted_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON rate_limits (identifier);
CREATE INDEX IF NOT EXISTS idx_rate_limits_attempted_at ON rate_limits (attempted_at);

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
