// ==========================================================================
// EMICILS — Page Galerie Photos
// ==========================================================================

function GaleriePage({ go }) {
  const [lightbox, setLightbox] = React.useState(null);
  const [photos, setPhotos]     = React.useState([]);

  React.useEffect(() => {
    fetch('/api/galerie')
      .then(r => r.ok ? r.json() : [])
      .then(data => setPhotos(Array.isArray(data) ? data : []))
      .catch(() => setPhotos([]));
  }, []);

  return (
    <div>
      {/* Lightbox */}
      {lightbox !== null && (
        <>
          <div onClick={() => setLightbox(null)} style={{ position: "fixed", inset: 0, background: "rgba(29,26,22,0.85)", zIndex: 200, cursor: "pointer" }} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 201, maxWidth: "90vw", maxHeight: "90vh" }}>
            <img src={photos[lightbox]?.url} alt={photos[lightbox]?.legende || ""} style={{ maxWidth: "90vw", maxHeight: "85vh", objectFit: "contain", borderRadius: "var(--r-md)" }} />
            {photos[lightbox]?.legende && (
              <p style={{ textAlign: "center", color: "var(--blanc)", fontFamily: "var(--f-display)", fontSize: "0.9rem", marginTop: "1rem" }}>{photos[lightbox].legende}</p>
            )}
            <button onClick={() => setLightbox(null)} style={{ position: "absolute", top: -40, right: 0, color: "var(--blanc)", fontSize: "1.4rem" }}>✕</button>
            {lightbox > 0 && <button onClick={() => setLightbox(lightbox - 1)} style={{ position: "absolute", left: -50, top: "50%", transform: "translateY(-50%)", color: "var(--blanc)", fontSize: "2rem" }}>‹</button>}
            {lightbox < photos.length - 1 && <button onClick={() => setLightbox(lightbox + 1)} style={{ position: "absolute", right: -50, top: "50%", transform: "translateY(-50%)", color: "var(--blanc)", fontSize: "2rem" }}>›</button>}
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
          <p style={{ color: "rgba(251,248,242,0.7)", fontSize: "1rem" }}>
            Découvrez nos réalisations, notre institut et le savoir-faire de nos lash artists.
          </p>
        </div>
      </section>

      {/* Photo de présentation */}
      <section className="container" style={{ paddingTop: "var(--pad-section)" }}>
        <img src="assets/galerie_hero.png" alt="Présentation Emicils" style={{
          width: "100%", maxHeight: 420, objectFit: "cover", borderRadius: "var(--r-lg)",
          boxShadow: "var(--shadow-soft)" }} />
      </section>

      {/* Grille photos */}
      <section className="container" style={{ paddingTop: "2rem", paddingBottom: "var(--pad-section)" }}>
        {photos.length === 0 && (
          <p style={{ textAlign: "center", color: "var(--texte-doux)", padding: "2rem 0" }}>Les photos arrivent bientôt...</p>
        )}
        <div style={{ columns: "3 280px", gap: "1rem" }}>
          {photos.map((p, i) => (
            <div key={i} onClick={() => setLightbox(i)} style={{ breakInside: "avoid", marginBottom: "1rem", cursor: "pointer", borderRadius: "var(--r-md)", overflow: "hidden", position: "relative" }}
              onMouseEnter={e => e.currentTarget.querySelector('.galerie-overlay').style.opacity = 1}
              onMouseLeave={e => e.currentTarget.querySelector('.galerie-overlay').style.opacity = 0}>
              <img src={p.url} alt={p.legende || "Photo Emicils"} style={{ width: "100%", display: "block", borderRadius: "var(--r-md)" }} />
              <div className="galerie-overlay" style={{ position: "absolute", inset: 0, background: "rgba(29,26,22,0.3)", display: "flex", alignItems: "flex-end", padding: "1rem", opacity: 0, transition: "opacity .25s", borderRadius: "var(--r-md)" }}>
                {p.legende && <span style={{ color: "var(--blanc)", fontSize: "0.82rem", fontFamily: "var(--f-display)" }}>{p.legende}</span>}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

Object.assign(window, { GaleriePage });
