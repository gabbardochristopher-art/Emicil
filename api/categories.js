// Retourne les catégories définies dans data.jsx
// Mettre à jour ici si les catégories du site changent
const CATEGORIES = [
  { id: "extensions",  label: "Extensions de cil" },
  { id: "accessoires", label: "Accessoires" },
  { id: "soins",       label: "Soins & entretien" },
  { id: "colle",       label: "Colle" },
];

module.exports = function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json(CATEGORIES);
};
