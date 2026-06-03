// ==========================================================================
// EMICILS — Compte client (connexion + tableau de bord fidélité)
// ==========================================================================

function AuthScreen({ onLogin, go }) {
  const [mode, setMode] = useState("login");
  return (
    <div className="container" style={{ maxWidth: 940, paddingTop: "3rem", paddingBottom: "var(--pad-section)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, border: "1px solid var(--ligne)", borderRadius: "var(--r-lg)", overflow: "hidden", boxShadow: "var(--shadow-soft)" }} data-auth-grid>
        {/* Visuel */}
        <div style={{ background: "var(--noir)", color: "var(--blanc)", padding: "clamp(2rem,4vw,3rem)", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 460 }}>
          <Logo size={22} color="var(--blanc)" />
          <div>
            <div className="eyebrow" style={{ color: "var(--or)" }}>Programme fidélité</div>
            <h2 style={{ color: "var(--blanc)", fontSize: "1.9rem", margin: "0.8rem 0 1rem" }}>Chaque visite vous rapproche d'un soin offert.</h2>
            <p style={{ color: "rgba(251,248,242,0.7)", fontSize: "0.92rem" }}>1 € = 1 point. Cumulez, montez en statut, et profitez d'offres réservées aux membres Emicils.</p>
          </div>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            {[["100 pts", "5 € offerts"], ["Statuts", "Argent · Or · VIP"]].map(([a,b]) => (
              <div key={a}><div style={{ fontFamily: "var(--f-display)", fontSize: "1.2rem", color: "var(--or)" }}>{a}</div>
              <div style={{ fontSize: "0.72rem", color: "rgba(251,248,242,0.6)" }}>{b}</div></div>
            ))}
          </div>
        </div>
        {/* Formulaire */}
        <div style={{ background: "var(--blanc)", padding: "clamp(2rem,4vw,3rem)" }}>
          <div style={{ display: "flex", gap: 0, marginBottom: "1.8rem", borderBottom: "1px solid var(--ligne)" }}>
            {[["login","Se connecter"],["signup","Créer un compte"]].map(([id,l]) => (
              <button key={id} onClick={() => setMode(id)} style={{ padding: "0.6rem 0", marginRight: "1.6rem", fontFamily: "var(--f-display)",
                letterSpacing: "0.08em", textTransform: "uppercase", fontSize: "0.78rem", color: mode === id ? "var(--noir)" : "var(--texte-doux)",
                borderBottom: "2px solid " + (mode === id ? "var(--or)" : "transparent"), marginBottom: -1 }}>{l}</button>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {mode === "signup" && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
              <Field label="Prénom" ph="Léa" /><Field label="Nom" ph="Marchetti" /></div>}
            <Field label="E-mail" ph="vous@email.fr" full />
            <Field label="Mot de passe" ph="••••••••" full />
            {mode === "signup" && <label style={{ display: "flex", gap: 8, fontSize: "0.8rem", color: "var(--texte-doux)" }}>
              <Ico.check width={15} height={15} style={{ color: "var(--or)", flexShrink: 0, marginTop: 2 }} /> J'accepte de recevoir les offres fidélité Emicils</label>}
            <button className="btn btn-dark btn-block" style={{ height: 48, marginTop: "0.4rem" }} onClick={onLogin}>
              {mode === "login" ? "Se connecter" : "Créer mon compte"}
            </button>
            {mode === "login" && <button style={{ fontSize: "0.8rem", color: "var(--texte-doux)", marginTop: "0.2rem" }}>Mot de passe oublié&nbsp;?</button>}
          </div>
        </div>
      </div>
    </div>
  );
}

function AccountPage({ loggedIn, onLogin, onLogout, go, points, orders }) {
  const { COMPTE_DEMO, PALIER_VALEUR } = window.DATA;
  const [tab, setTab] = useState("fidelite");

  if (!loggedIn) return <AuthScreen onLogin={onLogin} go={go} />;

  const c = COMPTE_DEMO;
  const pts = points ?? c.points;
  const allOrders = orders && orders.length ? [...orders, ...c.commandes] : c.commandes;
  const seuil = c.paliers.seuil;
  const prog = Math.min(100, (pts / seuil) * 100);
  const eurosDispo = Math.floor(pts / 100) * 5;

  const tabs = [["fidelite","Fidélité"],["commandes","Commandes"],["infos","Mes infos"]];

  return (
    <div className="container" style={{ paddingTop: "2.5rem", paddingBottom: "var(--pad-section)" }}>
      {/* En-tête */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
        <div>
          <div className="eyebrow">Mon espace</div>
          <h1 style={{ fontSize: "clamp(1.9rem,4vw,2.8rem)", marginTop: "0.5rem" }}>Bonjour, {c.prenom}</h1>
        </div>
        <button onClick={onLogout} style={{ fontSize: "0.82rem", color: "var(--texte-doux)", borderBottom: "1px solid var(--ligne)", paddingBottom: 3 }}>Se déconnecter</button>
      </div>

      {/* Onglets */}
      <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid var(--ligne)", marginBottom: "2.2rem", flexWrap: "wrap" }}>
        {tabs.map(([id,l]) => (
          <button key={id} onClick={() => setTab(id)} style={{ padding: "0.7rem 0", marginRight: "1.8rem", fontFamily: "var(--f-display)",
            letterSpacing: "0.08em", textTransform: "uppercase", fontSize: "0.8rem", color: tab === id ? "var(--noir)" : "var(--texte-doux)",
            borderBottom: "2px solid " + (tab === id ? "var(--or)" : "transparent"), marginBottom: -1 }}>{l}</button>
        ))}
      </div>

      {/* FIDÉLITÉ */}
      {tab === "fidelite" && (
        <div className="fade-up" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "1.5rem", alignItems: "start" }} data-acc-grid>
          {/* Carte fidélité */}
          <div style={{ background: "linear-gradient(150deg, var(--noir), #2c2823)", color: "var(--blanc)", borderRadius: "var(--r-lg)", padding: "clamp(1.6rem,3vw,2.4rem)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--or)" }}>
                <Ico.sparkle width={20} height={20} /> <span style={{ fontFamily: "var(--f-display)", letterSpacing: "0.16em", textTransform: "uppercase", fontSize: "0.78rem" }}>Membre {c.paliers.actuel}</span>
              </span>
              <Logo size={14} color="var(--blanc)" tagline={false} />
            </div>
            <div style={{ fontSize: "0.74rem", letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.6 }}>Solde de points</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 4 }}>
              <span style={{ fontFamily: "var(--f-display)", fontSize: "3.2rem", fontWeight: 300 }}>{pts.toLocaleString("fr-FR")}</span>
              <span style={{ color: "var(--or)" }}>= {euro(eurosDispo)} à utiliser</span>
            </div>
            <div style={{ marginTop: "2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", marginBottom: 8, opacity: 0.8 }}>
                <span>{c.paliers.actuel}</span><span>{c.paliers.prochain} · {seuil.toLocaleString("fr-FR")} pts</span>
              </div>
              <div style={{ height: 6, borderRadius: 999, background: "rgba(251,248,242,0.18)" }}>
                <div style={{ height: "100%", width: prog + "%", borderRadius: 999, background: "var(--or)" }} />
              </div>
              <div style={{ fontSize: "0.8rem", marginTop: 10, opacity: 0.75 }}>Plus que <strong style={{ color: "var(--or)" }}>{(seuil - pts).toLocaleString("fr-FR")} points</strong> pour passer membre {c.paliers.prochain}.</div>
            </div>
          </div>

          {/* Convertir */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ background: "var(--blanc)", border: "1px solid var(--ligne)", borderRadius: "var(--r-lg)", padding: "1.4rem" }}>
              <h3 style={{ fontSize: "1.1rem", marginBottom: "0.4rem" }}>Convertir mes points</h3>
              <p style={{ fontSize: "0.82rem", color: "var(--texte-doux)", marginBottom: "1.1rem" }}>100 points = 5 € de réduction, utilisables au panier.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {[[100,5],[200,10],[500,25]].map(([p,e]) => (
                  <div key={p} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.7rem 0.9rem", borderRadius: "var(--r-sm)", background: "var(--beige-bg2)" }}>
                    <span style={{ fontSize: "0.88rem" }}>{p} pts → <strong>{e} €</strong></span>
                    <button className="btn btn-light" style={{ padding: "0.5em 1.1em", opacity: pts >= p ? 1 : 0.4, pointerEvents: pts >= p ? "auto" : "none" }}>Échanger</button>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: "var(--or-soft)", borderRadius: "var(--r-lg)", padding: "1.4rem", display: "flex", gap: 12, alignItems: "center" }}>
              <Ico.gift width={26} height={26} style={{ color: "var(--or)", flexShrink: 0 }} />
              <div style={{ fontSize: "0.85rem" }}>À 1 500 points, un <strong>rehaussement de cils offert</strong> en institut.</div>
            </div>
          </div>

          {/* Historique points */}
          <div style={{ gridColumn: "1 / -1", background: "var(--blanc)", border: "1px solid var(--ligne)", borderRadius: "var(--r-lg)", padding: "1.4rem 1.6rem" }}>
            <h3 style={{ fontSize: "1.05rem", marginBottom: "1rem" }}>Activité fidélité</h3>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {[["Commande EMI-2418","22 mai 2026","+64"],["Parrainage — Sofia","14 mai 2026","+50"],["Commande EMI-2390","6 mai 2026","+37"],["Anniversaire 🎂","2 mai 2026","+100"]].map(([t,d,v],i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.8rem 0", borderTop: i ? "1px solid var(--ligne)" : "none" }}>
                  <div><div style={{ fontSize: "0.9rem" }}>{t}</div><div style={{ fontSize: "0.74rem", color: "var(--texte-doux)" }}>{d}</div></div>
                  <span style={{ fontFamily: "var(--f-display)", color: "var(--or)" }}>{v} pts</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* COMMANDES */}
      {tab === "commandes" && (
        <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {allOrders.map((o, i) => (
            <div key={i} style={{ background: "var(--blanc)", border: "1px solid var(--ligne)", borderRadius: "var(--r-md)", padding: "1.3rem 1.5rem",
              display: "grid", gridTemplateColumns: "auto 1fr auto auto", gap: "1.2rem", alignItems: "center" }} data-order-row>
              <div style={{ width: 46, height: 46, borderRadius: "50%", background: "var(--beige-bg2)", display: "grid", placeItems: "center", color: "var(--or)" }}>
                {o.mode && o.mode.includes("Collect") ? <Ico.store width={20} height={20} /> : o.mode === "Domicile" ? <Ico.truck width={20} height={20} /> : <Ico.box width={20} height={20} />}
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontFamily: "var(--f-display)", fontSize: "1rem" }}>{o.id}</span>
                  <span style={{ fontSize: "0.68rem", padding: "2px 8px", borderRadius: 999, background: "var(--or-soft)", color: "var(--or)", letterSpacing: "0.06em" }}>{o.statut}</span>
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--texte-doux)", marginTop: 2 }}>{o.date} · {o.articles} article{o.articles>1?"s":""} · {o.mode}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <Price value={o.total} />
                <div style={{ fontSize: "0.72rem", color: "var(--or)" }}>+{o.pts} pts</div>
              </div>
              <button className="btn btn-light" style={{ padding: "0.55em 1.1em" }}>Détails</button>
            </div>
          ))}
        </div>
      )}

      {/* INFOS */}
      {tab === "infos" && (
        <div className="fade-up" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", maxWidth: 820 }} data-acc-grid>
          <div style={{ background: "var(--blanc)", border: "1px solid var(--ligne)", borderRadius: "var(--r-lg)", padding: "1.6rem" }}>
            <h3 style={{ fontSize: "1.05rem", marginBottom: "1.2rem" }}>Coordonnées</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
              <Field label="Prénom" value={c.prenom} full /><Field label="Nom" value={c.nom} full /><Field label="E-mail" value={c.email} full />
            </div>
            <button className="btn btn-dark" style={{ marginTop: "1.4rem" }}>Enregistrer</button>
          </div>
          <div style={{ background: "var(--blanc)", border: "1px solid var(--ligne)", borderRadius: "var(--r-lg)", padding: "1.6rem" }}>
            <h3 style={{ fontSize: "1.05rem", marginBottom: "1.2rem" }}>Adresse de livraison</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
              <Field label="Adresse" value={c.adresse.rue} full /><Field label="Ville" value={c.adresse.ville} full />
            </div>
            <button className="btn btn-dark" style={{ marginTop: "1.4rem" }}>Enregistrer</button>
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { AccountPage });
