// ==========================================================================
// EMICILS — Page FAQ (Foire aux questions)
// ==========================================================================

const FAQ_DATA = [
  {
    q: "Combien de temps dure une pose d'extensions de cils ?",
    a: "Une séance de pose d'extensions de cils peut varier selon la technique choisie. Une pose classique (cil à cil) dure environ 90 minutes, tandis qu'une pose volume russe ou mega volume peut aller jusqu'à 2 heures. Nos lash artists prennent le temps nécessaire pour un résultat parfait et satisfaisant."
  },
  {
    q: "Quels sont les avantages d'une pose d'extension de cils chez Emicils ?",
    a: "Chez Emicils, nous utilisons exclusivement des produits professionnels de haute qualité. Nos lash artists sont formées et certifiées. Vous bénéficiez d'un diagnostic personnalisé pour choisir le style qui sublimera votre regard : volume russe, cil à cil, mixte ou mega volume."
  },
  {
    q: "Quelle est la durée de vie d'une pose d'extensions de cils ?",
    a: "Une pose d'extensions de cils dure en moyenne 3 à 4 semaines, en fonction de votre cycle naturel de pousse des cils. Nous recommandons un remplissage toutes les 2 à 3 semaines pour maintenir un résultat optimal. Un entretien régulier et les bons gestes au quotidien prolongent la tenue."
  },
  {
    q: "Comment prendre rendez-vous chez Emicils ?",
    a: "Vous pouvez réserver votre créneau directement sur notre page Planity, accessible depuis le bouton « Prendre RDV » sur notre site. Vous pouvez aussi nous appeler au 06 69 25 62 12 ou passer directement à l'institut au 50 avenue François Mitterand, 13170 Les Pennes-Mirabeau."
  },
  {
    q: "Les extensions de cils abîment-elles les cils naturels ?",
    a: "Non, lorsqu'elles sont posées par une professionnelle qualifiée et avec des produits adaptés, les extensions de cils ne fragilisent pas vos cils naturels. Chez Emicils, nous respectons le poids et la santé de chaque cil pour une pose confortable et sans risque."
  },
  {
    q: "Puis-je me maquiller avec des extensions de cils ?",
    a: "Oui, mais nous recommandons d'éviter le mascara waterproof et les démaquillants à base d'huile qui peuvent fragiliser la colle. Un mascara spécial extensions peut être utilisé. Le grand avantage des extensions, c'est justement de ne plus avoir besoin de mascara au quotidien !"
  },
  {
    q: "Quelles techniques de pose proposez-vous ?",
    a: "Nous proposons plusieurs techniques adaptées à vos envies : le cil à cil (classique) pour un effet naturel, le volume russe pour un regard intense, le volume mixte (hybride) pour un juste milieu, et le mega volume pour un effet glamour. Nos lash artists vous conseillent lors du diagnostic."
  },
  {
    q: "Qu'est-ce qu'un rehaussement de cils ?",
    a: "Le rehaussement de cils est une technique qui recourbe vos cils naturels de la racine à la pointe, sans ajout d'extensions. Le résultat dure 6 à 8 semaines et donne un effet « yeux ouverts » très naturel. Il peut être combiné avec une teinture pour un regard encore plus intense."
  },
  {
    q: "Proposez-vous des formations ?",
    a: "Oui ! Emicils propose des formations professionnelles pour devenir lash artist. Nos formations sont dispensées en petits groupes (4 personnes max), avec tout le matériel fourni et une certification à l'issue. Consultez notre page Formations pour découvrir les prochaines dates."
  },
  {
    q: "Comment fonctionne le programme fidélité ?",
    a: "Chaque euro dépensé chez Emicils vous rapporte 1 point fidélité. À partir de 100 points, vous pouvez les convertir en bons de réduction (100 pts = 5 €). Vous passez automatiquement aux statuts Argent, Or et VIP avec des avantages exclusifs. Créez votre compte pour en profiter !"
  },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ borderBottom: "1px solid var(--ligne)" }}>
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "1.4rem 0", textAlign: "left", gap: "1rem",
      }}>
        <span style={{ fontFamily: "var(--f-display)", fontSize: "0.82rem", letterSpacing: "0.08em",
          textTransform: "uppercase", color: "var(--noir)", flex: 1 }}>{q}</span>
        <span style={{ fontSize: "1.4rem", color: "var(--noir)", flexShrink: 0, width: 28, height: 28,
          display: "grid", placeItems: "center", borderRadius: "50%", background: open ? "var(--noir)" : "transparent",
          color: open ? "var(--blanc)" : "var(--noir)", transition: "all .25s" }}>
          {open ? "−" : "+"}
        </span>
      </button>
      <div style={{
        maxHeight: open ? 500 : 0, overflow: "hidden", transition: "max-height .35s ease",
      }}>
        <p style={{ fontSize: "0.9rem", color: "var(--texte-doux)", lineHeight: 1.7,
          padding: "0 0 1.4rem", maxWidth: 800 }}>{a}</p>
      </div>
    </div>
  );
}

function FaqPage({ go }) {
  return (
    <div>
      {/* Hero */}
      <section style={{ background: "var(--noir)", color: "var(--blanc)", padding: "clamp(3rem,7vw,5rem) 0" }}>
        <div className="container" style={{ textAlign: "center", maxWidth: 700 }}>
          <div className="eyebrow" style={{ color: "var(--or)" }}>Emicils</div>
          <h1 style={{ color: "var(--blanc)", fontSize: "clamp(2rem,5vw,3.2rem)", margin: "1rem 0 1rem", lineHeight: 1.08 }}>
            Foire aux <span style={{ fontFamily: "var(--f-serif)", fontStyle: "italic", fontWeight: 400 }}>Questions</span>
          </h1>
          <p style={{ color: "rgba(251,248,242,0.7)", fontSize: "1rem" }}>
            Retrouvez les réponses aux questions les plus fréquentes sur nos prestations, nos produits et notre institut.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="container" style={{ paddingTop: "var(--pad-section)", paddingBottom: "var(--pad-section)", maxWidth: 860 }}>
        <div style={{ borderTop: "1px solid var(--ligne)" }}>
          {FAQ_DATA.map((item, i) => <FaqItem key={i} q={item.q} a={item.a} />)}
        </div>
      </section>

      {/* Contact */}
      <section className="container" style={{ paddingBottom: "var(--pad-section)" }}>
        <div style={{ background: "var(--beige-bg2)", borderRadius: "var(--r-lg)", padding: "clamp(1.8rem,4vw,3rem)",
          textAlign: "center", maxWidth: 860, margin: "0 auto" }}>
          <div className="eyebrow">Vous ne trouvez pas la réponse ?</div>
          <h2 style={{ fontSize: "clamp(1.4rem,3vw,2rem)", margin: "0.6rem 0 1rem" }}>Contactez-nous directement</h2>
          <p style={{ fontSize: "0.9rem", color: "var(--texte-doux)", marginBottom: "1.4rem" }}>
            Appelez le <strong>06 69 25 62 12</strong> ou passez à l'institut.
          </p>
          <a href="https://www.planity.com/emicils-13240-septemes-les-vallons-58l" target="_blank" rel="noopener noreferrer"
            className="btn btn-dark">Prendre rendez-vous</a>
        </div>
      </section>
    </div>
  );
}

Object.assign(window, { FaqPage });
