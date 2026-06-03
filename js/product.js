// =========================================================
//  PRODUCT PAGE
// =========================================================

const params  = new URLSearchParams(window.location.search);
const product = getProductById(params.get('id'));
const detail  = document.getElementById('product-detail');

if (!product) {
  detail.innerHTML = '<p style="padding:40px 0;color:#aaa">Produit introuvable. <a href="shop.html">Retour à la boutique</a></p>';
} else {
  // Breadcrumb
  document.getElementById('breadcrumb-name').textContent = product.name;
  document.title = `Emicil — ${product.name}`;

  // Gallery
  const allImages = product.images.length ? product.images : (product.image ? [product.image] : []);
  const mainImgSrc = allImages[0] || '';
  const thumbsHtml = allImages.length > 1
    ? allImages.map((src, i) => `
        <div class="gallery-thumb ${i === 0 ? 'active' : ''}" data-src="${src}">
          <img src="${src}" alt="" />
        </div>`).join('')
    : '';

  const mainImgHtml = mainImgSrc
    ? `<img src="${mainImgSrc}" alt="${product.name}" id="gallery-main-img" />`
    : `<div style="width:100%;height:100%;background:#eee;display:flex;align-items:center;justify-content:center;color:#aaa">Image</div>`;

  // Sizes
  const sizesHtml = product.sizes.length
    ? `<div class="product-option">
        <p class="product-option__label">Taille</p>
        <div class="option-sizes">
          ${product.sizes.map(s => `<button class="size-btn" data-size="${s}">${s}</button>`).join('')}
        </div>
      </div>` : '';

  // Colors
  const colorsHtml = product.colors.length
    ? `<div class="product-option">
        <p class="product-option__label">Couleur</p>
        <div class="option-swatches">
          ${product.colors.map(c => `<button class="swatch" style="background:${c.hex}" data-color="${c.name}" title="${c.name}"></button>`).join('')}
        </div>
      </div>` : '';

  const oldPriceHtml = product.oldPrice
    ? `<span class="price-old">${formatPrice(product.oldPrice)}</span>` : '';

  detail.innerHTML = `
    <div class="product-gallery">
      <div class="gallery-main">${mainImgHtml}</div>
      ${thumbsHtml ? `<div class="gallery-thumbs">${thumbsHtml}</div>` : ''}
    </div>
    <div class="product-info">
      <p class="product-info__category">${getCategoryById(product.category)?.name || ''}</p>
      <h1 class="product-info__name">${product.name}</h1>
      <div class="product-info__price">
        <span class="price-current">${formatPrice(product.price)}</span>
        ${oldPriceHtml}
      </div>
      <p class="product-info__description">${product.description}</p>
      ${sizesHtml}
      ${colorsHtml}
      <div class="product-add">
        <div class="qty-input">
          <button class="qty-btn" id="qty-minus">−</button>
          <input type="number" class="qty-value" id="qty-value" value="1" min="1" max="${product.stock}" readonly />
          <button class="qty-btn" id="qty-plus">+</button>
        </div>
        <button class="btn btn-primary" id="add-to-cart-btn">Ajouter au panier</button>
      </div>
      <p class="product-meta">
        <span>Réf : ${product.sku}</span>
        <span>Stock : ${product.stock > 0 ? product.stock + ' disponible(s)' : '<strong style="color:#c62828">Rupture de stock</strong>'}</span>
      </p>
    </div>`;

  // Qty
  let qty = 1;
  document.getElementById('qty-minus').addEventListener('click', () => {
    if (qty > 1) { qty--; document.getElementById('qty-value').value = qty; }
  });
  document.getElementById('qty-plus').addEventListener('click', () => {
    if (qty < product.stock) { qty++; document.getElementById('qty-value').value = qty; }
  });

  // Gallery thumbs
  detail.querySelectorAll('.gallery-thumb').forEach(thumb => {
    thumb.addEventListener('click', () => {
      detail.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      const mainImg = document.getElementById('gallery-main-img');
      if (mainImg) mainImg.src = thumb.dataset.src;
    });
  });

  // Size/Color selection
  detail.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      detail.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
  detail.querySelectorAll('.swatch').forEach(btn => {
    btn.addEventListener('click', () => {
      detail.querySelectorAll('.swatch').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Add to cart
  document.getElementById('add-to-cart-btn').addEventListener('click', () => {
    const size  = detail.querySelector('.size-btn.active')?.dataset.size  || null;
    const color = detail.querySelector('.swatch.active')?.dataset.color   || null;
    Cart.addItem(product, qty, { size, color });
    showToast(`"${product.name}" ajouté au panier`);
  });

  // Related products
  const related = PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  const relatedGrid = document.getElementById('related-products');
  if (relatedGrid && related.length) {
    related.forEach(p => relatedGrid.insertAdjacentHTML('beforeend', buildProductCard(p)));
  } else if (relatedGrid) {
    relatedGrid.closest('section').style.display = 'none';
  }
}
