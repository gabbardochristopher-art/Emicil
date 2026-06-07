function LegalPage({ go, section }) {
  const TABS = [
    { id: "mentions", label: "Mentions légales" },
    { id: "cgv", label: "CGV" },
    { id: "confidentialite", label: "Confidentialité" },
  ];
  const active = TABS.some(t => t.id === section) ? section : "mentions";

  const textStyle = { fontSize: "0.92rem", lineHeight: 1.7, color: "var(--texte-doux)", margin: "0 0 1rem" };
  const h2Style = { fontSize: "clamp(1.15rem,2vw,1.4rem)", margin: "2.2rem 0 0.9rem" };
  const ulStyle = { ...textStyle, paddingLeft: "1.3rem" };

  return (
    <div>
      <section style={{ background: "var(--noir)", color: "var(--blanc)", padding: "clamp(2.6rem,6vw,4.6rem) 0" }}>
        <div className="container" style={{ maxWidth: 780, textAlign: "center" }}>
          <div className="eyebrow" style={{ color: "var(--or)" }}>Emicils · Institut de beauté</div>
          <h1 style={{ color: "var(--blanc)", fontSize: "clamp(1.8rem,4vw,2.6rem)", margin: "1rem 0 0", lineHeight: 1.1 }}>
            Informations légales
          </h1>
        </div>
      </section>

      <section className="container" style={{ paddingTop: "clamp(2rem,4vw,3rem)", paddingBottom: "clamp(3rem,6vw,5rem)" }}>
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", justifyContent: "center", marginBottom: "2.6rem" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => go("legal", { section: t.id })}
              style={{
                padding: "0.6rem 1.3rem", borderRadius: 999, fontSize: "0.84rem",
                background: active === t.id ? "var(--noir)" : "var(--blanc)",
                color: active === t.id ? "var(--blanc)" : "var(--noir)",
                boxShadow: active === t.id ? "none" : "inset 0 0 0 1px var(--ligne)",
              }}>{t.label}</button>
          ))}
        </div>

        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          {active === "mentions" && (
            <div>
              <h2 style={{ ...h2Style, marginTop: 0 }}>Éditeur du site</h2>
              <p style={textStyle}>
                Le site Emicils (<a href="https://emicil.vercel.app" style={{ color: "var(--or)" }}>emicil.vercel.app</a>) est édité par
                Émilie Portillo, exerçant à titre individuel sous le statut d'auto-entrepreneur (micro-entreprise), sous le nom
                commercial « Emicils ».
              </p>
              <ul style={ulStyle}>
                <li>Statut juridique : entreprise individuelle (auto-entrepreneur / micro-entreprise)</li>
                <li>SIREN : 818 488 348</li>
                <li>SIRET : 818 488 348 00033</li>
                <li>Adresse de l'établissement : 50 avenue François Mitterand, 13170 Les Pennes-Mirabeau</li>
                <li>Téléphone : 06 69 25 62 12</li>
                <li>Directrice de la publication : Émilie Portillo</li>
              </ul>

              <h2 style={h2Style}>Hébergement</h2>
              <p style={textStyle}>
                Le site est hébergé par Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, États-Unis
                (<a href="https://vercel.com" style={{ color: "var(--or)" }}>vercel.com</a>).
              </p>

              <h2 style={h2Style}>Propriété intellectuelle</h2>
              <p style={textStyle}>
                L'ensemble des éléments présents sur ce site (textes, images, logos, photographies, mise en page, identité visuelle)
                est la propriété exclusive d'Emicils, sauf mentions contraires. Toute reproduction, représentation, modification ou
                exploitation, totale ou partielle, sans autorisation écrite préalable, est interdite et pourrait constituer une
                contrefaçon au sens des articles L.335-2 et suivants du Code de la propriété intellectuelle.
              </p>

              <h2 style={h2Style}>Crédits</h2>
              <p style={textStyle}>Conception et développement du site : Emicils.</p>
            </div>
          )}

          {active === "cgv" && (
            <div>
              <p style={textStyle}>
                Les présentes conditions générales de vente s'appliquent à toutes les ventes de produits et prestations conclues
                par Emicils (Émilie Portillo, auto-entrepreneur — SIRET 818 488 348 00033), que ce soit en boutique, sur rendez-vous
                ou via le site emicil.vercel.app.
              </p>

              <h2 style={h2Style}>Article 1 — Produits et prestations</h2>
              <p style={textStyle}>
                Emicils propose à la vente des produits liés au regard (boîtes de cils, accessoires, soins, colle, cartes &
                prestations) ainsi que des prestations en institut (pose de cils, rehaussement, soins) et des formations
                professionnelles. Les caractéristiques essentielles de chaque produit ou prestation sont présentées sur sa fiche.
              </p>

              <h2 style={h2Style}>Article 2 — Prix</h2>
              <p style={textStyle}>
                Les prix sont indiqués en euros, toutes taxes comprises (TTC). Emicils se réserve le droit de modifier ses prix à
                tout moment ; les produits et prestations sont facturés sur la base des tarifs en vigueur au moment de la
                validation de la commande ou de la prise de rendez-vous.
              </p>

              <h2 style={h2Style}>Article 3 — Commande et paiement</h2>
              <p style={textStyle}>
                La commande est validée après confirmation des informations et du paiement. Le paiement s'effectue par les moyens
                proposés au moment de la commande (carte bancaire ou paiement en boutique selon le mode choisi). La commande n'est
                considérée comme définitive qu'après confirmation du paiement.
              </p>

              <h2 style={h2Style}>Article 4 — Retrait et livraison</h2>
              <p style={textStyle}>
                Les commandes peuvent être retirées en boutique (Click & Collect) à l'adresse 50 avenue François Mitterand, 13170
                Les Pennes-Mirabeau, aux horaires d'ouverture indiqués sur le site. Le client est informé par e-mail ou téléphone
                lorsque sa commande est prête.
              </p>

              <h2 style={h2Style}>Article 5 — Droit de rétractation</h2>
              <p style={textStyle}>
                Conformément aux articles L.221-18 et suivants du Code de la consommation, le client dispose d'un délai de 14
                jours à compter de la réception du produit pour exercer son droit de rétractation, sans avoir à justifier de
                motif ni à payer de pénalité, à l'exception des frais de retour.
              </p>
              <p style={textStyle}>
                Conformément à l'article L.221-28 du Code de la consommation, ce droit ne s'applique pas aux prestations de
                services pleinement exécutées avant la fin du délai de rétractation, ni aux produits scellés ne pouvant être
                renvoyés pour des raisons d'hygiène et de protection de la santé (cosmétiques, produits de beauté, accessoires
                de pose) lorsqu'ils ont été descellés après la livraison.
              </p>

              <h2 style={h2Style}>Article 6 — Garanties</h2>
              <p style={textStyle}>
                Les produits vendus bénéficient de la garantie légale de conformité (articles L.217-3 et suivants du Code de la
                consommation) et de la garantie contre les vices cachés (articles 1641 et suivants du Code civil).
              </p>

              <h2 style={h2Style}>Article 7 — Responsabilité</h2>
              <p style={textStyle}>
                Emicils ne saurait être tenue responsable de l'inexécution du contrat en cas de force majeure, de perturbation ou
                grève des services postaux, ou de tout autre cas indépendant de sa volonté.
              </p>

              <h2 style={h2Style}>Article 8 — Litiges et médiation</h2>
              <p style={textStyle}>
                Les présentes CGV sont soumises au droit français. En cas de litige, le client peut recourir gratuitement à un
                médiateur de la consommation conformément à l'article L.616-1 du Code de la consommation, avant toute action
                judiciaire.
              </p>
            </div>
          )}

          {active === "confidentialite" && (
            <div>
              <p style={textStyle}>
                Emicils accorde une grande importance à la protection des données personnelles de ses clients et visiteurs. La
                présente politique explique quelles données sont collectées, pourquoi, et quels sont vos droits, conformément au
                Règlement Général sur la Protection des Données (RGPD) et à la loi « Informatique et Libertés ».
              </p>

              <h2 style={h2Style}>Responsable du traitement</h2>
              <p style={textStyle}>
                Le responsable du traitement des données est Émilie Portillo, exerçant sous le nom commercial Emicils
                (SIRET 818 488 348 00033), 50 avenue François Mitterand, 13170 Les Pennes-Mirabeau — joignable au 06 69 25 62 12.
              </p>

              <h2 style={h2Style}>Données collectées</h2>
              <ul style={ulStyle}>
                <li>Données d'identification : nom, prénom, adresse e-mail, numéro de téléphone</li>
                <li>Données de compte client : historique de commandes, points de fidélité, préférences</li>
                <li>Données de commande : produits achetés, prestations réservées, mode de retrait, montants</li>
                <li>Données de connexion et de navigation (cookies, mesure d'audience)</li>
              </ul>

              <h2 style={h2Style}>Finalités et base légale</h2>
              <p style={textStyle}>
                Ces données sont collectées pour : la gestion des commandes et réservations (exécution du contrat), la gestion
                du compte client et du programme de fidélité, la réponse aux demandes de contact, et l'amélioration du site
                (intérêt légitime). Aucune donnée n'est utilisée à des fins de prospection sans consentement préalable.
              </p>

              <h2 style={h2Style}>Durée de conservation</h2>
              <p style={textStyle}>
                Les données sont conservées pendant la durée nécessaire aux finalités pour lesquelles elles ont été collectées,
                puis archivées ou supprimées conformément aux délais légaux applicables (notamment en matière commerciale et
                comptable).
              </p>

              <h2 style={h2Style}>Destinataires</h2>
              <p style={textStyle}>
                Les données sont traitées par Emicils et, le cas échéant, par ses prestataires techniques (hébergement,
                paiement) strictement nécessaires au fonctionnement du site, dans le respect du RGPD. Elles ne sont ni vendues
                ni cédées à des tiers à des fins commerciales.
              </p>

              <h2 style={h2Style}>Vos droits</h2>
              <p style={textStyle}>
                Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation, de
                portabilité et d'opposition concernant vos données personnelles. Vous pouvez exercer ces droits en nous
                contactant au 06 69 25 62 12 ou directement en boutique, 50 avenue François Mitterand, 13170 Les
                Pennes-Mirabeau. Vous disposez également du droit d'introduire une réclamation auprès de la CNIL
                (cnil.fr).
              </p>

              <h2 style={h2Style}>Cookies</h2>
              <p style={textStyle}>
                Le site peut utiliser des cookies nécessaires à son fonctionnement (panier, connexion au compte) ainsi que des
                cookies de mesure d'audience. Vous pouvez configurer votre navigateur pour refuser les cookies ; certaines
                fonctionnalités du site pourraient alors ne plus être disponibles.
              </p>

              <h2 style={h2Style}>Sécurité</h2>
              <p style={textStyle}>
                Emicils met en œuvre des mesures techniques et organisationnelles appropriées (hébergement sécurisé, accès
                restreint, mots de passe chiffrés) afin de protéger vos données contre toute perte, accès non autorisé,
                divulgation ou altération.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

Object.assign(window, { LegalPage });
