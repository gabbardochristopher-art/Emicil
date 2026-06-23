-- Table pour stocker les réponses du popup quiz
-- À exécuter dans le SQL Editor de Supabase
CREATE TABLE popup_submissions (
  id         BIGSERIAL PRIMARY KEY,
  prenom     TEXT NOT NULL DEFAULT '',
  nom        TEXT NOT NULL DEFAULT '',
  email      TEXT NOT NULL DEFAULT '',
  telephone  TEXT DEFAULT '',
  style      TEXT DEFAULT '',
  experience TEXT DEFAULT '',
  objectif   TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Activer RLS
ALTER TABLE popup_submissions ENABLE ROW LEVEL SECURITY;

-- Politique : insertion publique (le visiteur n'est pas forcément connecté)
CREATE POLICY "Allow public insert" ON popup_submissions
  FOR INSERT WITH CHECK (true);

-- Politique : lecture réservée au service_role (admin via gateway.js)
-- Pas de politique SELECT publique → seul le service_role peut lire
