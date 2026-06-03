// =========================================================
//  DATA — produits & catégories
//  Remplacez ce fichier par un appel API quand vous serez
//  prêt à connecter un backend.
// =========================================================

const CATEGORIES = [
  { id: 'all',       name: 'Tout',         image: '' },
  { id: 'cat-1',     name: 'Catégorie 1',  image: '' },
  { id: 'cat-2',     name: 'Catégorie 2',  image: '' },
  { id: 'cat-3',     name: 'Catégorie 3',  image: '' },
];

const PRODUCTS = [
  {
    id: 1,
    name: 'Produit exemple 1',
    category: 'cat-1',
    price: 49.99,
    oldPrice: null,
    image: '',
    images: [],
    badge: null,        // 'new' | 'sale' | null
    featured: true,
    newArrival: true,
    stock: 10,
    description: 'Description du produit. Ajoutez ici les détails.',
    sizes: [],
    colors: [],
    sku: 'SKU-001',
  },
  {
    id: 2,
    name: 'Produit exemple 2',
    category: 'cat-2',
    price: 89.00,
    oldPrice: 120.00,
    image: '',
    images: [],
    badge: 'sale',
    featured: true,
    newArrival: false,
    stock: 5,
    description: 'Description du produit. Ajoutez ici les détails.',
    sizes: [],
    colors: [],
    sku: 'SKU-002',
  },
  {
    id: 3,
    name: 'Produit exemple 3',
    category: 'cat-3',
    price: 35.00,
    oldPrice: null,
    image: '',
    images: [],
    badge: 'new',
    featured: false,
    newArrival: true,
    stock: 20,
    description: 'Description du produit. Ajoutez ici les détails.',
    sizes: [],
    colors: [],
    sku: 'SKU-003',
  },
];

// Helpers
function getProductById(id) {
  return PRODUCTS.find(p => p.id === parseInt(id));
}
function getProductsByCategory(categoryId) {
  if (!categoryId || categoryId === 'all') return PRODUCTS;
  return PRODUCTS.filter(p => p.category === categoryId);
}
function getFeaturedProducts() {
  return PRODUCTS.filter(p => p.featured);
}
function getNewArrivals() {
  return PRODUCTS.filter(p => p.newArrival);
}
function getCategoryById(id) {
  return CATEGORIES.find(c => c.id === id);
}
