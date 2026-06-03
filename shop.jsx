// ==========================================================================
// EMICILS — Boutique (catalogue + filtres) & fiche produit
// ==========================================================================

function ShopPage({ go, onOpen, onAdd, favs, onFav, initialCat }) {
  const { PRODUCTS, CATEGORIES } = window.DATA;
  const [cat, setCat] = useState(initialCat || "tous");
  const [tri, setTri] = useState("populaires");
  const [collectOnly, setCollectOnly] = useState(false);
  const [maxPrix, setMaxPrix] = useState(80);

  useEffect(() => { if (initialCat) setCat(initialCat); }, [initialCat]);

  const filtered = useMemo(() => {
    let l = PRODUCTS.filter(p => (cat === "tous" || p.cat === cat) && p.price <= maxPrix && (!collectOnly || p.boutique));
    if (tri === "prix-asc") l = [...l].sort((a,b) => a.price - b.price);
    else if (tri === "prix-desc") l = [...l].sort((a,b) => b.price - a.price);
    else if (tri === "note") l = [...l].sort((a,b) => b.note - a.note);
    else l = [...l].sort((a,b) => (b.best?1:0) - (a.best?1:0) || b.avis - a.avis);
    return l;
  }, [cat, tri, collectOnly, maxPrix]);

  const cats = [{ id: "tous", label: "Tout le catalogue", count: PRODUCTS.length }, ...CATEGORIES];

  return (
    <div className="container" style={{ paddingTop: "2.5rem", paddingBottom: "var(--pad-section)" }}>
      <div style={{ marginBottom: "2.4rem" }}>
        <div className="eyebrow">Boutique Emicils</div>
        <h1 style={{ fontSize: "clamp(2rem,4vw,3rem)", marginTop: "0.6rem" }}>
          {cat === "tous" ? "Tout le catalogue" : CATEGORIES.find(c => c.id === cat)?.label}
        </h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "clamp(1.5rem,3vw,3rem)", alignItems: "start" }} data-shop-grid>
        {/* Filtres */}
        <aside data-filters style={{ position: "sticky", top: 96, display: "flex", flexDirection: "column", gap: "2rem" }}>
          <div>
            <div className="wide" style={{ fontSize: "0.7rem", color: "var(--texte-doux)", marginBottom: "1rem", fontFamily: "var(--f-display)" }}>Catégories</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {cats.map(c => (
                <button key={c.id} onClick={() => setCat(c.id)}
                  style={{ textAlign: "left", padding: "0.55rem 0.8rem", borderRadius: "var(--r-sm)", display: "flex", justifyContent: "space-between",
                    background: cat === c.id ? "var(--noir)" : "transparent", color: cat === c.id ? "var(--blanc)" : "var(--texte)",
                    fontSize: "0.92rem", transition: "all .2s" }}>
                  <span>{c.label}</span><span style={{ opacity: 0.6, fontSize: "0.8rem" }}>{c.count}</span>
                </button>
              ))}
            </div>
          </div>
          <div style={{ borderTop: "1px solid var(--ligne)", paddingTop: "1.6rem" }}>
            <div className="wide" style={{ fontSize: "0.7rem", color: "var(--texte-doux)", marginBottom: "1rem", fontFamily: "var(--f-display)" }}>Prix max</div>
            <input type="range" min="3" max="80" value={maxPrix} onChange={e => setMaxPrix(+e.target.value)}
              style={{ width: "100%", accentColor: "var(--or)" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--texte-doux)", marginTop: 6 }}>
              <span>3 €</span><span style={{ color: "var(--noir)", fontFamily: "var(--f-display)" }}>{maxPrix} €</span>
            </div>
          </div>
          <div style={{ borderTop: "1px solid var(--ligne)", paddingTop: "1.6rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: "0.92rem" }}>
              <span onClick={() => setCollectOnly(v => !v)} style={{ width: 42, height: 24, borderRadius: 999, background: collectOnly ? "var(--or)" : "var(--beige-deep)",
                position: "relative", transition: "all .2s", flexShrink: 0 }}>
                <span style={{ position: "absolute", top: 3, left: collectOnly ? 21 : 3, width: 18, height: 18, borderRadius: "50%", background: "var(--blanc)", transition: "all .2s" }} />
              </span>
              <span>Dispo en boutique</span>
            </label>
          </div>
        </aside>

        {/* Grille */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.6rem", flexWrap: "wrap", gap: "0.8rem" }}>
            <span style={{ fontSize: "0.88rem", color: "var(--texte-doux)" }}>{filtered.length} produit{filtered.length > 1 ? "s" : ""}</span>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.85rem" }}>
              <span style={{ color: "var(--texte-doux)" }}>Trier&nbsp;:</span>
              <select value={tri} onChange={e => setTri(e.target.value)}
                style={{ border: "1px solid var(--ligne)", background: "var(--blanc)", borderRadius: "var(--r-sm)", padding: "0.5rem 0.8rem", color: "var(--texte)" }}>
                <option value="populaires">Populaires</option>
                <option value="note">Mieux notés</option>
                <option value="prix-asc">Prix croissant</option>
                <option value="prix-desc">Prix décroissant</option>
              </select>
            </label>
          </div>
          {filtered.length === 0 ? (
            <div style={{ padding: "4rem 1rem", textAlign: "center", color: "var(--texte-doux)" }}>Aucun produit avec ces filtres.</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "clamp(1.2rem,2.5vw,1.8rem)" }}>
              {filtered.map(p => <ProductCard key={p.id} p={p} onOpen={onOpen} onAdd={onAdd} fav={favs.includes(p.id)} onFav={onFav} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- Fiche produit ----------
function ProductPage({ p, go, onAdd, favs, onFav, onOpen }) {
  const { PRODUCTS } = window.DATA;
  const [qty, setQty] = useState(1);
  const [opts, setOpts] = useState(() => {
    const o = {}; if (p.options) Object.entries(p.options).forEach(([k, v]) => o[k] = v[Math.min(v.length - 1, v.length > 4 ? v.length - 1 : 0)]); return o;
  });
  const [mode, setMode] = useState("collect");
  const [added, setAdded] = useState(false);
  const fav = favs.includes(p.id);
  const related = PRODUCTS.filter(x => x.cat === p.cat && x.id !== p.id).slice(0, 4);

  useEffect(() => { window.scrollTo(0, 0); }, [p.id]);

  function add() {
    onAdd(p, qty, opts, mode);
    setAdded(true); setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="container" style={{ paddingTop: "1.8rem", paddingBottom: "var(--pad-section)" }}>
      <button onClick={() => go("shop", { cat: p.cat })} style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--texte-doux)", fontSize: "0.82rem", marginBottom: "1.8rem" }}>
        <Ico.chevron width={15} height={15} style={{ transform: "rotate(180deg)" }} /> Retour à la boutique
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(2rem,4vw,4rem)", alignItems: "start" }} data-pdp-grid>
        {/* Galerie */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", position: "sticky", top: 96 }} data-gallery>
          <Photo cat={p.cat} ratio="1 / 1" radius="var(--r-lg)" label={`photo · ${p.name}`} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.8rem" }}>
            {[1,2,3,4].map(i => <Photo key={i} cat={p.cat} ratio="1 / 1" radius="var(--r-sm)" label={`vue ${i}`} />)}
          </div>
        </div>

        {/* Infos */}
        <div>
          <div style={{ display: "flex", gap: 6, marginBottom: "0.9rem" }}>
            {p.best && <Badge>Best-seller</Badge>}
            {p.nouveau && <Badge tone="soft">Nouveau</Badge>}
            {p.presta && <Badge tone="soft">Prestation institut</Badge>}
          </div>
          <span style={{ fontSize: "0.72rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--texte-doux)" }}>{p.line}</span>
          <h1 style={{ fontSize: "clamp(1.8rem,3.6vw,2.6rem)", margin: "0.4rem 0 0.8rem" }}>{p.name}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.4rem" }}>
            <Stars note={p.note} size={15} showNum count={p.avis} />
          </div>
          <Price value={p.price} size="1.9rem" />
          <p style={{ color: "var(--texte-doux)", margin: "1.4rem 0 1.8rem", maxWidth: 460 }}>{p.desc}</p>

          {/* Options */}
          {p.options && Object.entries(p.options).map(([k, vals]) => (
            <div key={k} style={{ marginBottom: "1.4rem" }}>
              <div style={{ fontSize: "0.78rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--texte)", marginBottom: "0.7rem" }}>
                {k} : <strong style={{ fontWeight: 500 }}>{opts[k]}</strong>
              </div>
              <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                {vals.map(v => (
                  <button key={v} onClick={() => setOpts(o => ({ ...o, [k]: v }))}
                    style={{ padding: "0.55rem 1rem", borderRadius: "var(--r-sm)", fontSize: "0.85rem",
                      border: "1px solid " + (opts[k] === v ? "var(--noir)" : "var(--ligne)"),
                      background: opts[k] === v ? "var(--noir)" : "var(--blanc)", color: opts[k] === v ? "var(--blanc)" : "var(--texte)", transition: "all .2s" }}>{v}</button>
                ))}
              </div>
            </div>
          ))}

          {/* Mode de récupération */}
          <div style={{ marginBottom: "1.6rem" }}>
            <div style={{ fontSize: "0.78rem", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.7rem" }}>Récupération</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.7rem" }}>
              {[["collect", "store", "Retrait boutique", "Prêt sous 2 h · gratuit"], ["domicile", "truck", "Livraison", "Dès 5,90 € · 2-3 j"]].map(([id, ic, t, d]) => (
                <button key={id} onClick={() => setMode(id)}
                  style={{ textAlign: "left", padding: "0.9rem 1rem", borderRadius: "var(--r-md)", display: "flex", gap: 10, alignItems: "center",
                    border: "1px solid " + (mode === id ? "var(--or)" : "var(--ligne)"), background: mode === id ? "var(--or-soft)" : "var(--blanc)", transition: "all .2s" }}>
                  <span style={{ color: "var(--or)" }}>{Ico[ic]({ width: 20, height: 20 })}</span>
                  <span><span style={{ display: "block", fontFamily: "var(--f-display)", fontSize: "0.92rem" }}>{t}</span>
                  <span style={{ fontSize: "0.72rem", color: "var(--texte-doux)" }}>{d}</span></span>
                </button>
              ))}
            </div>
          </div>

          {/* Ajouter */}
          <div style={{ display: "flex", gap: "0.8rem", alignItems: "center" }}>
            <QtyStepper value={qty} onChange={setQty} />
            <button className="btn btn-dark" style={{ flex: 1, height: 48 }} onClick={add}>
              {added ? <><Ico.check width={16} height={16} /> Ajouté au panier</> : <><Ico.cart width={16} height={16} /> Ajouter — {euro(p.price * qty)}</>}
            </button>
            <button onClick={() => onFav(p.id)} aria-label="Favori"
              style={{ width: 48, height: 48, borderRadius: "var(--r-sm)", border: "1px solid var(--ligne)", display: "grid", placeItems: "center",
                color: fav ? "var(--or)" : "var(--texte)", background: "var(--blanc)" }}>
              <Ico.heart width={19} height={19} style={{ fill: fav ? "var(--or)" : "none" }} />
            </button>
          </div>

          {/* Réassurance */}
          <div style={{ marginTop: "1.8rem", borderTop: "1px solid var(--ligne)", paddingTop: "1.4rem", display: "flex", flexDirection: "column", gap: "0.7rem" }}>
            {[["store", "Retrait gratuit à l'institut des Pennes-Mirabeau"], ["sparkle", `Vous gagnez ${Math.round(p.price * qty)} points fidélité`], ["leaf", "Produits testés en cabine par nos lash artists"]].map(([ic, t]) => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.85rem", color: "var(--texte-doux)" }}>
                <span style={{ color: "var(--or)" }}>{Ico[ic]({ width: 17, height: 17 })}</span> {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Suggestions */}
      {related.length > 0 && (
        <div style={{ marginTop: "var(--pad-section)" }}>
          <SectionHead eyebrow="Vous aimerez aussi" title="Dans la même catégorie" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "clamp(1.2rem,2.5vw,1.8rem)" }}>
            {related.map(rp => <ProductCard key={rp.id} p={rp} onOpen={onOpen} onAdd={(x) => onAdd(x)} fav={favs.includes(rp.id)} onFav={onFav} />)}
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { ShopPage, ProductPage });
