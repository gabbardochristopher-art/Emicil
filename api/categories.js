// Retourne les catégories définies dans data.jsx
// Mettre à jour ici si les catégories du site changent
const CATEGORIES = [
  { id: "cils",        label: "Boîtes de cils" },
  { id: "accessoires", label: "Accessoires de pose" },
  { id: "soins",       label: "Soins & entretien" },
  { id: "cartes",      label: "Cartes & prestations" },
];

module.exports = function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json(CATEGORIES);
};
