// =========================================================
//  HOME PAGE
// =========================================================

// Categories
const categoriesGrid = document.getElementById('categories-grid');
if (categoriesGrid) {
  CATEGORIES.filter(c => c.id !== 'all').forEach(cat => {
    const img = cat.image
      ? `<img src="${cat.image}" alt="${cat.name}" loading="lazy" />`
      : `<div style="width:100%;height:100%;background:#eee;display:flex;align-items:center;justify-content:center;color:#aaa;font-size:.85rem;">Image</div>`;
    categoriesGrid.insertAdjacentHTML('beforeend', `
      <a href="pages/shop.html?category=${cat.id}" class="category-card">
        ${img}
        <span class="category-card__label">${cat.name}</span>
      </a>`);
  });
}

// Featured products
const featuredGrid = document.getElementById('featured-products');
if (featuredGrid) {
  const products = getFeaturedProducts().slice(0, 4);
  if (products.length) {
    products.forEach(p => featuredGrid.insertAdjacentHTML('beforeend', buildProductCard(p)));
  } else {
    featuredGrid.innerHTML = '<p style="color:#aaa;text-align:center;grid-column:1/-1">Aucun produit en vedette.</p>';
  }
}

// New arrivals
const newArrivalsGrid = document.getElementById('new-arrivals');
if (newArrivalsGrid) {
  const products = getNewArrivals().slice(0, 4);
  if (products.length) {
    products.forEach(p => newArrivalsGrid.insertAdjacentHTML('beforeend', buildProductCard(p)));
  } else {
    newArrivalsGrid.innerHTML = '<p style="color:#aaa;text-align:center;grid-column:1/-1">Aucune nouveauté.</p>';
  }
}
