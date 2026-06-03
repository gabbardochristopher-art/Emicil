// ==========================================================================
// EMICILS — Page d'accueil
// ==========================================================================

function Hero({ go }) {
  return (
    <section style={{ position: "relative", background: "var(--noir)", color: "var(--blanc)", overflow: "hidden" }}>
      <div className="container" style={{ display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: "clamp(2rem,5vw,4.5rem)",
        alignItems: "center", paddingTop: "clamp(3.5rem,7vw,6rem)", paddingBottom: "clamp(3.5rem,7vw,6rem)", minHeight: "82vh" }}
        data-hero-grid>
        <div className="fade-up" style={{ maxWidth: 560 }}>
          <div className="eyebrow" style={{ color: "var(--or)" }}>Institut & boutique · Les Pennes-Mirabeau</div>
          <h1 style={{ color: "var(--blanc)", fontSize: "clamp(2.6rem, 6vw, 4.6rem)", margin: "1.4rem 0 0", lineHeight: 1.04 }}>
            Le regard,<br /><span style={{ fontFamily: "var(--f-serif)", fontStyle: "italic", fontWeight: 400 }}>sublimé</span> avec soin.
          </h1>
          <p style={{ color: "rgba(251,248,242,0.72)", fontSize: "1.06rem", maxWidth: 440, margin: "1.6rem 0 2.4rem" }}>
            Boîtes de cils, accessoires de pose et soins sélectionnés par nos lash artists.
            Commandez en ligne, retirez en boutique en 2 h.
          </p>
          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            <button className="btn btn-light" onClick={() => go("shop")}>Découvrir la boutique</button>
            <button className="btn btn-outline" style={{ boxShadow: "inset 0 0 0 1px rgba(251,248,242,0.5)", color: "var(--blanc)" }}
              onClick={() => go("shop", { cat: "cartes" })}>Réserver une pose</button>
          </div>
          <div style={{ display: "flex", gap: "2.2rem", marginTop: "3rem", flexWrap: "wrap" }}>
            {[["2 h", "Retrait en boutique"], ["4.9/5", "+1 200 avis clientes"], ["1 pt = 1 €", "Programme fidélité"]].map(([a,b]) => (
              <div key={b}>
                <div style={{ fontFamily: "var(--f-display)", fontSize: "1.5rem", color: "var(--or)" }}>{a}</div>
                <div style={{ fontSize: "0.74rem", letterSpacing: "0.08em", color: "rgba(251,248,242,0.6)", textTransform: "uppercase" }}>{b}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="fade-up" style={{ position: "relative", animationDelay: ".1s" }}>
          <Photo cat="cils" ratio="4 / 5" label="visuel campagne · regard cils" radius="var(--r-lg)"
            style={{ boxShadow: "0 40px 80px -40px rgba(0,0,0,0.6)" }} />
          <div style={{ position: "absolute", bottom: -22, left: -22, background: "var(--blanc)", color: "var(--noir)",
            borderRadius: "var(--r-md)", padding: "1rem 1.2rem", boxShadow: "var(--shadow)", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: "50%", background: "var(--or-soft)", display: "grid", placeItems: "center", color: "var(--or)" }}>
              <Ico.store width={20} height={20} />
            </div>
            <div>
              <div style={{ fontFamily: "var(--f-display)", fontSize: "0.95rem" }}>Click & Collect</div>
              <div style={{ fontSize: "0.72rem", color: "var(--texte-doux)" }}>Prêt sous 2 h en boutique</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CategoryStrip({ go }) {
  const { CATEGORIES } = window.DATA;
  return (
    <section className="container" style={{ paddingTop: "var(--pad-section)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--gap)" }}>
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => go("shop", { cat: c.id })}
            style={{ textAlign: "left", background: "var(--blanc)", border: "1px solid var(--ligne)", borderRadius: "var(--r-lg)",
              padding: "1.6rem 1.5rem", display: "flex", flexDirection: "column", gap: "1.4rem", transition: "all .25s", cursor: "pointer" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "var(--shadow-soft)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ width: 46, height: 46, borderRadius: "50%", background: "var(--beige-bg2)", display: "grid", placeItems: "center", color: "var(--or)" }}>
                {c.id === "cils" && <Ico.sparkle width={20} height={20} />}
                {c.id === "accessoires" && <Ico.box width={20} height={20} />}
                {c.id === "soins" && <Ico.leaf width={20} height={20} />}
                {c.id === "cartes" && <Ico.gift width={20} height={20} />}
              </div>
              <span style={{ fontSize: "0.72rem", color: "var(--texte-doux)" }}>{c.count} produits</span>
            </div>
            <div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 400, marginBottom: 4 }}>{c.label}</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--texte-doux)" }}>{c.tagline}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function Featured({ go, onOpen, onAdd, favs, onFav }) {
  const { PRODUCTS } = window.DATA;
  const list = PRODUCTS.filter(p => p.best || p.nouveau).slice(0, 4);
  return (
    <section className="container" style={{ paddingTop: "var(--pad-section)" }}>
      <SectionHead eyebrow="La sélection" title="Les chouchous de l'atelier" action="Toute la boutique" onAction={() => go("shop")} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: "clamp(1.2rem,2.5vw,2rem)" }}>
        {list.map(p => <ProductCard key={p.id} p={p} onOpen={onOpen} onAdd={onAdd} fav={favs.includes(p.id)} onFav={onFav} />)}
      </div>
    </section>
  );
}

function ClickCollectBlock({ go }) {
  const items = [
    { ico: "search", t: "Choisissez en ligne", d: "Parcourez le catalogue et ajoutez vos produits au panier." },
    { ico: "store", t: "Sélectionnez le retrait", d: "Click & Collect à l'institut des Pennes-Mirabeau, ou point relais." },
    { ico: "clock", t: "Récupérez sous 2 h", d: "On vous prévient par SMS dès que votre commande est prête." },
  ];
  return (
    <section style={{ marginTop: "var(--pad-section)", background: "var(--beige-bg2)" }}>
      <div className="container" style={{ paddingTop: "var(--pad-section)", paddingBottom: "var(--pad-section)",
        display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: "clamp(2rem,5vw,4rem)", alignItems: "center" }} data-cc-grid>
        <div>
          <div className="eyebrow">Retrait & livraison</div>
          <h2 style={{ fontSize: "clamp(1.8rem,3.8vw,2.8rem)", margin: "1rem 0 1.2rem" }}>
            Commandez en ligne,<br /><span style={{ fontFamily: "var(--f-serif)", fontStyle: "italic" }}>retirez en boutique.</span>
          </h2>
          <p style={{ color: "var(--texte-doux)", maxWidth: 420, marginBottom: "2rem" }}>
            Gratuit et sans minimum. Vos cils et accessoires vous attendent en cabine,
            emballés avec soin par notre équipe.
          </p>
          <button className="btn btn-dark" onClick={() => go("shop")}>Je commande <Ico.arrow width={15} height={15} /></button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {items.map((it, i) => (
            <div key={i} style={{ display: "flex", gap: "1.1rem", alignItems: "center", background: "var(--blanc)",
              border: "1px solid var(--ligne)", borderRadius: "var(--r-md)", padding: "1.2rem 1.4rem" }}>
              <div style={{ fontFamily: "var(--f-display)", fontSize: "1.1rem", color: "var(--or)", width: 28 }}>0{i+1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "var(--f-display)", fontSize: "1.05rem", marginBottom: 2 }}>{it.t}</div>
                <div style={{ fontSize: "0.85rem", color: "var(--texte-doux)" }}>{it.d}</div>
              </div>
              <span style={{ color: "var(--or)" }}>{Ico[it.ico]({ width: 22, height: 22 })}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LoyaltyTeaser({ go }) {
  return (
    <section className="container" style={{ paddingTop: "var(--pad-section)" }}>
      <div style={{ background: "var(--noir)", color: "var(--blanc)", borderRadius: "var(--r-lg)",
        padding: "clamp(2.2rem,5vw,3.5rem)", display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "2.5rem",
        alignItems: "center", position: "relative", overflow: "hidden" }} data-loyal-grid>
        <div>
          <div className="eyebrow" style={{ color: "var(--or)" }}>Programme fidélité Emicils</div>
          <h2 style={{ color: "var(--blanc)", fontSize: "clamp(1.7rem,3.6vw,2.6rem)", margin: "1rem 0 1rem" }}>
            1 € dépensé = 1 point.<br />100 points = 5 € offerts.
          </h2>
          <p style={{ color: "rgba(251,248,242,0.7)", maxWidth: 440, marginBottom: "1.8rem" }}>
            Cumulez des points sur la boutique et les prestations, débloquez des statuts
            Argent, Or et VIP, et profitez d'offres réservées aux membres.
          </p>
          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            <button className="btn btn-light" onClick={() => go("account")}>Mon espace fidélité</button>
            <button className="btn btn-outline" style={{ boxShadow: "inset 0 0 0 1px rgba(251,248,242,0.5)", color: "var(--blanc)" }}
              onClick={() => go("account")}>Créer un compte</button>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div style={{ background: "linear-gradient(150deg, var(--or), #8a6c3e)", color: "var(--blanc)", borderRadius: "var(--r-md)",
            padding: "1.5rem 1.6rem", width: "100%", maxWidth: 300, boxShadow: "0 30px 60px -30px rgba(0,0,0,0.7)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
              <Ico.sparkle width={22} height={22} />
              <span style={{ fontFamily: "var(--f-display)", letterSpacing: "0.2em", fontSize: "0.7rem", textTransform: "uppercase" }}>Membre Or</span>
            </div>
            <div style={{ fontSize: "0.72rem", letterSpacing: "0.1em", opacity: 0.8, textTransform: "uppercase" }}>Solde points</div>
            <div style={{ fontFamily: "var(--f-display)", fontSize: "2.6rem", fontWeight: 300, marginTop: 4 }}>1 240</div>
            <div style={{ fontFamily: "var(--f-display)", letterSpacing: "0.3em", fontSize: "0.8rem", marginTop: "1.5rem", textTransform: "uppercase" }}>Emicils</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function InstitutBlock({ go }) {
  return (
    <section className="container" style={{ paddingTop: "var(--pad-section)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(2rem,5vw,4rem)", alignItems: "center" }} data-inst-grid>
        <Photo cat="cils" ratio="5 / 4" label="photo · institut Pennes-Mirabeau" radius="var(--r-lg)" />
        <div>
          <div className="eyebrow">L'institut</div>
          <h2 style={{ fontSize: "clamp(1.8rem,3.8vw,2.8rem)", margin: "1rem 0 1.2rem" }}>
            Une expertise cils,<br /><span style={{ fontFamily: "var(--f-serif)", fontStyle: "italic" }}>de la pose au produit.</span>
          </h2>
          <p style={{ color: "var(--texte-doux)", maxWidth: 460, marginBottom: "1.8rem" }}>
            Emicils, c'est un institut de beauté spécialisé dans le regard aux Pennes-Mirabeau,
            et une boutique des produits que nous utilisons réellement en cabine. Ce que nous
            posons, vous pouvez l'emporter.
          </p>
          <div style={{ display: "flex", gap: "2rem", marginBottom: "2rem", flexWrap: "wrap" }}>
            {[["Réservation", "Pose & rehaussement en ligne"], ["Conseils", "Sélection testée en cabine"]].map(([t,d]) => (
              <div key={t} style={{ borderLeft: "2px solid var(--or)", paddingLeft: "0.9rem" }}>
                <div style={{ fontFamily: "var(--f-display)", fontSize: "1rem" }}>{t}</div>
                <div style={{ fontSize: "0.82rem", color: "var(--texte-doux)" }}>{d}</div>
              </div>
            ))}
          </div>
          <button className="btn btn-outline" onClick={() => go("shop", { cat: "cartes" })}>Voir les prestations</button>
        </div>
      </div>
    </section>
  );
}

function HomePage(props) {
  return (
    <div>
      <Hero {...props} />
      <CategoryStrip {...props} />
      <Featured {...props} />
      <ClickCollectBlock {...props} />
      <LoyaltyTeaser {...props} />
      <InstitutBlock {...props} />
    </div>
  );
}

Object.assign(window, { HomePage });
