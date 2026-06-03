// ==========================================================================
// EMICILS — Page Formation
// ==========================================================================

function FormationPage({ go }) {
  const formations = [
    {
      titre: "Formation Pose Classique",
      duree: "1 jour · 7 h",
      niveau: "Débutant",
      prix: 290,
      desc: "Apprenez les bases de la pose cil à cil : préparation, isolation, collage, séchage. Vous repartez avec votre kit de démarrage.",
      points: ["Anatomie de l'œil & sécurité", "Choix des cils & colle", "Technique d'isolation", "Pose sur mannequin + modèle réel"],
    },
    {
      titre: "Formation Volume Russe",
      duree: "2 jours · 14 h",
      niveau: "Intermédiaire",
      prix: 490,
      desc: "Maîtrisez la confection de bouquets volume et méga-volume. Prérequis : maîtrise de la pose classique.",
      points: ["Confection des bouquets 2D à 10D", "Courbures & longueurs adaptées", "Gestion du temps en cabine", "Suivi clientèle & remplissage"],
    },
    {
      titre: "Formation Rehaussement & Teinture",
      duree: "1 jour · 6 h",
      niveau: "Tous niveaux",
      prix: 250,
      desc: "Lash lift + teinture : tout pour sublimer le cil naturel sans extensions. Technique rapide et rentable.",
      points: ["Bâtonnets & colle lash lift", "Application de la teinture", "Timing & neutralisation", "Protocole client & contre-indications"],
    },
    {
      titre: "Perfectionnement & Business",
      duree: "1 jour · 7 h",
      niveau: "Avancé",
      prix: 320,
      desc: "Affinez votre technique, optimisez votre cabine et développez votre clientèle. Coaching personnalisé.",
      points: ["Correction des erreurs courantes", "Tarification & positionnement", "Réseaux sociaux & avant/après", "Fidélisation & panier moyen"],
    },
  ];

  const NIVEAU_COLOR = {
    "Débutant":     { bg: "var(--or-soft)",   c: "var(--or)" },
    "Intermédiaire":{ bg: "rgba(176,141,87,.15)", c: "#7a5c20" },
    "Tous niveaux": { bg: "var(--beige-soft)", c: "var(--texte-doux)" },
    "Avancé":       { bg: "var(--noir)",       c: "var(--blanc)" },
  };

  return (
    <div>
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
            {[["Petits groupes","4 personnes max"],["Matériel fourni","Kit inclus"],["Certifiée","Attestation remise"]].map(([a,b]) => (
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.6rem" }}>
          {formations.map((f, i) => {
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
                  <p style={{ fontSize: "0.86rem", color: "var(--texte-doux)", lineHeight: 1.65 }}>{f.desc}</p>
                </div>

                <ul style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                  {f.points.map((pt, j) => (
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
                    onClick={() => go("contact")}>
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
          <button className="btn btn-dark" onClick={() => go("contact")}>
            Nous contacter <Ico.arrow width={15} height={15} />
          </button>
        </div>
      </section>
    </div>
  );
}

Object.assign(window, { FormationPage });
