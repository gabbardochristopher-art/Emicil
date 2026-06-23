// ==========================================================================
// EMICILS — Page Galerie Photos
// ==========================================================================

const GALERIE_CATEGORIES = [
  { id: "all",            label: "Toutes" },
  { id: "volume-russe",   label: "Volume Russe" },
  { id: "cil-a-cil",      label: "Cil à cil" },
  { id: "volume-mixte",   label: "Volume Mixte" },
  { id: "rehaussement",   label: "Rehaussement" },
  { id: "mega-volume",    label: "Mega Volume" },
  { id: "institut",       label: "Institut" },
];

function GaleriePage({ go }) {
  const [lightbox, setLightbox] = React.useState(null);
  const [photos, setPhotos]     = React.useState([]);
  const [filter, setFilter]     = React.useState("all");

  React.useEffect(() => {
    fetch('/api/galerie')
      .then(r => r.ok ? r.json() : [])
      .then(data => setPhotos(Array.isArray(data) ? data : []))
      .catch(() => setPhotos([]));
  }, []);

  const filtered = filter === "all" ? photos : photos.filter(p => p.categorie === filter);

  const lightboxPhotos = filtered;
  const lightboxPhoto  = lightbox !== null ? lightboxPhotos[lightbox] : null;

  return (
    <div>
      {/* Lightbox */}
      {lightbox !== null && lightboxPhoto && (
        <>
          <div onClick={() => setLightbox(null)} style={{ position: "fixed", inset: 0, background: "rgba(29,26,22,0.85)", zIndex: 200, cursor: "pointer" }} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 201, width: "94vw", maxWidth: 800, maxHeight: "90vh", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <img src={lightboxPhoto.url} alt={lightboxPhoto.legende || ""} style={{ maxWidth: "100%", maxHeight: "80vh", objectFit: "contain", borderRadius: "var(--r-md)" }} />
            {lightboxPhoto.legende && (
              <p style={{ textAlign: "center", color: "var(--blanc)", fontFamily: "var(--f-display)", fontSize: "0.9rem", marginTop: "1rem" }}>{lightboxPhoto.legende}</p>
            )}
            <button onClick={() => setLightbox(null)} style={{ position: "absolute", top: -36, right: 4, color: "var(--blanc)", fontSize: "1.4rem", zIndex: 1 }}>✕</button>
            {lightbox > 0 && <button onClick={() => setLightbox(lightbox - 1)} style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", color: "var(--blanc)", fontSize: "2.2rem", background: "rgba(0,0,0,0.4)", borderRadius: "50%", width: 40, height: 40, display: "grid", placeItems: "center" }}>‹</button>}
            {lightbox < lightboxPhotos.length - 1 && <button onClick={() => setLightbox(lightbox + 1)} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", color: "var(--blanc)", fontSize: "2.2rem", background: "rgba(0,0,0,0.4)", borderRadius: "50%", width: 40, height: 40, display: "grid", placeItems: "center" }}>›</button>}
          </div>
        </>
      )}

      {/* Hero */}
      <section style={{ background: "var(--noir)", color: "var(--blanc)", padding: "clamp(3rem,7vw,5rem) 0" }}>
        <div className="container" style={{ textAlign: "center", maxWidth: 700 }}>
          <div className="eyebrow" style={{ color: "var(--or)" }}>Institut Emicils</div>
          <h1 style={{ color: "var(--blanc)", fontSize: "clamp(2rem,5vw,3.2rem)", margin: "1rem 0 1rem", lineHeight: 1.08 }}>
            Galerie <span style={{ fontFamily: "var(--f-serif)", fontStyle: "italic", fontWeight: 400 }}>Photos</span>
          </h1>
          <p style={{ color: "rgba(251,248,242,0.7)", fontSize: "1rem", marginBottom: "2rem" }}>
            Découvrez nos réalisations, notre institut et le savoir-faire de nos lash artists.
          </p>
          <img src="assets/galerie_hero.png" alt="Présentation Emicils" style={{
            width: "100%", maxWidth: 480, maxHeight: 260, objectFit: "cover", borderRadius: "var(--r-md)",
            margin: "0 auto", display: "block" }} />
        </div>
      </section>

      {/* Filtres catégories */}
      <section className="container" style={{ paddingTop: "var(--pad-section)" }}>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "nowrap", justifyContent: "flex-start", marginBottom: "2rem", overflowX: "auto", WebkitOverflowScrolling: "touch", paddingBottom: 6 }}>
          {GALERIE_CATEGORIES.map(c => (
            <button key={c.id} onClick={() => { setFilter(c.id); setLightbox(null); }}
              style={{
                fontFamily: "var(--f-display)", letterSpacing: "0.1em", textTransform: "uppercase", fontSize: "0.74rem",
                padding: "0.6em 1.3em", borderRadius: "var(--r-pill)",
                border: "1.5px solid " + (filter === c.id ? "var(--or)" : "var(--ligne)"),
                background: filter === c.id ? "var(--or)" : "var(--blanc)",
                color: filter === c.id ? "var(--blanc)" : "var(--texte-doux)",
                transition: "all .2s", cursor: "pointer", flexShrink: 0,
              }}>{c.label}</button>
          ))}
        </div>

        {/* Grille photos */}
        {filtered.length === 0 && (
          <p style={{ textAlign: "center", color: "var(--texte-doux)", padding: "2rem 0" }}>
            {photos.length === 0 ? "Les photos arrivent bientôt..." : "Aucune photo dans cette catégorie."}
          </p>
        )}
        <div className="galerie-masonry" style={{ columns: "3 280px", gap: "1rem" }}>
          {filtered.map((p, i) => (
            <div key={p.id || i} onClick={() => setLightbox(i)} style={{ breakInside: "avoid", marginBottom: "1rem", cursor: "pointer", borderRadius: "var(--r-md)", overflow: "hidden", position: "relative" }}
              onMouseEnter={e => e.currentTarget.querySelector('.galerie-overlay').style.opacity = 1}
              onMouseLeave={e => e.currentTarget.querySelector('.galerie-overlay').style.opacity = 0}>
              <img src={p.url} alt={p.legende || "Photo Emicils"} style={{ width: "100%", display: "block", borderRadius: "var(--r-md)" }} />
              <div className="galerie-overlay" style={{ position: "absolute", inset: 0, background: "rgba(29,26,22,0.3)", display: "flex", alignItems: "flex-end", padding: "1rem", opacity: 0, transition: "opacity .25s", borderRadius: "var(--r-md)" }}>
                <div>
                  {p.legende && <span style={{ color: "var(--blanc)", fontSize: "0.82rem", fontFamily: "var(--f-display)", display: "block" }}>{p.legende}</span>}
                  {p.categorie && <span style={{ color: "var(--or)", fontSize: "0.68rem", fontFamily: "var(--f-display)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    {(GALERIE_CATEGORIES.find(c => c.id === p.categorie) || {}).label || p.categorie}
                  </span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

Object.assign(window, { GaleriePage });
