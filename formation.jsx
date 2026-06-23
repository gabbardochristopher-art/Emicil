// ==========================================================================
// EMICILS — Page Formation
// ==========================================================================


function BookingModal({ formation, onClose }) {
  const [form, setForm]       = React.useState({ name: "", email: "", phone: "", message: "", date: "" });
  const dates       = formation.dates || [];
  const datePlaces  = formation.date_places || {};
  const [sending, setSending] = React.useState(false);
  const [done, setDone]       = React.useState(false);
  const [error, setError]     = React.useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.email.trim()) { setError("L'email est requis."); return; }
    setSending(true); setError(null);
    try {
      const res = await fetch('/api/formation-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formation_id: formation.id, user_email: form.email, user_name: form.name, user_phone: form.phone, message: form.message, date_choisie: form.date }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Erreur, réessayez.'); setSending(false); return; }
      setDone(true);
    } catch { setError('Erreur de connexion.'); }
    setSending(false);
  }

  const inp = { border: "1px solid var(--ligne)", borderRadius: "var(--r-sm)", padding: "0.7rem 0.85rem", background: "var(--beige-bg)", color: "var(--texte)", width: "100%", font: "inherit" };
  const lbl = { display: "block", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--texte-doux)", marginBottom: 5 };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(29,26,22,0.55)", backdropFilter: "blur(3px)", zIndex: 200 }} />
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 201,
        background: "var(--blanc)", borderRadius: "var(--r-lg)", padding: "2rem", width: "min(480px,94vw)", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.4rem" }}>
          <div>
            <p style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--or)", marginBottom: 4 }}>S'inscrire</p>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 400 }}>{formation.titre}</h2>
          </div>
          <button onClick={onClose} style={{ color: "var(--texte-doux)", marginLeft: 12 }}><Ico.close width={20} height={20} /></button>
        </div>

        {done ? (
          <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--or)", color: "var(--blanc)", display: "grid", placeItems: "center", margin: "0 auto 1.2rem" }}>
              <Ico.check width={26} height={26} />
            </div>
            <p style={{ fontFamily: "var(--f-display)", fontSize: "1.1rem", marginBottom: "0.5rem" }}>Demande envoyée !</p>
            <p style={{ color: "var(--texte-doux)", fontSize: "0.88rem" }}>Nous vous contacterons sous 24 h pour confirmer votre inscription.</p>
            <button className="btn btn-dark" style={{ marginTop: "1.4rem" }} onClick={onClose}>Fermer</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
            <label><span style={lbl}>Prénom & Nom</span><input style={inp} value={form.name} onChange={e => setForm(v => ({...v, name: e.target.value}))} placeholder="Marie Dupont" /></label>
            <label><span style={lbl}>Email *</span><input style={inp} type="email" required value={form.email} onChange={e => setForm(v => ({...v, email: e.target.value}))} placeholder="marie@exemple.fr" /></label>
            <label><span style={lbl}>Téléphone</span><input style={inp} type="tel" value={form.phone} onChange={e => setForm(v => ({...v, phone: e.target.value}))} placeholder="06 12 34 56 78" /></label>
            {dates.length > 0 && (
              <label>
                <span style={lbl}>Date souhaitée</span>
                <select style={inp} value={form.date} onChange={e => setForm(v => ({...v, date: e.target.value}))}>
                  <option value="">— Choisir une date —</option>
                  {dates.map((d, i) => {
                    const remaining = datePlaces[d] ?? 0;
                    const full = remaining <= 0;
                    return <option key={i} value={d} disabled={full}>{d} — {full ? "Complet" : `${remaining} place${remaining > 1 ? "s" : ""} restante${remaining > 1 ? "s" : ""}`}</option>;
                  })}
                </select>
              </label>
            )}
            <label><span style={lbl}>Message (facultatif)</span><textarea style={{...inp, resize: "vertical"}} rows={3} value={form.message} onChange={e => setForm(v => ({...v, message: e.target.value}))} placeholder="Questions, disponibilités…" /></label>
            {error && <p style={{ color: "#c0392b", fontSize: "0.82rem" }}>{error}</p>}
            <button className="btn btn-dark btn-block" type="submit" disabled={sending} style={{ height: 48, opacity: sending ? 0.6 : 1 }}>
              {sending ? "Envoi…" : "Envoyer ma demande"}
              <Ico.arrow width={15} height={15} />
            </button>
          </form>
        )}
      </div>
    </>
  );
}

function FormationPage({ go }) {
  const [formations, setFormations] = React.useState(null);
  const [booking, setBooking]       = React.useState(null);

  React.useEffect(() => {
    fetch('/api/formations')
      .then(r => r.ok ? r.json() : [])
      .then(data => setFormations(data))
      .catch(() => setFormations([]));
  }, []);

  const liste = formations || [];

  const NIVEAU_COLOR = {
    "Débutant":     { bg: "var(--or-soft)",   c: "var(--or)" },
    "Intermédiaire":{ bg: "rgba(176,141,87,.15)", c: "#7a5c20" },
    "Tous niveaux": { bg: "var(--beige-soft)", c: "var(--texte-doux)" },
    "Avancé":       { bg: "var(--noir)",       c: "var(--blanc)" },
  };

  return (
    <div>
      {booking && <BookingModal formation={booking} onClose={() => setBooking(null)} />}
      {/* Hero */}
      <section style={{ background: "var(--noir)", color: "var(--blanc)", padding: "clamp(3rem,7vw,6rem) 0" }}>
        <div className="container" style={{ maxWidth: 780, textAlign: "center" }}>
          <div className="eyebrow" style={{ color: "var(--or)" }}>Institut Emicils · Les Pennes-Mirabeau</div>
          <h1 style={{ color: "var(--blanc)", fontSize: "clamp(2.2rem,5vw,3.6rem)", margin: "1.2rem 0 1.4rem", lineHeight: 1.08 }}>
            Formations<br />
            <span style={{ fontFamily: "var(--f-serif)", fontStyle: "italic", fontWeight: 400 }}>Lash Artist</span>
          </h1>
          <p style={{ color: "rgba(251,248,242,0.7)", fontSize: "1.05rem", maxWidth: 540, margin: "0 auto 2.2rem" }}>
            Apprenez les techniques utilisées en cabine par nos expertes.
            Petits groupes, matériel fourni, certification à l'issue de chaque formation.
          </p>
          <div style={{ display: "flex", gap: "2.4rem", justifyContent: "center", flexWrap: "wrap" }}>
            {[["Petits groupes","4 personnes max"],["Matériel fourni","Tout est prévu"],["Certifiée","Attestation remise"]].map(([a,b]) => (
              <div key={a} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "var(--f-display)", fontSize: "1.3rem", color: "var(--or)" }}>{a}</div>
                <div style={{ fontSize: "0.72rem", letterSpacing: "0.08em", color: "rgba(251,248,242,0.55)", textTransform: "uppercase" }}>{b}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Grille formations */}
      <section className="container" style={{ paddingTop: "var(--pad-section)", paddingBottom: "var(--pad-section)" }}>
        {formations === null && (
          <div style={{ textAlign: "center", padding: "3rem 0", color: "var(--texte-doux)" }}>Chargement…</div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.6rem" }}>
          {liste.map((f, i) => {
            const niv = NIVEAU_COLOR[f.niveau] || NIVEAU_COLOR["Tous niveaux"];
            return (
              <div key={i} className="fade-up" style={{ background: "var(--blanc)", border: "1px solid var(--ligne)", borderRadius: "var(--r-lg)",
                padding: "1.8rem", display: "flex", flexDirection: "column", gap: "1.1rem",
                transition: "box-shadow .25s", animationDelay: `${i * .08}s` }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "var(--shadow-soft)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ background: niv.bg, color: niv.c, fontSize: "0.65rem", fontFamily: "var(--f-display)",
                    letterSpacing: "0.12em", textTransform: "uppercase", padding: "4px 10px", borderRadius: "var(--r-pill)" }}>
                    {f.niveau}
                  </span>
                  <span style={{ fontSize: "0.78rem", color: "var(--texte-doux)" }}>{f.duree}</span>
                </div>

                <div>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 400, marginBottom: "0.5rem" }}>{f.titre}</h3>
                  <p style={{ fontSize: "0.86rem", color: "var(--texte-doux)", lineHeight: 1.65, whiteSpace: "pre-line" }}>{f.description || f.desc}</p>
                </div>

                <ul style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                  {(f.points || []).map((pt, j) => (
                    <li key={j} style={{ display: "flex", gap: 9, alignItems: "flex-start", fontSize: "0.83rem", color: "var(--texte)" }}>
                      <Ico.check width={14} height={14} style={{ color: "var(--or)", flexShrink: 0, marginTop: 2 }} />
                      {pt}
                    </li>
                  ))}
                </ul>

                <div style={{ marginTop: "auto", paddingTop: "1rem", borderTop: "1px solid var(--ligne)",
                  display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Price value={f.prix} size="1.3rem" />
                  <button className="btn btn-dark" style={{ padding: "0.7em 1.4em" }}
                    onClick={() => setBooking(f)}>
                    S'inscrire
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bloc contact */}
        <div style={{ marginTop: "3.5rem", background: "var(--beige-bg2)", borderRadius: "var(--r-lg)",
          padding: "clamp(1.8rem,4vw,3rem)", display: "grid", gridTemplateColumns: "1fr auto", gap: "2rem",
          alignItems: "center" }} data-inst-grid>
          <div>
            <div className="eyebrow">Une question ?</div>
            <h2 style={{ fontSize: "clamp(1.4rem,3vw,2rem)", margin: "0.6rem 0 0.8rem" }}>
              Contactez-nous pour vous inscrire
            </h2>
            <p style={{ fontSize: "0.88rem", color: "var(--texte-doux)" }}>
              Formations organisées à l'institut des Pennes-Mirabeau.<br />
              Appelez le <strong>06 69 25 62 12</strong> ou écrivez-nous.
            </p>
          </div>
          <button className="btn btn-dark" onClick={() => window.open("tel:0669256212")}>
            Nous contacter <Ico.arrow width={15} height={15} />
          </button>
        </div>
      </section>
    </div>
  );
}

Object.assign(window, { FormationPage });
