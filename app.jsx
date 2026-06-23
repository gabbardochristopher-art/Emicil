// ==========================================================================
// EMICILS — App (header, footer, routing, état global)
// ==========================================================================

function Header({ route, go, cartCount, onCart, loggedIn }) {
  const { CATEGORIES } = window.DATA;
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchInputRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll); return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!searchOpen) return;
    const t = setTimeout(() => searchInputRef.current?.focus(), 60);
    const onKey = (e) => { if (e.key === "Escape") closeSearch(); };
    window.addEventListener("keydown", onKey);
    return () => { clearTimeout(t); window.removeEventListener("keydown", onKey); };
  }, [searchOpen]);

  function closeSearch() { setSearchOpen(false); setQuery(""); }

  function runSearch(q) {
    const term = q.trim();
    if (!term) return;
    closeSearch();
    go("shop", { q: term });
  }

  function openResult(p) {
    closeSearch();
    go("product", { product: p });
  }

  const searchResults = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    const { PRODUCTS } = window.DATA;
    return PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(term) ||
      (p.line || "").toLowerCase().includes(term) ||
      (p.desc || "").toLowerCase().includes(term)
    ).slice(0, 6);
  }, [query]);

  const nav = [["home","Accueil"], ...CATEGORIES.map(c => ["cat:"+c.id, c.label]), ["formation","Formation"], ["account","Fidélité"]];

  function handleNav(key) {
    setMenuOpen(false);
    if (key === "home") go("home");
    else if (key === "account") go("account");
    else if (key === "formation") go("formation");
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
          {[["home","Accueil"],["shop","Boutique"],["formation","Formation"],["account","Fidélité"]].map(([k,l]) => (
            <button key={k} onClick={() => k === "shop" ? go("shop") : handleNav(k)}
              style={{ fontFamily: "var(--f-display)", letterSpacing: "0.12em", textTransform: "uppercase", fontSize: "0.74rem",
                color: route.page === (k === "shop" ? "shop" : k) ? "var(--noir)" : "var(--texte-doux)", paddingBottom: 3,
                borderBottom: "1px solid " + (route.page === (k === "shop" ? "shop" : k) ? "var(--or)" : "transparent") }}>{l}</button>
          ))}
          <a href="https://www.planity.com/emicils-13240-septemes-les-vallons-58l" target="_blank" rel="noopener noreferrer"
            style={{ fontFamily: "var(--f-display)", letterSpacing: "0.12em", textTransform: "uppercase", fontSize: "0.74rem",
              color: "var(--or)", paddingBottom: 3, borderBottom: "1px solid transparent", whiteSpace: "nowrap" }}>Prendre RDV</a>
        </nav>

        <button onClick={() => go("home")} aria-label="Emicils" style={{ flexShrink: 0 }}><Logo size={42} /></button>

        <div className="hdr-actions" style={{ display: "flex", gap: "0.4rem", alignItems: "center", flex: 1, justifyContent: "flex-end" }}>
          <button onClick={() => setSearchOpen(v => !v)} aria-label="Rechercher" aria-expanded={searchOpen} style={{ width: 42, height: 42, borderRadius: "50%", display: "grid", placeItems: "center", color: searchOpen ? "var(--or)" : "var(--noir)" }}>{searchOpen ? <Ico.close width={20} height={20} /> : <Ico.search width={20} height={20} />}</button>
          <button onClick={() => go("account")} aria-label="Compte" style={{ width: 42, height: 42, borderRadius: "50%", display: "grid", placeItems: "center", color: loggedIn ? "var(--or)" : "var(--noir)" }}><Ico.user width={20} height={20} /></button>
          <button onClick={onCart} aria-label="Panier" style={{ width: 42, height: 42, borderRadius: "50%", display: "grid", placeItems: "center", color: "var(--noir)", position: "relative" }}>
            <Ico.cart width={20} height={20} />
            {cartCount > 0 && <span style={{ position: "absolute", top: 4, right: 2, background: "var(--or)", color: "var(--blanc)", borderRadius: "50%", minWidth: 17, height: 17, fontSize: "0.62rem", display: "grid", placeItems: "center", padding: "0 4px" }}>{cartCount}</span>}
          </button>
        </div>
      </div>

      {/* Recherche */}
      <div onClick={closeSearch} style={{ position: "fixed", inset: 0, background: "rgba(29,26,22,0.45)", zIndex: 97,
        opacity: searchOpen ? 1 : 0, pointerEvents: searchOpen ? "auto" : "none", transition: "opacity .25s" }} />
      <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "var(--beige-bg)", borderBottom: "1px solid var(--ligne)",
        boxShadow: "0 24px 60px -24px rgba(29,26,22,0.4)", zIndex: 98, transformOrigin: "top",
        transform: searchOpen ? "scaleY(1)" : "scaleY(0.96)", opacity: searchOpen ? 1 : 0, pointerEvents: searchOpen ? "auto" : "none", transition: "all .22s ease" }}>
        <div className="container" style={{ padding: "1.6rem 0 2rem" }}>
          <form onSubmit={(e) => { e.preventDefault(); runSearch(query); }} style={{ display: "flex", alignItems: "center", gap: "0.9rem",
            borderBottom: "1px solid var(--ligne)", paddingBottom: "1rem" }}>
            <Ico.search width={20} height={20} style={{ color: "var(--texte-doux)", flexShrink: 0 }} />
            <input ref={searchInputRef} value={query} onChange={e => setQuery(e.target.value)} type="text"
              placeholder="Rechercher un produit, une marque, une catégorie…"
              style={{ flex: 1, fontSize: "1.05rem", fontFamily: "var(--f-display)", letterSpacing: "0.01em", color: "var(--noir)", background: "transparent" }} />
            <button type="button" onClick={closeSearch} aria-label="Fermer la recherche" style={{ color: "var(--texte-doux)", flexShrink: 0 }}><Ico.close width={20} height={20} /></button>
          </form>

          {query.trim() !== "" && (
            searchResults.length > 0 ? (
              <div style={{ marginTop: "1.2rem", display: "flex", flexDirection: "column", gap: 2 }}>
                {searchResults.map(p => (
                  <button key={p.id} onClick={() => openResult(p)} style={{ display: "flex", alignItems: "center", gap: "1rem", textAlign: "left",
                    padding: "0.6rem 0.5rem", borderRadius: "var(--r-sm)", transition: "background .15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--beige-soft)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <Photo cat={p.cat} ratio="1 / 1" radius="var(--r-sm)" style={{ width: 50, flexShrink: 0 }} label="" />
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: "block", fontFamily: "var(--f-display)", fontSize: "0.92rem" }}>{p.name}</span>
                      {p.line && <span style={{ fontSize: "0.78rem", color: "var(--texte-doux)" }}>{p.line}</span>}
                    </span>
                    <Price value={p.price} />
                  </button>
                ))}
                <button onClick={() => runSearch(query)} style={{ textAlign: "left", padding: "0.9rem 0.5rem 0.2rem", marginTop: 4, fontSize: "0.78rem",
                  color: "var(--or)", fontFamily: "var(--f-display)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  Voir tous les résultats pour « {query.trim()} »
                </button>
              </div>
            ) : (
              <div style={{ padding: "1.6rem 0.5rem", color: "var(--texte-doux)", fontSize: "0.9rem" }}>Aucun produit ne correspond à « {query.trim()} ».</div>
            )
          )}
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
        <a href="https://www.planity.com/emicils-13240-septemes-les-vallons-58l" target="_blank" rel="noopener noreferrer"
          style={{ textAlign: "left", padding: "0.9rem 0", borderBottom: "1px solid var(--ligne)",
            fontFamily: "var(--f-display)", letterSpacing: "0.08em", textTransform: "uppercase", fontSize: "0.85rem", color: "var(--or)" }}>Prendre RDV</a>
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
          <span style={{ display: "flex", gap: "1.4rem" }}>
            <button onClick={() => go("legal", { section: "mentions" })} style={{ color: "inherit" }}>Mentions légales</button>
            <button onClick={() => go("legal", { section: "cgv" })} style={{ color: "inherit" }}>CGV</button>
            <button onClick={() => go("legal", { section: "confidentialite" })} style={{ color: "inherit" }}>Confidentialité</button>
          </span>
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
  const [user, setUser]           = useState(null);
  const [loggedIn, setLoggedIn]   = useState(false);
  const [toast, setToast]         = useState("");
  const [points, setPoints]       = useState(0);
  const [newOrders] = useState([]);
  const [, forceUpdate]           = useState(0);
  const toastTimer = useRef(null);

  // Charge les points via l'API serveur (service_role — fiable après rechargement)
  async function loadPoints(accessToken) {
    try {
      const res = await fetch('/api/profile', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPoints(data.points ?? 0);
      }
    } catch {}
  }

  // Auth Supabase — écoute la session + points en temps réel
  useEffect(() => {
    let profileChannel = null;

    function setupRealtimePoints(userId, accessToken) {
      if (profileChannel) window.SUPABASE.removeChannel(profileChannel);
      profileChannel = window.SUPABASE
        .channel(`profile-${userId}`)
        .on('postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` },
          ({ new: profile }) => { setPoints(profile.points ?? 0); }
        )
        .subscribe();
    }

    window.SUPABASE.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user); setLoggedIn(true);
        loadPoints(session.access_token);
        setupRealtimePoints(session.user.id, session.access_token);
      }
    });

    const { data: { subscription } } = window.SUPABASE.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user); setLoggedIn(true);
        loadPoints(session.access_token);
        setupRealtimePoints(session.user.id, session.access_token);
      } else {
        setUser(null); setLoggedIn(false); setPoints(0);
        if (profileChannel) window.SUPABASE.removeChannel(profileChannel);
      }
    });

    return () => {
      subscription.unsubscribe();
      if (profileChannel) window.SUPABASE.removeChannel(profileChannel);
    };
  }, []);

  // Charge + écoute les produits en temps réel (Supabase Realtime)
  useEffect(() => {
    function mapProduct(p) {
      return {
        id: String(p.id),
        cat: p.category || '',
        name: p.name,
        line: p.sku || '',
        price: parseFloat(p.price),
        oldPrice: p.old_price ? parseFloat(p.old_price) : null,
        note: parseFloat(p.note) || 0,
        avis: p.avis || 0,
        boutique: p.stock > 0,
        best: !!p.featured,
        nouveau: !!p.new_arrival,
        desc: p.description || '',
        badge: p.badge || null,
        stock: p.stock || 0,
        image: p.image || '',
        options: (p.options && Object.keys(p.options).length) ? p.options : null,
      };
    }

    function refreshCounts() {
      window.DATA.CATEGORIES.forEach(c => {
        c.count = window.DATA.PRODUCTS.filter(p => p.cat === c.id).length;
      });
    }

    // Étoiles + nb d'avis affichés = vraie moyenne des avis publiés (pas de valeur figée en base)
    function loadReviewStats() {
      fetch('/api/reviews?summary=1')
        .then(r => r.ok ? r.json() : null)
        .then(stats => {
          if (!stats) return;
          window.DATA.PRODUCTS = window.DATA.PRODUCTS.map(p => ({
            ...p,
            note: stats[p.id]?.note || 0,
            avis: stats[p.id]?.avis || 0,
          }));
          forceUpdate(n => n + 1);
        })
        .catch(() => {});
    }

    // Chargement initial
    fetch('/api/products')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          window.DATA.PRODUCTS = data.map(mapProduct);
          refreshCounts();
          forceUpdate(n => n + 1);
          loadReviewStats();
        }
      })
      .catch(() => {});

    // Écoute temps réel
    const channel = window.SUPABASE
      .channel('products-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'products' }, ({ new: p }) => {
        window.DATA.PRODUCTS = [mapProduct(p), ...window.DATA.PRODUCTS];
        refreshCounts();
        forceUpdate(n => n + 1);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'products' }, ({ new: p }) => {
        window.DATA.PRODUCTS = window.DATA.PRODUCTS.map(x => x.id === String(p.id) ? mapProduct(p) : x);
        refreshCounts();
        forceUpdate(n => n + 1);
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'products' }, ({ old: p }) => {
        window.DATA.PRODUCTS = window.DATA.PRODUCTS.filter(x => x.id !== String(p.id));
        refreshCounts();
        forceUpdate(n => n + 1);
      })
      .subscribe();

    // Recalcule étoiles/avis dès qu'un avis est ajouté ou modéré (validé/refusé)
    const reviewsChannel = window.SUPABASE
      .channel('reviews-stats-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, () => loadReviewStats())
      .subscribe();

    return () => {
      window.SUPABASE.removeChannel(channel);
      window.SUPABASE.removeChannel(reviewsChannel);
    };
  }, []);

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
  function onCheckoutDone() {
    setCart([]);
  }

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  let content;
  if (route.page === "home") content = <HomePage go={go} onOpen={openProduct} onAdd={addToCart} favs={favs} onFav={toggleFav} />;
  else if (route.page === "shop") content = <ShopPage go={go} onOpen={openProduct} onAdd={addToCart} favs={favs} onFav={toggleFav} initialCat={route.cat} initialQuery={route.q} />;
  else if (route.page === "product") content = <ProductPage p={route.product} go={go} onAdd={addToCart} favs={favs} onFav={toggleFav} onOpen={openProduct} user={user} />;
  else if (route.page === "checkout") content = <CheckoutPage items={cart} go={go} onDone={onCheckoutDone} compte={{ points }} user={user} />;
  else if (route.page === "formation") content = <FormationPage go={go} />;
  else if (route.page === "account") content = <AccountPage user={user} onLogout={async () => { await window.SUPABASE.auth.signOut(); }} go={go} points={points} orders={newOrders} />;
  else if (route.page === "legal") content = <LegalPage go={go} section={route.section} />;

  return (
    <>
      <Header route={route} go={go} cartCount={cartCount} onCart={() => setCartOpen(true)} loggedIn={loggedIn} />
      <main style={{ flex: 1 }}>{content}</main>
      <Footer go={go} />
      <CartDrawer open={cartOpen} items={cart} onClose={() => setCartOpen(false)} onQty={setQty} onRemove={removeItem}
        onCheckout={() => { setCartOpen(false); go("checkout"); }} go={go} />
      <Toast msg={toast} />
      <PopupQuizWrapper />
      <EmicilsTweaks />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
