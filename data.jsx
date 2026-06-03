// ==========================================================================
// EMICILS — Données boutique (catalogue, catégories, compte démo)
// ==========================================================================

const CATEGORIES = [
  { id: "extensions",  label: "Extensions de cil",  tagline: "Pose classique, volume, mega-volume", count: 0 },
  { id: "accessoires", label: "Accessoires",         tagline: "Pinces, brosses, coussinets",         count: 0 },
  { id: "soins",       label: "Soins & entretien",   tagline: "Nettoyer, fortifier, sublimer",       count: 0 },
  { id: "colle",       label: "Colle",               tagline: "Adhésifs professionnels",             count: 0 },
];

// Produits chargés dynamiquement depuis Supabase (voir app.jsx)
const PRODUCTS = [];

// compteur par catégorie
CATEGORIES.forEach(c => { c.count = PRODUCTS.filter(p => p.cat === c.id).length; });

const PROMOS_LIVRAISON = {
  collect:  { id: "collect",  label: "Retrait en boutique",  sub: "Click & Collect · Les Pennes-Mirabeau", delai: "Prêt sous 2 h", prix: 0 },
  relais:   { id: "relais",   label: "Point relais",          sub: "Mondial Relay · à proximité",          delai: "2 à 4 jours ouvrés", prix: 3.90 },
  domicile: { id: "domicile", label: "Livraison à domicile",  sub: "Colissimo suivi",                       delai: "2 à 3 jours ouvrés", prix: 5.90 },
};
const FRANCO = 49; // livraison offerte dès 49 €

// Compte client démo
const COMPTE_DEMO = {
  prenom: "Léa",
  nom: "Marchetti",
  email: "lea.marchetti@email.fr",
  points: 1240,           // points fidélité (1 pt = 1 € dépensé)
  paliers: { actuel: "Argent", prochain: "Or", seuil: 1500 },
  adresse: { rue: "14 avenue de la Pinède", ville: "13170 Les Pennes-Mirabeau" },
  commandes: [
    { id: "EMI-2418", date: "22 mai 2026", total: 64.70, statut: "Livrée",       mode: "Point relais", articles: 3, pts: 64 },
    { id: "EMI-2390", date: "6 mai 2026",  total: 37.80, statut: "Retirée",      mode: "Click & Collect", articles: 2, pts: 37 },
    { id: "EMI-2351", date: "18 avr. 2026",total: 92.00, statut: "Livrée",       mode: "Domicile", articles: 4, pts: 92 },
  ],
};
// 100 points = 5 € de réduction
const PT_PAR_EURO = 1;
const PALIER_VALEUR = { pts: 100, euro: 5 };

window.DATA = { CATEGORIES, PRODUCTS, PROMOS_LIVRAISON, FRANCO, COMPTE_DEMO, PT_PAR_EURO, PALIER_VALEUR };
