// ==========================================================================
// EMICILS — Données boutique (catalogue, catégories, compte démo)
// ==========================================================================

const CATEGORIES = [
  { id: "cils",       label: "Boîtes de cils",      tagline: "Extensions & franges à poser", count: 0 },
  { id: "accessoires",label: "Accessoires de pose", tagline: "Pinces, colles, brosses",       count: 0 },
  { id: "soins",      label: "Soins & entretien",   tagline: "Nettoyer, fortifier, sublimer",  count: 0 },
  { id: "cartes",     label: "Cartes & prestations",tagline: "Offrir un moment beauté",        count: 0 },
];

// prix en euros. note = sur 5. boutique = dispo en retrait Pennes-Mirabeau.
const PRODUCTS = [
  // ---- Boîtes de cils ----
  { id: "vol-russe-007", cat: "cils", name: "Volume Russe 0.07", line: "Mix 8–14 mm",
    price: 18.90, note: 4.9, avis: 214, boutique: true, best: true,
    tag: "Best-seller", courbure: ["C", "D"], desc: "Cils ultra-fins en soie mate pour des bouquets volume aériens. Tenue impeccable, effet naturel densifié.",
    options: { courbure: ["C", "D", "CC"], longueur: ["8 mm", "10 mm", "12 mm", "14 mm", "Mix 8–14"] } },
  { id: "classique-015", cat: "cils", name: "Cils Classiques 0.15", line: "Pose cil à cil",
    price: 15.90, note: 4.8, avis: 168, boutique: true,
    desc: "L'incontournable de la pose classique. Brillance soie, base fine pour une accroche nette.",
    options: { courbure: ["B", "C", "D"], longueur: ["9 mm", "11 mm", "13 mm", "Mix 9–13"] } },
  { id: "wispy", cat: "cils", name: "Franges Wispy", line: "Faux-cils à bande",
    price: 12.50, note: 4.7, avis: 96, boutique: true, nouveau: true,
    desc: "Effet wispy criss-cross, réutilisable jusqu'à 20 fois. Bande fine et souple, invisible.",
    options: { modele: ["Naturel", "Glam", "Doll"] } },
  { id: "magnetique", cat: "cils", name: "Cils Magnétiques", line: "Sans colle, kit eye-liner",
    price: 24.90, note: 4.6, avis: 132, boutique: true,
    desc: "Kit cils magnétiques + eye-liner aimanté. Pose en 30 secondes, retrait sans douleur.",
    options: { modele: ["Naturel", "Volume"] } },
  { id: "mega-003", cat: "cils", name: "Volume Mega 0.03", line: "Pour méga-volume",
    price: 21.90, note: 4.9, avis: 88, boutique: true, best: true,
    desc: "Épaisseur 0.03 pour des bouquets jusqu'à 10D d'une légèreté absolue. Réservé aux expertes.",
    options: { courbure: ["D", "L"], longueur: ["9 mm", "11 mm", "13 mm", "Mix"] } },
  { id: "color-brun", cat: "cils", name: "Cils Color — Brun", line: "Teinte chaude",
    price: 17.50, note: 4.5, avis: 41, boutique: false, nouveau: true,
    desc: "Cils teintés brun chocolat pour un regard adouci. Sublime les carnations claires.",
    options: { courbure: ["C", "D"], longueur: ["10 mm", "12 mm", "Mix"] } },

  // ---- Accessoires de pose ----
  { id: "pince-courbe", cat: "accessoires", name: "Pince Courbée Précision", line: "Acier inox L+",
    price: 22.00, note: 4.9, avis: 153, boutique: true, best: true,
    desc: "Pince courbée à pointe fine, ressort équilibré pour l'isolation et le volume. Antistatique.",
    options: { finition: ["Noir mat", "Rose gold", "Acier"] } },
  { id: "pince-droite", cat: "accessoires", name: "Pince Droite Isolation", line: "Acier inox",
    price: 19.00, note: 4.7, avis: 102, boutique: true,
    desc: "Pointe droite ultra-précise pour isoler le cil naturel sans accroc.",
    options: { finition: ["Noir mat", "Acier"] } },
  { id: "colle-pro", cat: "accessoires", name: "Colle Pro 1 seconde", line: "Adhésif extensions",
    price: 27.90, note: 4.8, avis: 187, boutique: true,
    desc: "Séchage 1 s, tenue 6–7 semaines. Faible vapeur, idéale en cabine ventilée. 5 ml.",
    options: { volume: ["3 ml", "5 ml", "10 ml"] } },
  { id: "brosses", cat: "accessoires", name: "Brosses Jetables ×50", line: "Goupillons",
    price: 4.90, note: 4.9, avis: 264, boutique: true,
    desc: "Lot de 50 goupillons souples pour brosser et démêler. Hygiène à usage unique." },
  { id: "coussinets", cat: "accessoires", name: "Coussinets Gel ×100", line: "Patchs sous-yeux",
    price: 12.90, note: 4.6, avis: 119, boutique: true,
    desc: "Patchs hydrogel fins qui maintiennent les cils inférieurs. Effet frais." },
  { id: "ruban", cat: "accessoires", name: "Ruban Micropore", line: "Maintien doux",
    price: 3.50, note: 4.7, avis: 73, boutique: true,
    desc: "Ruban hypoallergénique pour un maintien net pendant la pose." },

  // ---- Soins & entretien ----
  { id: "mousse", cat: "soins", name: "Mousse Nettoyante Cils", line: "Nettoyage quotidien",
    price: 13.90, note: 4.8, avis: 205, boutique: true, best: true,
    desc: "Mousse douce sans huile qui nettoie les extensions sans les fragiliser. 60 ml.",
    options: { format: ["60 ml", "150 ml"] } },
  { id: "serum", cat: "soins", name: "Sérum Fortifiant", line: "Soin longueur & densité",
    price: 29.90, note: 4.7, avis: 144, boutique: true, nouveau: true,
    desc: "Sérum aux peptides pour fortifier le cil naturel. Application 1×/jour, résultats en 6 semaines." },
  { id: "brosse-finition", cat: "soins", name: "Brosse de Finition", line: "Goupillon réutilisable",
    price: 6.90, note: 4.9, avis: 58, boutique: true,
    desc: "Goupillon en silicone doux pour discipliner les extensions au quotidien.",
    options: { finition: ["Beige", "Noir"] } },

  // ---- Cartes & prestations ----
  { id: "carte-50", cat: "cartes", name: "Carte Cadeau 50 €", line: "À offrir",
    price: 50.00, note: 5.0, avis: 37, boutique: true, carte: true,
    desc: "Carte cadeau valable sur la boutique et toutes les prestations de l'institut. Envoi par e-mail ou retrait imprimé.",
    options: { montant: ["30 €", "50 €", "80 €", "120 €"] } },
  { id: "presta-volume", cat: "cartes", name: "Pose Volume Russe", line: "Prestation institut · 1h45",
    price: 69.00, note: 4.9, avis: 312, boutique: true, presta: true,
    desc: "Réservez votre pose Volume Russe à l'institut des Pennes-Mirabeau. Retrait = rendez-vous en cabine.",
    options: { formule: ["Pose complète", "Remplissage 2 sem.", "Remplissage 3 sem."] } },
  { id: "presta-rehauss", cat: "cartes", name: "Rehaussement de Cils", line: "Prestation institut · 45 min",
    price: 45.00, note: 4.9, avis: 188, boutique: true, presta: true,
    desc: "Lash lift + teinture pour un regard ouvert sans extensions. Tenue 6 à 8 semaines.",
    options: { formule: ["Rehaussement", "Rehaussement + teinture"] } },
];

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
