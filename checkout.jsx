// ==========================================================================
// EMICILS — Panier (tiroir) + Tunnel de commande
// ==========================================================================

function lineLabel(item) {
  if (!item.opts) return null;
  const vals = Object.values(item.opts);
  return vals.length ? vals.join(" · ") : null;
}

// ---------- Tiroir panier ----------
function CartDrawer({ open, items, onClose, onQty, onRemove, onCheckout, go }) {
  const { FRANCO } = window.DATA;
  const sousTotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const reste = Math.max(0, FRANCO - sousTotal);
  const prog = Math.min(100, (sousTotal / FRANCO) * 100);

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(29,26,22,0.45)", backdropFilter: "blur(2px)",
        opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none", transition: "opacity .3s", zIndex: 90 }} />
      <aside style={{ position: "fixed", top: 0, right: 0, height: "100%", width: "min(440px, 100vw)", background: "var(--beige-bg)",
        boxShadow: "-20px 0 60px -30px rgba(0,0,0,0.5)", transform: open ? "none" : "translateX(100%)", transition: "transform .35s cubic-bezier(.4,0,.2,1)",
        zIndex: 91, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.4rem 1.6rem", borderBottom: "1px solid var(--ligne)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Ico.cart width={20} height={20} />
            <span style={{ fontFamily: "var(--f-display)", letterSpacing: "0.16em", textTransform: "uppercase", fontSize: "0.9rem" }}>Mon panier ({items.reduce((s,i)=>s+i.qty,0)})</span>
          </div>
          <button onClick={onClose} aria-label="Fermer" style={{ color: "var(--texte)" }}><Ico.close width={22} height={22} /></button>
        </div>

        {items.length === 0 ? (
          <div style={{ flex: 1, display: "grid", placeItems: "center", padding: "2rem", textAlign: "center" }}>
            <div>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--beige-soft)", display: "grid", placeItems: "center", margin: "0 auto 1.2rem", color: "var(--or)" }}>
                <Ico.cart width={26} height={26} />
              </div>
              <p style={{ color: "var(--texte-doux)", marginBottom: "1.4rem" }}>Votre panier est vide.</p>
              <button className="btn btn-dark" onClick={() => { onClose(); go("shop"); }}>Découvrir la boutique</button>
            </div>
          </div>
        ) : (
          <>
            {/* Barre franco */}
            <div style={{ padding: "1rem 1.6rem", background: "var(--beige-bg2)", borderBottom: "1px solid var(--ligne)" }}>
              <div style={{ fontSize: "0.8rem", marginBottom: 8 }}>
                {reste > 0 ? <>Plus que <strong>{euro(reste)}</strong> pour la livraison offerte</> : <>🎉 Livraison à domicile offerte</>}
              </div>
              <div style={{ height: 5, borderRadius: 999, background: "var(--beige-deep)" }}>
                <div style={{ height: "100%", width: prog + "%", borderRadius: 999, background: "var(--or)", transition: "width .4s" }} />
              </div>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "0.5rem 1.6rem" }}>
              {items.map((i, idx) => (
                <div key={idx} style={{ display: "flex", gap: "1rem", padding: "1.1rem 0", borderBottom: "1px solid var(--ligne)" }}>
                  <Photo cat={i.cat} ratio="1 / 1" radius="var(--r-sm)" style={{ width: 76, flexShrink: 0 }} label="" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <span style={{ fontFamily: "var(--f-display)", fontSize: "0.95rem" }}>{i.name}</span>
                      <button onClick={() => onRemove(idx)} style={{ color: "var(--texte-doux)" }}><Ico.close width={16} height={16} /></button>
                    </div>
                    {lineLabel(i) && <div style={{ fontSize: "0.74rem", color: "var(--texte-doux)", margin: "2px 0 4px" }}>{lineLabel(i)}</div>}
                    <div style={{ fontSize: "0.72rem", color: "var(--or)", display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
                      {i.mode === "domicile" ? <Ico.truck width={13} height={13} /> : <Ico.store width={13} height={13} />}
                      {i.mode === "domicile" ? "Livraison" : "Retrait boutique"}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <QtyStepper value={i.qty} onChange={(q) => onQty(idx, q)} small />
                      <Price value={i.price * i.qty} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: "1.4rem 1.6rem", borderTop: "1px solid var(--ligne)", background: "var(--blanc)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: "0.9rem" }}>
                <span style={{ color: "var(--texte-doux)" }}>Sous-total</span><Price value={sousTotal} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.1rem", fontSize: "0.8rem", color: "var(--or)" }}>
                <span>Points fidélité gagnés</span><span>+{Math.round(sousTotal)} pts</span>
              </div>
              <button className="btn btn-dark btn-block" style={{ height: 50 }} onClick={onCheckout}>
                Passer commande <Ico.arrow width={15} height={15} />
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

// ---------- Tunnel de commande ----------
function CheckoutPage({ items, go, onDone, compte, user }) {
  const { PROMOS_LIVRAISON, FRANCO } = window.DATA;
  const [step, setStep]     = useState(1);
  const [mode, setMode]     = useState("collect");
  const [usePts, setUsePts] = useState(false);
  const [relais, setRelais] = useState(0);
  const [creneau, setCreneau] = useState("Aujourd'hui · 16 h 00");
  const [orderId, setOrderId] = useState(null);
  const [saving, setSaving]  = useState(false);

  const sousTotal  = items.reduce((s, i) => s + i.price * i.qty, 0);
  const livraison  = mode === "collect" ? 0 : (sousTotal >= FRANCO && mode === "domicile" ? 0 : PROMOS_LIVRAISON[mode].prix);
  const ptsDispo   = compte?.points || 0;
  const reducPts   = usePts ? Math.min(Math.floor(ptsDispo / 100) * 5, sousTotal) : 0;
  const total      = Math.max(0, sousTotal + livraison - reducPts);
  const ptsGagnes  = Math.round(sousTotal);

  const steps     = ["Livraison", "Coordonnées", "Paiement", "Confirmation"];
  const relaisList = ["Tabac de la Pinède — 0,3 km", "Carrefour City Plan-de-Campagne — 1,1 km", "Relais Presse Centre — 1,8 km"];
  const creneaux  = ["Aujourd'hui · 16 h 00", "Aujourd'hui · 18 h 30", "Demain · 10 h 00", "Demain · 14 h 00"];

  async function next() {
    if (step < 3) { setStep(step + 1); return; }
    setSaving(true);
    try {
      const { data: { session } } = await window.SUPABASE.auth.getSession();
      const token = session?.access_token;
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          items: items.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty, opts: i.opts })),
          total, shipping_cost: livraison, shipping_mode: mode,
        }),
      });
      const data = await res.json();
      setOrderId(data.id || null);
    } catch (e) {}
    setSaving(false);
    setStep(4);
    onDone && onDone({ total, ptsGagnes, mode });
    window.scrollTo(0, 0);
  }

  if (items.length === 0 && step < 4) {
    return <div className="container" style={{ padding: "5rem 0", textAlign: "center" }}>
      <p style={{ color: "var(--texte-doux)", marginBottom: "1.4rem" }}>Votre panier est vide.</p>
      <button className="btn btn-dark" onClick={() => go("shop")}>Aller à la boutique</button>
    </div>;
  }

  // Confirmation
  if (step === 4) {
    const ref = orderId || ("EMI-" + Math.floor(2400 + Math.random() * 99));
    return (
      <div className="container" style={{ maxWidth: 640, padding: "3.5rem 0 var(--pad-section)", textAlign: "center" }}>
        <div className="fade-up" style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--or)", color: "var(--blanc)", display: "grid", placeItems: "center", margin: "0 auto 1.6rem" }}>
          <Ico.check width={34} height={34} />
        </div>
        <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.6rem)" }}>Merci, c'est confirmé&nbsp;!</h1>
        <p style={{ color: "var(--texte-doux)", margin: "1rem auto 2rem", maxWidth: 440 }}>
          {mode === "collect"
            ? <>Votre commande sera prête au retrait à l'institut des Pennes-Mirabeau. Vous recevrez un SMS dès qu'elle vous attend.</>
            : <>Votre commande est en préparation. Un e-mail de suivi vient de vous être envoyé.</>}
        </p>
        <div style={{ background: "var(--blanc)", border: "1px solid var(--ligne)", borderRadius: "var(--r-lg)", padding: "1.6rem", textAlign: "left", marginBottom: "1.6rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem", paddingBottom: "1rem", borderBottom: "1px solid var(--ligne)" }}>
            <div><div style={{ fontSize: "0.72rem", color: "var(--texte-doux)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Commande</div><div style={{ fontFamily: "var(--f-display)", fontSize: "1.1rem" }}>{ref}</div></div>
            <div style={{ textAlign: "right" }}><div style={{ fontSize: "0.72rem", color: "var(--texte-doux)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Total</div><Price value={total} size="1.1rem" /></div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--or)", fontSize: "0.9rem" }}>
            <Ico.sparkle width={18} height={18} /> <strong>{ptsGagnes} points fidélité</strong> seront crédités après validation de votre commande.
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.8rem", justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn btn-dark" onClick={() => go("account")}>Voir mon compte</button>
          <button className="btn btn-outline" onClick={() => go("home")}>Retour à l'accueil</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: "2.2rem", paddingBottom: "var(--pad-section)" }}>
      <button onClick={() => go("shop")} style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--texte-doux)", fontSize: "0.82rem", marginBottom: "1.6rem" }}>
        <Ico.chevron width={15} height={15} style={{ transform: "rotate(180deg)" }} /> Continuer mes achats
      </button>

      {/* Stepper */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2.4rem", flexWrap: "wrap" }}>
        {steps.slice(0,3).map((s, i) => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: "0.5rem", opacity: step >= i+1 ? 1 : 0.4 }}>
            <span style={{ width: 26, height: 26, borderRadius: "50%", display: "grid", placeItems: "center", fontSize: "0.78rem",
              background: step > i+1 ? "var(--or)" : step === i+1 ? "var(--noir)" : "var(--beige-deep)", color: "var(--blanc)", fontFamily: "var(--f-display)" }}>
              {step > i+1 ? <Ico.check width={14} height={14} /> : i+1}</span>
            <span style={{ fontSize: "0.78rem", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "var(--f-display)" }}>{s}</span>
            {i < 2 && <span style={{ width: 30, height: 1, background: "var(--beige-deep)", marginLeft: 4 }} />}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "clamp(1.5rem,3vw,3rem)", alignItems: "start" }} data-checkout-grid>
        <div>
          {/* ÉTAPE 1 — Livraison */}
          {step === 1 && (
            <div className="fade-up">
              <h2 style={{ fontSize: "1.5rem", marginBottom: "1.4rem" }}>Comment souhaitez-vous récupérer&nbsp;?</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
                {Object.values(PROMOS_LIVRAISON).map(o => {
                  const prix = o.id === "domicile" && sousTotal >= FRANCO ? 0 : o.prix;
                  return (
                    <button key={o.id} onClick={() => setMode(o.id)} style={{ textAlign: "left", padding: "1.2rem 1.4rem", borderRadius: "var(--r-md)",
                      display: "flex", gap: "1rem", alignItems: "center", border: "1px solid " + (mode === o.id ? "var(--or)" : "var(--ligne)"),
                      background: mode === o.id ? "var(--or-soft)" : "var(--blanc)", transition: "all .2s" }}>
                      <span style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--beige-bg2)", display: "grid", placeItems: "center", color: "var(--or)", flexShrink: 0 }}>
                        {o.id === "collect" ? <Ico.store width={22} height={22} /> : o.id === "relais" ? <Ico.pin width={22} height={22} /> : <Ico.truck width={22} height={22} />}
                      </span>
                      <span style={{ flex: 1 }}>
                        <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontFamily: "var(--f-display)", fontSize: "1.05rem" }}>{o.label}</span>
                          <span style={{ fontFamily: "var(--f-display)", color: prix === 0 ? "var(--or)" : "var(--noir)" }}>{prix === 0 ? "Offert" : euro(prix)}</span>
                        </span>
                        <span style={{ display: "block", fontSize: "0.82rem", color: "var(--texte-doux)" }}>{o.sub} · {o.delai}</span>
                      </span>
                      <span style={{ width: 20, height: 20, borderRadius: "50%", border: "1px solid " + (mode === o.id ? "var(--or)" : "var(--beige-deep)"),
                        display: "grid", placeItems: "center", flexShrink: 0 }}>
                        {mode === o.id && <span style={{ width: 11, height: 11, borderRadius: "50%", background: "var(--or)" }} />}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Détail selon mode */}
              {mode === "collect" && (
                <div style={{ marginTop: "1.6rem", background: "var(--blanc)", border: "1px solid var(--ligne)", borderRadius: "var(--r-md)", padding: "1.4rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1rem" }}>
                    <Ico.pin width={18} height={18} style={{ color: "var(--or)" }} />
                    <strong style={{ fontFamily: "var(--f-display)", fontWeight: 500 }}>Emicils — Les Pennes-Mirabeau</strong>
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "var(--texte-doux)", marginBottom: "1.2rem" }}>14 avenue de la Pinède, 13170 Les Pennes-Mirabeau · Du mardi au samedi, 9 h–19 h</p>
                  <div style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.7rem" }}>Créneau de retrait</div>
                  <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                    {creneaux.map(c => (
                      <button key={c} onClick={() => setCreneau(c)} style={{ padding: "0.55rem 0.9rem", borderRadius: "var(--r-sm)", fontSize: "0.82rem",
                        border: "1px solid " + (creneau === c ? "var(--noir)" : "var(--ligne)"), background: creneau === c ? "var(--noir)" : "var(--blanc)", color: creneau === c ? "var(--blanc)" : "var(--texte)" }}>{c}</button>
                    ))}
                  </div>
                </div>
              )}
              {mode === "relais" && (
                <div style={{ marginTop: "1.6rem", background: "var(--blanc)", border: "1px solid var(--ligne)", borderRadius: "var(--r-md)", padding: "1.4rem" }}>
                  <div style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.9rem" }}>Choisir un point relais</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                    {relaisList.map((r, i) => (
                      <button key={r} onClick={() => setRelais(i)} style={{ textAlign: "left", display: "flex", alignItems: "center", gap: 10, padding: "0.8rem 1rem",
                        borderRadius: "var(--r-sm)", border: "1px solid " + (relais === i ? "var(--or)" : "var(--ligne)"), background: relais === i ? "var(--or-soft)" : "var(--blanc)" }}>
                        <Ico.pin width={17} height={17} style={{ color: "var(--or)" }} /> <span style={{ fontSize: "0.88rem" }}>{r}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {mode === "domicile" && (
                <div style={{ marginTop: "1.6rem", background: "var(--blanc)", border: "1px solid var(--ligne)", borderRadius: "var(--r-md)", padding: "1.4rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.9rem" }}>
                  <Field label="Adresse" full ph="14 avenue de la Pinède" />
                  <Field label="Code postal" ph="13170" />
                  <Field label="Ville" ph="Les Pennes-Mirabeau" />
                </div>
              )}
            </div>
          )}

          {/* ÉTAPE 2 — Coordonnées */}
          {step === 2 && (
            <div className="fade-up">
              <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Vos coordonnées</h2>
              <p style={{ fontSize: "0.85rem", color: "var(--texte-doux)", marginBottom: "1.6rem" }}>Connectée en tant que <strong>{COMPTE_DEMO.email}</strong></p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.9rem", background: "var(--blanc)", border: "1px solid var(--ligne)", borderRadius: "var(--r-md)", padding: "1.4rem" }}>
                <Field label="Prénom" value={COMPTE_DEMO.prenom} />
                <Field label="Nom" value={COMPTE_DEMO.nom} />
                <Field label="E-mail" value={COMPTE_DEMO.email} full />
                <Field label="Téléphone" ph="06 12 34 56 78" full />
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 10, marginTop: "1.2rem", fontSize: "0.88rem", color: "var(--texte-doux)" }}>
                <Ico.check width={16} height={16} style={{ color: "var(--or)" }} /> Recevoir un SMS dès que la commande est prête
              </label>
            </div>
          )}

          {/* ÉTAPE 3 — Paiement */}
          {step === 3 && (
            <div className="fade-up">
              <h2 style={{ fontSize: "1.5rem", marginBottom: "1.4rem" }}>Paiement</h2>
              {ptsDispo >= 100 && (
                <label style={{ display: "flex", alignItems: "center", gap: 12, padding: "1.1rem 1.3rem", borderRadius: "var(--r-md)", marginBottom: "1.4rem",
                  border: "1px solid " + (usePts ? "var(--or)" : "var(--ligne)"), background: usePts ? "var(--or-soft)" : "var(--blanc)", cursor: "pointer" }}>
                  <span onClick={() => setUsePts(v => !v)} style={{ width: 42, height: 24, borderRadius: 999, background: usePts ? "var(--or)" : "var(--beige-deep)", position: "relative", flexShrink: 0 }}>
                    <span style={{ position: "absolute", top: 3, left: usePts ? 21 : 3, width: 18, height: 18, borderRadius: "50%", background: "var(--blanc)", transition: "all .2s" }} />
                  </span>
                  <span style={{ flex: 1 }}>
                    <span style={{ display: "block", fontFamily: "var(--f-display)", fontSize: "0.95rem" }}>Utiliser mes points fidélité</span>
                    <span style={{ fontSize: "0.8rem", color: "var(--texte-doux)" }}>{ptsDispo} pts disponibles — jusqu'à {euro(Math.floor(ptsDispo/100)*5)} de réduction</span>
                  </span>
                </label>
              )}
              <div style={{ background: "var(--blanc)", border: "1px solid var(--ligne)", borderRadius: "var(--r-md)", padding: "1.4rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.9rem" }}>
                <Field label="Numéro de carte" ph="0000 0000 0000 0000" full />
                <Field label="Expiration" ph="MM / AA" />
                <Field label="CVC" ph="123" />
                <Field label="Nom sur la carte" value={`${COMPTE_DEMO.prenom} ${COMPTE_DEMO.nom}`} full />
              </div>
              <p style={{ fontSize: "0.78rem", color: "var(--texte-doux)", marginTop: "1rem", display: "flex", alignItems: "center", gap: 6 }}>
                <Ico.check width={14} height={14} style={{ color: "var(--or)" }} /> Paiement sécurisé · Démo, aucune carte ne sera débitée
              </p>
            </div>
          )}
        </div>

        {/* Récap latéral */}
        <aside style={{ position: "sticky", top: 96, background: "var(--blanc)", border: "1px solid var(--ligne)", borderRadius: "var(--r-lg)", padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "1.2rem" }}>Récapitulatif</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem", maxHeight: 220, overflowY: "auto", marginBottom: "1.2rem" }}>
            {items.map((i, idx) => (
              <div key={idx} style={{ display: "flex", gap: "0.8rem", alignItems: "center" }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <Photo cat={i.cat} ratio="1 / 1" radius="var(--r-sm)" style={{ width: 52 }} label="" />
                  <span style={{ position: "absolute", top: -6, right: -6, background: "var(--noir)", color: "var(--blanc)", borderRadius: "50%", width: 20, height: 20, display: "grid", placeItems: "center", fontSize: "0.7rem" }}>{i.qty}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "0.85rem", fontFamily: "var(--f-display)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{i.name}</div>
                  {lineLabel(i) && <div style={{ fontSize: "0.72rem", color: "var(--texte-doux)" }}>{lineLabel(i)}</div>}
                </div>
                <Price value={i.price * i.qty} size="0.85rem" />
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid var(--ligne)", paddingTop: "1rem", display: "flex", flexDirection: "column", gap: 8, fontSize: "0.9rem" }}>
            <Row k="Sous-total" v={euro(sousTotal)} />
            <Row k="Récupération" v={livraison === 0 ? "Offert" : euro(livraison)} />
            {reducPts > 0 && <Row k="Réduction points" v={"–" + euro(reducPts)} or />}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderTop: "1px solid var(--ligne)", paddingTop: "0.9rem", marginTop: "0.3rem" }}>
              <span style={{ fontFamily: "var(--f-display)", textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.85rem" }}>Total</span>
              <Price value={total} size="1.4rem" />
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--or)", display: "flex", alignItems: "center", gap: 5 }}>
              <Ico.sparkle width={14} height={14} /> +{ptsGagnes} points fidélité
            </div>
          </div>
          <button className="btn btn-dark btn-block" style={{ height: 50, marginTop: "1.4rem" }} onClick={next}>
            {step < 3 ? "Continuer" : `Payer ${euro(total)}`} <Ico.arrow width={15} height={15} />
          </button>
          {step > 1 && <button className="btn btn-light btn-block" style={{ marginTop: "0.6rem" }} onClick={() => setStep(step - 1)}>Retour</button>}
        </aside>
      </div>
    </div>
  );
}

function Row({ k, v, or }) {
  return <div style={{ display: "flex", justifyContent: "space-between", color: or ? "var(--or)" : "var(--texte-doux)" }}><span>{k}</span><span style={{ color: or ? "var(--or)" : "var(--texte)" }}>{v}</span></div>;
}

function Field({ label, ph, value, full }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 5, gridColumn: full ? "1 / -1" : "auto" }}>
      <span style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--texte-doux)" }}>{label}</span>
      <input defaultValue={value} placeholder={ph} style={{ border: "1px solid var(--ligne)", borderRadius: "var(--r-sm)", padding: "0.7rem 0.85rem", background: "var(--beige-bg)", color: "var(--texte)" }} />
    </label>
  );
}

Object.assign(window, { CartDrawer, CheckoutPage });
