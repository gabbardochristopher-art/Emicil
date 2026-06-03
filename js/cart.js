// =========================================================
//  CART — gestion du panier (localStorage)
// =========================================================

const Cart = (() => {
  const KEY = 'emicil_cart';

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch { return []; }
  }
  function save(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
    _dispatch();
  }

  function _dispatch() {
    document.dispatchEvent(new CustomEvent('cart:updated', { detail: getItems() }));
  }

  function getItems() { return load(); }

  function addItem(product, qty = 1, variant = {}) {
    const items = load();
    const key = `${product.id}-${variant.size || ''}-${variant.color || ''}`;
    const existing = items.find(i => i.key === key);
    if (existing) {
      existing.qty += qty;
    } else {
      items.push({
        key,
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        variant,
        qty,
      });
    }
    save(items);
  }

  function updateQty(key, qty) {
    const items = load();
    const item = items.find(i => i.key === key);
    if (!item) return;
    if (qty <= 0) return removeItem(key);
    item.qty = qty;
    save(items);
  }

  function removeItem(key) {
    save(load().filter(i => i.key !== key));
  }

  function clear() { save([]); }

  function getTotalQty() {
    return load().reduce((sum, i) => sum + i.qty, 0);
  }

  function getSubtotal() {
    return load().reduce((sum, i) => sum + i.price * i.qty, 0);
  }

  function applyPromo(code) {
    const codes = { 'BIENVENUE': 10, 'SOLDES20': 20 };
    return codes[code.toUpperCase()] || null;
  }

  return { getItems, addItem, updateQty, removeItem, clear, getTotalQty, getSubtotal, applyPromo };
})();
