// ==========================================================================
// EMICILS — App (header, footer, routing, état global)
// ==========================================================================

function Header({ route, go, cartCount, onCart, loggedIn }) {
  const { CATEGORIES } = window.DATA;
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll); return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const nav = [["home","Accueil"], ...CATEGORIES.map(c => ["cat:"+c.id, c.label]), ["account","Fidélité"]];

  function handleNav(key) {
    setMenuOpen(false);
    if (key === "home") go("home");
    else if (key === "account") go("account");
    else if (key.startsWith("cat:")) go("shop", { cat: key.slice(4) });
  }

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 80, background: scrolled ? "rgba(244,237,226,0.92)" : "var(--beige-bg)",
      backdropFilter: scrolled ? "blur(10px)" : "none", borderBottom: "1px solid " + (scrolled ? "var(--ligne)" : "transparent"), transition: "all .3s" }}>
      {/* bandeau */}
      <div style={{ background: "var(--noir)", color: "var(--blanc)", textAlign: "center", fontSize: "0.72rem", letterSpacing: "0.1em",
        padding: "0.5rem", textTransform: "uppercase", fontFamily: "var(--f-display)" }}>
        Click & Collect gratuit en 2 h · Livraison offerte dès 49 €
      </div>
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 76, gap: "1rem" }}>
        <button className="hdr-burger" onClick={() => setMenuOpen(true)} aria-label="Menu" style={{ display: "none", color: "var(--noir)" }}><Ico.menu width={24} height={24} /></button>

        <nav className="hdr-nav" style={{ display: "flex", gap: "1.6rem", flex: 1 }}>
          {[["home","Accueil"],["shop","Boutique"],["account","Fidélité"]].map(([k,l]) => (
            <button key={k} onClick={() => k === "shop" ? go("shop") : handleNav(k)}
              style={{ fontFamily: "var(--f-display)", letterSpacing: "0.12em", textTransform: "uppercase", fontSize: "0.74rem",
                color: route.page === (k === "shop" ? "shop" : k) ? "var(--noir)" : "var(--texte-doux)", paddingBottom: 3,
                borderBottom: "1px solid " + (route.page === (k === "shop" ? "shop" : k) ? "var(--or)" : "transparent") }}>{l}</button>
          ))}
        </nav>

        <button onClick={() => go("home")} aria-label="Emicils" style={{ flexShrink: 0 }}><Logo size={20} /></button>

        <div className="hdr-actions" style={{ display: "flex", gap: "0.4rem", alignItems: "center", flex: 1, justifyContent: "flex-end" }}>
          <button onClick={() => go("shop")} aria-label="Rechercher" style={{ width: 42, height: 42, borderRadius: "50%", display: "grid", placeItems: "center", color: "var(--noir)" }}><Ico.search width={20} height={20} /></button>
          <button onClick={() => go("account")} aria-label="Compte" style={{ width: 42, height: 42, borderRadius: "50%", display: "grid", placeItems: "center", color: loggedIn ? "var(--or)" : "var(--noir)" }}><Ico.user width={20} height={20} /></button>
          <button onClick={onCart} aria-label="Panier" style={{ width: 42, height: 42, borderRadius: "50%", display: "grid", placeItems: "center", color: "var(--noir)", position: "relative" }}>
            <Ico.cart width={20} height={20} />
            {cartCount > 0 && <span style={{ position: "absolute", top: 4, right: 2, background: "var(--or)", color: "var(--blanc)", borderRadius: "50%", minWidth: 17, height: 17, fontSize: "0.62rem", display: "grid", placeItems: "center", padding: "0 4px" }}>{cartCount}</span>}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(29,26,22,0.45)", zIndex: 95,
        opacity: menuOpen ? 1 : 0, pointerEvents: menuOpen ? "auto" : "none", transition: "opacity .3s" }} />
      <aside style={{ position: "fixed", top: 0, left: 0, height: "100%", width: "min(320px, 85vw)", background: "var(--beige-bg)", zIndex: 96,
        transform: menuOpen ? "none" : "translateX(-100%)", transition: "transform .35s", padding: "1.4rem", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <Logo size={18} /><button onClick={() => setMenuOpen(false)}><Ico.close width={24} height={24} /></button>
        </div>
        {nav.map(([k,l]) => (
          <button key={k} onClick={() => handleNav(k)} style={{ textAlign: "left", padding: "0.9rem 0", borderBottom: "1px solid var(--ligne)",
            fontFamily: "var(--f-display)", letterSpacing: "0.08em", textTransform: "uppercase", fontSize: "0.85rem", color: "var(--texte)" }}>{l}</button>
        ))}
      </aside>
    </header>
  );
}

function Footer({ go }) {
  return (
    <footer style={{ background: "var(--noir)", color: "rgba(251,248,242,0.7)", marginTop: "var(--pad-section)" }}>
      <div className="container" style={{ paddingTop: "clamp(3rem,6vw,5rem)", paddingBottom: "2.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1.2fr", gap: "2.5rem" }} data-footer-grid>
          <div>
            <img src="assets/logo-emicils.png" alt="Emicils" style={{ width: 150, marginBottom: "1.2rem", marginLeft: -10 }} />
            <p style={{ fontSize: "0.86rem", maxWidth: 260 }}>Institut de beauté & boutique spécialisés dans le regard, aux Pennes-Mirabeau.</p>
          </div>
          {[["Boutique", [["Boîtes de cils","cils"],["Accessoires","accessoires"],["Soins","soins"],["Cartes & prestations","cartes"]]],
            ["Aide", [["Click & Collect"],["Livraison & retours"],["Programme fidélité"],["Nous contacter"]]]].map(([t, links]) => (
            <div key={t}>
              <div className="wide" style={{ fontFamily: "var(--f-display)", fontSize: "0.72rem", color: "var(--blanc)", marginBottom: "1.1rem" }}>{t}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {links.map((l, i) => <button key={i} onClick={() => l[1] ? go("shop", { cat: l[1] }) : null} style={{ textAlign: "left", fontSize: "0.86rem", color: "rgba(251,248,242,0.7)" }}>{l[0]}</button>)}
              </div>
            </div>
          ))}
          <div>
            <div className="wide" style={{ fontFamily: "var(--f-display)", fontSize: "0.72rem", color: "var(--blanc)", marginBottom: "1.1rem" }}>L'institut</div>
            <div style={{ fontSize: "0.86rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              <span style={{ display: "flex", gap: 8, alignItems: "flex-start" }}><Ico.pin width={16} height={16} style={{ color: "var(--or)", flexShrink: 0, marginTop: 2 }} /> 50 avenue François Mitterand, 13170 Les Pennes-Mirabeau</span>
              <span style={{ display: "flex", gap: 8, alignItems: "center" }}><Ico.clock width={16} height={16} style={{ color: "var(--or)", flexShrink: 0 }} /> Lun–Sam · 10 h – 20 h</span>
              <span style={{ display: "flex", gap: 8, alignItems: "center" }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" width={16} height={16} style={{ color: "var(--or)", flexShrink: 0 }}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.67 3.47 2 2 0 0 1 3.64 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> 06 69 25 62 12</span>
            </div>
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(251,248,242,0.14)", marginTop: "2.5rem", paddingTop: "1.6rem", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.8rem", fontSize: "0.76rem" }}>
          <span>© 2026 Emicils · Institut de beauté</span>
          <span style={{ display: "flex", gap: "1.4rem" }}><button style={{ color: "inherit" }}>Mentions légales</button><button style={{ color: "inherit" }}>CGV</button><button style={{ color: "inherit" }}>Confidentialité</button></span>
        </div>
      </div>
    </footer>
  );
}

// Toast
function Toast({ msg }) {
  if (!msg) return null;
  return <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "var(--noir)", color: "var(--blanc)",
    padding: "0.9rem 1.4rem", borderRadius: "var(--r-pill)", zIndex: 120, display: "flex", alignItems: "center", gap: 10, boxShadow: "var(--shadow)",
    fontSize: "0.86rem", animation: "fadeUp .3s ease" }}>
    <Ico.check width={17} height={17} style={{ color: "var(--or)" }} /> {msg}</div>;
}

function App() {
  const [route, setRoute] = useState({ page: "home" });
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [favs, setFavs] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [toast, setToast] = useState("");
  const [points, setPoints] = useState(window.DATA.COMPTE_DEMO.points);
  const [newOrders, setNewOrders] = useState([]);
  const toastTimer = useRef(null);

  function go(page, params = {}) { setRoute({ page, ...params }); window.scrollTo(0, 0); }
  function flash(msg) { setToast(msg); clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(""), 2200); }

  function addToCart(p, qty = 1, opts = null, mode = "collect") {
    setCart(prev => {
      const key = p.id + JSON.stringify(opts || {}) + mode;
      const idx = prev.findIndex(i => i._key === key);
      if (idx >= 0) { const c = [...prev]; c[idx] = { ...c[idx], qty: c[idx].qty + qty }; return c; }
      return [...prev, { _key: key, id: p.id, name: p.name, price: p.price, cat: p.cat, qty, opts, mode }];
    });
    flash(`${p.name} ajouté au panier`);
  }
  function setQty(idx, q) { setCart(prev => prev.map((i, n) => n === idx ? { ...i, qty: q } : i)); }
  function removeItem(idx) { setCart(prev => prev.filter((_, n) => n !== idx)); }
  function toggleFav(id) { setFavs(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]); }

  function openProduct(p) { go("product", { product: p }); }
  function onCheckoutDone({ total, ptsGagnes, mode }) {
    setPoints(pt => pt + ptsGagnes);
    const ref = "EMI-" + Math.floor(2420 + Math.random() * 80);
    setNewOrders(o => [{ id: ref, date: "3 juin 2026", total, statut: mode === "collect" ? "En préparation" : "Confirmée",
      mode: mode === "collect" ? "Click & Collect" : mode === "relais" ? "Point relais" : "Domicile", articles: cart.reduce((s,i)=>s+i.qty,0), pts: ptsGagnes }, ...o]);
    setCart([]);
  }

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  let content;
  if (route.page === "home") content = <HomePage go={go} onOpen={openProduct} onAdd={addToCart} favs={favs} onFav={toggleFav} />;
  else if (route.page === "shop") content = <ShopPage go={go} onOpen={openProduct} onAdd={addToCart} favs={favs} onFav={toggleFav} initialCat={route.cat} />;
  else if (route.page === "product") content = <ProductPage p={route.product} go={go} onAdd={addToCart} favs={favs} onFav={toggleFav} onOpen={openProduct} />;
  else if (route.page === "checkout") content = <CheckoutPage items={cart} go={go} onDone={onCheckoutDone} compte={{ points }} />;
  else if (route.page === "account") content = <AccountPage loggedIn={loggedIn} onLogin={() => { setLoggedIn(true); flash("Bienvenue, Léa !"); }} onLogout={() => setLoggedIn(false)} go={go} points={points} orders={newOrders} />;

  return (
    <>
      <Header route={route} go={go} cartCount={cartCount} onCart={() => setCartOpen(true)} loggedIn={loggedIn} />
      <main style={{ flex: 1 }}>{content}</main>
      <Footer go={go} />
      <CartDrawer open={cartOpen} items={cart} onClose={() => setCartOpen(false)} onQty={setQty} onRemove={removeItem}
        onCheckout={() => { setCartOpen(false); go("checkout"); }} go={go} />
      <Toast msg={toast} />
      <EmicilsTweaks />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
