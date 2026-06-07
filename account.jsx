// ==========================================================================
// EMICILS — Compte client (auth Supabase + tableau de bord fidélité)
// ==========================================================================

// ---------- Champ de formulaire ----------
function Field({ label, id, value, ph, full, type = "text", onChange, disabled }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
      {label && <label htmlFor={id} style={{ fontSize: "0.78rem", color: "var(--texte-doux)", letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</label>}
      <input
        id={id} type={type} defaultValue={value} placeholder={ph} onChange={onChange} disabled={disabled}
        style={{ padding: "0.75rem 1rem", border: "1px solid var(--ligne)", borderRadius: "var(--r-sm)",
          fontSize: "0.94rem", background: disabled ? "var(--beige-bg2)" : "var(--blanc)",
          outline: "none", width: "100%", transition: "border-color .2s" }}
        onFocus={e => { if (!disabled) e.target.style.borderColor = "var(--or)"; }}
        onBlur={e => e.target.style.borderColor = "var(--ligne)"}
      />
    </div>
  );
}

// ---------- Écran connexion / inscription ----------
function AuthScreen({ onLogin, go, notice }) {
  const [mode, setMode]       = useState("login");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg]         = useState(null); // { type, text }
  const [form, setForm]       = useState({ firstName: "", lastName: "", email: "", password: "", phone: "" });

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleSubmit() {
    setLoading(true);
    setMsg(null);
    try {
      if (mode === "signup") {
        if (!form.firstName || !form.lastName) throw new Error("Veuillez saisir votre prénom et nom.");
        if (form.password.length < 6) throw new Error("Le mot de passe doit faire au moins 6 caractères.");

        const { error } = await window.SUPABASE.auth.signUp({
          email: form.email.trim(),
          password: form.password,
          options: {
            data: { firstName: form.firstName.trim(), lastName: form.lastName.trim(), phone: form.phone.trim() },
            emailRedirectTo: window.location.origin,
          }
        });
        if (error) throw error;
        setMsg({ type: "success", text: "✓ Compte créé ! Un email de confirmation a été envoyé. Cliquez sur le lien pour activer votre compte." });
        setForm(f => ({ ...f, password: "" }));

      } else {
        const { data, error } = await window.SUPABASE.auth.signInWithPassword({
          email: form.email.trim(),
          password: form.password,
        });
        if (error) {
          if (error.message.includes("Email not confirmed"))
            throw new Error("Email non confirmé. Vérifiez votre boîte mail et cliquez sur le lien.");
          throw new Error("Email ou mot de passe incorrect.");
        }
        onLogin(data.user);
      }
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    }
    setLoading(false);
  }

  async function handleForgot() {
    if (!form.email) { setMsg({ type: "error", text: "Saisissez votre email d'abord." }); return; }
    const { error } = await window.SUPABASE.auth.resetPasswordForEmail(form.email.trim(), {
      redirectTo: window.location.origin,
    });
    if (error) setMsg({ type: "error", text: error.message });
    else setMsg({ type: "success", text: "Email de réinitialisation envoyé !" });
  }

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
            {[["100 pts","5 € offerts"],["Statuts","Argent · Or · VIP"]].map(([a,b]) => (
              <div key={a}>
                <div style={{ fontFamily: "var(--f-display)", fontSize: "1.2rem", color: "var(--or)" }}>{a}</div>
                <div style={{ fontSize: "0.72rem", color: "rgba(251,248,242,0.6)" }}>{b}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Formulaire */}
        <div style={{ background: "var(--blanc)", padding: "clamp(2rem,4vw,3rem)" }}>
          {notice && (
            <div style={{ fontSize: "0.85rem", padding: "0.85rem 1.1rem", borderRadius: "var(--r-sm)",
              background: "var(--or-soft)", color: "var(--texte)", border: "1px solid var(--ligne)", marginBottom: "1.6rem" }}>
              {notice}
            </div>
          )}
          <div style={{ display: "flex", gap: 0, marginBottom: "1.8rem", borderBottom: "1px solid var(--ligne)" }}>
            {[["login","Se connecter"],["signup","Créer un compte"]].map(([id,l]) => (
              <button key={id} onClick={() => { setMode(id); setMsg(null); }}
                style={{ padding: "0.6rem 0", marginRight: "1.6rem", fontFamily: "var(--f-display)",
                  letterSpacing: "0.08em", textTransform: "uppercase", fontSize: "0.78rem",
                  color: mode === id ? "var(--noir)" : "var(--texte-doux)",
                  borderBottom: "2px solid " + (mode === id ? "var(--or)" : "transparent"), marginBottom: -1 }}>{l}</button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {mode === "signup" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                <Field label="Prénom" id="firstName" ph="Léa"       onChange={set("firstName")} />
                <Field label="Nom"    id="lastName"  ph="Marchetti"  onChange={set("lastName")} />
              </div>
            )}
            <Field label="E-mail"       id="email"    ph="vous@email.fr" type="email"    onChange={set("email")} />
            <Field label="Mot de passe" id="password" ph="••••••••"       type="password" onChange={set("password")} />
            {mode === "signup" && (
              <Field label="Téléphone (facultatif)" id="phone" ph="06 12 34 56 78" type="tel" onChange={set("phone")} />
            )}

            {mode === "signup" && (
              <label style={{ display: "flex", gap: 8, fontSize: "0.8rem", color: "var(--texte-doux)" }}>
                <Ico.check width={15} height={15} style={{ color: "var(--or)", flexShrink: 0, marginTop: 2 }} />
                J'accepte de recevoir les offres fidélité Emicils
              </label>
            )}

            {msg && (
              <div style={{ fontSize: "0.82rem", padding: "0.7rem 1rem", borderRadius: "var(--r-sm)",
                background: msg.type === "success" ? "#f0faf3" : "#fff2f2",
                color: msg.type === "success" ? "#1a6b38" : "#c0392b",
                border: "1px solid " + (msg.type === "success" ? "#b7e4c7" : "#f5c6cb") }}>
                {msg.text}
              </div>
            )}

            <button className="btn btn-dark btn-block" style={{ height: 48, marginTop: "0.4rem" }}
              onClick={handleSubmit} disabled={loading}>
              {loading ? "..." : mode === "login" ? "Se connecter" : "Créer mon compte"}
            </button>

            {mode === "login" && (
              <button onClick={handleForgot} style={{ fontSize: "0.8rem", color: "var(--texte-doux)", marginTop: "0.2rem" }}>
                Mot de passe oublié ?
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Dashboard ----------
function AccountPage({ user, onLogout, go, points: pointsProp }) {
  const [tab, setTab]               = useState("fidelite");
  const [realOrders, setRealOrders] = useState([]);

  // Charge les commandes réelles
  useEffect(() => {
    if (!user) return;
    window.SUPABASE.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      fetch('/api/orders', { headers: { Authorization: `Bearer ${session.access_token}` } })
        .then(r => r.ok ? r.json() : [])
        .then(data => setRealOrders(Array.isArray(data) ? data : []));
    });
  }, [user]);

  if (!user) return <AuthScreen onLogin={() => {}} go={go} />;

  // Les points viennent de app.jsx (mis à jour en temps réel via Supabase Realtime)
  const pts        = pointsProp ?? 0;
  const firstName  = user.user_metadata?.firstName || user.email.split("@")[0];
  const allOrders  = realOrders;
  const seuil      = 1500;
  const prog       = Math.min(100, (pts / seuil) * 100);
  const eurosDispo = Math.floor(pts / 100) * 5;
  const palier     = pts >= 1500 ? "VIP" : pts >= 500 ? "Or" : pts >= 100 ? "Argent" : "Membre";
  const palierNext = pts >= 1500 ? "VIP" : pts >= 500 ? "VIP" : pts >= 100 ? "Or" : "Argent";
  const tabs = [["fidelite","Fidélité"],["commandes","Commandes"],["infos","Mes infos"]];

  return (
    <div className="container" style={{ paddingTop: "2.5rem", paddingBottom: "var(--pad-section)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
        <div>
          <div className="eyebrow">Mon espace</div>
          <h1 style={{ fontSize: "clamp(1.9rem,4vw,2.8rem)", marginTop: "0.5rem" }}>Bonjour, {firstName} 👋</h1>
        </div>
        <button onClick={onLogout} style={{ fontSize: "0.82rem", color: "var(--texte-doux)", borderBottom: "1px solid var(--ligne)", paddingBottom: 3 }}>Se déconnecter</button>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid var(--ligne)", marginBottom: "2.2rem", flexWrap: "wrap" }}>
        {tabs.map(([id,l]) => (
          <button key={id} onClick={() => setTab(id)} style={{ padding: "0.7rem 0", marginRight: "1.8rem", fontFamily: "var(--f-display)",
            letterSpacing: "0.08em", textTransform: "uppercase", fontSize: "0.8rem",
            color: tab === id ? "var(--noir)" : "var(--texte-doux)",
            borderBottom: "2px solid " + (tab === id ? "var(--or)" : "transparent"), marginBottom: -1 }}>{l}</button>
        ))}
      </div>

      {tab === "fidelite" && (
        <div className="fade-up" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "1.5rem", alignItems: "start" }} data-acc-grid>
          <div style={{ background: "linear-gradient(150deg, var(--noir), #2c2823)", color: "var(--blanc)", borderRadius: "var(--r-lg)", padding: "clamp(1.6rem,3vw,2.4rem)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--or)" }}>
                <Ico.sparkle width={20} height={20} />
                <span style={{ fontFamily: "var(--f-display)", letterSpacing: "0.16em", textTransform: "uppercase", fontSize: "0.78rem" }}>Membre {palier}</span>
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
                <span>{palier}</span><span>{palierNext} · {seuil.toLocaleString("fr-FR")} pts</span>
              </div>
              <div style={{ height: 6, borderRadius: 999, background: "rgba(251,248,242,0.18)" }}>
                <div style={{ height: "100%", width: prog + "%", borderRadius: 999, background: "var(--or)" }} />
              </div>
              <div style={{ fontSize: "0.8rem", marginTop: 10, opacity: 0.75 }}>Plus que <strong style={{ color: "var(--or)" }}>{Math.max(0, seuil - pts).toLocaleString("fr-FR")} points</strong> pour passer membre {palierNext}.</div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ background: "var(--blanc)", border: "1px solid var(--ligne)", borderRadius: "var(--r-lg)", padding: "1.4rem" }}>
              <h3 style={{ fontSize: "1.1rem", marginBottom: "0.4rem" }}>Convertir mes points</h3>
              <p style={{ fontSize: "0.82rem", color: "var(--texte-doux)", marginBottom: "1.1rem" }}>100 points = 5 € de réduction.</p>
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

          <div style={{ gridColumn: "1 / -1", background: "var(--blanc)", border: "1px solid var(--ligne)", borderRadius: "var(--r-lg)", padding: "1.4rem 1.6rem" }}>
            <h3 style={{ fontSize: "1.05rem", marginBottom: "1rem" }}>Activité fidélité</h3>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {realOrders.length === 0 && (
                <p style={{ fontSize: "0.88rem", color: "var(--texte-doux)" }}>Aucune activité pour le moment.</p>
              )}
              {realOrders.map((o, i) => {
                const dateStr = o.created_at ? new Date(o.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "";
                const pts = o.points_to_award || 0;
                const validated = o.status === "validated" || o.status === "shipped";
                return (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.8rem 0", borderTop: i ? "1px solid var(--ligne)" : "none" }}>
                    <div>
                      <div style={{ fontSize: "0.9rem" }}>Commande {o.id}</div>
                      <div style={{ fontSize: "0.74rem", color: "var(--texte-doux)" }}>{dateStr}</div>
                    </div>
                    <span style={{ fontFamily: "var(--f-display)", color: validated ? "var(--or)" : "var(--texte-doux)" }}>
                      {validated ? `+${pts}` : `(${pts} en attente)`} pts
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === "commandes" && (
        <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {allOrders.length === 0 && <p style={{ color: "var(--texte-doux)", fontSize: "0.9rem" }}>Aucune commande pour le moment.</p>}
          {allOrders.map((o, i) => {
            const STATUS_LABEL = { pending: "En attente", validated: "Validée", refused: "Refusée", shipped: "Expédiée" };
            const MODE_LABEL   = { collect: "Click & Collect", relais: "Point relais", domicile: "Domicile" };
            const nbArticles   = Array.isArray(o.items) ? o.items.reduce((s, x) => s + (x.qty || 1), 0) : 0;
            const dateStr      = o.created_at ? new Date(o.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "";
            const statutLabel  = STATUS_LABEL[o.status] || o.status || "";
            const modeLabel    = MODE_LABEL[o.shipping_mode] || o.shipping_mode || "";
            return (
              <div key={i} style={{ background: "var(--blanc)", border: "1px solid var(--ligne)", borderRadius: "var(--r-md)", padding: "1.3rem 1.5rem",
                display: "grid", gridTemplateColumns: "auto 1fr auto auto", gap: "1.2rem", alignItems: "center" }} data-order-row>
                <div style={{ width: 46, height: 46, borderRadius: "50%", background: "var(--beige-bg2)", display: "grid", placeItems: "center", color: "var(--or)" }}>
                  {o.shipping_mode === "collect" ? <Ico.store width={20} height={20} /> : o.shipping_mode === "domicile" ? <Ico.truck width={20} height={20} /> : <Ico.box width={20} height={20} />}
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontFamily: "var(--f-display)", fontSize: "1rem" }}>{o.id}</span>
                    <span style={{ fontSize: "0.68rem", padding: "2px 8px", borderRadius: 999, background: "var(--or-soft)", color: "var(--or)", letterSpacing: "0.06em" }}>{statutLabel}</span>
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--texte-doux)", marginTop: 2 }}>{dateStr} · {nbArticles} article{nbArticles > 1 ? "s" : ""} · {modeLabel}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <Price value={o.total} />
                  <div style={{ fontSize: "0.72rem", color: "var(--or)" }}>+{o.points_to_award || 0} pts</div>
                </div>
                <button className="btn btn-light" style={{ padding: "0.55em 1.1em" }}>Détails</button>
              </div>
            );
          })}
        </div>
      )}

      {tab === "infos" && (
        <div className="fade-up" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", maxWidth: 820 }} data-acc-grid>
          <div style={{ background: "var(--blanc)", border: "1px solid var(--ligne)", borderRadius: "var(--r-lg)", padding: "1.6rem" }}>
            <h3 style={{ fontSize: "1.05rem", marginBottom: "1.2rem" }}>Coordonnées</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
              <Field label="Prénom" value={user.user_metadata?.firstName || ""} full disabled />
              <Field label="Nom"    value={user.user_metadata?.lastName  || ""} full disabled />
              <Field label="E-mail" value={user.email}                           full disabled />
            </div>
            <p style={{ fontSize: "0.78rem", color: "var(--texte-doux)", marginTop: "1rem" }}>
              Pour modifier vos informations, contactez-nous.
            </p>
          </div>
          <div style={{ background: "var(--blanc)", border: "1px solid var(--ligne)", borderRadius: "var(--r-lg)", padding: "1.6rem" }}>
            <h3 style={{ fontSize: "1.05rem", marginBottom: "1.2rem" }}>Sécurité</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--texte-doux)", marginBottom: "1.2rem" }}>
              Email confirmé : {user.email_confirmed_at ? "✓ Oui" : "⚠ Non — vérifiez votre boîte mail"}
            </p>
            <button className="btn btn-outline" style={{ fontSize: "0.8rem" }}
              onClick={async () => {
                await window.SUPABASE.auth.resetPasswordForEmail(user.email, { redirectTo: window.location.origin });
                alert("Email de réinitialisation envoyé !");
              }}>
              Changer mon mot de passe
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { AccountPage, AuthScreen, Field });
